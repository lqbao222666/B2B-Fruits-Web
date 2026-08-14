<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { BaoGiaService, type BaoGiaNhuCau } from "@/service/baogia";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const baogia_id = Number(route.params.id);
const loading = ref(true);
const baoGia = ref<BaoGiaNhuCau | null>(null);

const user = ref<any>(null);

// Form phản hồi / counter-offer
const phanHoiForm = ref({
  so_luong_cung_cap: 0,
  gia_de_xuat: 0,
  chenh_lech_gia: 0,
  ghi_chu: "",
});

const showResponseForm = ref(false);

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
const userRole = computed(() => user.value?.role?.toLowerCase() || "");

const isFarmer = computed(() => userRole.value === "nong_dan");
const isEnterprise = computed(() => userRole.value === "doanh_nghiep");
void userId;
void isFarmer;

const fetchBaoGia = async () => {
  loading.value = true;
  try {
    const data = await BaoGiaService.getById(baogia_id);
    baoGia.value = data;
    phanHoiForm.value = {
      so_luong_cung_cap: Number(data.so_luong_cung_cap),
      gia_de_xuat: Number(data.gia_de_xuat),
      chenh_lech_gia: Number(data.chenh_lech_gia),
      ghi_chu: "",
    };
  } catch (e: any) {
    notify.error("Không tìm thấy thông tin báo giá thương lượng");
  } finally {
    loading.value = false;
  }
};

const onGiaChange = () => {
  if (!baoGia.value?.nhuCau?.gia_tham_khao) return;
  const giaGoc = Number(baoGia.value.nhuCau.gia_tham_khao);
  const giaMoi = Number(phanHoiForm.value.gia_de_xuat);
  phanHoiForm.value.chenh_lech_gia = giaMoi - giaGoc;
};

const submitAccept = async () => {
  const result = await Swal.fire({
    title: "Xác nhận đồng ý thống nhất giá này?",
    text: "Cả hai bên sẽ chốt thỏa thuận mua bán với mức giá và số lượng đã thương lượng.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Đồng ý chốt",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      await BaoGiaService.phanHoi(baogia_id, {
        trang_thai: "da_thong_nhat",
        sender_role: isEnterprise.value ? "doanh_nghiep" : "nong_dan",
        ghi_chu: "Đã đồng ý chấp nhận thương lượng!",
      });
      await Swal.fire({
        icon: "success",
        title: "🎉 Thương lượng thành công!",
        text: "Đơn hàng B2B đã được khởi tạo! Doanh nghiệp chuyển sang danh sách đơn hàng để Đặt cọc 15% bắt đầu giao dịch!",
        confirmButtonColor: "#10b981",
      });
      router.push("/orders");
    } catch (e: any) {
      notify.error(e.response?.data?.message || "Có lỗi xảy ra khi xác nhận");
    }
  }
};

const submitReject = async () => {
  const result = await Swal.fire({
    title: "Xác nhận từ chối báo giá này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Từ chối",
    cancelButtonText: "Quay lại",
  });

  if (result.isConfirmed) {
    try {
      await BaoGiaService.phanHoi(baogia_id, {
        trang_thai: "tu_choi",
        sender_role: isEnterprise.value ? "doanh_nghiep" : "nong_dan",
        ghi_chu: "Đã từ chối đề xuất thương lượng.",
      });
      notify.info("Đã từ chối báo giá");
      fetchBaoGia();
    } catch (e: any) {
      notify.error("Có lỗi xảy ra");
    }
  }
};

const submitCounterOffer = async () => {
  try {
    await BaoGiaService.phanHoi(baogia_id, {
      so_luong_cung_cap: Number(phanHoiForm.value.so_luong_cung_cap),
      gia_de_xuat: Number(phanHoiForm.value.gia_de_xuat),
      chenh_lech_gia: Number(phanHoiForm.value.chenh_lech_gia),
      ghi_chu: phanHoiForm.value.ghi_chu,
      trang_thai: isEnterprise.value ? "cho_nong_dan" : "cho_doanh_nghiep",
      sender_role: isEnterprise.value ? "doanh_nghiep" : "nong_dan",
    });

    notify.success("Đã gửi phản hồi thương lượng thành công!");
    showResponseForm.value = false;
    fetchBaoGia();
  } catch (e: any) {
    notify.error(
      e.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại.",
    );
  }
};

const formatPrice = (val?: number) => {
  if (!val) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
};

