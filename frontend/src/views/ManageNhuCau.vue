<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { BaoGiaService } from "@/service/baogia";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const loading = ref(false);
const activeTab = ref<"demands" | "received_offers">("demands");
const filterStatus = ref<string>("ALL");
const searchText = ref<string>("");

const myDemands = ref<NhuCauThuMua[]>([]);
const receivedOffers = ref<any[]>([]);

const user = ref<any>(null);

const checkUser = () => {
  const saved = localStorage.getItem("user");
  if (saved) {
    try {
      user.value = JSON.parse(saved);
    } catch (_) {
      user.value = null;
    }
  }
};

const userId = computed(() => user.value?.user_id || user.value?.id);

const fetchMyDemands = async () => {
  if (!userId.value) return;
  loading.value = true;
  try {
    const data = await NhuCauService.getByDoanhNghiep(userId.value);
    myDemands.value = data || [];
  } catch (e: any) {
    notify.error("Lỗi khi tải danh sách nhu cầu thu mua của bạn");
  } finally {
    loading.value = false;
  }
};

const fetchReceivedOffers = async () => {
  if (!userId.value) return;
  try {
    const data = await BaoGiaService.getByDoanhNghiep(userId.value);
    receivedOffers.value = data || [];
  } catch (e) {
    console.error(e);
  }
};

const updateStatus = async (
  item: NhuCauThuMua,
  newStatus: "dang_thu_mua" | "du_so_luong" | "tam_ngung" | "da_dong"
) => {
  try {
    await NhuCauService.update(item.nhucau_id, { trang_thai: newStatus });
    notify.success("Cập nhật trạng thái nhu cầu thành công!");
    await fetchMyDemands();
  } catch (err: any) {
    notify.error("Không thể cập nhật trạng thái nhu cầu!");
  }
};

const deleteDemand = async (id: number) => {
  const result = await Swal.fire({
    title: "Xác nhận xoá nhu cầu thu mua?",
    text: "Hành động này không thể hoàn tác.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Đồng ý xoá",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      await NhuCauService.delete(id);
      notify.success("Đã xoá nhu cầu thu mua");
      fetchMyDemands();
    } catch (e: any) {
      notify.error(e.response?.data?.message || "Không thể xoá nhu cầu này");
    }
  }
};

const filteredDemands = computed(() => {
  return myDemands.value.filter((item) => {
    const matchStatus =
      filterStatus.value === "ALL" || item.trang_thai === filterStatus.value;
    const matchSearch =
      !searchText.value.trim() ||
      item.ten_nong_san
        .toLowerCase()
        .includes(searchText.value.trim().toLowerCase()) ||
      (item.tinh_thanh_giao &&
        item.tinh_thanh_giao
          .toLowerCase()
          .includes(searchText.value.trim().toLowerCase()));
    return matchStatus && matchSearch;
  });
});

