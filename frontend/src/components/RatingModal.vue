<script setup lang="ts">
import { ref } from "vue";
import api from "../service/api.ts";
import { DanhGiaService } from "../service/danhGia.ts";
import { notify } from "@/utils/notifier.ts";

const props = defineProps<{
  show: boolean;
  order: any;
}>();

const emit = defineEmits(["close", "success"]);

const diemTong = ref(5);
const diemChatLuong = ref(5);
const diemDungHen = ref(5);
const diemThaiDo = ref(5);
const nhanXet = ref("");

const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const isSubmitting = ref(false);

const setRating = (
  type: "tong" | "chatLuong" | "dungHen" | "thaiDo",
  val: number,
) => {
  if (type === "tong") diemTong.value = val;
  if (type === "chatLuong") diemChatLuong.value = val;
  if (type === "dungHen") diemDungHen.value = val;
  if (type === "thaiDo") diemThaiDo.value = val;
};

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
      console.error("Lỗi upload ảnh đánh giá:", err);
    }
  }
  return urls;
};

const submitRating = async () => {
  if (!props.order) return;
  if (!nhanXet.value.trim()) {
    notify.error("Vui lòng nhập nhận xét/bình luận sản phẩm");
    return;
  }

  isSubmitting.value = true;
  try {
    let images: string[] = [];
    if (selectedFiles.value.length > 0) {
      images = await uploadMedia();
    }

    const payload = {
      donhang_id: props.order.donhang_id,
      baidang_id: props.order.baidang_id,
      nguoi_duoc_dg_id: props.order.nguoi_ban_id,
      diem_tong: diemTong.value,
      diem_chat_luong: diemChatLuong.value,
      diem_dung_hen: diemDungHen.value,
      diem_thai_do: diemThaiDo.value,
      nhan_xet: nhanXet.value,
      images,
    };

    await DanhGiaService.create(payload);
    notify.success("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
    emit("success");
    closeModal();
  } catch (error: any) {
    notify.error(
      error?.response?.data?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  nhanXet.value = "";
  diemTong.value = 5;
  diemChatLuong.value = 5;
  diemDungHen.value = 5;
  diemThaiDo.value = 5;
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
      class="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in-up"
    >
      <!-- Header -->
      <div
        class="bg-emerald-50 px-6 py-4 flex items-center justify-between border-b border-emerald-100"
      >
        <h3 class="text-emerald-800 font-black text-lg flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500">star</span>
          Đánh giá sản phẩm & Nông dân
        </h3>
        <button
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <!-- Thông tin sản phẩm -->
        <div
          v-if="order"
          class="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100"
        >
          <span
            class="material-symbols-outlined text-emerald-600 bg-white p-2.5 rounded-xl border border-slate-200"
            >agriculture</span
          >
          <div>
            <div class="font-bold text-slate-800 text-sm">
              {{
                order.baiDang?.tieu_de ||
                order.baiDang?.ten_nong_san ||
                "Đơn hàng nông sản"
              }}
            </div>
            <div class="text-xs text-slate-500">
              Mã đơn: #{{ order.ma_don_hang || order.donhang_id }}
            </div>
          </div>
        </div>

        <!-- Đánh giá Tổng thể -->
        <div
          class="text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-100/80"
        >
          <div class="text-sm font-bold text-slate-700 mb-2">
            Đánh giá chung sản phẩm
          </div>
          <div class="flex justify-center items-center gap-2">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="setRating('tong', star)"
              class="text-3xl transition-transform hover:scale-125 focus:outline-none"
              :class="star <= diemTong ? 'text-amber-400' : 'text-slate-200'"
            >
              ★
            </button>
          </div>
          <div class="text-xs font-bold text-amber-600 mt-1">
            {{
              diemTong === 5
                ? "Rất tuyệt vời (5/5)"
                : diemTong === 4
                  ? "Hài lòng (4/5)"
                  : diemTong === 3
                    ? "Bình thường (3/5)"
                    : diemTong === 2
                      ? "Không hài lòng (2/5)"
                      : "Rất kém (1/5)"
            }}
          </div>
        </div>

        <!-- Tiêu chí chi tiết -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Chất lượng -->
          <div
            class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"
          >
            <div class="text-xs font-bold text-slate-600 mb-1">
              Chất lượng trái
            </div>
            <div class="flex justify-center gap-0.5">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="setRating('chatLuong', s)"
                class="text-lg"
                :class="
                  s <= diemChatLuong ? 'text-amber-400' : 'text-slate-200'
                "
              >
                ★
              </button>
            </div>
          </div>
          <!-- Đúng hẹn -->
          <div
            class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"
          >
            <div class="text-xs font-bold text-slate-600 mb-1">
              Giao đúng hẹn
            </div>
            <div class="flex justify-center gap-0.5">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="setRating('dungHen', s)"
                class="text-lg"
                :class="s <= diemDungHen ? 'text-amber-400' : 'text-slate-200'"
              >
                ★
              </button>
            </div>
          </div>
          <!-- Thái độ -->
          <div
            class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"
          >
            <div class="text-xs font-bold text-slate-600 mb-1">
              Thái độ phục vụ
            </div>
            <div class="flex justify-center gap-0.5">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="setRating('thaiDo', s)"
                class="text-lg"
                :class="s <= diemThaiDo ? 'text-amber-400' : 'text-slate-200'"
              >
                ★
              </button>
            </div>
          </div>
        </div>

        <!-- Nhận xét chi tiết -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5">
            Bình luận & Nhận xét sản phẩm <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="nhanXet"
            rows="3"
            placeholder="Chia sẻ cảm nhận thực tế về chất lượng trái cây, bao bì đóng gói, nông dân hợp tác..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm"
          ></textarea>
        </div>

        <!-- Upload ảnh đính kèm -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Hình ảnh thực tế (không bắt buộc)</label
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
              class="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <span class="material-symbols-outlined mb-1"
                >add_photo_alternate</span
              >
              <span class="text-[10px] font-bold">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">
            Đánh giá kèm ảnh thực tế giúp các Doanh nghiệp khác và Nông dân tin
            tưởng hơn.
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
          Trở lại
        </button>
        <button
          @click="submitRating"
          :disabled="isSubmitting"
          class="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span
            v-if="isSubmitting"
            class="material-symbols-outlined animate-spin text-[18px]"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined text-[18px]">send</span>
          {{ isSubmitting ? "Đang gửi..." : "Gửi đánh giá" }}
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
