<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NhuCauService } from "@/service/nhucau";
import { Category } from "@/service/category";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
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

const categories = ref<any[]>([]);
const tieuChuansList = ref<any[]>([]);
const savedLocations = ref<any[]>([]);

const loading = ref(true);
const saving = ref(false);
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
  ngay_bat_dau: "",
  ngay_ket_thuc: "",
  trang_thai: "dang_thu_mua" as any,
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
  const initLat = form.value.latitude || 10.03711;
  const initLng = form.value.longitude || 105.78274;

  const mapContainer = document.getElementById("nhucau-edit-map");
  if (!mapContainer) return;

  map = L.map("nhucau-edit-map").setView([initLat, initLng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  if (form.value.latitude && form.value.longitude) {
    moveToLocation(form.value.latitude, form.value.longitude);
  }

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
    notify.error("Vui lòng nhập tên gợi nhớ cho địa chỉ này!");
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
      if (loc.dia_chi) form.value.dia_chi_giao = loc.dia_chi;
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

const loadDetail = async () => {
  loading.value = true;
  try {
    const data = await NhuCauService.getById(nhucau_id);
    form.value = {
      ten_nong_san: data.ten_nong_san,
      danhmuc_id: data.danhmuc_id || undefined,
      so_luong_can: Number(data.so_luong_can),
      don_vi: data.don_vi || "kg",
      gia_tham_khao: Number(data.gia_tham_khao) || 0,
      cho_thuong_luong: data.cho_thuong_luong,
      tinh_thanh_giao: data.tinh_thanh_giao || "Cần Thơ",
      dia_chi_giao: data.dia_chi_giao || "",
      mo_ta: data.mo_ta || "",
      ngay_bat_dau: data.ngay_bat_dau ? data.ngay_bat_dau.split("T")[0] : "",
      ngay_ket_thuc: data.ngay_ket_thuc ? data.ngay_ket_thuc.split("T")[0] : "",
      trang_thai: data.trang_thai,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      tieu_chuan_ids: [],
    };

    // Pre-select certifications from text if string matches
    if (data.yeu_cau_chung_nhan && tieuChuansList.value.length > 0) {
      const names = data.yeu_cau_chung_nhan
        .split(",")
        .map((s: string) => s.trim());
      form.value.tieu_chuan_ids = tieuChuansList.value
        .filter((tc) => names.includes(tc.ten_tieu_chuan))
        .map((tc) => tc.tieuchuan_id);
    }
  } catch (e: any) {
    notify.error("Không tìm thấy thông tin nhu cầu!");
    router.push("/quan-ly-nhu-cau");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value.ten_nong_san.trim()) {
    notify.error("Vui lòng nhập tên nông sản thu mua!");
    return;
  }

  const selectedCertNames = tieuChuansList.value
    .filter((tc) => form.value.tieu_chuan_ids.includes(tc.tieuchuan_id))
    .map((tc) => tc.ten_tieu_chuan)
    .join(", ");

  saving.value = true;
  try {
    await NhuCauService.update(nhucau_id, {
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
      trang_thai: form.value.trang_thai,
    });

    notify.success("Cập nhật nhu cầu thu mua thành công!");
    router.push("/quan-ly-nhu-cau");
  } catch (e: any) {
    notify.error(e.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const catRes = await Category.getAllCategories();
    categories.value = Array.isArray(catRes) ? catRes : catRes.data || [];

    const tcRes = await api.get("/tieu-chuan");
    tieuChuansList.value = tcRes.data || [];

    await loadDetail();
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
          Sửa Nhu Cầu Thu Mua #{{ nhucau_id }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Cập nhật thông tin nông sản, số lượng, địa chỉ nhận hàng hoặc thay đổi
          trạng thái thu mua.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"
      ></div>
    </div>

    <!-- Main Form Box -->
    <div
      v-else
      class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8"
    >
      <!-- Section 1: Thông tin sản phẩm -->
      <div class="space-y-5">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-3"
        >
          <h3
            class="text-base font-black text-slate-900 flex items-center gap-2"
          >
            <span
              class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold"
              >1</span
            >
            Thông Tin Nông Sản Thu Mua
          </h3>

          <!-- Trạng Thái Thu Mua -->
          <div class="flex items-center gap-2 text-xs">
            <label class="font-bold text-slate-700">Trạng thái nhu cầu:</label>
            <select
              v-model="form.trang_thai"
              class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
              :class="{
                'text-emerald-700': form.trang_thai === 'dang_thu_mua',
                'text-blue-700': form.trang_thai === 'du_so_luong',
                'text-amber-700': form.trang_thai === 'tam_ngung',
                'text-slate-600': form.trang_thai === 'da_dong',
              }"
            >
              <option value="dang_thu_mua">Đang thu mua</option>
              <option value="du_so_luong">Đã đủ số lượng</option>
              <option value="tam_ngung">Tạm ngưng</option>
              <option value="da_dong">Đã đóng</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <!-- Tên nông sản -->
          <div class="col-span-1 md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1"
              >Tên Nông Sản Thu Mua (*):</label
            >
            <input
              v-model="form.ten_nong_san"
              type="text"
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
              >Giá Niêm Yết Tham Khảo (VNĐ):</label
            >
            <input
              v-model.number="form.gia_tham_khao"
              type="number"
              step="1000"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div
          class="flex items-center gap-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100"
        >
          <input
            v-model="form.cho_thuong_luong"
            type="checkbox"
            id="thuong_luong_edit_chk"
            class="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
          <label
            for="thuong_luong_edit_chk"
            class="font-bold text-slate-800 text-xs cursor-pointer"
          >
            Cho phép Nông Dân đề xuất chênh lệch giá & thương lượng 2 chiều
          </label>
        </div>
      </div>

      <!-- Section 2: Yêu cầu chứng nhận -->
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

        <div class="flex flex-wrap gap-2.5">
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
          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Khu Vực Tỉnh / Thành Phố (*):</label
            >
            <select
              v-model="form.tinh_thanh_giao"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs"
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

          <div>
            <label class="block font-bold text-slate-700 mb-1"
              >Chọn từ Địa Chỉ Đã Lưu:</label
            >
            <select
              v-model="selectedSavedLocation"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
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

          <div class="col-span-1 md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1"
              >Địa Chỉ Nhận Hàng Cụ Thể:</label
            >
            <input
              v-model="form.dia_chi_giao"
              type="text"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs"
            />
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-2">
            <input
              v-model="searchLocationText"
              type="text"
              placeholder="Tìm kiếm địa chỉ hoặc tọa độ..."
              class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              @keyup.enter="handleSearchLocation"
            />
            <button
              type="button"
              @click="handleSearchLocation"
              :disabled="isSearching"
              class="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              🔍 Tìm Vị Trí
            </button>
          </div>

          <div
            id="nhucau-edit-map"
            class="w-full h-72 rounded-2xl border border-slate-200 shadow-inner z-10"
          ></div>

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
                placeholder="Tên lưu..."
                class="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs"
              />
              <button
                type="button"
                @click="saveCurrentLocation"
                :disabled="isSavingLocation"
                class="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                💾 Lưu Vị Trí
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

        <div class="space-y-1">
          <label class="block font-bold text-slate-700 text-xs"
            >Mô Tả Chi Tiết Yêu Cầu Thu Mua:</label
          >
          <textarea
            v-model="form.mo_ta"
            rows="5"
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
          :disabled="saving"
          class="flex-1 py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xl hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          <span>💾</span>
          {{ saving ? "Đang Cập Nhật..." : "Lưu Thay Đổi Nhu Cầu" }}
        </button>
      </div>
    </div>
  </div>
</template>
