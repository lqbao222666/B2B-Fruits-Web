<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/service/api";
import { notify } from "@/utils/notifier";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const item = ref<any>(null);

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const isNongDan = computed(() => user?.role?.toLowerCase() === "nong_dan");

// Form phản hồi
const isSubmitting = ref(false);
const showReplyForm = ref(false);
const formItems = ref<any[]>([]);
const formGhiChu = ref("");

const fetchDetail = async () => {
  const id = Number(route.params.id);
  if (!id) return;
  loading.value = true;
  try {
    const res = await api.get(`/thuong-luong/${id}`);
    item.value = res.data;
    // Map initial chiTiets to form items
    formItems.value = (res.data.chiTiets || []).map((ct: any) => ({
      phanloai_id: ct.phanloai_id,
      ten_phan_loai: ct.phanLoai?.ten_phan_loai,
      so_luong_mua: Number(ct.so_luong_mua),
      gia_de_xuat: Number(ct.gia_de_xuat)
    }));
  } catch (e) {
    notify.error("Không tải được chi tiết thương lượng");
    router.push("/quan-ly-thuong-luong");
  } finally {
    loading.value = false;
  }
};

const historyList = computed(() => {
  if (!item.value || !item.value.lich_su_thuong_luong) return [];
  return item.value.lich_su_thuong_luong.slice().reverse();
});

const canReply = computed(() => {
  if (!item.value) return false;
  if (["da_thong_nhat", "tu_choi", "da_huy"].includes(item.value.trang_thai))
    return false;
  
  if (isNongDan.value && item.value.trang_thai === "cho_nong_dan") return true;
  if (!isNongDan.value && item.value.trang_thai === "cho_doanh_nghiep") return true;
  return false;
});

const isClosed = computed(() => {
  if (!item.value) return false;
  return ["da_thong_nhat", "tu_choi", "da_huy"].includes(item.value.trang_thai);
});

const formatPrice = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (d: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(d));
};

const handlePhanHoi = async (trangThai: string, isForm = false) => {
  let payload: any = {
    trang_thai: trangThai,
    sender_role: isNongDan.value ? 'nong_dan' : 'doanh_nghiep'
  };

  if (isForm) {
    payload.items = formItems.value.map(i => ({
      phanloai_id: i.phanloai_id,
      so_luong_mua: Number(i.so_luong_mua),
      gia_de_xuat: Number(i.gia_de_xuat)
    }));
    payload.ghi_chu = formGhiChu.value;
  }

  isSubmitting.value = true;
  try {
    await api.patch(`/thuong-luong/${item.value.thuongluong_id}/phan-hoi`, payload);
    notify.success("Đã gửi phản hồi thành công");
    showReplyForm.value = false;
    formGhiChu.value = "";
    await fetchDetail();
  } catch (e: any) {
    notify.error(e.response?.data?.message || "Lỗi khi phản hồi");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (!user) router.push("/login");
  else fetchDetail();
});
</script>

