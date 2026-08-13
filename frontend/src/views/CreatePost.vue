<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { BaiDang } from "@/service/baidang.ts";
import api from "@/service/api.ts";
import { notify } from "@/utils/notifier.ts";
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

const router = useRouter();
const categories = ref<any[]>([]);
const tieuChuansList = ref<any[]>([]);
const loading = ref(false);
const isSuggesting = ref(false);

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

// Lấy thông tin user hiện tại
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

// Khởi tạo form data
const form = ref({
  tieu_de: "",
  ten_nong_san: "",
  danhmuc_id: "",
  don_vi_tinh: "kg",
  tinh_thanh: user?.tinh_thanh || "",
  mo_ta: "",
  latitude: null as number | null,
  longitude: null as number | null,
  tieu_chuan_ids: [] as number[],
});

const phanLoais = ref([
  {
    ten_phan_loai: "Loại 1",
    gia: null as number | null,
    so_luong_co: null as number | null,
  },
]);
const addPhanLoai = () => {
  phanLoais.value.push({
    ten_phan_loai: `Loại ${phanLoais.value.length + 1}`,
    gia: null,
    so_luong_co: null,
  });
};
const removePhanLoai = (index: number) => {
  if (phanLoais.value.length > 1) {
    phanLoais.value.splice(index, 1);
  }
};

const selectedImages = ref<{ file: File; isMain: boolean }[]>([]);

// Map State
let map: L.Map | null = null;
let userMarker: L.Marker | null = null;
const savedLocations = ref<any[]>([]);
const searchLocationText = ref("");
const selectedSavedLocation = ref("");
const saveLocationName = ref("");
const isSavingLocation = ref(false);
const isSearching = ref(false);

const fetchSavedLocations = async () => {
  if (!user) return;
  try {
    const res = await api.get(`/dia-chi-luu/user/${user.user_id || user.id}`);
    savedLocations.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const initMap = () => {
  if (map) return;
  // Default to HCM if no location
  const initLat = 10.762622;
  const initLng = 106.660172;

  map = L.map("post-map").setView([initLat, initLng], 12);
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
    .bindPopup("Vị trí lô hàng")
    .openPopup();
  form.value.latitude = lat;
  form.value.longitude = lng;
};

const handleSearchLocation = async () => {
  if (!searchLocationText.value) return;
  const text = searchLocationText.value.trim();

  // Tọa độ dạng (lat, lng)
  const coordRegex =
    /^\s*\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?\s*$/;
  const match = text.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    moveToLocation(lat, lng);
    return;
  }

  // Text search
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
      moveToLocation(Number(loc.latitude), Number(loc.longitude));
      form.value.tinh_thanh = loc.dia_chi || form.value.tinh_thanh;
    }
  }
});

