<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DonHang } from "../service/donhang.ts";
import api from "../service/api.ts";
import ReportModal from "../components/ReportModal.vue";
import RatingModal from "../components/RatingModal.vue";
import FollowToggle from "../components/FollowToggle.vue";
import { notify } from "@/utils/notifier.ts";

const route = useRoute();
const router = useRouter();

const orderId = Number(route.params.id);
const userId = ref<number | null>(null);

const selectedOrder = ref<any>(null);
const loading = ref(false);
const isCanceling = ref(false);

const showReportModal = ref(false);
const showRatingModal = ref(false);
const reportingOrder = ref<any>(null);

// --- THANH TOÁN DOANH NGHIỆP ---
const showPaymentModal = ref(false);
const paymentData = ref({ type: "", amount: 0, method: "momo" });

const openPaymentModal = (type: string, amount: number) => {
  paymentData.value = { type, amount, method: "momo" };
  showPaymentModal.value = true;
};

const confirmPayment = async () => {
  if (paymentData.value.type === "coc") {
    await submitEnterpriseDeposit(
      selectedOrder.value.donhang_id,
      paymentData.value.amount,
    );
  } else if (paymentData.value.type === "con_lai") {
    await submitPayRemaining85(
      selectedOrder.value.donhang_id,
      paymentData.value.amount,
    );
  }
  showPaymentModal.value = false;
};

// --- Payout Nông Dân ---
const farmerPayoutInfo = ref({
  phuong_thuc_nhan_tien: "tien_mat",
  ngan_hang: "",
  so_tai_khoan: "",
  chu_tai_khoan: "",
});
const isSavingPayout = ref(false);

const loadFarmerPayout = async () => {
  if (userId.value && selectedOrder.value?.nguoi_ban_id === userId.value) {
    try {
      const res = await api.get(`/nong-dan/${userId.value}`);
      if (res.data) {
        farmerPayoutInfo.value.phuong_thuc_nhan_tien =
          res.data.phuong_thuc_nhan_tien || "tien_mat";
        farmerPayoutInfo.value.ngan_hang = res.data.ngan_hang || "";
        farmerPayoutInfo.value.so_tai_khoan = res.data.so_tai_khoan || "";
        farmerPayoutInfo.value.chu_tai_khoan = res.data.chu_tai_khoan || "";
      }
    } catch (e) {
      console.error(e);
    }
  }
};

const saveFarmerPayout = async () => {
  isSavingPayout.value = true;
  try {
    await api.patch(`/nong-dan/${userId.value}`, farmerPayoutInfo.value);
    notify.success("Cập nhật phương thức nhận tiền thành công!");
  } catch (error) {
    notify.error("Lỗi lưu phương thức nhận tiền");
  } finally {
    isSavingPayout.value = false;
  }
};

// --- CÁC HÀM FORMAT & HELPER ---
const formatCurrency = (amount: number | string) => {
  if (!amount) return "0đ";
  return Number(amount).toLocaleString("vi-VN") + "đ";
};

const getStatusInfo = (status: string) => {
  const map: Record<string, any> = {
    cho_xac_nhan: {
      label: "Chờ cọc & phí vận chuyển",
      color: "bg-amber-100 text-amber-700",
      step: 0,
    },
    da_xac_nhan: {
      label: "Đã hoàn tất cọc & phí VC",
      color: "bg-blue-100 text-blue-700",
      step: 1,
    },
    dang_giao: {
      label: "Đội xe B2B đang vận chuyển",
      color: "bg-indigo-100 text-indigo-700",
      step: 2,
    },
    da_giao_hang: {
      label: "Xe B2B đã giao tới nơi (Chờ thanh toán 85%)",
      color: "bg-purple-100 text-purple-700",
      step: 3,
    },
    hoan_thanh: {
      label: "Giao dịch hoàn tất 100%",
      color: "bg-emerald-100 text-emerald-700",
      step: 4,
    },
    da_huy: { label: "Đã hủy", color: "bg-rose-100 text-rose-700", step: -1 },
  };
  return (
    map[status] || {
      label: status,
      color: "bg-slate-100 text-slate-700",
      step: 0,
    }
  );
};

