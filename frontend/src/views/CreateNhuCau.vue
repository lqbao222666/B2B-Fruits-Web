<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { NhuCauService } from "@/service/nhucau";
import { Category } from "@/service/category";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { extractProvinceName } from "@/utils/provinceHelper";

// Fix Leaflet marker icons
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const router = useRouter();
const categories = ref<any[]>([]);
const tieuChuansList = ref<any[]>([]);
const savedLocations = ref<any[]>([]);

const loading = ref(false);
const isSearching = ref(false);

const vietnamProvinces = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const userId = user?.user_id || user?.id;

const form = ref({
  ten_nong_san: "",
  danhmuc_id: undefined as number | undefined,
  so_luong_can: 1000,
  don_vi: "kg",
  gia_tham_khao: 50000,
  cho_thuong_luong: true,
  tinh_thanh_giao: "Cần Thơ",
  dia_chi_giao: "",
  mo_ta: "",
  ngay_bat_dau: new Date().toISOString().split("T")[0],
  ngay_ket_thuc: new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0],
  latitude: null as number | null,
  longitude: null as number | null,
  tieu_chuan_ids: [] as number[],
});

// Map State
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
const searchLocationText = ref("");
const selectedSavedLocation = ref("");
const saveLocationName = ref("");
const isSavingLocation = ref(false);

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
  const initLat = 10.03711; // Cần Thơ default
  const initLng = 105.78274;

  const mapContainer = document.getElementById("nhucau-map");
  if (!mapContainer) return;

  map = L.map("nhucau-map").setView([initLat, initLng], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  map.on("click", (e: L.LeafletMouseEvent) => {
    moveToLocation(e.latlng.lat, e.latlng.lng);
  });
};

const moveToLocation = (lat: number, lng: number) => {
  if (!map) return;
  map.setView([lat, lng], 14);
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Vị trí địa điểm nhận hàng")
    .openPopup();
  form.value.latitude = lat;
  form.value.longitude = lng;
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
      if (!form.value.dia_chi_giao) {
        form.value.dia_chi_giao = data[0].display_name;
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

const saveCurrentLocation = async () => {
  if (!form.value.latitude || !form.value.longitude) {
    notify.error("Vui lòng chọn vị trí trên bản đồ trước khi lưu!");
    return;
  }
  if (!saveLocationName.value.trim()) {
    notify.error(
      "Vui lòng nhập tên gợi nhớ cho địa chỉ này (ví dụ: Kho Cần Thơ)!",
    );
    return;
  }

  isSavingLocation.value = true;
  try {
    await api.post("/dia-chi-luu", {
      user_id: userId,
      ten_goi: saveLocationName.value.trim(),
      dia_chi: form.value.dia_chi_giao || form.value.tinh_thanh_giao,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    });
    notify.success("Đã lưu vị trí nhận hàng thành công!");
    saveLocationName.value = "";
    fetchSavedLocations();
  } catch (e: any) {
    notify.error("Lỗi khi lưu vị trí!");
  } finally {
    isSavingLocation.value = false;
  }
};

watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find((l) => l.id == val);
    if (loc) {
      moveToLocation(Number(loc.latitude), Number(loc.longitude));
      if (loc.dia_chi) {
        form.value.tinh_thanh_giao = extractProvinceName(loc.dia_chi);
        form.value.dia_chi_giao = loc.dia_chi;
      }
    }
  }
});

const toggleTieuChuan = (id: number) => {
  const idx = form.value.tieu_chuan_ids.indexOf(id);
  if (idx > -1) {
    form.value.tieu_chuan_ids.splice(idx, 1);
  } else {
    form.value.tieu_chuan_ids.push(id);
  }
};

