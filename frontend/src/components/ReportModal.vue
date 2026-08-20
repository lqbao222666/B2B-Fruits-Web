<script setup lang="ts">
import { ref } from "vue";
import api from "../service/api.ts";
import { notify } from "@/utils/notifier.ts";

const props = defineProps<{
  show: boolean;
  order: any;
  userId: number;
}>();

const emit = defineEmits(["close", "success"]);

const selectedLoai = ref<"thieu_so_luong" | "chat_luong_khong_dat">("thieu_so_luong");
const selectedDeXuat = ref<"gia_han" | "huy_hoan_tien">("gia_han");
const ngayGiaoDeXuat = ref<string>(
  new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
);

const reason = ref("");
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const isSubmitting = ref(false);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    selectedFiles.value.push(...files);

    files.forEach((file) => {
      previewUrls.value.push(URL.createObjectURL(file));
    });
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(previewUrls.value[index]);
  previewUrls.value.splice(index, 1);
};

const uploadMedia = async () => {
  const urls: string[] = [];
  for (const file of selectedFiles.value) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/bai-dang/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.url) {
        urls.push(res.data.url);
      }
    } catch (err) {
      console.error("Lỗi upload media:", err);
    }
  }
  return urls;
};

const submitReport = async () => {
  if (!reason.value.trim()) {
    notify.error("Vui lòng nhập mô tả nguyên nhân sự cố");
    return;
  }

  if (selectedDeXuat.value === "gia_han" && !ngayGiaoDeXuat.value) {
    notify.error("Vui lòng chọn ngày giao hàng đề xuất mới");
    return;
  }

  isSubmitting.value = true;
  try {
    let mediaUrls: string[] = [];
    if (selectedFiles.value.length > 0) {
      mediaUrls = await uploadMedia();
    }

    const payload = {
      nguoi_baocao_id: props.userId,
      nguoi_bi_bc_id: props.order.nguoi_mua_id,
      baidang_id: props.order.baidang_id,
      donhang_id: props.order.donhang_id,
      loai: selectedLoai.value,
      de_xuat: selectedDeXuat.value,
      ngay_giao_de_xuat: selectedDeXuat.value === "gia_han" ? ngayGiaoDeXuat.value : null,
      mo_ta: `[Đơn hàng #${props.order.ma_don_hang || props.order.donhang_id}] - ${reason.value}`,
      bang_chung: mediaUrls,
    };

    await api.post("/bao-cao", payload);
    notify.success(
      "Đã gửi báo cáo sự cố thành công! Hệ thống đã thông báo đến Doanh nghiệp và Admin sẽ xem xét."
    );
    emit("success");
    closeModal();
  } catch (error) {
    notify.error("Lỗi khi gửi báo cáo sự cố. Vui lòng thử lại.");
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  reason.value = "";
  selectedFiles.value = [];
  previewUrls.value = [];
  emit("close");
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto bg-slate-900/50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up max-h-[82vh] overflow-y-auto my-auto"
    >
      <!-- Header -->
      <div
        class="bg-[#FFF8E1] px-6 py-4 flex items-center justify-between border-b border-[#FFE082]"
      >
        <h3 class="text-[#FF8F00] font-black text-lg flex items-center gap-2">
          <span class="material-symbols-outlined">report_problem</span>
          Báo cáo sự cố trước giao hàng
        </h3>
        <button
          @click="closeModal"
          class="text-[#FF8F00] hover:bg-[#FFE082] rounded-full p-1 transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5">
        <!-- Mã đơn hàng -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
          Đơn hàng liên quan: <span class="font-bold text-slate-800">#{{ order?.ma_don_hang || order?.donhang_id }}</span>
        </div>

        <!-- 1. Nguyên nhân sự cố -->
        <div>
          <label class="block text-sm font-bold text-slate-800 mb-2">
            1. Nguyên nhân phát sinh sự cố <span class="text-red-500">*</span>
          </label>
          <div class="space-y-2">
            <label
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm',
                selectedLoai === 'thieu_so_luong'
                  ? 'bg-amber-50/50 border-[#FF8F00] text-amber-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              ]"
            >
              <input
                type="radio"
                value="thieu_so_luong"
                v-model="selectedLoai"
                class="accent-[#FF8F00]"
              />
              <span>Thiếu số lượng nông sản (Sản lượng vườn bị sụt giảm)</span>
            </label>

            <label
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm',
                selectedLoai === 'chat_luong_khong_dat'
                  ? 'bg-amber-50/50 border-[#FF8F00] text-amber-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              ]"
            >
              <input
                type="radio"
                value="chat_luong_khong_dat"
                v-model="selectedLoai"
                class="accent-[#FF8F00]"
              />
              <span>Chất lượng không đạt (Thời tiết, sâu bệnh, hư hỏng)</span>
            </label>
          </div>
        </div>

        <!-- 2. Đề xuất giải quyết -->
        <div>
          <label class="block text-sm font-bold text-slate-800 mb-2">
            2. Phương án đề xuất xử lý <span class="text-red-500">*</span>
          </label>
          <div class="space-y-2">
            <label
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm',
                selectedDeXuat === 'gia_han'
                  ? 'bg-emerald-50/50 border-emerald-500 text-emerald-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              ]"
            >
              <input
                type="radio"
                value="gia_han"
                v-model="selectedDeXuat"
                class="accent-emerald-600"
              />
              <span>Gia hạn thời gian (Dời ngày giao hàng để chờ thu hái đợt sau)</span>
            </label>

            <label
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm',
                selectedDeXuat === 'huy_hoan_tien'
                  ? 'bg-rose-50/50 border-rose-500 text-rose-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              ]"
            >
              <input
                type="radio"
                value="huy_hoan_tien"
                v-model="selectedDeXuat"
                class="accent-rose-600"
              />
              <span>Hủy đơn & Hoàn tiền cọc (Doanh nghiệp nhận lại cọc, hoàn số lượng về bài đăng)</span>
            </label>
          </div>
        </div>

        <!-- 3. Nếu chọn Gia hạn: Chọn ngày giao mới -->
        <div v-if="selectedDeXuat === 'gia_han'" class="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200">
          <label class="block text-xs font-bold text-slate-700 mb-1">
            Ngày giao hàng mới đề xuất <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="ngayGiaoDeXuat"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:border-emerald-500 outline-none"
          />
        </div>

        <!-- 4. Mô tả chi tiết -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5">
            Chi tiết nguyên nhân & giải thích <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="reason"
            rows="3"
            placeholder="Mô tả chi tiết tình hình vườn nông sản thực tế..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#FF8F00] focus:ring-4 focus:ring-[#FF8F00]/10 outline-none transition-all resize-none text-sm"
          ></textarea>
        </div>

        <!-- 5. Ảnh/Video minh chứng -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5">
            Hình ảnh/Video bằng chứng thực tế tại vườn
          </label>
          <div class="grid grid-cols-4 gap-3">
            <div
              v-for="(url, index) in previewUrls"
              :key="index"
              class="aspect-square rounded-xl overflow-hidden relative border border-slate-200 group"
            >
              <img :src="url" class="w-full h-full object-cover" />
              <button
                @click="removeFile(index)"
                class="absolute top-1 right-1 bg-white/80 hover:bg-white text-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <span class="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>

            <label
              v-if="previewUrls.length < 4"
              class="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#FF8F00] hover:bg-[#FF8F00]/5 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-[#FF8F00] transition-colors"
            >
              <span class="material-symbols-outlined mb-1">add_photo_alternate</span>
              <span class="text-[10px] font-bold">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
          <p class="text-[11px] text-slate-500 mt-2">
            Ảnh chụp thực tế số lượng / chất lượng nông sản tại vườn (Tối đa 4 file).
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button
          @click="closeModal"
          :disabled="isSubmitting"
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          @click="submitReport"
          :disabled="isSubmitting"
          class="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF8F00] hover:bg-[#FF6F00] text-white shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span
            v-if="isSubmitting"
            class="material-symbols-outlined animate-spin text-[18px]"
          >progress_activity</span>
          <span v-else class="material-symbols-outlined text-[18px]">send</span>
          {{ isSubmitting ? "Đang gửi..." : "Gửi Báo Cáo Sự Cố" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
