<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { BaoGiaService, type BaoGiaNhuCau } from "@/service/baogia";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const nhucau_id = Number(route.params.id);
const loading = ref(true);
const nhuCau = ref<NhuCauThuMua | null>(null);
const matchingProducts = ref<any[]>([]);
const offerList = ref<BaoGiaNhuCau[]>([]);

const user = ref<any>(null);

// Saved locations state
const savedLocations = ref<any[]>([]);
const selectedSavedLocation = ref("");
const saveLocationName = ref("");
const isSavingLocation = ref(false);

// Modal Chào hàng / Báo giá
const showOfferModal = ref(false);
const offerForm = ref({
  so_luong_cung_cap: 100,
  gia_de_xuat: 0,
  chenh_lech_gia: 0,
  tinh_thanh_cung_cap: "Cần Thơ",
  dia_chi_cung_cap: "",
  latitude_cung_cap: null as number | null,
  longitude_cung_cap: null as number | null,
  ghi_chu: "",
});

const provinces = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Cần Thơ",
  "Đà Nẵng",
  "An Giang",
  "Bến Tre",
  "Đồng Tháp",
  "Tiền Giang",
  "Lâm Đồng",
  "Đắk Lắk",
  "Gia Lai",
  "Long An",
  "Vĩnh Long",
];

const isFarmer = computed(() => user.value?.role?.toUpperCase() === "NONG_DAN");
const isOwner = computed(() => {
  if (!user.value || !nhuCau.value) return false;
  const userId = user.value.user_id || user.value.id;
  return nhuCau.value.doanh_nghiep_id === userId;
});

const fetchSavedLocations = async () => {
  const userId = user.value?.user_id || user.value?.id;
  if (!userId) return;
  try {
    const res = await api.get(`/dia-chi-luu/user/${userId}`);
    savedLocations.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find((l) => l.id == val);
    if (loc) {
      if (loc.dia_chi) offerForm.value.dia_chi_cung_cap = loc.dia_chi;
      if (loc.latitude)
        offerForm.value.latitude_cung_cap = Number(loc.latitude);
      if (loc.longitude)
        offerForm.value.longitude_cung_cap = Number(loc.longitude);

      if (loc.dia_chi) {
        const foundProv = provinces.find((p) => loc.dia_chi.includes(p));
        if (foundProv) offerForm.value.tinh_thanh_cung_cap = foundProv;
      }
    }
  }
});

const saveCurrentSupplyLocation = async () => {
  if (!offerForm.value.dia_chi_cung_cap.trim()) {
    notify.error("Vui lòng nhập địa chỉ kho / vườn cụ thể trước khi lưu!");
    return;
  }
  if (!saveLocationName.value.trim()) {
    notify.error(
      "Vui lòng nhập tên gợi nhớ cho vị trí (ví dụ: Kho số 1, Vườn sầu riêng)!",
    );
    return;
  }

  const userId = user.value?.user_id || user.value?.id;
  isSavingLocation.value = true;
  try {
    await api.post("/dia-chi-luu", {
      user_id: userId,
      ten_goi: saveLocationName.value.trim(),
      dia_chi: `${offerForm.value.dia_chi_cung_cap}, ${offerForm.value.tinh_thanh_cung_cap}`,
      latitude: offerForm.value.latitude_cung_cap || undefined,
      longitude: offerForm.value.longitude_cung_cap || undefined,
    });
    notify.success("Đã lưu địa chỉ xuất hàng thành công!");
    saveLocationName.value = "";
    fetchSavedLocations();
  } catch (e: any) {
    notify.error("Lỗi khi lưu địa chỉ!");
  } finally {
    isSavingLocation.value = false;
  }
};
void saveCurrentSupplyLocation;

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

const fetchDetail = async () => {
  loading.value = true;
  try {
    const data = await NhuCauService.getById(nhucau_id);
    nhuCau.value = data;
    offerList.value = data.baoGiaList || [];

    // Fetch matching products by category
    if (data.danhmuc_id) {
      try {
        const prodRes = await api.get("/bai-dang", {
          params: { danhmuc_id: data.danhmuc_id },
        });
        matchingProducts.value = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.data || [];
      } catch (e) {
        console.error(e);
      }
    }
  } catch (e: any) {
    notify.error("Không tìm thấy nhu cầu thu mua");
  } finally {
    loading.value = false;
  }
};

const getHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const openOfferModal = () => {
  if (!user.value) {
    notify.info("Vui lòng đăng nhập tài khoản Nông Dân để chào hàng");
    router.push("/auth/nong-dan");
    return;
  }
  if (!isFarmer.value) {
    notify.error("Chỉ tài khoản Nông Dân mới có thể gửi báo giá");
    return;
  }

  if (!nhuCau.value) return;
  router.push(`/gui-bao-gia/${nhuCau.value.nhucau_id}`);
};