// --- TÁCH THÔNG TIN GIAO HÀNG TỪ CHUỖI ---
const parsedShippingInfo = computed(() => {
  if (!selectedOrder.value?.dia_chi_giao)
    return { name: "", phone: "", address: "" };
  const addressString = selectedOrder.value.dia_chi_giao;
  const parts = addressString.split(" - ");
  if (parts.length >= 3) {
    return {
      name: parts[0].trim(),
      phone: parts[1].trim(),
      address: parts.slice(2).join(" - ").trim(),
    };
  }
  return {
    name: selectedOrder.value.nguoiMua?.user?.full_name || "Khách hàng",
    phone: selectedOrder.value.nguoiMua?.user?.phone || "---",
    address: addressString,
  };
});

// --- CÁC HÀM GỌI API ---
const fetchDetail = async () => {
  if (!orderId) return;
  loading.value = true;
  try {
    const orderData = await DonHang.getById(orderId);
    if (orderData) {
      selectedOrder.value = orderData;
      await loadFarmerPayout();
    }
  } catch (error: any) {
    notify.error(error?.message || "Lỗi tải chi tiết đơn hàng!");
  } finally {
    loading.value = false;
  }
};

const handleCancelOrder = async (id: number) => {
  const confirmCancel = confirm(
    "Bạn có chắc chắn muốn hủy đơn hàng này không?",
  );
  if (!confirmCancel) return;
  isCanceling.value = true;
  try {
    await DonHang.update(id, { trang_thai_don: "da_huy" });
    notify.success("Đã hủy đơn hàng thành công!");
    selectedOrder.value.trang_thai_don = "da_huy";
  } catch (error) {
    notify.error("Không thể hủy đơn hàng lúc này.");
  } finally {
    isCanceling.value = false;
  }
};

const isUpdating = ref(false);

const handlePayFarmerShipping = async (orderId: number, fee: number) => {
  const confirmPay = confirm(
    `Bạn (Nông Dân) xác nhận thanh toán phí vận chuyển xe B2B: ${formatCurrency(fee)}?`,
  );
  if (!confirmPay) return;

  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, {
      nong_dan_da_tt_vanchuyen: true,
    });
    notify.success(
      `Đã thanh toán phí vận chuyển ${formatCurrency(fee)} thành công!`,
    );
    await fetchDetail();
  } catch (error) {
    notify.error("Lỗi khi thanh toán phí vận chuyển.");
  } finally {
    isUpdating.value = false;
  }
};

const submitEnterpriseDeposit = async (
  orderId: number,
  depositAmount: number,
) => {
  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, {
      doanh_nghiep_da_tt_coc: true,
      phuong_thuc_tt: paymentData.value.method,
    });
    notify.success(
      `Đã thanh toán đặt cọc 15% ${formatCurrency(depositAmount)} thành công!`,
    );
    await fetchDetail();
  } catch (error) {
    notify.error("Lỗi khi thanh toán tiền cọc.");
  } finally {
    isUpdating.value = false;
  }
};

const submitPayRemaining85 = async (
  orderId: number,
  remainingAmount: number,
) => {
  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, {
      trang_thai_don: "hoan_thanh",
      trang_thai_tt: "da_thanh_toan",
      phuong_thuc_tt: paymentData.value.method,
    });
    notify.success(`Đã thanh toán hoàn tất 100%! Giao dịch đã thành công.`);
    await fetchDetail();
  } catch (error) {
    notify.error("Lỗi khi thanh toán tiền còn lại.");
  } finally {
    isUpdating.value = false;
  }
};

