<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import TinNhanService from "@/service/tinnhan.ts";
import { notify } from "@/utils/notifier.ts";

const route = useRoute();
const router = useRouter();

const userId = computed(() => Number(route.params.id));
const isLoading = ref(true);
const partner = ref<any>(null);

const getAvatarUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${path}`;
};

const getPostImage = (images: any) => {
  if (!images) return "";
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) return getAvatarUrl(parsed[0]);
    } catch {
      return getAvatarUrl(images);
    }
  }
  if (Array.isArray(images) && images.length > 0) {
    return getAvatarUrl(images[0]);
  }
  return "";
};

const fetchPartnerDetail = async () => {
  if (!userId.value || isNaN(userId.value)) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    const data = await TinNhanService.getUserDetail(userId.value);
    partner.value = data;
  } catch (error) {
    console.error("Lỗi khi tải thông tin đối tác:", error);
    notify.error("Không thể tải thông tin đối tác");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPartnerDetail();
});

watch(
  () => route.params.id,
  () => {
    fetchPartnerDetail();
  },
);

const isFarmer = computed(() => {
  return (
    partner.value?.vaiTro?.ten_vai_tro === "nong_dan" ||
    !!partner.value?.nongDan
  );
});

const isBusiness = computed(() => {
  return (
    partner.value?.vaiTro?.ten_vai_tro === "doanh_nghiep" ||
    !!partner.value?.doanhNghiep
  );
});

const ratingScore = computed(() => {
  if (isFarmer.value && partner.value?.nongDan?.diem_trung_binh) {
    return Number(partner.value.nongDan.diem_trung_binh).toFixed(1);
  }
  if (isBusiness.value && partner.value?.doanhNghiep?.diem_trung_binh) {
    return Number(partner.value.doanhNghiep.diem_trung_binh).toFixed(1);
  }
  return "5.0";
});

const totalTransactions = computed(() => {
  if (isFarmer.value) {
    return partner.value?.nongDan?.tong_giao_dich || 0;
  }
  if (isBusiness.value) {
    return partner.value?.doanhNghiep?.tong_giao_dich || 0;
  }
  return 0;
});

const startChat = () => {
  if (userId.value) {
    router.push({ path: "/messages", query: { partnerId: userId.value } });
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  notify.success("Đã sao chép liên kết hồ sơ!");
};

const goBack = () => {
  if (window.history.length > 1 && window.history.state?.back) {
    router.back();
  } else {
    router.push("/messages");
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pt-24 pb-16 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Back Navigation -->
      <div class="mb-4 flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center gap-1.5 text-slate-600 hover:text-[#2E7D32] font-semibold text-sm transition-colors py-1 px-3 rounded-lg hover:bg-slate-100"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại
        </button>

        <button
          @click="copyLink"
          class="flex items-center gap-1.5 text-slate-600 hover:text-[#2E7D32] font-semibold text-sm transition-colors py-1 px-3 rounded-lg hover:bg-slate-100"
        >
          <span class="material-symbols-outlined text-[18px]">share</span>
          Chia sẻ hồ sơ
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <span class="animate-spin border-4 border-[#2E7D32]/30 border-t-[#2E7D32] rounded-full w-10 h-10 inline-block mb-3"></span>
        <p class="text-slate-500 font-medium text-sm">Đang tải hồ sơ đối tác...</p>
      </div>

      <!-- Not found -->
      <div v-else-if="!partner" class="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <span class="material-symbols-outlined text-5xl text-slate-300 mb-2">person_off</span>
        <h3 class="text-lg font-bold text-slate-700">Không tìm thấy thông tin đối tác</h3>
        <p class="text-sm text-slate-400 mt-1">Người dùng này có thể không tồn tại hoặc đã ngừng hoạt động.</p>
        <button
          @click="router.push('/messages')"
          class="mt-4 px-5 py-2.5 bg-[#2E7D32] text-white rounded-xl font-bold text-sm hover:bg-[#1B5E20] transition-colors"
        >
          Quay lại tin nhắn
        </button>
      </div>

      <div v-else class="space-y-6 animate-in fade-in duration-300">
        <!-- ════════ HERO PROFILE HEADER ════════ -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <!-- Cover Banner -->
          <div class="h-36 sm:h-48 bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 relative">
            <div class="absolute inset-0 bg-black/10"></div>
          </div>

          <!-- Profile Info Bar -->
          <div class="px-6 sm:px-8 pb-6 pt-0 relative">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              <!-- Avatar & Name -->
              <div class="flex items-end gap-4">
                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1 shadow-xl flex-shrink-0">
                  <div class="w-full h-full rounded-2xl bg-slate-200 overflow-hidden flex items-center justify-center">
                    <img
                      v-if="partner.avatar_url"
                      :src="getAvatarUrl(partner.avatar_url)"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-4xl font-extrabold text-[#2E7D32]">
                      {{ partner.full_name?.charAt(0) || "U" }}
                    </span>
                  </div>
                </div>

                <div class="mb-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h1 class="text-2xl sm:text-3xl font-black text-slate-800 truncate">
                      {{ partner.full_name }}
                    </h1>
                    <span
                      v-if="isFarmer"
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1"
                    >
                      <span class="material-symbols-outlined text-[14px]">psychiatry</span>
                      Nông Dân
                    </span>
                    <span
                      v-else-if="isBusiness"
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 flex items-center gap-1"
                    >
                      <span class="material-symbols-outlined text-[14px]">apartment</span>
                      Doanh Nghiệp
                    </span>
                  </div>

                  <p
                    v-if="isFarmer && partner.nongDan?.ten_co_so_kd"
                    class="text-sm font-semibold text-[#2E7D32] mt-0.5 flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">store</span>
                    {{ partner.nongDan.ten_co_so_kd }}
                  </p>
                  <p
                    v-else-if="isBusiness && partner.doanhNghiep?.ten_cong_ty"
                    class="text-sm font-semibold text-blue-700 mt-0.5 flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">business</span>
                    {{ partner.doanhNghiep.ten_cong_ty }}
                  </p>
                </div>
              </div>

              <!-- Quick Action Button -->
              <div class="flex items-center gap-2.5 flex-wrap">
                <button
                  @click="startChat"
                  class="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-[18px]">chat</span>
                  Nhắn tin ngay
                </button>
              </div>
            </div>

            <!-- Highlights Metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div class="p-3 bg-slate-50 rounded-2xl text-center">
                <div class="text-[11px] font-bold uppercase text-slate-400">Đánh giá</div>
                <div class="text-lg font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                  <span class="material-symbols-outlined text-[18px]">star</span>
                  {{ ratingScore }}
                </div>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl text-center">
                <div class="text-[11px] font-bold uppercase text-slate-400">Giao dịch thành công</div>
                <div class="text-lg font-black text-slate-800 mt-0.5">
                  {{ totalTransactions }}
                </div>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl text-center">
                <div class="text-[11px] font-bold uppercase text-slate-400">Khu vực</div>
                <div class="text-sm font-bold text-slate-800 truncate mt-1">
                  {{ partner.nongDan?.tinh_thanh || partner.doanhNghiep?.tinh_thanh || "Toàn quốc" }}
                </div>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl text-center">
                <div class="text-[11px] font-bold uppercase text-slate-400">Trạng thái</div>
                <div class="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Hoạt động
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════ MAIN CONTENT GRID ════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- LEFT COLUMN: Contact & Professional Info -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Contact Card -->
            <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-[#2E7D32]">contact_page</span>
                Thông tin liên hệ
              </h3>

              <div class="space-y-3 text-sm">
                <!-- Phone -->
                <div class="p-3 rounded-2xl bg-slate-50 flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400 text-[20px]">call</span>
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] text-slate-400 font-medium">Số điện thoại</div>
                    <a
                      :href="`tel:${partner.phone || partner.nongDan?.so_dien_thoai || partner.doanhNghiep?.so_dien_thoai}`"
                      class="font-bold text-slate-800 hover:text-[#2E7D32] transition-colors truncate block"
                    >
                      {{
                        partner.phone ||
                        partner.nongDan?.so_dien_thoai ||
                        partner.doanhNghiep?.so_dien_thoai ||
                        "Chưa cập nhật"
                      }}
                    </a>
                  </div>
                </div>

                <!-- Email -->
                <div class="p-3 rounded-2xl bg-slate-50 flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] text-slate-400 font-medium">Email liên hệ</div>
                    <a
                      :href="`mailto:${partner.email || partner.nongDan?.email_lien_he || partner.doanhNghiep?.email_lien_he}`"
                      class="font-bold text-slate-800 hover:text-[#2E7D32] transition-colors truncate block"
                    >
                      {{
                        partner.email ||
                        partner.nongDan?.email_lien_he ||
                        partner.doanhNghiep?.email_lien_he ||
                        "Chưa cập nhật"
                      }}
                    </a>
                  </div>
                </div>

                <!-- Address -->
                <div class="p-3 rounded-2xl bg-slate-50 flex items-start gap-3">
                  <span class="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">location_on</span>
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] text-slate-400 font-medium">Địa chỉ</div>
                    <div class="font-semibold text-slate-800 text-xs leading-relaxed">
                      <span v-if="isFarmer">
                        {{
                          [
                            partner.nongDan?.dia_chi_cu_the,
                            partner.nongDan?.huyen_xa,
                            partner.nongDan?.tinh_thanh,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Chưa cập nhật"
                        }}
                      </span>
                      <span v-else-if="isBusiness">
                        {{
                          [
                            partner.doanhNghiep?.dia_chi,
                            partner.doanhNghiep?.tinh_thanh,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Chưa cập nhật"
                        }}
                      </span>
                      <span v-else>Chưa cập nhật</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Organization / Farm Profile Card -->
            <div
              v-if="isFarmer || isBusiness"
              class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-[#2E7D32]">verified</span>
                {{ isFarmer ? "Hồ sơ nông hộ" : "Hồ sơ doanh nghiệp" }}
              </h3>

              <!-- Farmer details -->
              <div v-if="isFarmer && partner.nongDan" class="space-y-2.5 text-xs">
                <div v-if="partner.nongDan.nong_san_chinh" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Nông sản chủ lực</span>
                  <strong class="text-slate-800 text-sm font-bold">{{ partner.nongDan.nong_san_chinh }}</strong>
                </div>
                <div v-if="partner.nongDan.dien_tich_ha" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Diện tích canh tác</span>
                  <strong class="text-slate-800 text-sm font-bold">{{ partner.nongDan.dien_tich_ha }} ha</strong>
                </div>
                <div v-if="partner.nongDan.chung_nhan" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Chứng nhận tiêu chuẩn</span>
                  <strong class="text-emerald-700 text-sm font-bold">{{ partner.nongDan.chung_nhan }}</strong>
                </div>
                <div v-if="partner.nongDan.ma_so_thue" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Mã số thuế</span>
                  <strong class="text-slate-800 font-bold">{{ partner.nongDan.ma_so_thue }}</strong>
                </div>
              </div>

              <!-- Business details -->
              <div v-if="isBusiness && partner.doanhNghiep" class="space-y-2.5 text-xs">
                <div v-if="partner.doanhNghiep.nguoi_dai_dien" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Người đại diện</span>
                  <strong class="text-slate-800 text-sm font-bold">
                    {{ partner.doanhNghiep.nguoi_dai_dien }}
                    <span v-if="partner.doanhNghiep.chuc_vu" class="text-slate-500 font-normal">
                      ({{ partner.doanhNghiep.chuc_vu }})
                    </span>
                  </strong>
                </div>
                <div v-if="partner.doanhNghiep.nganh_kinh_doanh" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Ngành kinh doanh</span>
                  <strong class="text-slate-800 text-sm font-bold">{{ partner.doanhNghiep.nganh_kinh_doanh }}</strong>
                </div>
                <div v-if="partner.doanhNghiep.ma_so_thue" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Mã số thuế</span>
                  <strong class="text-slate-800 font-bold">{{ partner.doanhNghiep.ma_so_thue }}</strong>
                </div>
                <div v-if="partner.doanhNghiep.website" class="p-2.5 rounded-xl bg-slate-50">
                  <span class="text-slate-400 font-medium block">Website</span>
                  <a
                    :href="partner.doanhNghiep.website.startsWith('http') ? partner.doanhNghiep.website : `https://${partner.doanhNghiep.website}`"
                    target="_blank"
                    class="font-bold text-[#2E7D32] hover:underline flex items-center gap-1 text-xs mt-0.5"
                  >
                    {{ partner.doanhNghiep.website }}
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>

              <!-- Bio -->
              <div
                v-if="
                  (isFarmer && partner.nongDan?.mo_ta_ban_than) ||
                  (isBusiness && partner.doanhNghiep?.mo_ta)
                "
                class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 leading-relaxed"
              >
                <span class="text-slate-400 font-bold uppercase block mb-1">Giới thiệu</span>
                <p>{{ isFarmer ? partner.nongDan.mo_ta_ban_than : partner.doanhNghiep.mo_ta }}</p>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Active Selling Posts / Buying Demands -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Farmer active selling products -->
            <div
              v-if="isFarmer"
              class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-slate-800 flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#2E7D32]">potted_plant</span>
                  Nông sản đang chào bán
                  <span
                    v-if="partner.nongDan?.baiDangs"
                    class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold"
                  >
                    {{ partner.nongDan.baiDangs.length }}
                  </span>
                </h3>
              </div>

              <div
                v-if="partner.nongDan?.baiDangs && partner.nongDan.baiDangs.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div
                  v-for="post in partner.nongDan.baiDangs"
                  :key="post.baidang_id"
                  @click="router.push(`/product/${post.baidang_id}`)"
                  class="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#2E7D32]/50 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div class="flex gap-3">
                    <div class="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        v-if="getPostImage(post.images)"
                        :src="getPostImage(post.images)"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        Ảnh
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-bold text-sm text-slate-800 group-hover:text-[#2E7D32] transition-colors truncate">
                        {{ post.tieu_de || post.ten_nong_san }}
                      </h4>
                      <p class="text-xs text-slate-400 mt-1">📍 {{ post.tinh_thanh }}</p>
                      <p class="text-xs text-slate-500 mt-1 font-medium">
                        Còn: <strong class="text-slate-700">{{ post.so_luong_con_lai }} {{ post.don_vi_tinh || "kg" }}</strong>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <span class="text-sm font-extrabold text-[#2E7D32]">
                      {{ Number(post.gia_per_kg).toLocaleString("vi-VN") }} đ/{{ post.don_vi_tinh || "kg" }}
                    </span>
                    <span class="text-xs text-[#2E7D32] font-bold group-hover:underline flex items-center gap-0.5">
                      Xem chi tiết <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="p-8 text-center text-slate-400 text-sm">
                Nông dân hiện chưa có bài đăng nông sản nào đang bán.
              </div>
            </div>

            <!-- Business active buying requests -->
            <div
              v-if="isBusiness"
              class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-base font-black text-slate-800 flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#2E7D32]">receipt_long</span>
                  Nhu cầu thu mua đang mở
                  <span
                    v-if="partner.doanhNghiep?.nhuCauThuMua"
                    class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold"
                  >
                    {{ partner.doanhNghiep.nhuCauThuMua.length }}
                  </span>
                </h3>
              </div>

              <div
                v-if="partner.doanhNghiep?.nhuCauThuMua && partner.doanhNghiep.nhuCauThuMua.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div
                  v-for="demand in partner.doanhNghiep.nhuCauThuMua"
                  :key="demand.nhucau_id"
                  @click="router.push(`/nhu-cau/${demand.nhucau_id}`)"
                  class="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h4 class="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {{ demand.ten_nong_san }}
                    </h4>
                    <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[15px] text-slate-400">inventory_2</span>
                      Số lượng: <strong class="text-slate-800">{{ demand.so_luong_can }} {{ demand.don_vi }}</strong>
                    </p>
                    <p class="text-xs text-slate-400 mt-1">
                      📍 Giao tại: {{ demand.tinh_thanh_giao || "Toàn quốc" }}
                    </p>
                  </div>

                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <span class="text-xs font-bold text-[#2E7D32]">
                      {{ demand.gia_tham_khao ? `${Number(demand.gia_tham_khao).toLocaleString("vi-VN")} đ` : "Giá thương lượng" }}
                    </span>
                    <span class="text-xs text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                      Gửi báo giá <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="p-8 text-center text-slate-400 text-sm">
                Doanh nghiệp hiện chưa có nhu cầu thu mua nào đang mở.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
