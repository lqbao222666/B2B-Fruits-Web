<script setup lang="ts">
import { ref, watch, computed } from "vue";
import TinNhanService from "@/service/tinnhan.ts";
import { useRouter, useRoute } from "vue-router";

const props = defineProps<{
  show: boolean;
  userId?: number | null;
  userData?: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "startChat", partnerId: number): void;
}>();

const router = useRouter();
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    emit("close");
  },
);

const isLoading = ref(false);
const isFetchingExtended = ref(false);
const fetchError = ref(false);
const userDetail = ref<any>(null);

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

const initAndFetch = async () => {
  const targetId = props.userId || props.userData?.user_id;
  fetchError.value = false;

  if (props.userData) {
    userDetail.value = { ...props.userData };
    isLoading.value = false;
  } else {
    userDetail.value = null;
    isLoading.value = true;
  }

  if (targetId) {
    isFetchingExtended.value = true;
    try {
      const data = await TinNhanService.getUserDetail(targetId);
      if (data) {
        userDetail.value = {
          ...userDetail.value,
          ...data,
        };
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết người dùng:", error);
      if (!userDetail.value) {
        fetchError.value = true;
      }
    } finally {
      isLoading.value = false;
      isFetchingExtended.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

watch(
  () => [props.show, props.userId, props.userData],
  ([newShow]) => {
    if (newShow) {
      initAndFetch();
    }
  },
  { immediate: true, deep: true },
);

const isFarmer = computed(() => {
  const role = userDetail.value?.vaiTro?.ten_vai_tro || userDetail.value?.role_name;
  return role === "nong_dan" || !!userDetail.value?.nongDan;
});

const isBusiness = computed(() => {
  const role = userDetail.value?.vaiTro?.ten_vai_tro || userDetail.value?.role_name;
  return role === "doanh_nghiep" || !!userDetail.value?.doanhNghiep;
});

const effectiveUserId = computed(() => {
  return props.userId || userDetail.value?.user_id || props.userData?.user_id;
});

const ratingScore = computed(() => {
  if (isFarmer.value && userDetail.value?.nongDan?.diem_trung_binh) {
    return Number(userDetail.value.nongDan.diem_trung_binh).toFixed(1);
  }
  if (isBusiness.value && userDetail.value?.doanhNghiep?.diem_trung_binh) {
    return Number(userDetail.value.doanhNghiep.diem_trung_binh).toFixed(1);
  }
  return "5.0";
});

const totalTransactions = computed(() => {
  if (isFarmer.value) {
    return userDetail.value?.nongDan?.tong_giao_dich || 0;
  }
  if (isBusiness.value) {
    return userDetail.value?.doanhNghiep?.tong_giao_dich || 0;
  }
  return 0;
});

const handleStartChat = () => {
  if (effectiveUserId.value) {
    emit("startChat", effectiveUserId.value);
    emit("close");
  }
};

const goToProfilePage = () => {
  if (effectiveUserId.value) {
    emit("close");
    router.push(`/partner/${effectiveUserId.value}`);
  }
};

const goToProduct = (id: number) => {
  emit("close");
  router.push(`/product/${id}`);
};

const goToNhuCau = (id: number) => {
  emit("close");
  router.push(`/nhu-cau/${id}`);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Modal Header -->
      <div
        class="relative px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex-shrink-0"
      >
        <div class="absolute top-4 right-4 flex items-center gap-2">
          <button
            v-if="effectiveUserId"
            @click="goToProfilePage"
            class="text-xs font-bold text-white/90 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            title="Mở trang hồ sơ riêng"
          >
            <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            <span class="hidden sm:inline">Mở trang hồ sơ</span>
          </button>
          <button
            @click="emit('close')"
            class="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <div
            class="w-16 h-16 rounded-full bg-white/20 border-2 border-white/80 overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center"
          >
            <img
              v-if="userDetail?.avatar_url"
              :src="getAvatarUrl(userDetail.avatar_url)"
              class="w-full h-full object-cover"
            />
            <span
              v-else
              class="text-2xl font-bold text-white uppercase"
            >
              {{ userDetail?.full_name?.charAt(0) || "U" }}
            </span>
          </div>

          <!-- Basic Info -->
          <div class="min-w-0 flex-1 pr-24 sm:pr-28">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-xl font-black text-white truncate">
                {{ userDetail?.full_name || (isLoading ? "Đang tải..." : "Đối tác") }}
              </h2>
              <span
                v-if="isFarmer"
                class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm"
              >
                <span class="material-symbols-outlined text-[14px]">psychiatry</span>
                Nông Dân
              </span>
              <span
                v-else-if="isBusiness"
                class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-300 text-blue-950 flex items-center gap-1 shadow-sm"
              >
                <span class="material-symbols-outlined text-[14px]">apartment</span>
                Doanh Nghiệp
              </span>
              <span
                v-else
                class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800"
              >
                Thành viên
              </span>
            </div>

            <!-- Business name or Facility name -->
            <p
              v-if="isFarmer && (userDetail?.nongDan?.ten_co_so_kd || userDetail?.ten_co_so)"
              class="text-xs text-white/90 font-medium mt-0.5 flex items-center gap-1 truncate"
            >
              <span class="material-symbols-outlined text-[14px]">store</span>
              {{ userDetail.nongDan?.ten_co_so_kd || userDetail.ten_co_so }}
            </p>
            <p
              v-else-if="isBusiness && (userDetail?.doanhNghiep?.ten_cong_ty || userDetail?.ten_co_so)"
              class="text-xs text-white/90 font-medium mt-0.5 flex items-center gap-1 truncate"
            >
              <span class="material-symbols-outlined text-[14px]">business</span>
              {{ userDetail.doanhNghiep?.ten_cong_ty || userDetail.ten_co_so }}
            </p>

            <!-- Stars & Transactions -->
            <div class="flex items-center gap-3 mt-2 text-xs text-white/90 font-medium">
              <div class="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                <span class="material-symbols-outlined text-amber-300 text-[14px]">star</span>
                <span class="font-bold text-white">{{ ratingScore }}</span>
              </div>
              <div class="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                <span class="material-symbols-outlined text-emerald-200 text-[14px]">swap_horiz</span>
                <span>{{ totalTransactions }} giao dịch</span>
              </div>
              <div v-if="isFetchingExtended" class="flex items-center gap-1 text-[11px] text-white/80">
                <span class="animate-spin border border-white border-t-transparent rounded-full w-3 h-3"></span>
                Đang cập nhật...
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        <!-- Error State -->
        <div v-if="fetchError && !userDetail" class="p-8 text-center bg-white rounded-2xl border border-slate-100">
          <span class="material-symbols-outlined text-4xl text-rose-400 mb-2">error</span>
          <p class="text-sm font-bold text-slate-700">Không thể tải chi tiết đối tác</p>
          <button
            @click="initAndFetch"
            class="mt-3 px-4 py-2 bg-[#2E7D32] text-white text-xs font-bold rounded-xl hover:bg-[#1B5E20]"
          >
            Thử lại
          </button>
        </div>

        <!-- Loading Skeleton -->
        <div v-else-if="isLoading && !userDetail" class="flex flex-col items-center justify-center py-12 gap-3">
          <span
            class="animate-spin border-4 border-[#2E7D32]/30 border-t-[#2E7D32] rounded-full w-9 h-9"
          ></span>
          <p class="text-sm text-slate-500 font-medium">Đang tải hồ sơ chi tiết...</p>
        </div>

        <template v-else-if="userDetail">
          <!-- Contact Info Section -->
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">contact_page</span>
              Thông tin liên hệ
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <!-- Phone -->
              <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] text-slate-400 font-medium">Số điện thoại</div>
                  <div class="font-bold text-slate-800 truncate">
                    {{
                      userDetail.phone ||
                      userDetail.nongDan?.so_dien_thoai ||
                      userDetail.doanhNghiep?.so_dien_thoai ||
                      "Chưa cập nhật"
                    }}
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] text-slate-400 font-medium">Email liên hệ</div>
                  <div class="font-bold text-slate-800 truncate">
                    {{
                      userDetail.email ||
                      userDetail.nongDan?.email_lien_he ||
                      userDetail.doanhNghiep?.email_lien_he ||
                      "Chưa cập nhật"
                    }}
                  </div>
                </div>
              </div>

              <!-- Location / Address -->
              <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 sm:col-span-2">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] text-slate-400 font-medium">Khu vực / Tỉnh thành</div>
                  <div class="font-semibold text-slate-800">
                    <span v-if="isFarmer">
                      {{
                        [
                          userDetail.nongDan?.dia_chi_cu_the,
                          userDetail.nongDan?.huyen_xa,
                          userDetail.nongDan?.tinh_thanh || userDetail.tinh_thanh,
                        ]
                          .filter(Boolean)
                          .join(", ") || userDetail.tinh_thanh || "Chưa cập nhật địa chỉ"
                      }}
                    </span>
                    <span v-else-if="isBusiness">
                      {{
                        [
                          userDetail.doanhNghiep?.dia_chi,
                          userDetail.doanhNghiep?.tinh_thanh || userDetail.tinh_thanh,
                        ]
                          .filter(Boolean)
                          .join(", ") || userDetail.tinh_thanh || "Chưa cập nhật địa chỉ"
                      }}
                    </span>
                    <span v-else>{{ userDetail.tinh_thanh || "Chưa cập nhật" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Specific Business / Farm Details -->
          <div
            v-if="isFarmer || isBusiness"
            class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
          >
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              {{ isFarmer ? "Thông tin nông hộ & canh tác" : "Thông tin doanh nghiệp" }}
            </h3>

            <!-- Farmer fields -->
            <div v-if="isFarmer" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div v-if="userDetail.nongDan?.nong_san_chinh" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Nông sản chủ lực</div>
                <div class="font-bold text-slate-800">{{ userDetail.nongDan.nong_san_chinh }}</div>
              </div>
              <div v-if="userDetail.nongDan?.dien_tich_ha" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Diện tích canh tác</div>
                <div class="font-bold text-slate-800">{{ userDetail.nongDan.dien_tich_ha }} ha</div>
              </div>
              <div v-if="userDetail.nongDan?.chung_nhan" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Chứng nhận tiêu chuẩn</div>
                <div class="font-bold text-emerald-700">{{ userDetail.nongDan.chung_nhan }}</div>
              </div>
              <div v-if="userDetail.nongDan?.ma_so_thue" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Mã số thuế</div>
                <div class="font-bold text-slate-800">{{ userDetail.nongDan.ma_so_thue }}</div>
              </div>
              <div v-if="userDetail.nongDan?.doi_tuong_dang_ky" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Đối tượng đăng ký</div>
                <div class="font-bold text-slate-800">{{ userDetail.nongDan.doi_tuong_dang_ky }}</div>
              </div>
            </div>

            <!-- Business fields -->
            <div v-if="isBusiness" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div v-if="userDetail.doanhNghiep?.nguoi_dai_dien" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Người đại diện</div>
                <div class="font-bold text-slate-800">
                  {{ userDetail.doanhNghiep.nguoi_dai_dien }}
                  <span v-if="userDetail.doanhNghiep.chuc_vu" class="text-xs text-slate-500 font-normal">
                    ({{ userDetail.doanhNghiep.chuc_vu }})
                  </span>
                </div>
              </div>
              <div v-if="userDetail.doanhNghiep?.nganh_kinh_doanh" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Ngành kinh doanh</div>
                <div class="font-bold text-slate-800">{{ userDetail.doanhNghiep.nganh_kinh_doanh }}</div>
              </div>
              <div v-if="userDetail.doanhNghiep?.ma_so_thue" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Mã số thuế</div>
                <div class="font-bold text-slate-800">{{ userDetail.doanhNghiep.ma_so_thue }}</div>
              </div>
              <div v-if="userDetail.doanhNghiep?.website" class="p-2 rounded-xl bg-slate-50">
                <div class="text-[11px] text-slate-400 font-medium">Website</div>
                <a
                  :href="userDetail.doanhNghiep.website.startsWith('http') ? userDetail.doanhNghiep.website : `https://${userDetail.doanhNghiep.website}`"
                  target="_blank"
                  class="font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
                >
                  {{ userDetail.doanhNghiep.website }}
                  <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>

            <!-- Description / Bio -->
            <div
              v-if="
                (isFarmer && userDetail.nongDan?.mo_ta_ban_than) ||
                (isBusiness && userDetail.doanhNghiep?.mo_ta)
              "
              class="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-sm text-slate-600 leading-relaxed"
            >
              <div class="text-[11px] text-slate-400 font-bold uppercase mb-1">Mô tả / Giới thiệu</div>
              <p>{{ isFarmer ? userDetail.nongDan.mo_ta_ban_than : userDetail.doanhNghiep.mo_ta }}</p>
            </div>
          </div>

          <!-- Active Posts for Farmer -->
          <div
            v-if="isFarmer && userDetail.nongDan?.baiDangs && userDetail.nongDan.baiDangs.length > 0"
            class="space-y-3"
          >
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-emerald-600">potted_plant</span>
                Nông sản đang chào bán ({{ userDetail.nongDan.baiDangs.length }})
              </span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="post in userDetail.nongDan.baiDangs"
                :key="post.baidang_id"
                @click="goToProduct(post.baidang_id)"
                class="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#2E7D32]/40 hover:shadow-md cursor-pointer transition-all flex gap-3 group"
              >
                <div class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                  <img
                    v-if="getPostImage(post.images)"
                    :src="getPostImage(post.images)"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-slate-400 text-xs"
                  >
                    Ảnh
                  </div>
                </div>
                <div class="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-sm text-slate-800 truncate group-hover:text-[#2E7D32] transition-colors">
                      {{ post.tieu_de || post.ten_nong_san }}
                    </h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      📍 {{ post.tinh_thanh }}
                    </p>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-sm font-extrabold text-[#2E7D32]">
                      {{ Number(post.gia_per_kg).toLocaleString("vi-VN") }} đ/{{ post.don_vi_tinh || "kg" }}
                    </span>
                    <span class="text-[11px] text-slate-500 font-medium">
                      Còn {{ post.so_luong_con_lai }} {{ post.don_vi_tinh || "kg" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Demands for Business -->
          <div
            v-if="isBusiness && userDetail.doanhNghiep?.nhuCauThuMua && userDetail.doanhNghiep.nhuCauThuMua.length > 0"
            class="space-y-3"
          >
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-emerald-600">receipt_long</span>
                Nhu cầu thu mua đang mở ({{ userDetail.doanhNghiep.nhuCauThuMua.length }})
              </span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="demand in userDetail.doanhNghiep.nhuCauThuMua"
                :key="demand.nhucau_id"
                @click="goToNhuCau(demand.nhucau_id)"
                class="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#2E7D32]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <h4 class="font-bold text-sm text-slate-800 group-hover:text-[#2E7D32] transition-colors truncate">
                    {{ demand.ten_nong_san }}
                  </h4>
                  <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px] text-slate-400">inventory_2</span>
                    Cần mua: <strong class="text-slate-700">{{ demand.so_luong_can }} {{ demand.don_vi }}</strong>
                  </p>
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <span class="text-xs font-bold text-[#2E7D32]">
                    {{ demand.gia_tham_khao ? `${Number(demand.gia_tham_khao).toLocaleString("vi-VN")} đ` : "Giá thương lượng" }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    📍 {{ demand.tinh_thanh_giao || "Toàn quốc" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Footer Actions -->
      <div class="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
        <button
          v-if="effectiveUserId"
          @click="goToProfilePage"
          class="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#2E7D32] hover:bg-[#f0f8e6] text-slate-700 hover:text-[#2E7D32] text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">account_box</span>
          Xem trang hồ sơ
        </button>
        <div v-else></div>

        <div class="flex items-center gap-2">
          <button
            @click="emit('close')"
            class="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Đóng
          </button>
          <button
            @click="handleStartChat"
            class="px-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">chat</span>
            Nhắn tin ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