const estimatedDistance = computed(() => {
  if (!nhuCau.value) return 25;
  const item = nhuCau.value;
  const fLat = offerForm.value.latitude_cung_cap;
  const fLng = offerForm.value.longitude_cung_cap;
  const eLat = (item as any).latitude ? Number((item as any).latitude) : null;
  const eLng = (item as any).longitude ? Number((item as any).longitude) : null;

  if (fLat && fLng && eLat && eLng) {
    return getHaversineDistance(fLat, fLng, eLat, eLng);
  }

  const farmerProv = (offerForm.value.tinh_thanh_cung_cap || "")
    .trim()
    .toLowerCase();
  const enterpProv = (item.tinh_thanh_giao || "").trim().toLowerCase();

  if (farmerProv && enterpProv && farmerProv === enterpProv) {
    return 15;
  }
  return 75;
});

const calculatedShippingFee = computed(() => {
  const dist = estimatedDistance.value;
  const qty = Number(offerForm.value.so_luong_cung_cap) || 0;
  let pricePerKm = 18000;
  if (qty > 1000) pricePerKm = 24500;
  let fee = 25000;
  if (dist > 4) {
    fee += (dist - 4) * pricePerKm;
  }
  return fee;
});

const onGiaChange = () => {
  if (!nhuCau.value?.gia_tham_khao) return;
  const giaGoc = Number(nhuCau.value.gia_tham_khao);
  const giaMoi = Number(offerForm.value.gia_de_xuat);
  offerForm.value.chenh_lech_gia = giaMoi - giaGoc;
};

const submitOffer = async () => {
  if (!nhuCau.value || !user.value) return;
  const userId = user.value.user_id || user.value.id;

  try {
    await BaoGiaService.create({
      nhucau_id: nhuCau.value.nhucau_id,
      nong_dan_id: userId,
      so_luong_cung_cap: Number(offerForm.value.so_luong_cung_cap),
      don_vi: nhuCau.value.don_vi || "kg",
      gia_de_xuat: Number(offerForm.value.gia_de_xuat),
      chenh_lech_gia: Number(offerForm.value.chenh_lech_gia),
      tinh_thanh_cung_cap: offerForm.value.tinh_thanh_cung_cap,
      dia_chi_cung_cap: offerForm.value.dia_chi_cung_cap,
      latitude_cung_cap: offerForm.value.latitude_cung_cap || undefined,
      longitude_cung_cap: offerForm.value.longitude_cung_cap || undefined,
      khoang_cach_km: estimatedDistance.value,
      phi_van_chuyen: calculatedShippingFee.value,
      ghi_chu: offerForm.value.ghi_chu,
    });

    Swal.fire({
      icon: "success",
      title: "Gửi báo giá chào hàng thành công!",
      text: "Doanh nghiệp đã nhận được báo giá và sẽ phản hồi cho bạn sớm nhất.",
      confirmButtonColor: "#10b981",
    });
    showOfferModal.value = false;
    fetchDetail();
  } catch (e: any) {
    notify.error(
      e.response?.data?.message || "Không thể gửi báo giá. Vui lòng thử lại.",
    );
  }
};

const contactEnterprise = () => {
  if (!user.value) {
    notify.error("Vui lòng đăng nhập để gửi tin nhắn!");
    return;
  }
  if (!nhuCau.value?.doanhNghiep?.user_id) return;
  router.push(`/messages?partnerId=${nhuCau.value.doanhNghiep.user_id}`);
};

