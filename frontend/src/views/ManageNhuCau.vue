<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { BaoGiaService } from "@/service/baogia";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const router = useRouter();
const loading = ref(false);
const activeTab = ref<"demands" | "received_offers">("demands");

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
      notify.error(e.response?.data?.message || "Không thể xoá bài đăng này");
    }
  }
};

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
    <!-- Header -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-black text-slate-900">
          Quản Lý Nhu Cầu Thu Mua B2B
        </h1>
        <p class="text-xs text-slate-500">
          Quản lý danh sách nông sản cần thu mua và tiếp nhận báo giá thương
          lượng từ Nông dân
        </p>
      </div>

      <RouterLink
        to="/create-nhu-cau"
        class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition flex items-center gap-2"
      >
        <span>➕</span> Đăng Nhu Cầu Thu Mua Mới
      </RouterLink>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        @click="activeTab = 'demands'"
        class="px-5 py-3 font-bold text-xs transition border-b-2"
        :class="
          activeTab === 'demands'
            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        "
      >
        📦 Nhu Cầu Thu Mua Đã Đăng ({{ myDemands.length }})
      </button>
      <button
        @click="activeTab = 'received_offers'"
        class="px-5 py-3 font-bold text-xs transition border-b-2"
        :class="
          activeTab === 'received_offers'
            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        "
      >
        📩 Báo Giá Nhận Được từ Nông Dân ({{ receivedOffers.length }})
      </button>
    </div>

    <!-- TAB 1: DEMANDS LIST -->
    <div v-if="activeTab === 'demands'">
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"
        ></div>
      </div>

      <div
        v-else-if="myDemands.length === 0"
        class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3"
      >
        <div class="text-4xl">📝</div>
        <h3 class="text-base font-bold text-slate-800">
          Bạn chưa đăng nhu cầu thu mua nào
        </h3>
        <p class="text-xs text-slate-500">
          Hãy tạo nhu cầu thu mua nông sản đầu tiên để Nông dân có thể báo giá
          chào hàng!
        </p>
        <RouterLink
          to="/create-nhu-cau"
          class="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          Đăng Nhu Cầu Ngay
        </RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in myDemands"
          :key="item.nhucau_id"
          class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span
                v-if="item.danhMuc"
                class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                {{ item.danhMuc.ten_danh_muc }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                :class="{
                  'bg-emerald-100 text-emerald-800':
                    item.trang_thai === 'dang_thu_mua',
                  'bg-blue-100 text-blue-800':
                    item.trang_thai === 'du_so_luong',
                  'bg-amber-100 text-amber-800':
                    item.trang_thai === 'tam_ngung',
                  'bg-slate-100 text-slate-600': item.trang_thai === 'da_dong',
                }"
              >
                {{
                  item.trang_thai === "dang_thu_mua"
                    ? "Đang thu mua"
                    : item.trang_thai === "du_so_luong"
                      ? "Đã đủ số lượng"
                      : item.trang_thai === "tam_ngung"
                        ? "Tạm ngưng"
                        : "Đã đóng"
                }}
              </span>
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
                  >{{ item.so_luong_can }} {{ item.don_vi }}</span
                >
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]"
                  >Giá tham khảo:</span
                >
                <span class="font-bold text-emerald-700">{{
                  formatPrice(item.gia_tham_khao)
                }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-500 space-y-1">
              <p>
                📍 Giao tại:
                <strong class="text-slate-700">{{
                  item.tinh_thanh_giao
                }}</strong>
              </p>
              <p>
                📜 Yêu cầu:
                <strong class="text-amber-800">{{
                  item.yeu_cau_chung_nhan || "Không"
                }}</strong>
              </p>
              <p>
                📩 Báo giá nhận được:
                <strong class="text-emerald-700"
                  >{{ item._count?.baoGiaList || 0 }} nông dân</strong
                >
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <RouterLink
              :to="`/edit-nhu-cau/${item.nhucau_id}`"
              class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center"
            >
              ✏️ Sửa Nhu Cầu
            </RouterLink>
            <button
              @click="deleteDemand(item.nhucau_id)"
              class="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: RECEIVED OFFERS -->
    <div v-if="activeTab === 'received_offers'">
      <div
        v-if="receivedOffers.length === 0"
        class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2"
      >
        <div class="text-4xl">📬</div>
        <h3 class="text-base font-bold text-slate-800">
          Chưa có báo giá nào từ Nông dân
        </h3>
        <p class="text-xs text-slate-500">
          Khi Nông dân báo giá cho các nhu cầu của bạn, danh sách thương lượng
          sẽ hiển thị tại đây!
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="offer in receivedOffers"
          :key="offer.baogia_id"
          class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs">
              <span class="font-bold text-slate-900">
                👨‍🌾
                {{
                  offer.nongDan?.ho_ten ||
                  offer.nongDan?.user?.full_name ||
                  "Nông Dân"
                }}
              </span>
              <span class="text-slate-400">• Nhu cầu:</span>
              <span class="font-bold text-emerald-700">{{
                offer.nhuCau?.ten_nong_san
              }}</span>
            </div>
            <p class="text-xs text-slate-600">
              Chào bán:
              <strong class="text-slate-800"
                >{{ offer.so_luong_cung_cap }} {{ offer.don_vi }}</strong
              >
              | Giá đề xuất:
              <strong class="text-emerald-700">{{
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
            class="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
          >
            Mở Giao Diện Thương Lượng →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
