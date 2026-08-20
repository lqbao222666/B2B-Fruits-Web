<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { BaoGiaService } from "@/service/baogia";
import { Category } from "@/service/category";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const router = useRouter();
const loading = ref(false);
const nhuCauList = ref<NhuCauThuMua[]>([]);
const categories = ref<any[]>([]);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 12;

const totalPages = computed(() => {
  return Math.ceil(nhuCauList.value.length / itemsPerPage);
});

const paginatedNhuCauList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return nhuCauList.value.slice(start, end);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

import { useRoute } from "vue-router";

const route = useRoute();

// Filter states mở rộng
const searchKeyword = ref("");
const selectedProvince = ref("");
const selectedRegion = ref("");
const selectedCategory = ref<number | null>(null);
const presetMinQuantity = ref<number | null>(null);
const minQuantityInput = ref<number | null>(null);
const presetPriceRange = ref<string>("");
const minPriceInput = ref<number | null>(null);
const maxPriceInput = ref<number | null>(null);
const selectedStandard = ref<string>("");
const selectedNegotiation = ref<string>("");
const selectedSort = ref<string>("newest");

// Saved locations state
const savedLocations = ref<any[]>([]);
const selectedSavedLocation = ref("");
const saveLocationName = ref("");
const isSavingLocation = ref(false);

// Modal Chào hàng / Báo giá
const showOfferModal = ref(false);
const selectedNhuCau = ref<NhuCauThuMua | null>(null);

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

const user = ref<any>(null);

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

const isFarmer = computed(() => {
  return user.value?.role?.toUpperCase() === "NONG_DAN";
});

