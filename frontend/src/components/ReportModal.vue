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
    notify.error("Vui lòng nhập lý do sự cố");
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
      loai: "khac",
      mo_ta: `[Đơn hàng #${props.order.ma_don_hang || props.order.donhang_id}] - ${reason.value}`,
      bang_chung: mediaUrls,
    };

    await api.post("/bao-cao", payload);
    notify.success(
      "Đã gửi báo cáo sự cố thành công! Admin sẽ xem xét và liên hệ lại.",
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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up"
    >
      <!-- Header -->
      <div
        class="bg-[#FFF8E1] px-6 py-4 flex items-center justify-between border-b border-[#FFE082]"
      >
        <h3 class="text-[#FF8F00] font-black text-lg flex items-center gap-2">
          <span class="material-symbols-outlined">report_problem</span>
          Báo cáo sự cố đơn hàng
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
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Chi tiết sự cố <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="reason"
            rows="4"
            placeholder="Ví dụ: Không thể giao hàng do thời tiết xấu, nông sản bị hỏng..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#FF8F00] focus:ring-4 focus:ring-[#FF8F00]/10 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Hình ảnh/Video minh chứng</label
          >
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
              <span class="material-symbols-outlined mb-1"
                >add_photo_alternate</span
              >
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
            Đính kèm ảnh vườn bị hư hại hoặc lý do khác (Tối đa 4 file).
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"
      >
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
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined text-[18px]">send</span>
          {{ isSubmitting ? "Đang gửi..." : "Gửi báo cáo" }}
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