<template>
  <main class="mx-auto max-w-[900px] w-full px-4 py-8 font-sans pb-24">
    <button @click="router.back()" class="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-sm mb-4 transition">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      Quay lại
    </button>

    <div v-if="loading" class="text-center py-12 text-slate-400 font-bold">Đang tải...</div>

    <div v-else-if="item" class="space-y-6">
      <!-- Header info -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div v-if="item.trang_thai === 'da_thong_nhat'" class="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center text-xs font-bold py-1.5 uppercase tracking-widest shadow-sm z-10">
          ĐÃ THỐNG NHẤT VÀ TỰ ĐỘNG TẠO ĐƠN HÀNG THÀNH CÔNG
        </div>
        <div v-if="item.trang_thai === 'tu_choi'" class="absolute top-0 left-0 right-0 bg-red-500 text-white text-center text-xs font-bold py-1.5 uppercase tracking-widest shadow-sm z-10">
          GIAO DỊCH ĐÃ BỊ TỪ CHỐI
        </div>

        <div class="pt-4 flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h1 class="text-2xl font-black text-slate-900 leading-tight">{{ item.baiDang?.ten_nong_san }}</h1>
            <p class="text-sm text-slate-500 mt-1 font-medium">Doanh nghiệp: <strong class="text-slate-700">{{ item.doanhNghiep?.user?.full_name }}</strong> đang thương lượng</p>
          </div>
          <RouterLink :to="`/product/${item.baidang_id}`" class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-sm font-bold transition flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">visibility</span> Xem Bài Đăng
          </RouterLink>
        </div>

        <!-- Mức giá hiện tại -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Tổng sản phẩm</span>
            <span class="font-black text-2xl text-slate-700">{{ item.chiTiets?.length || 0 }} loại</span>
          </div>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Tổng số lượng</span>
            <span class="font-black text-2xl text-slate-700">{{ item.chiTiets?.reduce((acc: number, ct: any) => acc + Number(ct.so_luong_mua), 0) }} {{ item.don_vi }}</span>
          </div>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center col-span-2">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Địa chỉ nhận hàng (DN)</span>
            <span class="font-bold text-sm text-slate-700">{{ item.dia_chi_giao }}, {{ item.tinh_thanh_giao }}</span>
          </div>
        </div>

        <!-- Link tới Đơn Hàng nếu đã thống nhất -->
        <div v-if="item.trang_thai === 'da_thong_nhat'" class="mt-6 flex justify-end">
          <RouterLink to="/orders" class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-amber-200 flex items-center gap-2 animate-bounce">
            <span class="material-symbols-outlined">receipt_long</span>
            Vào Trang Đơn Hàng Để Thanh Toán Cọc
          </RouterLink>
        </div>
      </div>

      <!-- Khung chat / Lịch sử -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[500px]">
        <h3 class="font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 uppercase tracking-wide text-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[#2E7D32]">history</span>
          Lịch sử thương lượng
        </h3>

        <div class="flex-1 overflow-y-auto space-y-4 pr-2 flex flex-col-reverse">
          <div v-for="(h, idx) in historyList" :key="idx" class="flex flex-col max-w-[85%]" :class="h.sender === user?.role?.toLowerCase() ? 'self-end items-end' : 'self-start items-start'">
            <div class="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
              {{ h.sender === 'he_thong' ? 'Hệ thống' : (h.sender === 'nong_dan' ? 'Nông dân' : 'Doanh nghiệp') }}
              <span class="font-normal">{{ formatDate(h.created_at) }}</span>
            </div>
            
            <div class="p-3 rounded-2xl text-sm border shadow-sm" :class="[
              h.sender === user?.role?.toLowerCase() ? 'bg-emerald-50 border-emerald-200 rounded-tr-none text-emerald-900' : 'bg-slate-50 border-slate-200 rounded-tl-none text-slate-800',
              h.trang_thai === 'da_thong_nhat' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : '',
              h.trang_thai === 'tu_choi' ? 'bg-red-50 border-red-300' : ''
            ]">
              <div v-if="h.trang_thai === 'da_thong_nhat'" class="font-black text-amber-700 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-sm">handshake</span> ĐÃ ĐỒNG Ý CHỐT KÈO!</div>
              <div v-if="h.trang_thai === 'tu_choi'" class="font-black text-red-700 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-sm">cancel</span> ĐÃ TỪ CHỐI THƯƠNG LƯỢNG</div>
              
              <div class="font-bold flex flex-col gap-1">
                <div v-for="ct in h.items" :key="ct.phanloai_id" class="flex gap-4 border-b border-slate-100 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                  <span class="text-sm">SL: <span class="text-[#2E7D32]">{{ ct.so_luong_mua }} {{ item.don_vi }}</span></span>
                  <span class="text-sm">Giá: <span class="text-[#d00000]">{{ formatPrice(ct.gia_de_xuat) }}</span></span>
                </div>
              </div>
              <div v-if="h.ghi_chu" class="mt-2 pt-2 border-t" :class="h.sender === user?.role?.toLowerCase() ? 'border-emerald-200' : 'border-slate-200'">
                <p class="italic">"{{ h.ghi_chu }}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action / Form phản hồi -->
        <div v-if="!isClosed" class="mt-4 border-t border-slate-100 pt-4">
          <div v-if="canReply && !showReplyForm" class="flex items-center gap-3">
            <button @click="showReplyForm = true" class="flex-1 py-3 bg-white border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-emerald-50 font-bold rounded-xl transition">
              Đề Xuất Giá Khác
            </button>
            <button @click="handlePhanHoi('da_thong_nhat')" class="flex-1 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-1">
              <span class="material-symbols-outlined">check_circle</span> Đồng Ý Chốt
            </button>
            <button @click="handlePhanHoi('tu_choi')" class="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition">
              Từ Chối
            </button>
          </div>
          <div v-else-if="!canReply" class="text-center text-sm font-bold text-slate-500 bg-slate-50 py-3 rounded-xl border border-slate-200">
            Đang chờ phản hồi từ đối tác...
          </div>
          
          <!-- Form trả giá -->
          <div v-if="showReplyForm" class="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn overflow-y-auto max-h-[300px]">
            <h4 class="font-bold text-sm mb-3">Gửi mức giá đề xuất mới</h4>
            
            <div v-for="(fItem, idx) in formItems" :key="idx" class="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2 shadow-sm">
              <div class="text-xs font-bold text-slate-800">Loại: {{ fItem.ten_phan_loai || 'Mặc định' }}</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1">Mức giá (VNĐ)</label>
                  <input v-model="fItem.gia_de_xuat" type="number" class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1">Số lượng mua ({{ item.don_vi }})</label>
                  <input v-model="fItem.so_luong_mua" type="number" class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]" />
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-xs font-bold text-slate-600 mb-1">Lời nhắn</label>
              <input v-model="formGhiChu" type="text" placeholder="Nhập lời nhắn..." class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]" />
            </div>
            
            <div class="flex gap-2">
              <button @click="showReplyForm = false" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold">Hủy</button>
              <button @click="handlePhanHoi(isNongDan ? 'cho_doanh_nghiep' : 'cho_nong_dan', true)" :disabled="isSubmitting" class="flex-1 bg-[#2E7D32] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">sync</span>
                Gửi Phản Hồi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
.font-sans { font-family: "Inter", sans-serif; }
.animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