const handleSubmit = async () => {
  if (!form.value.ten_nong_san.trim()) {
    notify.error("Vui lòng nhập tên nông sản thu mua!");
    return;
  }
  if (!form.value.so_luong_can || form.value.so_luong_can <= 0) {
    notify.error("Vui lòng nhập số lượng cần thu mua hợp lệ!");
    return;
  }

  // Aggregate selected certification names
  const selectedCertNames = tieuChuansList.value
    .filter((tc) => form.value.tieu_chuan_ids.includes(tc.tieuchuan_id))
    .map((tc) => tc.ten_tieu_chuan)
    .join(", ");

  loading.value = true;
  try {
    await NhuCauService.create({
      doanh_nghiep_id: userId,
      danhmuc_id: form.value.danhmuc_id,
      ten_nong_san: form.value.ten_nong_san.trim(),
      mo_ta: form.value.mo_ta,
      so_luong_can: Number(form.value.so_luong_can),
      don_vi: form.value.don_vi,
      gia_tham_khao: Number(form.value.gia_tham_khao),
      cho_thuong_luong: form.value.cho_thuong_luong,
      yeu_cau_chung_nhan: selectedCertNames || undefined,
      tinh_thanh_giao: form.value.tinh_thanh_giao,
      dia_chi_giao: form.value.dia_chi_giao,
      latitude: form.value.latitude || undefined,
      longitude: form.value.longitude || undefined,
      ngay_bat_dau: form.value.ngay_bat_dau
        ? new Date(form.value.ngay_bat_dau).toISOString()
        : undefined,
      ngay_ket_thuc: form.value.ngay_ket_thuc
        ? new Date(form.value.ngay_ket_thuc).toISOString()
        : undefined,
      trang_thai: "dang_thu_mua",
    });

    notify.success("Đăng nhu cầu thu mua mới thành công!");
    router.push("/quan-ly-nhu-cau");
  } catch (e: any) {
    notify.error(
      e.response?.data?.message || "Có lỗi xảy ra khi đăng nhu cầu!",
    );
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const roleStr = user?.role ? user.role.toUpperCase() : "";
  if (!user || (roleStr !== "DOANH_NGHIEP" && roleStr !== "ADMIN")) {
    notify.error(
      "Chỉ tài khoản Doanh Nghiệp hoặc Admin mới được đăng nhu cầu thu mua!",
    );
    router.push("/auth/doanh-nghiep");
    return;
  }

  try {
    const catRes = await Category.getAllCategories();
    categories.value = Array.isArray(catRes) ? catRes : catRes.data || [];
    if (categories.value.length > 0) {
      form.value.danhmuc_id = categories.value[0].danhmuc_id;
    }

    const tcRes = await api.get("/tieu-chuan");
    tieuChuansList.value = tcRes.data || [];

    fetchSavedLocations();
    setTimeout(initMap, 250);
  } catch (e) {
    console.error(e);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-24">
    <!-- Header Page Navigation -->
    <div
      class="flex items-center justify-between border-b border-slate-200 pb-5"
    >
      <div>
        <button
          @click="router.back()"
          class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition mb-2"
        >
          <span>←</span> Quay lại quản lý
        </button>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">
          Đăng Nhu Cầu Thu Mua Mới
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Khai báo thông tin nông sản thu mua số lượng lớn để Nông dân trên toàn
          quốc báo giá chào hàng.
        </p>
      </div>
    </div>

    <!-- Main Form Box -->
    <div
      class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8"
    >
      <!-- Section 1: Thông tin sản phẩm -->
      <div class="space-y-5">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >1</span
          >
          Thông Tin Nông Sản Thu Mua
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <!-- Tên nông sản -->
          <div class="col-span-1 md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1"
              >Tên Nông Sản Thu Mua (*):</label
            >
            <input
              v-model="form.ten_nong_san"
              type="text"
              placeholder="Ví dụ: Sầu Riêng Ri6, Xoài Cát Hòa Lộc, Thanh Long..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Danh mục -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Danh Mục Nông Sản:</label
            >
            <select
              v-model="form.danhmuc_id"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option
                v-for="cat in categories"
                :key="cat.danhmuc_id"
                :value="cat.danhmuc_id"
              >
                {{ cat.ten_danh_muc }}
              </option>
            </select>
          </div>

          <!-- Đơn vị tính -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Đơn Vị Tính (*):</label
            >
            <input
              v-model="form.don_vi"
              type="text"
              placeholder="kg, tấn, thùng, bao..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Số lượng cần -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Số Lượng Cần Thu Mua (*):</label
            >
            <input
              v-model.number="form.so_luong_can"
              type="number"
              min="1"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Giá tham khảo -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Giá Niêm Yết Tham Khảo (VNĐ / đơn vị):</label
            >
            <input
              v-model.number="form.gia_tham_khao"
              type="number"
              step="1000"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Cho phép thương lượng checkbox -->
        <div
          class="flex items-center gap-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100"
        >
          <input
            v-model="form.cho_thuong_luong"
            type="checkbox"
            id="thuong_luong_chk"
            class="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
          <label
            for="thuong_luong_chk"
            class="font-bold text-slate-800 text-xs cursor-pointer"
          >
            Cho phép Nông Dân đề xuất chênh lệch giá & thương lượng 2 chiều
          </label>
        </div>
      </div>

      <!-- Section 2: Yêu cầu chứng nhận (Đồng bộ từ database) -->
      <div class="space-y-4">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >2</span
          >
          Yêu Cầu Chứng Nhận Nông Sản (Chọn nhiều hoặc để trống)
        </h3>

        <div
          v-if="tieuChuansList.length === 0"
          class="text-xs text-slate-400 italic"
        >
          Đang tải danh sách tiêu chuẩn...
        </div>

        <div v-else class="flex flex-wrap gap-2.5">
          <button
            v-for="tc in tieuChuansList"
            :key="tc.tieuchuan_id"
            type="button"
            @click="toggleTieuChuan(tc.tieuchuan_id)"
            class="px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2"
            :class="
              form.tieu_chuan_ids.includes(tc.tieuchuan_id)
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            "
          >
            <span>📜</span> {{ tc.ten_tieu_chuan }}
          </button>
        </div>
      </div>

      <!-- Section 3: Địa điểm nhận hàng & Bản đồ Leaflet -->
      <div class="space-y-5">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >3</span
          >
          Địa Điểm Nhận Hàng & Bản Đồ
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <!-- Tỉnh / Thành phố -->
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Khu Vực Tỉnh / Thành Phố (*):</label
            >
            <select
              v-model="form.tinh_thanh_giao"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option
                v-for="prov in vietnamProvinces"
                :key="prov"
                :value="prov"
              >
                {{ prov }}
              </option>
            </select>
          </div>

          <!-- Chọn vị trí đã lưu -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block font-bold text-slate-700"
                >Chọn từ Địa Chỉ Đã Lưu (Nếu có):</label
              >
              <router-link
                to="/profile"
                class="text-[11px] text-emerald-600 hover:underline font-bold flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-xs">add_location_alt</span>
                {{ savedLocations.length > 0 ? 'Quản lý kho' : '+ Thêm kho đã lưu' }}
              </router-link>
            </div>
            <select
              v-model="selectedSavedLocation"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              <option value="">-- Chọn vị trí nhà kho đã lưu --</option>
              <option
                v-for="loc in savedLocations"
                :key="loc.id"
                :value="loc.id"
              >
                📍 {{ loc.ten_goi }} ({{ loc.dia_chi }})
              </option>
            </select>
          </div>

          <!-- Địa chỉ cụ thể -->
          <div class="col-span-1 md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1"
              >Địa Chỉ Nhận Hàng Cụ Thể:</label
            >
            <input
              v-model="form.dia_chi_giao"
              type="text"
              placeholder="Ví dụ: Số 123 Đường Nguyễn Văn Cừ, Phường An Khánh, Cần Thơ..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Search location & Leaflet Map Box -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-2">
            <input
              v-model="searchLocationText"
              type="text"
              placeholder="Tìm kiếm địa chỉ hoặc tọa độ (lat, lng) trên bản đồ..."
              class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              @keyup.enter="handleSearchLocation"
            />
            <button
              type="button"
              @click="handleSearchLocation"
              :disabled="isSearching"
              class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
            >
              {{ isSearching ? "Đang tìm..." : "🔍 Tìm Vị Trí" }}
            </button>
          </div>

          <!-- MAP CONTAINER -->
          <div
            id="nhucau-map"
            class="w-full h-72 rounded-2xl border border-slate-200 shadow-inner z-10"
          ></div>

          <!-- Save current map location -->
          <div
            v-if="form.latitude && form.longitude"
            class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs"
          >
            <span class="text-emerald-900 font-semibold">
              📍 Vị trí đã chọn:
              <strong
                >{{ form.latitude.toFixed(6) }},
                {{ form.longitude.toFixed(6) }}</strong
              >
            </span>

            <div class="flex items-center gap-2">
              <input
                v-model="saveLocationName"
                type="text"
                placeholder="Tên lưu (ví dụ: Kho chính)..."
                class="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="button"
                @click="saveCurrentLocation"
                :disabled="isSavingLocation"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {{ isSavingLocation ? "Đang lưu..." : "💾 Lưu Vị Trí Này" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Ngày thu mua & Mô tả chi tiết -->
      <div class="space-y-5">
        <h3
          class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
        >
          <span
            class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
            >4</span
          >
          Thời Gian Thu Mua & Mô Tả Chi Tiết
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Ngày Bắt Đầu Thu Mua:</label
            >
            <input
              v-model="form.ngay_bat_dau"
              type="date"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Hạn Chót Kết Thúc Thu Mua:</label
            >
            <input
              v-model="form.ngay_ket_thuc"
              type="date"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        <!-- Mô tả chi tiết - Không bị che -->
        <div class="space-y-1">
          <label class="block font-bold text-slate-700 text-xs"
            >Mô Tả Chi Tiết Yêu Cầu Thu Mua:</label
          >
          <textarea
            v-model="form.mo_ta"
            rows="5"
            placeholder="Khai báo quy cách đóng gói, mức độ chín, kích thước, hình thức vận chuyển hoặc yêu cầu kỹ thuật đặc biệt..."
            class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons Area -->
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
          @click="handleSubmit"
          :disabled="loading"
          class="flex-1 py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xl hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          {{ loading ? "Đang Xử Lý..." : "Đăng Nhu Cầu Thu Mua Mới" }}
        </button>
      </div>
    </div>
  </div>
</template>
