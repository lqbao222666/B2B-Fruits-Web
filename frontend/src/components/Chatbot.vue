<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import api from "../service/api"; // Sử dụng API của NestJS
import { marked } from "marked";

// --- CÁC BIẾN TRẠNG THÁI ---
const isOpen = ref(false); // Hiển thị biểu tượng (icon) lúc đầu
const isExpanded = ref(false); // Chế độ mở rộng khung chat
const isLoading = ref(false);
const userInput = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

// --- DRAG LOGIC ---
import { onMounted, onUnmounted } from "vue";

const position = ref({ right: 20, bottom: 20 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const windowWidth = ref(1024);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  windowWidth.value = window.innerWidth;
  position.value = { right: 20, bottom: 20 };
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const startDrag = (e: MouseEvent) => {
  if (window.innerWidth < 768) return;
  // Prevent drag if clicking on an interactive element like a button
  if ((e.target as HTMLElement).closest(".action-header-btn")) return;
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX + position.value.right,
    y: e.clientY + position.value.bottom,
  };
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  let newRight = dragOffset.value.x - e.clientX;
  let newBottom = dragOffset.value.y - e.clientY;

  // Boundaries
  if (newRight < 0) newRight = 0;
  if (newBottom < 0) newBottom = 0;

  const currentW = isExpanded.value ? 620 : 420;
  const currentH = isExpanded.value ? 660 : 580;

  // Max boundaries (prevent dragging off-screen top/left)
  const maxRight = window.innerWidth - (isOpen.value ? currentW : 64);
  const maxBottom = window.innerHeight - (isOpen.value ? currentH : 64);

  if (newRight > maxRight) newRight = maxRight;
  if (newBottom > maxBottom) newBottom = maxBottom;

  position.value = { right: newRight, bottom: newBottom };
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

// --- DỮ LIỆU CHAT ---
interface Suggestion {
  type: string;
  id: number;
  ten: string;
  gia: string;
  dia_chi: string;
  lien_he: string;
}

interface Message {
  id: number;
  isUser: boolean;
  text: string;
  imageUrl?: string;
  suggestions?: Suggestion[];
  search_type?: 'bai_dang' | 'nhu_cau' | 'both';
  detected_category?: { id: number; name: string };
  detected_province?: string;
  detected_region?: string;
  detected_standard?: string;
  detected_price_range?: string;
  detected_price_min?: number;
  detected_price_max?: number;
  detected_min_quantity?: number;
  detected_rating?: number;
}

const messages = ref<Message[]>([
  {
    id: 1,
    isUser: false,
    text: "Xin chào! Trợ lý B2B có thể giúp bạn tìm kiếm nông sản và kết nối người mua/bán hôm nay?",
    imageUrl: "",
  },
]);

// --- HÀM GỌI API THẬT ---
const handleSendMessage = async () => {
  const userQuestion = userInput.value.trim();
  if (!userQuestion) return;

  // 1. Thêm tin nhắn của người dùng vào giao diện ngay lập tức
  messages.value.push({
    id: Date.now(),
    isUser: true,
    text: userQuestion,
    imageUrl: "",
  });

  // 2. Xóa ô input và bật trạng thái "loading"
  userInput.value = "";
  isLoading.value = true;

  // 3. GỌI API NESTJS THẬT
  try {
    const response = await api.post("/ai/chat/public", {
      message: userQuestion,
    });

    // Lấy dữ liệu trả về từ NestJS
    const botResponse = response.data;

    // Thêm tin nhắn của bot vào giao diện
    messages.value.push({
      id: Date.now() + 1,
      isUser: false,
      text: botResponse.reply || "Xin lỗi, tôi không thể xử lý yêu cầu này.",
      imageUrl: "",
      suggestions: botResponse.suggestions,
      search_type: botResponse.search_type,
      detected_category: botResponse.detected_category,
      detected_province: botResponse.detected_province,
      detected_region: botResponse.detected_region,
      detected_standard: botResponse.detected_standard,
      detected_price_range: botResponse.detected_price_range,
      detected_price_min: botResponse.detected_price_min,
      detected_price_max: botResponse.detected_price_max,
      detected_min_quantity: botResponse.detected_min_quantity,
      detected_rating: botResponse.detected_rating,
    });
  } catch (error) {
    // Xử lý lỗi nếu API không gọi được
    console.error("Lỗi khi gọi API chatbot:", error);
    messages.value.push({
      id: Date.now() + 1,
      isUser: false,
      text: "Xin lỗi, Trợ lý B2B đang gặp sự cố nhỏ. Vui lòng thử lại sau giây lát.",
      imageUrl: "",
    });
  } finally {
    // Luôn tắt trạng thái loading sau khi API hoàn thành (dù thành công hay thất bại)
    isLoading.value = false;
  }
};

// Hàm tự động cuộn (giữ nguyên)
watch(
  messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    });
  },
  { deep: true },
);
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]">
    <!-- Nút Tròn (Khi chatbot đóng) -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="!isOpen"
        @click="isOpen = true"
        @mousedown="startDrag"
        class="absolute size-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-xl shadow-emerald-600/30 flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 animate-soft-pulse pointer-events-auto"
        :class="windowWidth >= 768 ? 'cursor-move' : ''"
        :style="
          windowWidth >= 768
            ? { bottom: position.bottom + 'px', right: position.right + 'px' }
            : { bottom: '20px', right: '20px' }
        "
        aria-label="Mở chatbot"
      >
        <span class="material-symbols-outlined text-3xl">smart_toy</span>
      </button>
    </transition>

    <!-- Khung Chat (Khi chatbot mở) -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-5 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-5 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-emerald-100 overflow-hidden pointer-events-auto transition-all duration-300 max-w-[95vw]"
        :class="
          isExpanded
            ? 'w-[620px] h-[660px] max-h-[85vh]'
            : 'w-[420px] h-[580px] max-h-[80vh]'
        "
        :style="
          windowWidth >= 768
            ? { bottom: position.bottom + 'px', right: position.right + 'px' }
            : { bottom: '80px', right: '12px', left: '12px', width: 'auto' }
        "
      >
        <!-- Header -->
        <div
          @mousedown="startDrag"
          class="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white select-none shadow-sm"
          :class="windowWidth >= 768 ? 'cursor-move' : ''"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shrink-0"
            >
              <span class="material-symbols-outlined text-white"
                >smart_toy</span
              >
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-white text-base">Trợ lý AI B2B</h3>
                <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium text-emerald-100">AI Thông Minh</span>
              </div>
              <p class="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span
                  class="size-2 bg-emerald-300 rounded-full animate-pulse"
                ></span>
                Đang trực tuyến
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <!-- Nút Phóng to / Thu nhỏ -->
            <button
              v-if="windowWidth >= 768"
              @click="isExpanded = !isExpanded"
              class="action-header-btn p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
              :title="isExpanded ? 'Thu nhỏ cửa sổ' : 'Mở rộng cửa sổ'"
            >
              <span class="material-symbols-outlined text-[20px]">{{
                isExpanded ? 'close_fullscreen' : 'open_in_full'
              }}</span>
            </button>
            <!-- Nút Đóng -->
            <button
              @click="isOpen = false"
              class="action-header-btn p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Đóng chatbot"
              title="Đóng chatbot"
            >
              <span class="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        <!-- Vùng Hiển thị tin nhắn -->
        <div
          ref="messagesContainer"
          class="flex-1 p-4 overflow-y-auto space-y-4"
        >
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex"
            :class="message.isUser ? 'justify-end' : 'justify-start'"
          >
            <div
              class="p-3.5 rounded-2xl transition-all shadow-xs"
              :class="[
                message.isUser
                  ? 'max-w-[85%] bg-[#2E7D32] text-white rounded-br-xs'
                  : 'max-w-[95%] bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
              ]"
            >
              <!-- Tin nhắn của người dùng: Hiển thị text bình thường -->
              <p v-if="message.isUser" class="text-sm leading-relaxed whitespace-pre-wrap">
                {{ message.text }}
              </p>

              <!-- Tin nhắn của bot: Hiển thị HTML được render từ Markdown -->
              <div
                v-else
                class="bot-markdown text-sm leading-relaxed text-slate-800"
                v-html="marked(message.text)"
              ></div>

              <!-- Hiển thị ảnh nếu API trả về link -->
              <img
                v-if="message.imageUrl"
                :src="message.imageUrl"
                alt="Hình ảnh sản phẩm"
                class="mt-2 rounded-lg max-w-full"
              />

              <!-- Nút chuyển đến danh mục / bộ lọc cho cả Sản Phẩm và Nhu Cầu -->
              <div
                v-if="
                  message.search_type && (
                    message.detected_category ||
                    message.detected_province ||
                    message.detected_region ||
                    message.detected_standard ||
                    message.detected_price_range ||
                    message.detected_price_max ||
                    message.detected_min_quantity ||
                    message.detected_rating
                  )
                "
                class="mt-3 flex flex-wrap gap-2"
              >
                <!-- Nút chuyển sang Trang Nhu Cầu Thu Mua (Hiện khi có nhu cầu) -->
                <router-link
                  v-if="message.search_type === 'nhu_cau' || message.search_type === 'both'"
                  :to="`/nhu-cau?${[
                    message.detected_category
                      ? 'category=' + message.detected_category.id
                      : '',
                    message.detected_province
                      ? 'province=' + encodeURIComponent(message.detected_province)
                      : '',
                    message.detected_region
                      ? 'region=' + message.detected_region
                      : '',
                    message.detected_standard
                      ? 'standard=' + encodeURIComponent(message.detected_standard)
                      : '',
                    message.detected_min_quantity
                      ? 'minQuantity=' + message.detected_min_quantity
                      : '',
                    message.detected_price_max
                      ? 'maxPrice=' + message.detected_price_max
                      : '',
                  ]
                    .filter(Boolean)
                    .join('&')}`"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <span class="material-symbols-outlined text-[14px]">store</span>
                  🏢 Xem Nhu Cầu Thu Mua
                </router-link>

                <!-- Nút chuyển sang Trang Sản Phẩm Đăng Bán (Hiện khi có bài đăng) -->
                <router-link
                  v-if="message.search_type === 'bai_dang' || message.search_type === 'both'"
                  :to="`/products?${[
                    message.detected_category
                      ? 'category=' + message.detected_category.id
                      : '',
                    message.detected_province
                      ? 'province=' + encodeURIComponent(message.detected_province)
                      : '',
                    message.detected_region
                      ? 'region=' + message.detected_region
                      : '',
                    message.detected_standard
                      ? 'standard=' + encodeURIComponent(message.detected_standard)
                      : '',
                    message.detected_min_quantity
                      ? 'minQuantity=' + message.detected_min_quantity
                      : '',
                    message.detected_price_range
                      ? 'price=' + message.detected_price_range
                      : '',
                    message.detected_rating
                      ? 'rating=' + message.detected_rating
                      : '',
                  ]
                    .filter(Boolean)
                    .join('&')}`"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eef4e6] text-[#658a22] font-semibold text-xs rounded-lg hover:bg-[#658a22] hover:text-white transition-colors border border-[#658a22]/20"
                >
                  <span class="material-symbols-outlined text-[14px]">grass</span>
                  🌾 Xem Sản Phẩm Bán
                </router-link>
              </div>

              <!-- Gợi ý sản phẩm/nhu cầu -->
              <div
                v-if="message.suggestions && message.suggestions.length > 0"
                class="mt-3 space-y-2"
              >
                <router-link
                  v-for="item in message.suggestions"
                  :key="item.id"
                  :to="item.type === 'nhu_cau' ? `/nhu-cau/${item.id}` : `/bai-dang/${item.id}`"
                  class="block bg-white p-2.5 rounded border border-slate-200 shadow-sm text-xs text-slate-700 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-semibold text-slate-900 mb-1 leading-tight flex-1">
                      {{ item.ten }}
                    </p>
                    <span
                      class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      :class="item.type === 'nhu_cau'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#eef4e6] text-[#658a22]'"
                    >
                      {{ item.type === 'nhu_cau' ? '🏢 Nhu cầu' : '🌾 Bài đăng' }}
                    </span>
                  </div>
                  <div class="space-y-0.5">
                    <p>
                      <span class="font-medium text-slate-500">Giá:</span>
                      <span class="text-[#658a22] font-semibold">{{
                        item.gia
                      }}</span>
                    </p>
                    <p>
                      <span class="font-medium text-slate-500">Khu vực:</span>
                      {{ item.dia_chi }}
                    </p>
                  </div>
                  <p class="mt-1.5 pt-1.5 border-t border-slate-100">
                    <span class="font-medium text-slate-500">Liên hệ:</span>
                    {{ item.lien_he }}
                  </p>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Dấu "..." khi bot đang gõ -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="p-3 rounded-2xl bg-slate-100 rounded-bl-lg">
              <div class="flex items-center gap-1.5">
                <span
                  class="size-2 bg-slate-300 rounded-full animate-pulse delay-0"
                ></span>
                <span
                  class="size-2 bg-slate-300 rounded-full animate-pulse delay-200"
                ></span>
                <span
                  class="size-2 bg-slate-300 rounded-full animate-pulse delay-400"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ô Nhập liệu -->
        <div class="p-4 border-t border-slate-100">
          <form
            @submit.prevent="handleSendMessage"
            class="flex items-center gap-2"
          >
            <input
              v-model="userInput"
              type="text"
              placeholder="Hỏi Trợ lý B2B về sản phẩm..."
              class="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-slate-900"
              autocomplete="off"
            />
            <button
              type="submit"
              class="size-11 bg-[#658a22] text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-[#58791d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!userInput.trim()"
            >
              <span class="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@keyframes softPulse {
  0%, 100% {
    box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 15px 30px -5px rgba(5, 150, 105, 0.6);
    transform: scale(1.04);
  }
}

.animate-soft-pulse {
  animation: softPulse 3s infinite ease-in-out;
}

/* Custom Markdown Content Formatting */
:deep(.bot-markdown) {
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

:deep(.bot-markdown p) {
  margin-bottom: 0.5rem;
}

:deep(.bot-markdown p:last-child) {
  margin-bottom: 0;
}

:deep(.bot-markdown table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 12px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.bot-markdown th) {
  background-color: #f1f8e9;
  color: #1b5e20;
  font-weight: 700;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
  white-space: nowrap;
}

:deep(.bot-markdown td) {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  color: #334155;
  white-space: nowrap;
}

:deep(.bot-markdown tr:nth-child(even)) {
  background-color: #f8fafc;
}

:deep(.bot-markdown ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

:deep(.bot-markdown ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

:deep(.bot-markdown li) {
  margin-bottom: 0.25rem;
}

:deep(.bot-markdown strong),
:deep(.bot-markdown b) {
  font-weight: 700;
  color: #0f172a;
}

:deep(.bot-markdown code) {
  background-color: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  color: #0f766e;
}
</style>