// Fetch danh mục
onMounted(async () => {
  const roleStr = user?.role ? user.role.toLowerCase() : "";
  const isNongDan =
    roleStr === "nong_dan" || roleStr === "nông dân" || roleStr === "nong dan";

  if (!user || !isNongDan) {
    notify.error("Chỉ Nông Dân mới được tạo bài đăng bán nông sản!");
    router.push("/");
    return;
  }

  try {
    const profileRes = await api.get(`/nong-dan/${user.user_id || user.id}`);
    const p = profileRes.data;
    if (!p.ma_so_thue || !p.ten_co_so_kd || !p.tinh_thanh) {
      notify.error(
        "Vui lòng cập nhật đầy đủ thông tin kinh doanh (Mã số thuế, Tên cơ sở) trong Hồ sơ cá nhân trước khi đăng bài!",
      );
      router.push("/profile");
      return;
    }
  } catch (err) {
    console.error("Lỗi khi tải profile nông dân:", err);
  }

  try {
    const res = await api.get("/danh-muc");
    categories.value = res.data || [];

    const tcRes = await api.get("/tieu-chuan");
    tieuChuansList.value = tcRes.data || [];

    fetchSavedLocations();
    setTimeout(initMap, 200);
  } catch (err) {
    console.error("Lỗi khi tải danh mục hoặc tiêu chuẩn:", err);
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Xử lý chọn ảnh
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    Array.from(target.files).forEach((file) => {
      selectedImages.value.push({
        file,
        isMain: selectedImages.value.length === 0, // Ảnh đầu tiên mặc định là ảnh chính
      });
    });
  }
};

const setMainImage = (index: number) => {
  selectedImages.value.forEach((img, i) => {
    img.isMain = i === index;
  });
};

const removeImage = (index: number) => {
  const wasMain = selectedImages.value[index].isMain;
  selectedImages.value.splice(index, 1);
  if (wasMain && selectedImages.value.length > 0) {
    selectedImages.value[0].isMain = true;
  }
};

// Gọi AI gợi ý nội dung mô tả
const handleSuggestDescription = async () => {
  if (!form.value.ten_nong_san || !form.value.tinh_thanh) {
    notify.error(
      "Vui lòng nhập Tên nông sản và Khu vực trước khi dùng AI gợi ý!",
    );
    return;
  }

  isSuggesting.value = true;
  try {
    const payload = {
      tieu_de: form.value.tieu_de,
      ten_nong_san: form.value.ten_nong_san,
      so_luong_co:
        phanLoais.value.length > 0
          ? Number(phanLoais.value[0].so_luong_co)
          : undefined,
      don_vi_tinh: form.value.don_vi_tinh,
      tinh_thanh: form.value.tinh_thanh,
    };
    const res = await api.post("/ai/suggest-post", payload);
    if (res.data) {
      const data = res.data;
      if (data.tieu_de) form.value.tieu_de = data.tieu_de;
      if (data.mo_ta) form.value.mo_ta = data.mo_ta;

      notify.success("AI đã gợi ý xong nội dung!");
    }
  } catch (err: any) {
    console.error("Lỗi khi gợi ý mô tả:", err);
    notify.error("Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.");
  } finally {
    isSuggesting.value = false;
  }
};

const suggestingPriceIdx = ref<number | null>(null);

const handleSuggestPrice = async (index: number) => {
  if (!form.value.ten_nong_san || !form.value.tinh_thanh) {
    notify.error("Vui lòng nhập Tên nông sản và Khu vực trước khi gợi ý giá!");
    return;
  }

  suggestingPriceIdx.value = index;
  try {
    const payload = {
      ten_nong_san:
        form.value.ten_nong_san +
        (phanLoais.value[index].ten_phan_loai
          ? ` (${phanLoais.value[index].ten_phan_loai})`
          : ""),
      don_vi_tinh: form.value.don_vi_tinh,
      tinh_thanh: form.value.tinh_thanh,
    };

    const res = await api.post("/ai/suggest-price", payload);
    if (res.data && res.data.gia_goi_y) {
      phanLoais.value[index].gia = res.data.gia_goi_y;
      notify.success("Đã điền giá gợi ý từ AI!");
    }
  } catch (err) {
    console.error("Lỗi khi gợi ý giá:", err);
    notify.error("Không thể lấy gợi ý giá lúc này.");
  } finally {
    suggestingPriceIdx.value = null;
  }
};

// Upload ảnh lên server
const uploadImages = async () => {
  const uploadedUrls: any[] = [];
  for (const imgObj of selectedImages.value) {
    const formData = new FormData();
    formData.append("file", imgObj.file);
    try {
      const res = await api.post("/bai-dang/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.url) {
        uploadedUrls.push({
          url: res.data.url,
          is_main: imgObj.isMain,
        });
      }
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    }
  }
  return uploadedUrls;
};

const submitPost = async () => {
  // Validate phân loại
  let isValidPhanLoai = true;
  let tongSoLuong = 0;
  let minGia = Infinity;

  phanLoais.value.forEach((pl) => {
    if (!pl.ten_phan_loai || !pl.gia || !pl.so_luong_co)
      isValidPhanLoai = false;
    tongSoLuong += Number(pl.so_luong_co);
    if (Number(pl.gia) < minGia) minGia = Number(pl.gia);
  });

  if (
    !form.value.tieu_de ||
    !form.value.danhmuc_id ||
    !form.value.tinh_thanh ||
    !isValidPhanLoai
  ) {
    notify.error(
      "Vui lòng điền đầy đủ các thông tin bắt buộc có dấu *, và đảm bảo các phân loại đều có Tên, Giá, Sản lượng",
    );
    return;
  }

  loading.value = true;
  try {
    // 1. Upload ảnh trước nếu có
    let uploadedUrls: any[] = [];
    if (selectedImages.value.length > 0) {
      uploadedUrls = await uploadImages();
    }

    // 2. Gọi API tạo bài đăng
    const payload = {
      nguoi_dang_id: user.user_id || user.id,
      tieu_de: form.value.tieu_de,
      ten_nong_san: form.value.ten_nong_san,
      danhmuc_id: Number(form.value.danhmuc_id),
      so_luong_co: tongSoLuong,
      don_vi_tinh: form.value.don_vi_tinh,
      gia_per_kg: minGia === Infinity ? 0 : minGia,
      tinh_thanh: form.value.tinh_thanh,
      mo_ta: form.value.mo_ta,
      latitude: form.value.latitude ? Number(form.value.latitude) : null,
      longitude: form.value.longitude ? Number(form.value.longitude) : null,
      tieu_chuan_ids: form.value.tieu_chuan_ids,
      images: uploadedUrls,
      phan_loais: phanLoais.value.map((pl) => ({
        ten_phan_loai: pl.ten_phan_loai,
        gia: Number(pl.gia),
        so_luong_co: Number(pl.so_luong_co),
      })),
    };

    await BaiDang.create(payload);

    // 3. Xử lý lưu địa chỉ nếu có yêu cầu
    if (
      isSavingLocation.value &&
      saveLocationName.value &&
      form.value.latitude
    ) {
      try {
        await api.post("/dia-chi-luu", {
          user_id: user.user_id || user.id,
          ten_goi: saveLocationName.value,
          dia_chi: form.value.tinh_thanh,
          latitude: form.value.latitude,
          longitude: form.value.longitude,
        });
      } catch (err) {
        console.error("Lỗi khi lưu tọa độ:", err);
      }
    }
    notify.success(
      "Tạo bài đăng thành công! Lô hàng đang chờ duyệt từ hệ thống.",
    );
    router.push("/");
  } catch (err: any) {
    console.error(err);
    notify.error(
      err.response?.data?.message ||
        "Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại.",
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="create-post-root bg-[#f8fafc] py-12 px-4 min-h-screen font-sans">
    <div
      class="max-w-4xl mx-auto bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100 relative overflow-hidden"
    >
      <!-- Trang trí nền góc trên -->
      <div
        class="absolute -top-24 -right-24 w-64 h-64 bg-[#e8f5e9] rounded-full opacity-50 pointer-events-none"
      ></div>

      <div
        class="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6 relative z-10"
      >
        <div
          class="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center shadow-inner"
        >
          <span class="text-3xl">🌾</span>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            Tạo Bài Đăng Sản Phẩm
          </h1>
          <p class="text-slate-500 text-sm mt-1 font-medium">
            Bắt đầu kết nối nông sản của bạn tới hàng ngàn doanh nghiệp.
          </p>
        </div>
      </div>

      <form @submit.prevent="submitPost" class="space-y-8 relative z-10">
        <!-- THÔNG TIN CƠ BẢN -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-lg font-bold text-slate-800 flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[#2E7D32]">info</span>
              Thông tin cơ bản
            </h2>
            <button
              type="button"
              @click="handleSuggestDescription"
              :disabled="isSuggesting"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5e9] rounded-lg text-sm font-bold text-[#2E7D32] hover:bg-[#c8e6c9] transition-colors disabled:opacity-50 border border-[#2E7D32]/20 shadow-sm"
            >
              <span
                v-if="isSuggesting"
                class="animate-spin material-symbols-outlined text-sm"
                >sync</span
              >
              <span v-else class="material-symbols-outlined text-sm"
                >smart_toy</span
              >
              {{ isSuggesting ? "AI Đang Xử Lý..." : "AI Điền Tự Động" }}
            </button>
          </div>
          <div
            class="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100"
          >
            <!-- Tiêu đề -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5"
                >Tiêu đề bài đăng <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.tieu_de"
                type="text"
                required
                placeholder="Ví dụ: Cà chua Cherry Đà Lạt sạch không thuốc trừ sâu"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Tên nông sản -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5"
                  >Tên nông sản <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.ten_nong_san"
                  type="text"
                  required
                  placeholder="Ví dụ: Cà chua Cherry"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <!-- Danh mục -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5"
                  >Danh mục <span class="text-red-500">*</span></label
                >
                <select
                  v-model="form.danhmuc_id"
                  required
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer"
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  <option
                    v-for="cat in categories"
                    :key="cat.danhmuc_id"
                    :value="cat.danhmuc_id"
                  >
                    {{ cat.ten_danh_muc }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- GIÁ CẢ VÀ SẢN LƯỢNG (PHÂN LOẠI SẢN PHẨM) -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h2
              class="text-lg font-bold text-slate-800 flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[#2E7D32]"
                >category</span
              >
              Phân loại sản phẩm (VD: Loại 1, Loại 2...)
            </h2>
            <button
              type="button"
              @click="addPhanLoai"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5e9] rounded-lg text-sm font-bold text-[#2E7D32] hover:bg-[#c8e6c9] transition-colors border border-[#2E7D32]/20"
            >
              <span class="material-symbols-outlined text-sm">add</span> Thêm
              Phân Loại
            </button>
          </div>

          <!-- List Phân loại -->
          <div class="space-y-4">
            <div
              v-for="(pl, index) in phanLoais"
              :key="index"
              class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group"
            >
              <!-- Nút xoá phân loại -->
              <button
                v-if="phanLoais.length > 1"
                @click="removePhanLoai(index)"
                type="button"
                class="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm border border-red-200 z-10"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="md:col-span-1">
                  <label
                    class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >Tên Phân Loại <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="pl.ten_phan_loai"
                    type="text"
                    required
                    placeholder="VD: Sầu Riêng Ri6 Loại 1"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                <div class="md:col-span-1">
                  <label
                    class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >Sản Lượng Có <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="pl.so_luong_co"
                    type="number"
                    min="1"
                    required
                    placeholder="VD: 100"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                <div class="md:col-span-1">
                  <div class="flex items-center justify-between mb-1.5">
                    <label
                      class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      >Giá Bán (VNĐ) <span class="text-red-500">*</span></label
                    >
                    <button
                      type="button"
                      @click="handleSuggestPrice(index)"
                      :disabled="suggestingPriceIdx === index"
                      class="text-[10px] font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <span
                        v-if="suggestingPriceIdx === index"
                        class="animate-spin material-symbols-outlined text-[14px]"
                        >sync</span
                      >
                      <span v-else class="material-symbols-outlined text-[14px]"
                        >smart_toy</span
                      >
                      Gợi ý
                    </button>
                  </div>
                  <input
                    v-model="pl.gia"
                    type="number"
                    min="500"
                    required
                    placeholder="VD: 50000"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-bold text-[#d00000]"
                  />
                </div>
                <div class="md:col-span-1 pb-1">
                  <p
                    v-if="form.don_vi_tinh === 'tấn' && pl.gia"
                    class="text-xs font-bold text-[#2E7D32]"
                  >
                    ~ {{ (pl.gia / 1000).toLocaleString("vi-VN") }} VNĐ/kg
                  </p>
                  <p
                    v-if="form.don_vi_tinh === 'kg' && pl.gia"
                    class="text-xs font-bold text-[#2E7D32]"
                  >
                    ~ {{ (pl.gia * 1000).toLocaleString("vi-VN") }} VNĐ/tấn
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-6 space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100"
          >
            <!-- Đơn vị tính chung -->
            <div class="max-w-xs">
              <label class="block text-sm font-bold text-slate-700 mb-1.5"
                >Đơn vị tính (Chung cho lô hàng)</label
              >
              <select
                v-model="form.don_vi_tinh"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer"
              >
                <option value="kg">Kg</option>
                <option value="tấn">Tấn</option>
              </select>
            </div>

            <!-- Tỉnh thành -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5"
                >Khu vực / Tỉnh thành <span class="text-red-500">*</span></label
              >
              <select
                v-model="form.tinh_thanh"
                required
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer"
              >
                <option value="" disabled>-- Chọn tỉnh thành --</option>
                <option
                  v-for="prov in vietnamProvinces"
                  :key="prov"
                  :value="prov"
                >
                  {{ prov }}
                </option>
              </select>
            </div>

            <!-- Tiêu Chuẩn -->
            <div v-if="tieuChuansList.length > 0">
              <label class="block text-sm font-bold text-slate-700 mb-2"
                >Tiêu chuẩn nông sản từng đạt được</label
              >
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  v-for="tc in tieuChuansList"
                  :key="tc.tieuchuan_id"
                  class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#2E7D32] transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="tc.tieuchuan_id"
                    v-model="form.tieu_chuan_ids"
                    class="w-5 h-5 text-[#2E7D32] rounded focus:ring-[#2E7D32] border-slate-300"
                  />
                  <span
                    class="text-sm font-bold text-slate-700 flex items-center gap-1"
                  >
                    <span
                      v-if="tc.icon_url"
                      class="material-symbols-outlined text-sm text-[#2E7D32]"
                      >{{ tc.icon_url }}</span
                    >
                    {{ tc.ten_tieu_chuan }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Bản đồ -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-bold text-slate-700"
                  >Tọa độ lấy hàng (Khuyến nghị)</label
                >
                <select
                  v-if="savedLocations.length > 0"
                  v-model="selectedSavedLocation"
                  class="text-xs p-2 border border-slate-200 rounded-lg outline-none bg-white cursor-pointer w-48 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  <option value="">-- Chọn tọa độ đã lưu --</option>
                  <option
                    v-for="loc in savedLocations"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.ten_goi }}
                  </option>
                </select>
              </div>

              <!-- Search box -->
              <div class="flex gap-2 mb-3">
                <input
                  v-model="searchLocationText"
                  @keyup.enter.prevent="handleSearchLocation"
                  type="text"
                  placeholder="Tìm địa chỉ hoặc nhập tọa độ..."
                  class="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-[#2E7D32]"
                />
                <button
                  type="button"
                  @click="handleSearchLocation"
                  :disabled="isSearching"
                  class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 rounded-xl flex items-center justify-center transition-colors"
                >
                  <span
                    v-if="isSearching"
                    class="animate-spin material-symbols-outlined text-sm"
                    >sync</span
                  >
                  <span v-else class="material-symbols-outlined text-sm"
                    >search</span
                  >
                </button>
              </div>

              <div
                id="post-map"
                class="w-full h-[300px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative z-0"
              ></div>

              <!-- Save location options -->
              <div
                v-if="form.latitude && !selectedSavedLocation"
                class="mt-3 bg-white p-3 rounded-xl border border-slate-200"
              >
                <label class="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    v-model="isSavingLocation"
                    class="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                  />
                  <span class="text-sm font-bold text-slate-700"
                    >Lưu tọa độ này cho lần sau</span
                  >
                </label>
                <div v-if="isSavingLocation" class="flex gap-2">
                  <input
                    v-model="saveLocationName"
                    type="text"
                    placeholder="Nhập tên gợi nhớ (VD: Vườn sầu riêng 1)..."
                    class="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>
              <p
                v-if="form.latitude"
                class="text-xs text-slate-500 font-bold mt-2"
              >
                Đã chọn tọa độ: {{ form.latitude.toFixed(6) }},
                {{ form.longitude?.toFixed(6) }}
              </p>
            </div>
          </div>
        </section>

        <!-- HÌNH ẢNH & MÔ TẢ -->
        <section>
          <h2
            class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[#2E7D32]"
              >photo_library</span
            >
            Hình ảnh & Chi tiết
          </h2>
          <div
            class="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100"
          >
            <!-- Hình ảnh -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2"
                >Tải lên hình ảnh lô hàng</label
              >
              <div
                class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-300 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-colors relative group"
              >
                <div class="space-y-2 text-center relative z-10">
                  <div
                    class="w-16 h-16 bg-[#e8f5e9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <span class="material-symbols-outlined text-3xl"
                      >cloud_upload</span
                    >
                  </div>
                  <div class="flex text-sm text-slate-600 justify-center">
                    <label
                      for="file-upload"
                      class="relative cursor-pointer bg-white rounded-md font-bold text-[#2E7D32] hover:text-[#1B5E20] focus-within:outline-none"
                    >
                      <span>Nhấn để chọn ảnh</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        class="sr-only"
                        multiple
                        accept="image/*"
                        @change="handleFileChange"
                      />
                    </label>
                    <p class="pl-1 text-slate-500 font-medium">
                      hoặc kéo thả vào đây
                    </p>
                  </div>
                  <p class="text-xs text-slate-400 font-medium">
                    Định dạng hỗ trợ: PNG, JPG, GIF (Tối đa 5MB)
                  </p>

                  <div
                    v-if="selectedImages.length > 0"
                    class="mt-6 flex flex-wrap gap-3 justify-center"
                  >
                    <div
                      v-for="(imgObj, index) in selectedImages"
                      :key="index"
                      class="relative text-xs font-bold bg-[#e8f5e9] text-[#2E7D32] px-3 py-2 rounded-xl border border-[#2E7D32]/20 flex flex-col items-center gap-1 group/img"
                      :class="
                        imgObj.isMain
                          ? 'ring-2 ring-[#2E7D32] bg-[#c8e6c9]'
                          : ''
                      "
                    >
                      <!-- Badge ảnh chính -->
                      <span
                        v-if="imgObj.isMain"
                        class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[10px]"
                          >star</span
                        >
                        Chính
                      </span>

                      <span class="material-symbols-outlined text-[18px]"
                        >image</span
                      >
                      <span class="truncate w-20 text-center">{{
                        imgObj.file.name
                      }}</span>

                      <!-- Nút thao tác -->
                      <div class="flex gap-1 mt-1">
                        <button
                          v-if="!imgObj.isMain"
                          @click.prevent="setMainImage(index)"
                          class="px-2 py-1 bg-white text-[#2E7D32] rounded border border-[#2E7D32]/20 hover:bg-[#2E7D32] hover:text-white transition-colors"
                          title="Đặt làm ảnh chính"
                        >
                          Chọn chính
                        </button>
                        <button
                          @click.prevent="removeImage(index)"
                          class="px-2 py-1 bg-white text-red-500 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors"
                          title="Xoá ảnh"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mô tả -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5"
                >Mô tả chi tiết</label
              >
              <textarea
                v-model="form.mo_ta"
                rows="5"
                placeholder="Nhập thông tin chi tiết về sản phẩm, tiêu chuẩn chất lượng (VietGAP, GlobalGAP), cách thức vận chuyển..."
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- BUTTONS -->
        <div
          class="pt-6 flex flex-col sm:flex-row gap-4 justify-end border-t border-slate-100"
        >
          <button
            type="button"
            @click="router.back()"
            class="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="w-full sm:w-auto px-10 py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(46,125,50,0.3)] hover:shadow-[0_6px_20px_rgba(46,125,50,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span
              v-if="loading"
              class="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"
            ></span>
            {{ loading ? "Đang tạo bài..." : "Đăng Bán Ngay" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

.font-sans {
  font-family: "Inter", sans-serif;
}
</style>