onMounted(() => {
  checkUser();
  fetchBaoGia();
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Back button -->
    <div>
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        <span>←</span> Quay lại
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"
      ></div>
    </div>

    <template v-else-if="baoGia">
      <!-- Status Header Banner -->
      <div
        class="p-6 rounded-3xl text-white shadow-lg space-y-2 flex flex-wrap items-center justify-between gap-4"
        :class="{
          'bg-gradient-to-r from-amber-600 to-yellow-600':
            baoGia.trang_thai === 'cho_doanh_nghiep',
          'bg-gradient-to-r from-blue-600 to-indigo-600':
            baoGia.trang_thai === 'cho_nong_dan',
          'bg-gradient-to-r from-emerald-600 to-teal-700':
            baoGia.trang_thai === 'da_thong_nhat',
          'bg-gradient-to-r from-red-600 to-rose-700':
            baoGia.trang_thai === 'tu_choi',
        }"
      >
        <div>
          <span
            class="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full"
          >
            {{
              baoGia.trang_thai === "cho_doanh_nghiep"
                ? "⏳ Chờ Doanh Nghiệp Phản Hồi"
                : baoGia.trang_thai === "cho_nong_dan"
                  ? "⏳ Chờ Nông Dân Phản Hồi"
                  : baoGia.trang_thai === "da_thong_nhat"
                    ? "🎉 Đã Thống Nhất Giao Dịch!"
                    : "❌ Báo Giá Bị Từ Chối"
            }}
          </span>
          <h1 class="text-xl md:text-2xl font-black mt-2">
            Thương Lượng Báo Giá: {{ baoGia.nhuCau?.ten_nong_san }}
          </h1>
        </div>

        <div class="text-right">
          <span class="text-xs opacity-80 block">Số lượng hiện tại:</span>
          <span class="text-2xl font-black"
            >{{ baoGia.so_luong_cung_cap }} {{ baoGia.don_vi }}</span
          >
        </div>
      </div>

      <!-- Main Overview Box -->
      <div
        class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6"
      >
        <!-- Demand & Farmer Profile Info -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100 text-xs"
        >
          <!-- Doanh nghiệp -->
          <div
            class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
          >
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >Doanh Nghiệp Thu Mua</span
            >
            <h4 class="font-bold text-slate-900 text-sm">
              {{
                baoGia.nhuCau?.doanhNghiep?.ten_cong_ty ||
                baoGia.nhuCau?.doanhNghiep?.user?.full_name ||
                "Doanh Nghiệp"
              }}
            </h4>
            <p class="text-slate-600">
              SĐT:
              <strong>{{
                baoGia.nhuCau?.doanhNghiep?.so_dien_thoai ||
                baoGia.nhuCau?.doanhNghiep?.user?.phone ||
                "N/A"
              }}</strong>
            </p>
            <p class="text-slate-600">
              Giá tham khảo của DN:
              <strong class="text-emerald-700"
                >{{ formatPrice(baoGia.nhuCau?.gia_tham_khao) }} /
                {{ baoGia.don_vi }}</strong
              >
            </p>
          </div>

          <!-- Nông dân -->
          <div
            class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
          >
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >Nông Dân Chào Hàng</span
            >
            <h4 class="font-bold text-slate-900 text-sm">
              {{
                baoGia.nongDan?.ho_ten ||
                baoGia.nongDan?.user?.full_name ||
                "Nông Dân"
              }}
            </h4>
            <p class="text-slate-600">
              SĐT:
              <strong>{{
                baoGia.nongDan?.so_dien_thoai ||
                baoGia.nongDan?.user?.phone ||
                "N/A"
              }}</strong>
            </p>
            <p class="text-slate-600">
              Điểm cung cấp:
              <strong class="text-slate-900"
                >{{
                  baoGia.dia_chi_cung_cap ? baoGia.dia_chi_cung_cap + ", " : ""
                }}{{
                  baoGia.tinh_thanh_cung_cap ||
                  baoGia.nongDan?.tinh_thanh ||
                  "Vườn/Kho"
                }}</strong
              >
            </p>
          </div>
        </div>

        <!-- Shipping Fee & Distance Highlight Box -->
        <div
          class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-amber-950 text-xs"
        >
          <div class="space-y-1">
            <span class="font-bold text-amber-900 flex items-center gap-1"
              >🚚 Thông tin Tuyến Vận Chuyển & Phí Giao Hàng (Nông dân chi
              trả):</span
            >
            <p class="text-amber-900 font-medium">
              Từ:
              <strong class="text-amber-950">{{
                baoGia.tinh_thanh_cung_cap || "Vị trí Nông dân"
              }}</strong>
              ➔ Đến:
              <strong class="text-amber-950">{{
                baoGia.nhuCau?.tinh_thanh_giao || "Doanh nghiệp"
              }}</strong>
            </p>
            <p class="text-amber-800">
              Khoảng cách vận chuyển:
              <strong>{{ baoGia.khoang_cach_km || 15 }} km</strong> | Phí giao
              hàng:
              <strong class="text-amber-950 text-sm font-black">{{
                formatPrice(baoGia.phi_van_chuyen)
              }}</strong>
            </p>
          </div>
          <span
            class="px-3 py-1 bg-amber-200/80 rounded-full font-bold text-[11px] text-amber-900"
          >
            Nông dân gánh phí
          </span>
        </div>

        <!-- History Timeline -->
        <div class="space-y-4">
          <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>📜</span> Lịch sử các vòng thương lượng
          </h3>

          <div class="space-y-3">
            <div
              v-for="(step, idx) in baoGia.lich_su_thuong_luong || []"
              :key="idx"
              class="p-4 rounded-2xl border text-xs space-y-1.5 transition"
              :class="
                step.sender === 'doanh_nghiep'
                  ? 'bg-blue-50/50 border-blue-200 text-blue-950 ml-4'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-950 mr-4'
              "
            >
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-1.5">
                  {{
                    step.sender === "doanh_nghiep"
                      ? "🏢 Doanh Nghiệp Phản Hồi"
                      : "👨‍🌾 Nông Dân Đề Xuất"
                  }}
                </span>
                <span class="text-[10px] text-slate-400 font-normal">{{
                  formatDate(step.created_at)
                }}</span>
              </div>

              <div
                class="grid grid-cols-2 md:grid-cols-3 gap-2 py-1 font-medium"
              >
                <div>
                  Số lượng:
                  <strong class="text-slate-900"
                    >{{ step.so_luong }} {{ baoGia.don_vi }}</strong
                  >
                </div>
                <div>
                  Giá chào:
                  <strong class="text-emerald-700 font-black">{{
                    formatPrice(step.gia)
                  }}</strong>
                </div>
                <div v-if="step.chenh_lech !== undefined">
                  Chênh lệch:
                  <strong class="text-slate-800"
                    >{{ step.chenh_lech > 0 ? "+" : ""
                    }}{{ formatPrice(step.chenh_lech) }}</strong
                  >
                </div>
              </div>

              <p
                v-if="step.ghi_chu"
                class="text-slate-600 bg-white/80 p-2 rounded-xl italic"
              >
                "{{ step.ghi_chu }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Actions Panel -->
        <div
          v-if="
            baoGia.trang_thai !== 'da_thong_nhat' &&
            baoGia.trang_thai !== 'tu_choi'
          "
          class="pt-6 border-t border-slate-100 space-y-4"
        >
          <div class="flex flex-wrap items-center gap-3">
            <button
              @click="submitAccept"
              class="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>✅</span> Đồng Ý Chốt Giao Dịch
            </button>

            <button
              @click="showResponseForm = !showResponseForm"
              class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>💬</span> Phản Hồi Điều Chỉnh Giá / Số Lượng
            </button>

            <button
              @click="submitReject"
              class="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-2xl transition"
            >
              Từ Chối
            </button>
          </div>

          <!-- Inline Counter Offer Form -->
          <div
            v-if="showResponseForm"
            class="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 text-xs animate-fade-in"
          >
            <h4 class="font-bold text-slate-900 text-sm">
              Nhập thông tin phản hồi thương lượng:
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1"
                  >Số lượng điều chỉnh ({{ baoGia.don_vi }}):</label
                >
                <input
                  v-model.number="phanHoiForm.so_luong_cung_cap"
                  type="number"
                  class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1"
                  >Giá đề xuất mới (VNĐ / {{ baoGia.don_vi }}):</label
                >
                <input
                  v-model.number="phanHoiForm.gia_de_xuat"
                  type="number"
                  step="500"
                  @input="onGiaChange"
                  class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1"
                >Tin nhắn / Ghi chú phản hồi:</label
              >
              <textarea
                v-model="phanHoiForm.ghi_chu"
                rows="3"
                placeholder="Nhập lời nhắn trao đổi với đối phương..."
                class="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              ></textarea>
            </div>

            <div class="flex items-center gap-3">
              <button
                @click="showResponseForm = false"
                class="py-2.5 px-4 bg-slate-200 font-bold rounded-xl text-slate-700"
              >
                Hủy
              </button>
              <button
                @click="submitCounterOffer"
                class="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-md"
              >
                Gửi Phản Hồi Thương Lượng
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
