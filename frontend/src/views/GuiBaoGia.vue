<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { BaoGiaService } from "@/service/baogia";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const route = useRoute();
const router = useRouter();
const nhucau_id = Number(route.params.id);

const loading = ref(true);
const submitting = ref(false);
const nhuCau = ref<NhuCauThuMua | null>(null);

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const userId = user?.user_id || user?.id;

const offerForm = ref({
  so_luong_cung_cap: 100,
  gia_de_xuat: 50000,
  chenh_lech_gia: 0,
  tinh_thanh_cung_cap: user?.tinh_thanh || "Cần Thơ",
  dia_chi_cung_cap: user?.dia_chi_cu_the || user?.dia_chi || "",
  latitude_cung_cap: user?.latitude ? Number(user.latitude) : null,
  longitude_cung_cap: user?.longitude ? Number(user.longitude) : null,
  ghi_chu: "",
  tieu_chuan_nong_dan: "",
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

// Saved locations state
const savedLocations = ref<any[]>([]);
const selectedSavedLocation = ref("");
const saveLocationName = ref("");
const isSavingLocation = ref(false);

// Map states
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
const searchLocationText = ref("");
const isSearching = ref(false);

const isPriceUnchanged = computed(() => {
  if (!nhuCau.value?.gia_tham_khao) return false;
  return (
    Math.abs(
      Number(offerForm.value.gia_de_xuat) - Number(nhuCau.value.gia_tham_khao),
    ) < 1
  );
});

const isStandardMatched = computed(() => {
  if (!nhuCau.value?.yeu_cau_chung_nhan) return true;
  const yeuCau = nhuCau.value.yeu_cau_chung_nhan.toLowerCase().trim();
  const nongDanCo = offerForm.value.tieu_chuan_nong_dan.toLowerCase().trim();
  if (!yeuCau) return true;
  return nongDanCo.includes(yeuCau);
});

const canInstantOrder = computed(() => {
  return isPriceUnchanged.value && isStandardMatched.value;
});

const fetchSavedLocations = async () => {
  if (!userId) return;
  try {
    const res = await api.get(`/dia-chi-luu/user/${userId}`);
    savedLocations.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const initMap = () => {
  if (map) return;
  const initLat = offerForm.value.latitude_cung_cap || 10.762622;
  const initLng = offerForm.value.longitude_cung_cap || 106.660172;

  map = L.map("post-map").setView([initLat, initLng], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  map.on("click", (e: L.LeafletMouseEvent) => {
    moveToLocation(e.latlng.lat, e.latlng.lng);
  });

  if (offerForm.value.latitude_cung_cap && offerForm.value.longitude_cung_cap) {
    moveToLocation(
      offerForm.value.latitude_cung_cap,
      offerForm.value.longitude_cung_cap,
    );
  }
};

const moveToLocation = (lat: number, lng: number) => {
  if (!map) return;
  map.setView([lat, lng], 14);
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Vị trí xuất hàng của bạn")
    .openPopup();
  offerForm.value.latitude_cung_cap = lat;
  offerForm.value.longitude_cung_cap = lng;
};

const handleSearchLocation = async () => {
  if (!searchLocationText.value) return;
  const text = searchLocationText.value.trim();

  const coordRegex =
    /^\s*\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?\s*$/;
  const match = text.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    moveToLocation(lat, lng);
    return;
  }

  isSearching.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`,
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      moveToLocation(lat, lng);

      const display_name = data[0].display_name || "";
      offerForm.value.dia_chi_cung_cap = display_name;
      const foundProv = provinces.find((p) => display_name.includes(p));
      if (foundProv) {
        offerForm.value.tinh_thanh_cung_cap = foundProv;
      }
      notify.success("Đã tìm thấy vị trí!");
    } else {
      notify.error("Không tìm thấy địa điểm này!");
    }
  } catch (e) {
    notify.error("Lỗi khi tìm kiếm địa điểm!");
  } finally {
    isSearching.value = false;
  }
};

watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find((l) => l.id == val);
    if (loc) {
      if (loc.dia_chi) {
        offerForm.value.dia_chi_cung_cap = loc.dia_chi;
        const foundProv = provinces.find((p) => loc.dia_chi.includes(p));
        if (foundProv) offerForm.value.tinh_thanh_cung_cap = foundProv;
      }
      if (loc.latitude && loc.longitude) {
        offerForm.value.latitude_cung_cap = Number(loc.latitude);
        offerForm.value.longitude_cung_cap = Number(loc.longitude);
        moveToLocation(Number(loc.latitude), Number(loc.longitude));
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

  isSavingLocation.value = true;
  try {
    await api.post("/dia-chi-luu", {
      user_id: userId,
      ten_goi: saveLocationName.value.trim(),
      dia_chi: offerForm.value.dia_chi_cung_cap.includes(
        offerForm.value.tinh_thanh_cung_cap,
      )
        ? offerForm.value.dia_chi_cung_cap
        : `${offerForm.value.dia_chi_cung_cap}, ${offerForm.value.tinh_thanh_cung_cap}`,
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

const getHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
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

const estimatedDistance = computed(() => {
  if (!nhuCau.value) return 25;
  const item = nhuCau.value;
  const fLat = offerForm.value.latitude_cung_cap;
  const fLng = offerForm.value.longitude_cung_cap;
  const eLat = item.latitude ? Number(item.latitude) : null;
  const eLng = item.longitude ? Number(item.longitude) : null;

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

const loadDemandDetail = async () => {
  loading.value = true;
  try {
    const data = await NhuCauService.getById(nhucau_id);
    nhuCau.value = data;

    offerForm.value.so_luong_cung_cap = Number(data.so_luong_can) || 100;
    offerForm.value.gia_de_xuat = Number(data.gia_tham_khao) || 50000;
    offerForm.value.chenh_lech_gia = 0;
  } catch (e: any) {
    notify.error("Không tìm thấy thông tin nhu cầu thu mua");
    router.push("/nhu-cau");
  } finally {
    loading.value = false;
  }
};

const submitOffer = async () => {
  if (!nhuCau.value || !user) return;
  if (
    !offerForm.value.so_luong_cung_cap ||
    offerForm.value.so_luong_cung_cap <= 0
  ) {
    notify.error("Vui lòng nhập số lượng chào bán hợp lệ!");
    return;
  }
  if (!offerForm.value.gia_de_xuat || offerForm.value.gia_de_xuat <= 0) {
    notify.error("Vui lòng nhập giá đề xuất hợp lệ!");
    return;
  }

  submitting.value = true;
  try {
    const res: any = await BaoGiaService.create({
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
      tieu_chuan_nong_dan: offerForm.value.tieu_chuan_nong_dan,
    });

    if (res?.is_instant_order) {
      await Swal.fire({
        icon: "success",
        title: "🎉 Khởi Tạo Đơn Hàng Thành Công!",
        text: "Do giá không thay đổi, đơn hàng đã được chốt trực tiếp. Thông báo đã gửi sang Doanh Nghiệp để tiến hành Đặt cọc 15%!",
        confirmButtonColor: "#10b981",
      });
      router.push("/orders");
    } else {
      await Swal.fire({
        icon: "success",
        title: "📩 Đã Gửi Báo Giá Thương Lượng!",
        text: "Báo giá đề xuất mức giá mới đã gửi sang Doanh nghiệp. Bạn sẽ nhận được thông báo khi Doanh nghiệp phản hồi!",
        confirmButtonColor: "#10b981",
      });
      router.push("/nhu-cau");
    }
  } catch (e: any) {
    notify.error(
      e.response?.data?.message || "Không thể gửi báo giá. Vui lòng thử lại.",
    );
  } finally {
    submitting.value = false;
  }
};

const formatPrice = (val?: number) => {
  if (!val) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

onMounted(async () => {
  const roleStr = user?.role ? user.role.toUpperCase() : "";
  if (!user || (roleStr !== "NONG_DAN" && roleStr !== "NÔNG DÂN")) {
    notify.error("Chỉ tài khoản Nông Dân mới có thể gửi báo giá chào hàng!");
    router.push("/auth/nong-dan");
    return;
  }

  await loadDemandDetail();
  fetchSavedLocations();
  setTimeout(() => {
    initMap();
  }, 400);
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-24">
    <!-- Navigation Back -->
    <div
      class="flex items-center justify-between border-b border-slate-200 pb-5"
    >
      <div>
        <button
          @click="router.back()"
          class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition mb-2"
        >
          <span>←</span> Quay lại nhu cầu
        </button>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">
          Tạo Báo Giá Chào Hàng Nông Sản
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Gửi số lượng chào bán, giá đề xuất và vị trí xuất hàng tới Doanh
          Nghiệp Thu Mua.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"
      ></div>
    </div>

    <!-- Main Container -->
    <div
      v-else-if="nhuCau"
      class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8"
    >
      <!-- Section 1: Thông tin nhu cầu của Doanh Nghiệp -->
      <div class="space-y-4">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >1</span
          >
          Thông Tin Nhu Cầu Thu Mua Của Doanh Nghiệp
        </h3>

        <div
          class="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl space-y-3 text-xs text-slate-800"
        >
          <div
            class="flex items-center justify-between border-b border-emerald-200/50 pb-2"
          >
            <span class="font-bold text-emerald-900 text-base"
              >🏢
              {{
                nhuCau.doanhNghiep?.ten_cong_ty ||
                nhuCau.doanhNghiep?.user?.full_name ||
                "Doanh Nghiệp"
              }}</span
            >
            <span
              class="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-[11px]"
              >Đang thu mua</span
            >
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="text-slate-500 block text-[11px]"
                >Nông sản cần mua:</span
              >
              <strong class="text-slate-900 text-sm">{{
                nhuCau.ten_nong_san
              }}</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]"
                >Số lượng cần:</span
              >
              <strong class="text-slate-900 text-sm"
                >{{ nhuCau.so_luong_can }} {{ nhuCau.don_vi }}</strong
              >
            </div>
            <div>
              <span class="text-slate-500 block text-[11px]"
                >Giá niêm yết tham khảo:</span
              >
              <strong class="text-emerald-700 text-sm font-black"
                >{{ formatPrice(nhuCau.gia_tham_khao) }} /
                {{ nhuCau.don_vi }}</strong
              >
            </div>
          </div>

          <div
            class="pt-2 border-t border-emerald-200/50 flex flex-wrap items-center justify-between gap-2 text-slate-600"
          >
            <span
              >📍 Địa điểm nhận hàng:
              <strong class="text-slate-800">{{
                nhuCau.dia_chi_giao || nhuCau.tinh_thanh_giao || "Thỏa thuận"
              }}</strong></span
            >
            <span
              v-if="nhuCau.yeu_cau_chung_nhan"
              class="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded border border-amber-200"
              >📜 {{ nhuCau.yeu_cau_chung_nhan }}</span
            >
          </div>
        </div>
      </div>

      <!-- Section 2: Khai báo Báo Giá Chào Hàng của Nông Dân -->
      <div class="space-y-5">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >2</span
          >
          Khai Báo Mức Giá & Số Lượng Chào Bán
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <!-- Số lượng chào bán -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Số Lượng Bạn Có Thể Cung Cấp ({{ nhuCau.don_vi }}) (*):</label
            >
            <input
              v-model.number="offerForm.so_luong_cung_cap"
              type="number"
              min="1"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Giá đề xuất mới -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Giá Bạn Đề Xuất (VNĐ / {{ nhuCau.don_vi }}) (*):</label
            >
            <input
              v-model.number="offerForm.gia_de_xuat"
              type="number"
              step="500"
              @input="onGiaChange"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div class="mt-1 flex items-center justify-between text-[11px]">
              <span class="text-slate-500"
                >Chênh lệch so với giá niêm yết:</span
              >
              <span
                class="font-bold"
                :class="
                  offerForm.chenh_lech_gia > 0
                    ? 'text-red-600'
                    : offerForm.chenh_lech_gia < 0
                      ? 'text-emerald-600'
                      : 'text-slate-600'
                "
              >
                {{ offerForm.chenh_lech_gia > 0 ? "+" : ""
                }}{{ formatPrice(offerForm.chenh_lech_gia) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tiêu chuẩn đạt được -->
        <div
          v-if="nhuCau.yeu_cau_chung_nhan"
          class="text-xs pt-3 border-t border-slate-100"
        >
          <label class="block font-bold text-slate-700 mb-1"
            >Tiêu Chuẩn Đạt Được Của Bạn (*):</label
          >
          <input
            v-model="offerForm.tieu_chuan_nong_dan"
            type="text"
            placeholder="Nhập tiêu chuẩn bạn đang có (Ví dụ: VietGAP, GlobalGAP, Hữu cơ...)"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p class="text-[11px] text-slate-500 mt-1">
            Doanh nghiệp yêu cầu chứng nhận:
            <strong class="text-emerald-700">{{
              nhuCau.yeu_cau_chung_nhan
            }}</strong
            >. Nếu tiêu chuẩn của bạn khớp với yêu cầu và mức giá không thay
            đổi, đơn hàng sẽ được chốt tự động.
          </p>
        </div>

        <!-- Banner giải thích luồng giao dịch tự động -->
        <div
          v-if="canInstantOrder"
          class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-950 text-xs"
        >
          <div class="text-2xl">⚡</div>
          <div>
            <h4 class="font-bold text-emerald-900">
              Thỏa mãn điều kiện - Đơn hàng sẽ được chốt giao dịch tự động!
            </h4>
            <p class="text-emerald-800 text-[11px] mt-0.5">
              Do bạn chấp nhận mức giá niêm yết và đáp ứng tiêu chuẩn của Doanh
              nghiệp, đơn hàng B2B sẽ được tạo lập ngay lập tức. Doanh nghiệp sẽ
              nhận được thông báo để đặt cọc 15% và hệ thống xe B2B sẽ tới kho
              bạn nhận hàng!
            </p>
          </div>
        </div>

        <div
          v-else
          class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-950 text-xs"
        >
          <div>
            <h4 class="font-bold text-amber-900">
              Gửi đề xuất thương lượng / Xét duyệt!
            </h4>
            <p class="text-amber-800 text-[11px] mt-0.5">
              Do mức giá có thay đổi hoặc tiêu chuẩn chưa khớp hoàn toàn, báo
              giá sẽ được chuyển tới Doanh nghiệp để xem xét thủ công.
            </p>
          </div>
        </div>
      </div>

      <!-- Section 3: Địa điểm xuất hàng & Tính phí vận chuyển -->
      <div class="space-y-5">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >3</span
          >
          Địa Điểm Xuất Hàng & Tính Phí Giao Hàng
        </h3>

        <div
          class="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs"
        >
          <!-- Chọn từ kho đã lưu -->
          <div v-if="savedLocations.length > 0">
            <label class="block font-bold text-slate-700 mb-1"
              >Chọn từ kho / địa chỉ đã lưu:</label
            >
            <select
              v-model="selectedSavedLocation"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn vị trí kho đã lưu --</option>
              <option
                v-for="loc in savedLocations"
                :key="loc.id"
                :value="loc.id"
              >
                📍 {{ loc.ten_goi }} ({{ loc.dia_chi }})
              </option>
            </select>
          </div>

          <!-- Tìm vị trí trên bản đồ -->
          <div class="space-y-2">
            <label class="block font-bold text-slate-700"
              >Tìm địa điểm xuất hàng trên bản đồ hoặc chọn thủ công:</label
            >
            <div class="flex gap-2">
              <input
                v-model="searchLocationText"
                @keyup.enter.prevent="handleSearchLocation"
                type="text"
                placeholder="Nhập địa chỉ của bạn để tìm nhanh trên bản đồ..."
                class="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="button"
                @click="handleSearchLocation"
                :disabled="isSearching"
                class="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {{ isSearching ? "Đang tìm..." : "🔍 Tìm vị trí" }}
              </button>
            </div>

            <!-- Leaflet Map Container -->
            <div
              id="post-map"
              class="w-full h-[280px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative z-0"
            ></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-700 mb-1"
                >Tỉnh / Thành Phố Xuất Hàng (*):</label
              >
              <select
                v-model="offerForm.tinh_thanh_cung_cap"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option v-for="prov in provinces" :key="prov" :value="prov">
                  {{ prov }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1"
                >Địa Chỉ Kho / Vườn Cụ Thể:</label
              >
              <input
                v-model="offerForm.dia_chi_cung_cap"
                type="text"
                placeholder="Ví dụ: Kho số 1, Ấp 3, Xã Tân Thuận..."
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/40"
          >
            <div>
              <label class="block font-bold text-slate-700 mb-1"
                >Vĩ độ (Latitude) (*):</label
              >
              <input
                v-model.number="offerForm.latitude_cung_cap"
                type="number"
                step="0.000001"
                placeholder="Nhấp trên bản đồ hoặc nhập vĩ độ"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1"
                >Kinh độ (Longitude) (*):</label
              >
              <input
                v-model.number="offerForm.longitude_cung_cap"
                type="number"
                step="0.000001"
                placeholder="Nhấp trên bản đồ hoặc nhập kinh độ"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Ô lưu địa chỉ mới -->
          <div
            class="flex items-center gap-2 pt-2 border-t border-slate-200/60"
          >
            <input
              v-model="saveLocationName"
              type="text"
              placeholder="Tên gợi nhớ để lưu địa chỉ này (ví dụ: Kho số 1, Vườn sầu riêng)..."
              class="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
            <button
              type="button"
              @click="saveCurrentSupplyLocation"
              :disabled="isSavingLocation"
              class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {{ isSavingLocation ? "Đang lưu..." : "Lưu vị trí này" }}
            </button>
          </div>
        </div>

        <!-- Calculated Distance & Shipping Fee Box -->
        <div
          class="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2 text-amber-950 text-xs"
        >
          <div class="flex justify-between items-center font-bold">
            <span>Khoảng cách vận chuyển (Nông dân ➔ DN):</span>
            <span class="text-base text-amber-950"
              >{{ estimatedDistance }} km</span
            >
          </div>
          <div class="flex justify-between items-center font-bold">
            <span>Phí giao hàng xe B2B (Nông dân chi trả):</span>
            <span class="text-base text-amber-950 font-black">{{
              formatPrice(calculatedShippingFee)
            }}</span>
          </div>
          <p
            class="text-[11px] text-amber-800 pt-2 border-t border-amber-200/70"
          >
            Phí vận chuyển được tự động tính theo khoảng cách từ
            <strong>{{ offerForm.tinh_thanh_cung_cap }}</strong> đến
            <strong>{{ nhuCau.tinh_thanh_giao || "Doanh nghiệp" }}</strong
            >. Nông dân chịu phí giao hàng này.
          </p>
        </div>
      </div>

      <!-- Section 4: Ghi chú thương lượng -->
      <div class="space-y-3">
        <label class="block font-bold text-slate-700 text-xs"
          >Ghi Chú / Giải Thích Nguyên Do Thay Đổi Giá (Nếu Có):</label
        >
        <textarea
          v-model="offerForm.ghi_chu"
          rows="4"
          placeholder="Ví dụ: Nông sản chất lượng đạt chuẩn VietGAP xuất khẩu, đóng hộp xốp kỹ lưỡng..."
          class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="pt-6 border-t border-slate-100 flex items-center gap-4">
        <button
          type="button"
          @click="router.back()"
          class="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
        >
          Hủy Bỏ
        </button>

        <button
          type="button"
          @click="submitOffer"
          :disabled="submitting"
          class="flex-1 py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xl hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          {{
            submitting
              ? "Đang Xử Lý..."
              : canInstantOrder
                ? "Chốt Giá & Khởi Tạo Đơn Hàng"
                : "Gửi Báo Giá & Chờ Xét Duyệt"
          }}
        </button>
      </div>
    </div>
  </div>
</template>