const formatPrice = (val?: number) => {
  if (!val) return "Thương lượng";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

onMounted(() => {
  checkUser();
  fetchMyDemands();
  fetchReceivedOffers();
});
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header Page Navigation -->
    <div
      class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
    >
      <div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#658a22] text-2xl"
            >assignment</span
          >
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Nhu Cầu Thu Mua Cá Nhân
          </h1>
        </div>
        <p class="text-xs text-slate-500 mt-1 font-medium">
          Trang dành riêng cho Doanh nghiệp quản lý danh sách nhu cầu thu mua nông sản, cập nhật trạng thái và phản hồi báo giá từ Nông dân.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/nhu-cau"
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">storefront</span>
          Xem trang công khai
        </RouterLink>

        <RouterLink
          to="/create-nhu-cau"
          class="px-5 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5 active:scale-95"
        >
          <span class="material-symbols-outlined text-base">add_circle</span>
          Đăng nhu cầu thu mua mới
        </RouterLink>
      </div>
    </div>

    <!-- Navigation Tabs & Search/Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'demands'"
          class="px-5 py-3 font-bold text-xs transition border-b-2 flex items-center gap-2"
          :class="
            activeTab === 'demands'
              ? 'border-[#658a22] text-[#658a22] bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          "
        >
          <span class="material-symbols-outlined text-lg">inventory_2</span>
          Nhu cầu thu mua đã đăng ({{ myDemands.length }})
        </button>
        <button
          @click="activeTab = 'received_offers'"
          class="px-5 py-3 font-bold text-xs transition border-b-2 flex items-center gap-2"
          :class="
            activeTab === 'received_offers'
              ? 'border-[#658a22] text-[#658a22] bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          "
        >
          <span class="material-symbols-outlined text-lg">mark_email_unread</span>
          Báo giá từ Nông dân ({{ receivedOffers.length }})
        </button>
      </div>

      <!-- Search & Filter Controls for Demands -->
      <div v-if="activeTab === 'demands'" class="flex items-center gap-2">
        <div class="relative">
          <input
            v-model="searchText"
            type="text"
            placeholder="Tìm tên nông sản..."
            class="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#658a22] w-44"
          />
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
        </div>

        <select
          v-model="filterStatus"
          class="text-xs py-1.5 px-3 border border-slate-200 rounded-xl bg-white outline-none font-medium text-slate-700"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="dang_thu_mua">Đang thu mua</option>
          <option value="du_so_luong">Đã đủ số lượng</option>
          <option value="tam_ngung">Tạm ngưng</option>
          <option value="da_dong">Đã đóng</option>
        </select>
      </div>
    </div>

    <!-- TAB 1: DEMANDS LIST -->
    <div v-if="activeTab === 'demands'">
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-10 w-10 border-3 border-[#658a22] border-t-transparent"
        ></div>
      </div>

      <div
        v-else-if="filteredDemands.length === 0"
        class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3"
      >
        <span class="material-symbols-outlined text-slate-300 text-5xl">inventory_2</span>
        <h3 class="text-base font-bold text-slate-800">
          {{ myDemands.length === 0 ? 'Bạn chưa đăng nhu cầu thu mua nào' : 'Không tìm thấy nhu cầu thu mua phù hợp' }}
        </h3>
        <p class="text-xs text-slate-500">
          Hãy tạo nhu cầu thu mua nông sản đầu tiên để Nông dân có thể tìm thấy và gửi báo giá cho bạn!
        </p>
        <RouterLink
          to="/create-nhu-cau"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold text-xs rounded-xl transition"
        >
          <span class="material-symbols-outlined text-base">add</span>
          Đăng nhu cầu ngay
        </RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredDemands"
          :key="item.nhucau_id"
          class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#658a22]/40 transition-all"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span
                v-if="item.danhMuc"
                class="text-[10px] font-bold text-[#658a22] bg-emerald-50 px-2 py-0.5 rounded border border-[#658a22]/20"
              >
                {{ item.danhMuc.ten_danh_muc }}
              </span>
              <select
                :value="item.trang_thai"
                @change="updateStatus(item, ($event.target as HTMLSelectElement).value as any)"
                class="px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer"
                :class="{
                  'bg-emerald-50 text-emerald-800 border-emerald-200':
                    item.trang_thai === 'dang_thu_mua',
                  'bg-blue-50 text-blue-800 border-blue-200':
                    item.trang_thai === 'du_so_luong',
                  'bg-amber-50 text-amber-800 border-amber-200':
                    item.trang_thai === 'tam_ngung',
                  'bg-slate-100 text-slate-600 border-slate-200': item.trang_thai === 'da_dong',
                }"
              >
                <option value="dang_thu_mua">Đang thu mua</option>
                <option value="du_so_luong">Đã đủ số lượng</option>
                <option value="tam_ngung">Tạm ngưng</option>
                <option value="da_dong">Đã đóng</option>
              </select>
            </div>

            <h3 class="font-black text-slate-900 text-base">
              {{ item.ten_nong_san }}
            </h3>

            <div
              class="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs"
            >
              <div>
                <span class="text-slate-400 block text-[10px]"
                  >Cần thu mua:</span
                >
                <span class="font-bold text-slate-800"
                  >{{ Number(item.so_luong_can).toLocaleString("vi-VN") }} {{ item.don_vi }}</span
                >
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]"
                  >Giá tham khảo:</span
                >
                <span class="font-bold text-[#658a22]">{{
                  formatPrice(Number(item.gia_tham_khao))
                }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-500 space-y-1.5">
              <p class="flex items-start gap-1">
                <span class="material-symbols-outlined text-slate-400 text-sm mt-0.5">place</span>
                <span class="text-slate-700 font-medium line-clamp-2">{{ item.dia_chi_giao || item.tinh_thanh_giao }}</span>
              </p>
              <p class="flex items-center gap-1">
                <span class="material-symbols-outlined text-amber-600 text-sm">verified</span>
                <span>Chứng nhận: <strong class="text-slate-800">{{ item.yeu_cau_chung_nhan || "Không" }}</strong></span>
              </p>
              <p class="flex items-center gap-1">
                <span class="material-symbols-outlined text-emerald-600 text-sm">forum</span>
                <span>Báo giá nhận được: <strong class="text-[#658a22]">{{ item._count?.baoGiaList || 0 }} nông dân</strong></span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <RouterLink
              :to="`/edit-nhu-cau/${item.nhucau_id}`"
              class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
              Sửa
            </RouterLink>
            <button
              @click="deleteDemand(item.nhucau_id)"
              class="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: RECEIVED OFFERS FROM FARMERS -->
    <div v-if="activeTab === 'received_offers'">
      <div
        v-if="receivedOffers.length === 0"
        class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2"
      >
        <span class="material-symbols-outlined text-slate-300 text-5xl">mail</span>
        <h3 class="text-base font-bold text-slate-800">
          Chưa có báo giá nào từ Nông dân
        </h3>
        <p class="text-xs text-slate-500">
          Khi Nông dân gửi báo giá cho các nhu cầu thu mua của bạn, danh sách thương lượng sẽ hiển thị tại đây!
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="offer in receivedOffers"
          :key="offer.baogia_id"
          class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 hover:border-[#658a22]/30 transition-all"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs">
              <span class="font-bold text-slate-900 flex items-center gap-1">
                <span class="material-symbols-outlined text-[#658a22] text-base">person</span>
                {{
                  offer.nongDan?.ho_ten ||
                  offer.nongDan?.user?.full_name ||
                  "Nông Dân"
                }}
              </span>
              <span class="text-slate-400">• Nhu cầu:</span>
              <span class="font-bold text-[#658a22]">{{
                offer.nhuCau?.ten_nong_san
              }}</span>
            </div>
            <p class="text-xs text-slate-600">
              Chào bán:
              <strong class="text-slate-800"
                >{{ offer.so_luong_cung_cap }} {{ offer.don_vi }}</strong
              >
              | Giá đề xuất:
              <strong class="text-[#658a22]">{{
                formatPrice(offer.gia_de_xuat)
              }}</strong>
              | Phí vận chuyển nông dân chịu:
              <strong class="text-amber-800">{{
                formatPrice(offer.phi_van_chuyen)
              }}</strong>
            </p>
          </div>

          <RouterLink
            :to="`/phan-hoi-bao-gia/${offer.baogia_id}`"
            class="px-5 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
          >
            <span>Mở thương lượng</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