const isEnterprise = computed(() => {
  return user.value?.role?.toUpperCase() === "DOANH_NGHIEP";
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

const fetchCategories = async () => {
  try {
    const res = await Category.getAllCategories();
    categories.value = Array.isArray(res) ? res : res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const resetFilters = () => {
  searchKeyword.value = "";
  selectedProvince.value = "";
  selectedRegion.value = "";
  selectedCategory.value = null;
  presetMinQuantity.value = null;
  minQuantityInput.value = null;
  presetPriceRange.value = "";
  minPriceInput.value = null;
  maxPriceInput.value = null;
  selectedStandard.value = "";
  selectedNegotiation.value = "";
  selectedSort.value = "newest";
  fetchNhuCauList();
};

const fetchNhuCauList = async () => {
  loading.value = true;
  currentPage.value = 1;
  try {
    let computedGiaMin: number | undefined = minPriceInput.value
      ? minPriceInput.value * 1000
      : undefined;
    let computedGiaMax: number | undefined = maxPriceInput.value
      ? maxPriceInput.value * 1000
      : undefined;

    if (!computedGiaMin && !computedGiaMax && presetPriceRange.value) {
      if (presetPriceRange.value === "under-30") computedGiaMax = 30000;
      else if (presetPriceRange.value === "30-50") {
        computedGiaMin = 30000;
        computedGiaMax = 50000;
      } else if (presetPriceRange.value === "over-50") {
        computedGiaMin = 50000;
      }
    }

    const minQty =
      minQuantityInput.value !== null && minQuantityInput.value !== undefined
        ? minQuantityInput.value
        : (presetMinQuantity.value ?? undefined);

    const data = await NhuCauService.getAll({
      ten_nong_san: searchKeyword.value || undefined,
      tinh_thanh_giao: selectedProvince.value || undefined,
      danhmuc_id: selectedCategory.value || undefined,
      trang_thai: "dang_thu_mua",
      mien: selectedRegion.value || undefined,
      so_luong_min: minQty,
      gia_min: computedGiaMin,
      gia_max: computedGiaMax,
      yeu_cau_chung_nhan: selectedStandard.value || undefined,
      cho_thuong_luong:
        selectedNegotiation.value === "true"
          ? true
          : selectedNegotiation.value === "false"
            ? false
            : undefined,
      sort: selectedSort.value || undefined,
    });
    nhuCauList.value = data || [];
  } catch (e: any) {
    notify.error("Lỗi khi tải danh sách nhu cầu thu mua");
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

const openOfferModal = (item: NhuCauThuMua) => {
  if (!user.value) {
    notify.info(
      "Vui lòng đăng nhập tài khoản Nông Dân để gửi báo giá chào hàng",
    );
    router.push("/auth/nong-dan");
    return;
  }
  if (!isFarmer.value) {
    notify.error("Chỉ tài khoản Nông Dân mới có thể gửi báo giá chào hàng");
    return;
  }

  router.push(`/gui-bao-gia/${item.nhucau_id}`);
};

// Calculate distance dynamically based on Farmer supply location vs Enterprise delivery location
const estimatedDistance = computed(() => {
  if (!selectedNhuCau.value) return 25;
  const item = selectedNhuCau.value;
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
    return 15; // Cùng tỉnh thành
  }
  return 75; // Khác tỉnh thành
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
  if (!selectedNhuCau.value?.gia_tham_khao) return;
  const giaGoc = Number(selectedNhuCau.value.gia_tham_khao);
  const giaMoi = Number(offerForm.value.gia_de_xuat);
  offerForm.value.chenh_lech_gia = giaMoi - giaGoc;
};

const submitOffer = async () => {
  if (!selectedNhuCau.value || !user.value) return;
  const userId = user.value.user_id || user.value.id;

  try {
    await BaoGiaService.create({
      nhucau_id: selectedNhuCau.value.nhucau_id,
      nong_dan_id: userId,
      so_luong_cung_cap: Number(offerForm.value.so_luong_cung_cap),
      don_vi: selectedNhuCau.value.don_vi || "kg",
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
      text: "Doanh nghiệp đã nhận được báo giá và sẽ phản hồi cho bạn trong thời gian sớm nhất.",
      confirmButtonColor: "#10b981",
    });
    showOfferModal.value = false;
    fetchNhuCauList();
  } catch (e: any) {
    notify.error(
      e.response?.data?.message || "Không thể gửi báo giá. Vui lòng thử lại.",
    );
  }
};

const formatPrice = (val?: number) => {
  if (!val) return "Thương lượng";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Không thời hạn";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

watch(
  () => route.query,
  () => {
    if (route.query.keyword !== undefined) searchKeyword.value = String(route.query.keyword || "");
    if (route.query.province !== undefined) selectedProvince.value = String(route.query.province || "");
    if (route.query.region !== undefined) selectedRegion.value = String(route.query.region || "");
    if (route.query.category !== undefined) selectedCategory.value = route.query.category ? Number(route.query.category) : null;
    if (route.query.minQuantity !== undefined) presetMinQuantity.value = route.query.minQuantity ? Number(route.query.minQuantity) : null;
    if (route.query.standard !== undefined) selectedStandard.value = String(route.query.standard || "");
    if (route.query.maxPrice !== undefined) maxPriceInput.value = route.query.maxPrice ? Number(route.query.maxPrice) / 1000 : null;
    if (route.query.minPrice !== undefined) minPriceInput.value = route.query.minPrice ? Number(route.query.minPrice) / 1000 : null;
    if (route.query.sort !== undefined) selectedSort.value = String(route.query.sort || "newest");
    fetchNhuCauList();
  },
  { deep: true },
);

onMounted(() => {
  if (route.query.keyword) searchKeyword.value = String(route.query.keyword);
  if (route.query.province) selectedProvince.value = String(route.query.province);
  if (route.query.region) selectedRegion.value = String(route.query.region);
  if (route.query.category) selectedCategory.value = Number(route.query.category);
  if (route.query.minQuantity) presetMinQuantity.value = Number(route.query.minQuantity);
  if (route.query.standard) selectedStandard.value = String(route.query.standard);
  if (route.query.maxPrice) maxPriceInput.value = Number(route.query.maxPrice) / 1000;
  if (route.query.minPrice) minPriceInput.value = Number(route.query.minPrice) / 1000;
  if (route.query.sort) selectedSort.value = String(route.query.sort);

  checkUser();
  fetchCategories();
  fetchNhuCauList();
});
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- ===== HERO BANNER ===== -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-green-900 p-8 md:p-12 text-white shadow-xl"
    >
      <div
        class="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div class="relative z-10 max-w-3xl space-y-4">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-sm font-semibold backdrop-blur-md"
        >
          Sàn Giao Dịch Nhu Cầu Thu Mua B2B
        </div>
        <h1
          class="text-3xl md:text-5xl font-black tracking-tight leading-tight"
        >
          Sàn Giao Dịch B2B
        </h1>
        <p
          class="text-emerald-100 text-sm md:text-base leading-relaxed opacity-95"
        >
          Tìm kiếm nguồn cung cấp nông sản từ nhà vườn hoặc đáp ứng yêu cầu của
          doanh nghiệp
        </p>

        <div class="pt-2 flex flex-wrap gap-3" v-if="isEnterprise">
          <RouterLink
            to="/quan-ly-nhu-cau"
            class="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-800 font-bold rounded-2xl shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
          >
            Quản Lý Nhu Cầu Của Tôi
          </RouterLink>

          <RouterLink
            to="/create-nhu-cau"
            class="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            Đăng Nhu Cầu Mới
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="flex items-center gap-4 border-b border-slate-200 pb-4">
      <RouterLink
        to="/products"
        class="px-6 py-3 rounded-2xl font-bold text-base uppercase tracking-wide transition-all text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800"
      >
        Sản Phẩm Nông Dân Đăng Bán
      </RouterLink>
      <RouterLink
        to="/nhu-cau"
        class="px-6 py-3 rounded-2xl font-black text-base uppercase tracking-wide transition-all bg-[#2E7D32] text-white shadow-lg transform -translate-y-0.5"
      >
        Yêu Cầu Thu Mua Của Doanh Nghiệp
      </RouterLink>
    </div>

    <!-- ===== SEARCH & FILTER BAR ===== -->
    <div
      class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-5"
    >
      <!-- Row 1: Search keyword, Sort & Reset -->
      <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 w-full">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Tìm theo tên nông sản, công ty thu mua, mô tả (Sầu riêng, Xoài, Thanh long...)..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            @keyup.enter="fetchNhuCauList"
          />
        </div>

        <div class="flex items-center gap-3 w-full lg:w-auto">
          <!-- Sort dropdown -->
          <select
            v-model="selectedSort"
            class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
            @change="fetchNhuCauList"
          >
            <option value="newest">Mới nhất</option>

            <option value="qty_desc">Số lượng cần (Cao ➔ Thấp)</option>
            <option value="qty_asc">Số lượng cần (Thấp ➔ Cao)</option>
            <option value="price_desc">Giá tham khảo (Cao ➔ Thấp)</option>
            <option value="price_asc">Giá tham khảo (Thấp ➔ Cao)</option>
          </select>

          <!-- Nút áp dụng / Nút làm mới -->
          <button
            @click="fetchNhuCauList"
            class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow transition flex items-center gap-1.5"
          >
            Áp dụng
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition"
            title="Đặt lại bộ lọc"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Row 2: Filter by Region (Miền) -->
      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span class="text-sm font-bold text-slate-500 mr-2 flex items-center gap-1">
          Vùng miền:
        </span>
        <button
          type="button"
          @click="selectedRegion = ''; fetchNhuCauList();"
          class="px-3.5 py-1.5 rounded-xl text-sm font-bold transition border"
          :class="
            selectedRegion === ''
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          "
        >
          Tất cả vùng miền
        </button>
        <button
          type="button"
          @click="selectedRegion = 'bac'; fetchNhuCauList();"
          class="px-3.5 py-1.5 rounded-xl text-sm font-bold transition border"
          :class="
            selectedRegion === 'bac'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          "
        >
          Miền Bắc
        </button>
        <button
          type="button"
          @click="selectedRegion = 'trung'; fetchNhuCauList();"
          class="px-3.5 py-1.5 rounded-xl text-sm font-bold transition border"
          :class="
            selectedRegion === 'trung'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          "
        >
          Miền Trung / Tây Nguyên
        </button>
        <button
          type="button"
          @click="selectedRegion = 'nam'; fetchNhuCauList();"
          class="px-3.5 py-1.5 rounded-xl text-sm font-bold transition border"
          :class="
            selectedRegion === 'nam'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          "
        >
          Miền Nam / Miền Tây
        </button>
      </div>

      <!-- Row 3: Grid of filters (Province, Category, Min Qty, Price, Standard, Negotiation) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
        <!-- Province -->
        <div>
          <label class="block text-sm font-bold text-slate-500 mb-1"
            >Tỉnh/Thành giao hàng:</label
          >
          <select
            v-model="selectedProvince"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            @change="fetchNhuCauList"
          >
            <option value="">Tất cả tỉnh thành</option>
            <option v-for="prov in provinces" :key="prov" :value="prov">
              {{ prov }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-bold text-slate-500 mb-1"
            >Danh mục nông sản:</label
          >
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            @change="fetchNhuCauList"
          >
            <option :value="null">Tất cả danh mục</option>
            <option
              v-for="cat in categories"
              :key="cat.danhmuc_id"
              :value="cat.danhmuc_id"
            >
              {{ cat.ten_danh_muc }}
            </option>
          </select>
        </div>

        <!-- Min Quantity Needed -->
        <div>
          <label class="block text-sm font-bold text-slate-500 mb-1"
            >Số lượng cần tối thiểu:</label
          >
          <select
            v-model="presetMinQuantity"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            @change="fetchNhuCauList"
          >
            <option :value="null">Tất cả quy mô số lượng</option>
            <option :value="100">≥ 100 kg</option>
            <option :value="500">≥ 500 kg</option>
            <option :value="1000">≥ 1 Tấn (1.000 kg)</option>
            <option :value="5000">≥ 5 Tấn (5.000 kg)</option>
            <option :value="10000">≥ 10 Tấn (10.000 kg)</option>
          </select>
        </div>

        <!-- Certificate standard requirement -->
        <div>
          <label class="block text-sm font-bold text-slate-500 mb-1"
            >Yêu cầu chứng nhận:</label
          >
          <select
            v-model="selectedStandard"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            @change="fetchNhuCauList"
          >
            <option value="">Tất cả chứng nhận</option>
            <option value="VietGAP">VietGAP</option>
            <option value="GlobalGAP">GlobalGAP</option>
            <option value="Hữu cơ (Organic)">Hữu cơ (Organic)</option>
            <option value="OCOP">Tiêu chuẩn OCOP</option>
            <option value="ISO 22000">ISO 22000</option>
          </select>
        </div>

        <!-- Price Range preset & Custom Min/Max -->
        <div>
          <label class="block text-sm font-bold text-slate-500 mb-1"
            >Mức giá tham khảo:</label
          >
          <select
            v-model="presetPriceRange"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            @change="minPriceInput = null; maxPriceInput = null; fetchNhuCauList();"
          >
            <option value="">Tất cả khoảng giá</option>
            <option value="under-30">Dưới 30.000đ/đơn vị</option>
            <option value="30-50">Từ 30.000đ - 50.000đ</option>
            <option value="over-50">Trên 50.000đ/đơn vị</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ===== DEMANDS LISTING GRID ===== -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"
      ></div>
    </div>

    <div
      v-else-if="nhuCauList.length === 0"
      class="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4"
    >
      <div class="text-5xl">🌾</div>
      <h3 class="text-lg font-bold text-slate-800">
        Chưa có nhu cầu thu mua nào phù hợp
      </h3>
      <p class="text-slate-500 text-sm max-w-md mx-auto">
        Hiện tại chưa tìm thấy yêu cầu thu mua nào phù hợp với bộ lọc. Hãy thử
        tìm từ khóa khác hoặc quay lại sau!
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in paginatedNhuCauList"
        :key="item.nhucau_id"
        class="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
      >
        <div class="p-6 space-y-4">
          <!-- Enterprise Header -->
          <div
            class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
          >
            <div class="flex items-center gap-3">
              <div>
                <h4 class="font-bold text-slate-800 text-lg line-clamp-1">
                  {{
                    item.doanhNghiep?.ten_cong_ty ||
                    item.doanhNghiep?.user?.full_name ||
                    "Doanh Nghiệp Thu Mua"
                  }}
                </h4>
                <p class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <span>📍</span> {{ item.tinh_thanh_giao || "Toàn quốc" }}
                </p>
              </div>
            </div>

            <span
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              Đang mở thu mua
            </span>
          </div>

          <!-- Product Name & Needed Quantity -->
          <div>
            <span
              v-if="item.danhMuc"
              class="text-[11px] font-semibold tracking-wide uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
            >
              {{ item.danhMuc.ten_danh_muc }}
            </span>
            <h3
              class="text-xl font-black text-slate-900 mt-1 group-hover:text-emerald-700 transition"
            >
              {{ item.ten_nong_san }}
            </h3>
            <p
              v-if="item.mo_ta"
              class="text-xs text-slate-600 line-clamp-2 mt-1"
            >
              {{ item.mo_ta }}
            </p>
          </div>

          <!-- Specifications Box -->
          <div
            class="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs"
          >
            <div>
              <span class="text-slate-400 block text-[11px]"
                >Số lượng cần:</span
              >
              <span class="font-bold text-slate-800 text-sm">
                {{ item.so_luong_can }}
                <span class="text-xs font-medium text-slate-600">{{
                  item.don_vi
                }}</span>
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]"
                >Giá tham khảo:</span
              >
              <span class="font-bold text-emerald-700 text-sm">
                {{ formatPrice(item.gia_tham_khao) }}
              </span>
            </div>
          </div>

          <!-- Info Details -->
          <div class="space-y-1.5 text-xs text-slate-600">
            <div
              class="flex items-center justify-between"
              v-if="item.yeu_cau_chung_nhan"
            >
              <span class="text-slate-400">Yêu cầu chứng nhận:</span>
              <span
                class="font-semibold text-slate-700 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded"
              >
                📜 {{ item.yeu_cau_chung_nhan }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Địa chỉ nhận hàng:</span>
              <span
                class="font-medium text-slate-700 line-clamp-1 max-w-[180px]"
              >
                {{ item.dia_chi_giao || item.tinh_thanh_giao || "Thỏa thuận" }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Hạn thu mua:</span>
              <span class="font-medium text-slate-700">
                {{ formatDate(item.ngay_ket_thuc) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div
          class="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2"
        >
          <RouterLink
            :to="`/nhu-cau/${item.nhucau_id}`"
            class="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 text-center transition"
          >
            Chi tiết
          </RouterLink>

          <button
            @click="openOfferModal(item)"
            class="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-600/20 text-center transition flex items-center justify-center gap-1.5"
          >
            <span>🏷️</span> Gửi Báo Giá
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        &lt;
      </button>
      
      <div class="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition flex-shrink-0"
          :class="
            currentPage === page
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          "
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        &gt;
      </button>
    </div>

    <!-- ===== MODAL GỬI BÁO GIÁ CHÀO HÀNG ===== -->
    <div
      v-if="showOfferModal && selectedNhuCau"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative border border-slate-100 max-h-[82vh] overflow-y-auto my-auto"
      >
        <!-- Header -->
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
                selectedNhuCau.ten_nong_san
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

        <!-- Demand Summary Info -->
        <div
          class="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1 text-emerald-950"
        >
          <div class="flex justify-between">
            <span class="text-emerald-700 font-medium">Doanh nghiệp:</span>
            <span class="font-bold">{{
              selectedNhuCau.doanhNghiep?.ten_cong_ty ||
              selectedNhuCau.doanhNghiep?.user?.full_name
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-emerald-700 font-medium">Số lượng DN cần:</span>
            <span class="font-bold"
              >{{ selectedNhuCau.so_luong_can }}
              {{ selectedNhuCau.don_vi }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-emerald-700 font-medium"
              >Giá tham khảo của DN:</span
            >
            <span class="font-bold text-emerald-800"
              >{{ formatPrice(selectedNhuCau.gia_tham_khao) }} /
              {{ selectedNhuCau.don_vi }}</span
            >
          </div>
        </div>

        <!-- Form Inputs -->
        <div class="space-y-4 text-xs">
          <!-- Số lượng chào bán -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Số lượng bạn có thể cung cấp ({{ selectedNhuCau.don_vi }}):
            </label>
            <input
              v-model.number="offerForm.so_luong_cung_cap"
              type="number"
              min="1"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Giá đề xuất mới -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Giá bạn đề xuất (VNĐ / {{ selectedNhuCau.don_vi }}):
            </label>
            <input
              v-model.number="offerForm.gia_de_xuat"
              type="number"
              step="500"
              @input="onGiaChange"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div class="mt-1 flex items-center justify-between text-[11px]">
              <span class="text-slate-500"
                >Chênh lệch so với giá tham khảo:</span
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

          <!-- Địa điểm cung cấp của Nông dân -->
          <div
            class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5"
          >
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800 text-xs">
                📍 Địa điểm xuất hàng / Kho nông sản của bạn (*):
              </label>
              <span
                class="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                Tự động tính khoảng cách
              </span>
            </div>

            <!-- Chọn từ danh sách kho đã lưu -->
            <div v-if="savedLocations.length > 0">
              <label class="block font-semibold text-slate-600 text-[11px] mb-1"
                >Chọn từ kho / địa chỉ đã lưu:</label
              >
              <select
                v-model="selectedSavedLocation"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  placeholder="Ví dụ: Kho số 1, Ấp 3, Xã Tân Thuận..."
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- Lưu địa chỉ mới cho những lần sử dụng sau -->
            <div
              class="flex items-center gap-2 pt-1 border-t border-slate-200/60"
            >
              <input
                v-model="saveLocationName"
                type="text"
                placeholder="Tên lưu gợi nhớ (ví dụ: Kho số 1, Vườn sầu riêng)..."
                class="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none"
              />
              <button
                type="button"
                @click="saveCurrentSupplyLocation"
                :disabled="isSavingLocation"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow transition"
              >
                {{ isSavingLocation ? "Đang lưu..." : "💾 Lưu địa chỉ này" }}
              </button>
            </div>
          </div>

          <!-- Fee & Distance Calculation Box -->
          <div
            class="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1.5 text-amber-900"
          >
            <div
              class="flex justify-between items-center text-xs font-semibold"
            >
              <span class="flex items-center gap-1"
                >🚚 Khoảng cách tính toán (Nông dân ➔ DN):</span
              >
              <span class="font-bold text-amber-950 text-sm"
                >{{ estimatedDistance }} km</span
              >
            </div>
            <div
              class="flex justify-between items-center text-xs font-semibold"
            >
              <span class="flex items-center gap-1"
                >💰 Phí giao hàng (Nông dân chi trả):</span
              >
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
              đến
              <strong>{{
                selectedNhuCau.tinh_thanh_giao || "Doanh nghiệp"
              }}</strong
              >. Nông dân chịu phí vận chuyển này.
            </p>
          </div>

          <!-- Ghi chú / Message -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Ghi chú / Thỏa thuận thêm:
            </label>
            <textarea
              v-model="offerForm.ghi_chu"
              rows="3"
              placeholder="Nhập thông tin về chất lượng, hình thức đóng gói, ngày giao hàng..."
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            @click="showOfferModal = false"
            class="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            Hủy
          </button>
          <button
            @click="submitOffer"
            class="flex-1 py-3 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-700 transition"
          >
            Gửi Báo Giá Ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
