<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { notify } from "@/utils/notifier";
import api from "@/service/api";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const filterStatus = ref<string>("ALL");

const thuongLuongList = ref<any[]>([]);
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const userId = user?.user_id || user?.id;
const userRole = user?.role?.toLowerCase();

const isNongDan = computed(() => userRole === "nong_dan");

const fetchData = async () => {
  if (!userId) return;
  loading.value = true;
  try {
    const endpoint = isNongDan.value
      ? `/thuong-luong/nong-dan/${userId}`
      : `/thuong-luong/doanh-nghiep/${userId}`;
    const res = await api.get(endpoint);
    thuongLuongList.value = res.data || [];
  } catch (e: any) {
    notify.error("Lỗi khi tải danh sách thương lượng");
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
};

const getStatusName = (status: string) => {
  switch (status) {
    case "cho_nong_dan":
      return "Chờ nông dân phản hồi";
    case "cho_doanh_nghiep":
      return "Chờ doanh nghiệp phản hồi";
    case "da_thong_nhat":
      return "Đã thống nhất (Chốt kèo)";
    case "tu_choi":
      return "Bị từ chối";
    case "da_huy":
      return "Đã hủy";
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "da_thong_nhat":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "tu_choi":
    case "da_huy":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const filteredList = computed(() => {
  if (filterStatus.value === "ALL") return thuongLuongList.value;
  return thuongLuongList.value.filter((i) => i.trang_thai === filterStatus.value);
});

onMounted(() => {
  if (!user) {
    router.push("/login");
    return;
  }
  fetchData();
});
</script>

<template>
  <main class="mx-auto max-w-[1000px] w-full px-4 py-8 font-sans pb-24">
    <div class="flex items-center gap-3 mb-6">
      <span class="material-symbols-outlined text-[#2E7D32] text-3xl">handshake</span>
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Yêu Cầu Thương Lượng</h1>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-2 mb-6">
      <span class="text-sm font-bold text-slate-600">Trạng thái:</span>
      <select
        v-model="filterStatus"
        class="text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2E7D32]"
      >
        <option value="ALL">Tất cả</option>
        <option value="cho_nong_dan">Chờ nông dân</option>
        <option value="cho_doanh_nghiep">Chờ doanh nghiệp</option>
        <option value="da_thong_nhat">Đã thống nhất</option>
        <option value="tu_choi">Bị từ chối</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400 font-bold text-sm">
      Đang tải danh sách...
    </div>

    <div v-else-if="filteredList.length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-3xl text-slate-400">
      <span class="material-symbols-outlined text-5xl mb-2">inbox</span>
      <p class="font-bold">Không có yêu cầu thương lượng nào</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in filteredList"
        :key="item.thuongluong_id"
        class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <!-- Info -->
        <div class="space-y-2 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest"
              :class="getStatusBadgeClass(item.trang_thai)"
            >
              {{ getStatusName(item.trang_thai) }}
            </span>
            <span class="text-[11px] text-slate-400 font-bold">
              {{ formatDate(item.updated_at) }}
            </span>
          </div>

          <h3 class="font-black text-slate-800 text-lg leading-tight">
            {{ item.baiDang?.ten_nong_san }}
          </h3>
          <p class="text-xs text-slate-500 font-bold">
            <span class="text-slate-400">Đăng bởi:</span> {{ item.baiDang?.nguoiDang?.user?.full_name || 'Nông dân' }}
          </p>

          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap gap-4 mt-2 inline-flex w-full md:w-auto">
            <div class="flex flex-col">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sản phẩm mua</span>
              <span class="font-black text-slate-700">{{ item.chiTiets?.length || 0 }} loại</span>
            </div>
            <div class="flex flex-col border-l border-slate-200 pl-4">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tổng SL</span>
              <span class="font-black text-[#d00000]">{{ item.chiTiets?.reduce((sum: number, ct: any) => sum + Number(ct.so_luong_mua), 0) }} {{ item.don_vi }}</span>
            </div>
            <div class="flex flex-col border-l border-slate-200 pl-4">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Người mua (DN)</span>
              <span class="font-black text-slate-700">{{ item.doanhNghiep?.user?.full_name }}</span>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="flex md:flex-col gap-2 self-start md:self-center shrink-0 w-full md:w-auto">
          <RouterLink
            :to="`/thuong-luong/${item.thuongluong_id}`"
            class="flex-1 md:flex-none text-center bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] border border-[#2E7D32]/20 font-bold text-xs py-2.5 px-6 rounded-xl transition"
          >
            Xem Chi Tiết / Trả Giá
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