const handleUpdateStatus = async (
  orderId: number,
  newStatus: string,
  confirmMsg?: string,
) => {
  if (confirmMsg && !confirm(confirmMsg)) return;
  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, { trang_thai_don: newStatus });
    notify.success("Cập nhật trạng thái thành công!");
    await fetchDetail();
  } catch (error) {
    notify.error("Lỗi khi cập nhật trạng thái đơn hàng");
  } finally {
    isUpdating.value = false;
  }
};

const handleReorder = async (order: any) => {
  if (!order.baidang_id) {
    notify.error("Đơn hàng này không có sản phẩm để mua lại.");
    return;
  }
  router.push(`/product/${order.baidang_id}`);
};

const handleReportIssue = (order: any) => {
  reportingOrder.value = order;
  showReportModal.value = true;
};

const goToProduct = (productId: number | undefined) => {
  if (productId) router.push(`/product/${productId}`);
};

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      userId.value = u.user_id || u.id;
    } catch (e) {
      console.error(e);
    }
  }
  if (orderId) fetchDetail();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <div v-if="loading" class="p-10 text-center text-slate-500 font-medium">
        Đang tải chi tiết đơn hàng...
      </div>

      <div v-else-if="selectedOrder" class="animate-fadeIn">
        <button
          @click="router.back()"
          class="mb-6 flex items-center text-slate-400 hover:text-slate-800 transition-colors font-black uppercase text-xs tracking-widest gap-1"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại danh sách
        </button>

        <div
          class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
        >
          <!-- HEDAER ĐƠN HÀNG -->
          <div class="bg-slate-50 p-6 md:p-8 border-b border-slate-200">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2
                  class="font-black text-2xl text-slate-800 tracking-tight uppercase"
                >
                  Mã đơn: #{{
                    selectedOrder.ma_don_hang || selectedOrder.donhang_id
                  }}
                </h2>
                <p class="text-slate-500 text-sm mt-1">
                  {{ new Date(selectedOrder.ngay_tao).toLocaleString("vi-VN") }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span
                  :class="[
                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest',
                    getStatusInfo(selectedOrder.trang_thai_don).color,
                  ]"
                >
                  {{ getStatusInfo(selectedOrder.trang_thai_don).label }}
                </span>

                <button
                  v-if="
                    selectedOrder.trang_thai_don === 'cho_xac_nhan' &&
                    selectedOrder.nguoi_mua_id === userId
                  "
                  @click="handleCancelOrder(selectedOrder.donhang_id)"
                  :disabled="isCanceling"
                  class="px-4 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]"
                    >close</span
                  >
                  {{ isCanceling ? "Đang hủy..." : "Hủy đơn hàng" }}
                </button>

                <!-- Nông dân -->
                <button
                  v-if="
                    selectedOrder.trang_thai_don === 'cho_xac_nhan' &&
                    selectedOrder.nguoi_ban_id === userId
                  "
                  @click="
                    handleUpdateStatus(selectedOrder.donhang_id, 'da_xac_nhan')
                  "
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]"
                    >check_circle</span
                  >
                  Xác nhận đơn
                </button>

                <button
                  v-if="
                    selectedOrder.trang_thai_don === 'da_xac_nhan' &&
                    selectedOrder.nguoi_ban_id === userId
                  "
                  @click="
                    handleUpdateStatus(selectedOrder.donhang_id, 'dang_giao')
                  "
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]"
                    >local_shipping</span
                  >
                  Bắt đầu giao
                </button>

                <!-- Doanh nghiệp -->
                <button
                  v-if="
                    selectedOrder.trang_thai_don === 'dang_giao' &&
                    selectedOrder.nguoi_mua_id === userId
                  "
                  @click="
                    handleUpdateStatus(
                      selectedOrder.donhang_id,
                      'hoan_thanh',
                      'Bạn xác nhận đã nhận đủ hàng, kiểm tra chất lượng đạt yêu cầu và đã thanh toán 85% phần còn lại?',
                    )
                  "
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]"
                    >verified</span
                  >
                  Đã nhận hàng & Hoàn tất
                </button>

                <!-- Đánh giá sản phẩm khi đã hoàn thành đơn hàng -->
                <div
                  v-if="
                    selectedOrder.trang_thai_don === 'hoan_thanh' &&
                    selectedOrder.nguoi_mua_id === userId
                  "
                >
                  <span
                    v-if="selectedOrder.danhGia"
                    class="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-black uppercase flex items-center gap-1"
                  >
                    <span
                      class="material-symbols-outlined text-[16px] text-amber-500"
                      >star</span
                    >
                    Đã đánh giá ({{ selectedOrder.danhGia.diem_tong }}/5★)
                  </span>
                  <button
                    v-else
                    @click="showRatingModal = true"
                    class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]"
                      >rate_review</span
                    >
                    Đánh giá sản phẩm
                  </button>
                </div>

                <button
                  v-if="
                    selectedOrder.nguoi_ban_id === userId &&
                    !['hoan_thanh', 'da_huy'].includes(
                      selectedOrder.trang_thai_don,
                    )
                  "
                  @click="handleReportIssue(selectedOrder)"
                  class="px-4 py-2 bg-[#FFF8E1] border border-[#FFE082] text-[#FF8F00] hover:bg-[#FFECB3] rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]"
                    >report_problem</span
                  >
                  Báo cáo sự cố
                </button>
              </div>
            </div>

            <!-- THANH TIẾN TRÌNH -->
            <div
              v-if="selectedOrder.trang_thai_don !== 'da_huy'"
              class="flex items-center justify-between mt-8 px-6 relative"
            >
              <div
                v-for="step in [0, 1, 2, 3]"
                :key="step"
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center z-10 font-black transition-all duration-500 shadow-sm text-sm border-2',
                  getStatusInfo(selectedOrder.trang_thai_don).step >= step
                    ? 'bg-[#2E7D32] border-[#2E7D32] text-white scale-110'
                    : 'bg-white text-slate-300 border-slate-200',
                ]"
              >
                {{ step + 1 }}
              </div>
              <div
                class="absolute h-1.5 bg-slate-100 left-12 right-12 top-[1.15rem] z-0 overflow-hidden rounded-full shadow-inner"
              >
                <div
                  class="h-full bg-[#2E7D32] transition-all duration-700 ease-in-out"
                  :style="{
                    width: `${(getStatusInfo(selectedOrder.trang_thai_don).step / 3) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- CỘT TRÁI: SẢN PHẨM -->
            <div>
              <h3
                class="font-black mb-5 text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-sm"
                  >inventory_2</span
                >
                Sản phẩm đã đặt (B2B)
              </h3>

              <div class="space-y-3">
                <div
                  v-for="item in selectedOrder.chiTiets"
                  :key="item.id"
                  @click="goToProduct(selectedOrder.baidang_id)"
                  class="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer hover:border-[#2E7D32]/50 transition-all group"
                >
                  <div class="flex-1">
                    <p
                      class="font-black text-sm text-slate-800 group-hover:text-[#2E7D32] transition-colors line-clamp-2"
                    >
                      {{
                        selectedOrder.baiDang?.ten_nong_san ||
                        "Bài đăng nông sản"
                      }}
                      - {{ item.phanLoai?.ten_phan_loai }}
                    </p>
                    <p class="font-bold text-[#d00000] text-sm mt-1">
                      {{ formatCurrency(item.don_gia) }} /
                      {{ selectedOrder.baiDang?.don_vi_tinh || "kg" }}
                    </p>
                    <div
                      class="mt-2 inline-flex bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-slate-600 uppercase"
                    >
                      Số lượng: {{ item.so_luong }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <h3
                  class="font-black mb-3 text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-sm"
                    >storefront</span
                  >
                  Đối tác giao dịch
                </h3>
                <div
                  class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2"
                >
                  <div v-if="selectedOrder.nguoi_mua_id === userId">
                    <p class="text-xs font-black text-slate-400 uppercase">
                      Nông dân (Người bán)
                    </p>
                    <p class="text-sm font-bold text-slate-800">
                      {{
                        selectedOrder.nguoiBan?.user?.full_name || "Không rõ"
                      }}
                    </p>
                    <p
                      class="text-sm text-slate-600 flex items-center gap-1 mt-1"
                    >
                      <span class="material-symbols-outlined text-[14px]"
                        >call</span
                      >
                      {{ selectedOrder.nguoiBan?.user?.phone || "---" }}
                    </p>
                    <FollowToggle
                      v-if="
                        selectedOrder.nguoiBan?.user?.user_id ||
                        selectedOrder.nguoiBan?.user_id
                      "
                      :sellerId="
                        selectedOrder.nguoiBan?.user?.user_id ||
                        selectedOrder.nguoiBan?.user_id
                      "
                      :sellerName="selectedOrder.nguoiBan?.user?.full_name"
                    />
                  </div>
                  <div v-else>
                    <p class="text-xs font-black text-slate-400 uppercase">
                      Doanh nghiệp (Người mua)
                    </p>
                    <p class="text-sm font-bold text-slate-800">
                      {{
                        selectedOrder.nguoiMua?.user?.full_name || "Không rõ"
                      }}
                    </p>
                    <p
                      class="text-sm text-slate-600 flex items-center gap-1 mt-1"
                    >
                      <span class="material-symbols-outlined text-[14px]"
                        >call</span
                      >
                      {{ selectedOrder.nguoiMua?.user?.phone || "---" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CỘT PHẢI: GIAO HÀNG & THANH TOÁN -->
            <div class="space-y-6">
              <!-- Giao hàng -->
              <div>
                <h4
                  class="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-sm"
                    >local_shipping</span
                  >
                  Thông tin nhận hàng
                </h4>
                <div
                  class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3"
                >
                  <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                      <p
                        class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1"
                      >
                        Người nhận
                      </p>
                      <p class="font-bold text-slate-800 text-sm">
                        {{ parsedShippingInfo.name }}
                      </p>
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1"
                      >
                        Số điện thoại
                      </p>
                      <p class="font-bold text-slate-800 text-sm">
                        {{ parsedShippingInfo.phone }}
                      </p>
                    </div>
                  </div>
                  <div class="pt-2 border-t border-slate-100">
                    <p
                      class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1"
                    >
                      Địa chỉ chi tiết
                    </p>
                    <p class="font-medium text-slate-700 text-sm">
                      {{ parsedShippingInfo.address }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-slate-100">
                    <p
                      class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1"
                    >
                      Phương thức vận chuyển
                    </p>
                    <p class="font-bold text-[#2E7D32] text-sm">
                      {{
                        selectedOrder.hinh_thuc_giao_hang === "tu_den_lay"
                          ? "Doanh nghiệp tự đến lấy"
                          : "Nông dân giao tận nơi"
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Thanh toán B2B & Phân chia chi phí -->
              <div
                class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4"
              >
                <div class="space-y-3 text-sm font-medium text-slate-600">
                  <div class="flex justify-between">
                    <span>Tổng tiền hàng nông sản:</span>
                    <span>{{ formatCurrency(selectedOrder.tong_tien) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Phí vận chuyển xe B2B (Nông dân chi trả):</span>
                    <span class="text-amber-900 font-bold">{{
                      formatCurrency(selectedOrder.phi_van_chuyen)
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between font-black text-slate-800 text-lg pt-3 border-t border-slate-200"
                  >
                    <span>Tổng giá trị đơn hàng:</span>
                    <span class="text-[#d00000]">{{
                      formatCurrency(selectedOrder.tong_tien)
                    }}</span>
                  </div>
                </div>

                <!-- BẢNG TRẠNG THÁI THANH TOÁN 2 BÊN -->
                <div class="space-y-3 pt-3 border-t border-slate-200">
                  <!-- 1. Nông Dân: Thực nhận sau khi trừ phí vận chuyển -->
                  <div
                    v-if="selectedOrder.nguoi_ban_id === userId"
                    class="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl space-y-2 text-xs"
                  >
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="font-bold text-amber-900 block"
                          >Tiền hàng thực nhận (sau khi trừ phí ship B2B):</span
                        >
                        <span class="text-[11px] text-amber-800">
                          Phí giao hàng sẽ được tự động trừ vào số tiền thanh
                          toán khi hoàn tất đơn.
                        </span>
                      </div>
                      <span class="font-black text-amber-950 text-sm">{{
                        formatCurrency(
                          selectedOrder.tong_tien -
                            (selectedOrder.phi_van_chuyen || 0),
                        )
                      }}</span>
                    </div>
                  </div>

                  <!-- 2. Thanh toán Đặt Cọc 15% của Doanh Nghiệp -->
                  <div
                    class="p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-xl space-y-2 text-xs"
                  >
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="font-bold text-emerald-900 block"
                          >🏢 Doanh Nghiệp: Đặt cọc 15% đơn hàng</span
                        >
                        <span
                          class="text-[11px]"
                          :class="
                            selectedOrder.doanh_nghiep_da_tt_coc
                              ? 'text-emerald-700 font-bold'
                              : 'text-emerald-800'
                          "
                        >
                          {{
                            selectedOrder.doanh_nghiep_da_tt_coc
                              ? "✅ Đã hoàn tất thanh toán đặt cọc 15%"
                              : "⏳ Chưa đặt cọc 15%"
                          }}
                        </span>
                      </div>
                      <span class="font-black text-emerald-950 text-sm">{{
                        formatCurrency(
                          selectedOrder.tien_coc ||
                            selectedOrder.tong_tien * 0.15,
                        )
                      }}</span>
                    </div>

                    <button
                      v-if="
                        !selectedOrder.doanh_nghiep_da_tt_coc &&
                        selectedOrder.nguoi_mua_id === userId &&
                        selectedOrder.trang_thai_don !== 'da_huy'
                      "
                      @click="
                        openPaymentModal(
                          'coc',
                          selectedOrder.tien_coc ||
                            selectedOrder.tong_tien * 0.15,
                        )
                      "
                      :disabled="isUpdating"
                      class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow transition"
                    >
                      💳 Doanh Nghiệp Thanh Toán Đặt Cọc 15% ({{
                        formatCurrency(
                          selectedOrder.tien_coc ||
                            selectedOrder.tong_tien * 0.15,
                        )
                      }})
                    </button>
                  </div>

                  <!-- Thông báo tiến độ vận chuyển xe B2B -->
                  <div
                    v-if="
                      selectedOrder.doanh_nghiep_da_tt_coc &&
                      selectedOrder.trang_thai_don === 'dang_giao'
                    "
                    class="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900"
                  >
                    🚚 <strong>Đã đủ điều kiện vận chuyển!</strong> Hệ thống xe
                    B2B đã được kích hoạt, đang lấy hàng từ Nông dân và chuyển
                    đến Doanh nghiệp.
                  </div>

                  <!-- 3. Thanh toán 85% còn lại khi xe B2B đã giao tới nơi -->
                  <div
                    v-if="selectedOrder.trang_thai_don === 'da_giao_hang'"
                    class="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3 text-xs"
                  >
                    <div
                      class="flex items-center gap-2 text-purple-950 font-bold"
                    >
                      <span class="text-xl">📍</span>
                      <div>
                        <h4>Xe vận chuyển B2B đã giao hàng đến nơi!</h4>
                        <p class="text-[11px] font-normal text-purple-800">
                          Doanh nghiệp vui lòng thanh toán 85% số tiền còn lại
                          để nhận hàng hoàn tất giao dịch.
                        </p>
                      </div>
                    </div>

                    <button
                      v-if="selectedOrder.nguoi_mua_id === userId"
                      @click="
                        openPaymentModal(
                          'con_lai',
                          selectedOrder.tong_tien - selectedOrder.tien_coc,
                        )
                      "
                      :disabled="isUpdating"
                      class="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      💳 Thanh Toán 85% Còn Lại ({{
                        formatCurrency(
                          selectedOrder.tong_tien - selectedOrder.tien_coc,
                        )
                      }}) Để Nhận Hàng
                    </button>
                  </div>
                </div>
              </div>

              <button
                v-if="
                  ['hoan_thanh', 'da_huy'].includes(
                    selectedOrder.trang_thai_don,
                  ) && selectedOrder.nguoi_mua_id === userId
                "
                @click="handleReorder(selectedOrder)"
                class="w-full mt-2 bg-[#2E7D32] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#1B5E20] transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">shopping_cart</span> Mua
                lại sản phẩm này
              </button>

              <!-- CÀI ĐẶT NHẬN TIỀN CỦA NÔNG DÂN -->
              <div
                v-if="selectedOrder.nguoi_ban_id === userId"
                class="mt-6 bg-amber-50/50 p-5 rounded-2xl border border-amber-200"
              >
                <h3
                  class="font-black text-amber-900 mb-4 flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg"
                    >account_balance_wallet</span
                  >
                  Cài đặt phương thức nhận tiền
                </h3>
                <div class="space-y-4">
                  <div class="flex gap-4">
                    <label
                      class="flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="farmerPayoutInfo.phuong_thuc_nhan_tien"
                        value="tien_mat"
                        class="text-amber-600 focus:ring-amber-500"
                      />
                      Tiền mặt trực tiếp
                    </label>
                    <label
                      class="flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="farmerPayoutInfo.phuong_thuc_nhan_tien"
                        value="chuyen_khoan"
                        class="text-amber-600 focus:ring-amber-500"
                      />
                      Chuyển khoản ngân hàng
                    </label>
                  </div>

                  <div
                    v-if="
                      farmerPayoutInfo.phuong_thuc_nhan_tien === 'chuyen_khoan'
                    "
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                  >
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1"
                        >Tên ngân hàng</label
                      >
                      <input
                        v-model="farmerPayoutInfo.ngan_hang"
                        type="text"
                        placeholder="VD: Vietcombank, MBBank..."
                        class="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1"
                        >Số tài khoản</label
                      >
                      <input
                        v-model="farmerPayoutInfo.so_tai_khoan"
                        type="text"
                        placeholder="Nhập số tài khoản"
                        class="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition"
                      />
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-slate-600 mb-1"
                        >Tên chủ tài khoản (Viết hoa không dấu)</label
                      >
                      <input
                        v-model="farmerPayoutInfo.chu_tai_khoan"
                        type="text"
                        placeholder="NGUYEN VAN A"
                        class="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition uppercase"
                      />
                    </div>
                  </div>

                  <button
                    @click="saveFarmerPayout"
                    :disabled="isSavingPayout"
                    class="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow"
                  >
                    {{
                      isSavingPayout ? "Đang lưu..." : "Lưu thông tin nhận tiền"
                    }}
                  </button>
                  <p class="text-[11px] text-slate-500 text-center mt-2">
                    * Thông tin này sẽ được lưu cho các lần nhận tiền tiếp theo
                    của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL THANH TOÁN (DOANH NGHIỆP) -->
    <Teleport to="body">
      <div
        v-if="showPaymentModal"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      >
        <div
          class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div
            class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50"
          >
            <h3 class="font-black text-lg text-slate-800 tracking-tight">
              Thanh Toán Trực Tuyến
            </h3>
            <button
              @click="showPaymentModal = false"
              class="text-slate-400 hover:text-slate-700 transition p-1.5 bg-white rounded-full shadow-sm"
            >
              <span class="material-symbols-outlined block text-[20px]"
                >close</span
              >
            </button>
          </div>

          <div class="p-6 space-y-6 flex-1 overflow-y-auto">
            <p class="text-sm text-slate-600 font-medium">
              Vui lòng chọn phương thức thanh toán và quét mã QR để hoàn tất số
              tiền
              <strong class="text-emerald-700 text-lg ml-1">{{
                formatCurrency(paymentData.amount)
              }}</strong
              >.
            </p>

            <div class="flex gap-3">
              <button
                @click="paymentData.method = 'momo'"
                :class="[
                  'flex-1 py-3 border-2 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition',
                  paymentData.method === 'momo'
                    ? 'bg-[#a50064] text-white border-[#a50064] shadow-md shadow-pink-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#a50064] hover:text-[#a50064] hover:bg-pink-50',
                ]"
              >
                <span class="material-symbols-outlined text-[24px]"
                  >account_balance_wallet</span
                >
                MoMo
              </button>
              <button
                @click="paymentData.method = 'chuyen_khoan'"
                :class="[
                  'flex-1 py-3 border-2 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition',
                  paymentData.method === 'chuyen_khoan'
                    ? 'bg-[#0052cc] text-white border-[#0052cc] shadow-md shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0052cc] hover:text-[#0052cc] hover:bg-blue-50',
                ]"
              >
                <span class="material-symbols-outlined text-[24px]"
                  >qr_code_scanner</span
                >
                VietQR
              </button>
            </div>

            <!-- Khu vực QR code giả lập -->
            <div
              :class="[
                'border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-colors',
                paymentData.method === 'momo'
                  ? 'bg-pink-50/50 border-[#a50064]/30'
                  : 'bg-blue-50/50 border-[#0052cc]/30',
              ]"
            >
              <div
                class="relative bg-white p-3.5 rounded-2xl shadow-sm transition-all"
                :class="
                  paymentData.method === 'momo'
                    ? 'ring-4 ring-[#a50064]/10'
                    : 'ring-4 ring-[#0052cc]/10'
                "
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                  class="w-44 h-44 opacity-90 mix-blend-multiply"
                  alt="QR Code"
                />

                <!-- Logo ở giữa -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div
                    class="bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center justify-center"
                  >
                    <img
                      v-if="paymentData.method === 'momo'"
                      src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                      class="w-8 h-8 object-contain"
                      alt="MoMo Logo"
                    />
                    <img
                      v-else
                      src="https://upload.wikimedia.org/wikipedia/commons/c/ca/VietQR_Logo.svg"
                      class="w-12 h-6 object-contain"
                      alt="VietQR Logo"
                    />
                  </div>
                </div>
              </div>

              <p class="text-[13px] text-slate-500 mt-5 font-medium px-2">
                Mở ứng dụng
                <strong
                  :class="
                    paymentData.method === 'momo'
                      ? 'text-[#a50064]'
                      : 'text-[#0052cc]'
                  "
                  >{{
                    paymentData.method === "momo" ? "MoMo" : "Ngân hàng"
                  }}</strong
                >
                để quét mã.<br />
                <span class="opacity-70 font-normal mt-1 block"
                  >(Đây là giao diện giả lập Demo)</span
                >
              </p>
            </div>
          </div>

          <div class="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button
              @click="showPaymentModal = false"
              class="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              @click="confirmPayment"
              :disabled="isUpdating"
              class="flex-[2] py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined" v-if="!isUpdating"
                >check_circle</span
              >
              {{ isUpdating ? "Đang xử lý..." : "Xác nhận chuyển khoản" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <ReportModal
      v-if="userId && reportingOrder"
      :show="showReportModal"
      :order="reportingOrder"
      :userId="userId"
      @close="showReportModal = false"
      @success="fetchDetail"
    />

    <RatingModal
      v-if="selectedOrder"
      :show="showRatingModal"
      :order="selectedOrder"
      @close="showRatingModal = false"
      @success="fetchDetail"
    />
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