const formatPrice = (val?: number) => {
  if (!val) return "Thương lượng";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Chưa xác định";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

onMounted(() => {
  checkUser();
  fetchDetail();
});
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8 pb-12">
    <!-- Back button -->
    <div>
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
      >
        <span>←</span> Quay lại danh sách
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"
      ></div>
    </div>

    <template v-else-if="nhuCau">
      <!-- ===== MAIN DEMAND HEADER CARD ===== -->
      <div
        class="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6"
      >
        <div
          class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6"
        >
          <div class="space-y-2 max-w-2xl">
            <span
              v-if="nhuCau.danhMuc"
              class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
            >
              🏷️ {{ nhuCau.danhMuc.ten_danh_muc }}
            </span>
            <h1
              class="text-2xl md:text-3xl font-black text-slate-900 leading-tight"
            >
              {{ nhuCau.ten_nong_san }}
            </h1>
            <p class="text-xs text-slate-500 flex items-center gap-2">
              <span>📍 Địa điểm giao hàng:</span>
              <strong class="text-slate-700">{{
                nhuCau.dia_chi_giao || nhuCau.tinh_thanh_giao || "Toàn quốc"
              }}</strong>
            </p>
          </div>

          <div
            class="text-right space-y-1 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 min-w-[200px]"
          >
            <span class="text-xs text-emerald-700 font-medium block"
              >Giá niêm yết tham khảo:</span
            >
            <span class="text-2xl font-black text-emerald-700 block">
              {{ formatPrice(nhuCau.gia_tham_khao) }}
            </span>
            <span class="text-[11px] text-slate-500 font-medium"
              >Đơn vị: {{ nhuCau.don_vi }}</span
            >
          </div>
        </div>

        <!-- Specifications Grid -->
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs"
        >
          <div>
            <span class="text-slate-400 block mb-0.5"
              >Số lượng cần thu mua:</span
            >
            <span class="font-black text-base text-slate-800"
              >{{ nhuCau.so_luong_can }} {{ nhuCau.don_vi }}</span
            >
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Thương lượng giá:</span>
            <span class="font-bold text-emerald-700 text-sm">
              {{
                nhuCau.cho_thuong_luong ? "Cho phép thương lượng" : "Cố định"
              }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Yêu cầu chứng nhận:</span>
            <span class="font-bold text-amber-800 text-sm">
              {{ nhuCau.yeu_cau_chung_nhan || "Không yêu cầu" }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Hạn chót thu mua:</span>
            <span class="font-bold text-slate-800 text-sm">{{
              formatDate(nhuCau.ngay_ket_thuc)
            }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h3 class="font-bold text-slate-800 text-sm">
            Mô tả chi tiết yêu cầu:
          </h3>
          <p
            class="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line"
          >
            {{ nhuCau.mo_ta || "Không có mô tả thêm." }}
          </p>
        </div>

        <!-- Enterprise Contact Info Box -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-2xl shadow-md"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl"
            >
              🏢
            </div>
            <div>
              <h4 class="font-bold text-base">
                {{
                  nhuCau.doanhNghiep?.ten_cong_ty ||
                  nhuCau.doanhNghiep?.user?.full_name ||
                  "Doanh Nghiệp Thu Mua"
                }}
              </h4>
              <p class="text-xs text-emerald-200">
                SĐT:
                {{
                  nhuCau.doanhNghiep?.so_dien_thoai ||
                  nhuCau.doanhNghiep?.user?.phone ||
                  "Bảo mật"
                }}
                | Email:
                {{
                  nhuCau.doanhNghiep?.email_lien_he ||
                  nhuCau.doanhNghiep?.user?.email ||
                  "N/A"
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="contactEnterprise"
              class="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition flex items-center gap-1.5"
            >
              💬 Nhắn tin trực tiếp
            </button>
            <button
              v-if="!isOwner"
              @click="openOfferModal"
              class="px-6 py-2.5 bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl shadow-lg hover:bg-emerald-300 transition flex items-center gap-1.5"
            >
              🏷️ Gửi Báo Giá Chào Hàng
            </button>
          </div>
        </div>
      </div>

      <!-- ===== NEGOTIATION / OFFERS HISTORY FOR ENTERPRISE & FARMER ===== -->
      <div
        v-if="offerList.length > 0"
        class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4"
      >
        <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
          <span>📋</span> Danh sách báo giá đã gửi cho nhu cầu này ({{
            offerList.length
          }})
        </h3>

        <div class="divide-y divide-slate-100">
          <div
            v-for="offer in offerList"
            :key="offer.baogia_id"
            class="py-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs">
                <span class="font-bold text-slate-800">
                  👨‍🌾
                  {{
                    offer.nongDan?.ho_ten ||
                    offer.nongDan?.user?.full_name ||
                    "Nông Dân"
                  }}
                </span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="{
                    'bg-amber-100 text-amber-800':
                      offer.trang_thai === 'cho_doanh_nghiep',
                    'bg-blue-100 text-blue-800':
                      offer.trang_thai === 'cho_nong_dan',
                    'bg-emerald-100 text-emerald-800':
                      offer.trang_thai === 'da_thong_nhat',
                    'bg-red-100 text-red-800': offer.trang_thai === 'tu_choi',
                  }"
                >
                  {{
                    offer.trang_thai === "cho_doanh_nghiep"
                      ? "Chờ DN phản hồi"
                      : offer.trang_thai === "cho_nong_dan"
                        ? "Chờ Nông dân phản hồi"
                        : offer.trang_thai === "da_thong_nhat"
                          ? "Đã chốt thống nhất"
                          : "Từ chối"
                  }}
                </span>
              </div>
              <p class="text-xs text-slate-600">
                Chào bán:
                <strong class="text-slate-800"
                  >{{ offer.so_luong_cung_cap }} {{ offer.don_vi }}</strong
                >
                với giá:
                <strong class="text-emerald-700">{{
                  formatPrice(offer.gia_de_xuat)
                }}</strong>
                <span
                  v-if="offer.phi_van_chuyen"
                  class="text-amber-800 font-medium ml-2"
                >
                  (Phí giao hàng: {{ formatPrice(offer.phi_van_chuyen) }})
                </span>
              </p>
            </div>

            <RouterLink
              :to="`/phan-hoi-bao-gia/${offer.baogia_id}`"
              class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
            >
              Mở Giao Diện Thương Lượng →
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- ===== MATCHING FARMER PRODUCTS ===== -->
      <div v-if="matchingProducts.length > 0" class="space-y-4">
        <h3 class="font-black text-slate-900 text-lg flex items-center gap-2">
          <span>🌿</span> Sản phẩm sẵn có cùng danh mục của Nông Dân
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="prod in matchingProducts"
            :key="prod.baidang_id"
            class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
          >
            <h4 class="font-bold text-slate-800 text-sm line-clamp-1">
              {{ prod.tieu_de }}
            </h4>
            <div class="text-xs text-slate-600 space-y-1">
              <p>
                Số lượng có:
                <strong class="text-slate-800"
                  >{{ prod.so_luong_con_lai }} {{ prod.don_vi_tinh }}</strong
                >
              </p>
              <p>
                Giá cố định:
                <strong class="text-emerald-700">{{
                  formatPrice(prod.gia_per_kg)
                }}</strong>
              </p>
              <p>
                Nông dân:
                <strong class="text-slate-700">{{
                  prod.nguoiDang?.ho_ten || "Nông dân"
                }}</strong>
              </p>
            </div>
            <RouterLink
              :to="`/product/${prod.baidang_id}`"
              class="block w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
            >
              Xem Bài Đăng Sản Phẩm
            </RouterLink>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MODAL GỬI BÁO GIÁ ===== -->
    <div
      v-if="showOfferModal && nhuCau"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative border border-slate-100 max-h-[82vh] overflow-y-auto my-auto"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-4"
        >
          <div>
            <h3 class="text-lg font-black text-slate-900">
              Gửi Báo Giá Chào Hàng
            </h3>
            <p class="text-xs text-slate-500">
              Nhu cầu:
              <span class="font-bold text-emerald-700">{{
                nhuCau.ten_nong_san
              }}</span>
            </p>
          </div>
          <button
            @click="showOfferModal = false"
            class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Số lượng bạn có thể cung cấp ({{ nhuCau.don_vi }}):
            </label>
            <input
              v-model.number="offerForm.so_luong_cung_cap"
              type="number"
              min="1"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Giá bạn đề xuất (VNĐ / {{ nhuCau.don_vi }}):
            </label>
            <input
              v-model.number="offerForm.gia_de_xuat"
              type="number"
              step="500"
              @input="onGiaChange"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Địa điểm cung cấp của Nông dân -->
          <div
            class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5"
          >
            <label
              class="block font-bold text-slate-800 text-xs flex items-center justify-between"
            >
              <span>📍 Địa điểm xuất hàng / Kho nông sản của bạn (*):</span>
              <span
                class="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                Tự động tính khoảng cách
              </span>
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-slate-500 block text-[11px] mb-1"
                  >Tỉnh / Thành phố xuất hàng:</span
                >
                <select
                  v-model="offerForm.tinh_thanh_cung_cap"
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option v-for="prov in provinces" :key="prov" :value="prov">
                    {{ prov }}
                  </option>
                </select>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px] mb-1"
                  >Địa chỉ kho / vườn cụ thể:</span
                >
                <input
                  v-model="offerForm.dia_chi_cung_cap"
                  type="text"
                  placeholder="Ví dụ: Nông trại Ấp 3, Xã Tân Thuận..."
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div
            class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-amber-900"
          >
            <div class="flex justify-between font-semibold">
              <span>🚚 Khoảng cách tính toán (Nông dân ➔ DN):</span>
              <span class="font-bold text-amber-950 text-sm"
                >{{ estimatedDistance }} km</span
              >
            </div>
            <div class="flex justify-between font-semibold">
              <span>💰 Phí giao hàng (Nông dân chi trả):</span>
              <span class="font-bold text-amber-950 text-sm">{{
                formatPrice(calculatedShippingFee)
              }}</span>
            </div>
            <p
              class="text-[10px] text-amber-700 leading-normal pt-1 border-t border-amber-200/60"
            >
              💡 Phí giao hàng được tự động tính theo khoảng cách từ
              <strong>{{
                offerForm.tinh_thanh_cung_cap || "vị trí Nông dân"
              }}</strong>
              đến <strong>{{ nhuCau.tinh_thanh_giao || "Doanh nghiệp" }}</strong
              >.
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Ghi chú thương lượng:</label
            >
            <textarea
              v-model="offerForm.ghi_chu"
              rows="3"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            @click="showOfferModal = false"
            class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
          >
            Hủy
          </button>
          <button
            @click="submitOffer"
            class="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg"
          >
            Gửi Báo Giá Ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
