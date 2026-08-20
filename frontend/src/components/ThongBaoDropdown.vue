<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ThongBaoService } from "@/service/thong-bao";
import { useRouter } from "vue-router";

const props = defineProps<{ userId: number | null }>();
const notifications = ref<any[]>([]);
const isDropdownOpen = ref(false);
const router = useRouter();

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.da_doc).length,
);

let pollingInterval: any = null;

const fetchNotifications = async () => {
  if (!props.userId) return;
  try {
    const res = await ThongBaoService.getByUser(props.userId);
    notifications.value = res.data || res;
  } catch (e) {
    console.error("Lỗi khi tải thông báo", e);
  }
};

const containerRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  fetchNotifications();
  pollingInterval = setInterval(fetchNotifications, 15000);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  document.removeEventListener("click", handleClickOutside);
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    fetchNotifications();
  }
};

const markAsRead = async (id: number) => {
  await ThongBaoService.markAsRead(id);
  const tb = notifications.value.find((n) => n.tb_id === id);
  if (tb) tb.da_doc = true;
};

const markAllAsRead = async () => {
  await ThongBaoService.markAllAsRead();
  notifications.value.forEach((tb) => (tb.da_doc = true));
};

const handleNotificationClick = async (tb: any) => {
  if (!tb.da_doc) {
    await markAsRead(tb.tb_id);
  }
  isDropdownOpen.value = false;

  if (tb.ref_type === "don_hang" || tb.loai === "don_hang") {
    if (tb.ref_id) {
      router.push(`/orders/${tb.ref_id}`);
    } else {
      router.push("/orders");
    }
  } else if (tb.ref_type === "bao_gia") {
    if (tb.ref_id) {
      router.push(`/phan-hoi-bao-gia/${tb.ref_id}`);
    } else {
      router.push("/quan-ly-nhu-cau");
    }
  } else if (tb.ref_type === "thuong_luong_bai_dang") {
    if (tb.ref_id) {
      router.push(`/thuong-luong/${tb.ref_id}`);
    } else {
      router.push("/quan-ly-thuong-luong");
    }
  } else if (tb.loai === "bai_dang" && tb.ref_id) {
    router.push(`/products/${tb.ref_id}`);
  } else if (tb.loai === "hang_moi" && tb.ref_id) {
    router.push(`/products/${tb.ref_id}`);
  } else {
    router.push("/orders");
  }
};

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
};
</script>

<template>
  <div class="notification-dropdown-container" ref="containerRef">
    <button @click.stop="toggleDropdown" class="action-btn">
      <div class="action-btn-icon relative">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span v-if="unreadCount > 0" class="badge">{{
          unreadCount > 99 ? "99+" : unreadCount
        }}</span>
      </div>
      <span class="action-btn-label">Thông báo</span>
    </button>

    <transition name="dropdown">
      <div v-if="isDropdownOpen" class="dropdown-menu" @click.stop>
        <div
          class="dropdown-header flex justify-between items-center px-4 py-3 border-b border-gray-100"
        >
          <h3 class="font-bold text-gray-800 text-lg m-0">Thông báo</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-primary text-sm hover:underline font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div class="dropdown-body overflow-y-auto max-h-[400px]">
          <div
            v-if="notifications.length === 0"
            class="p-6 text-center text-gray-500"
          >
            Không có thông báo nào.
          </div>
          <div
            v-else
            v-for="tb in notifications"
            :key="tb.tb_id"
            @click="handleNotificationClick(tb)"
            class="notification-item p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            :class="{ 'bg-blue-50': !tb.da_doc }"
          >
            <div class="flex gap-3">
              <div class="icon-circle mt-1" :class="`icon-${tb.loai}`">
                <svg
                  v-if="tb.loai === 'don_hang'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 17H5a2 2 0 0 0-2 2" />
                  <path d="M9 3H5a2 2 0 0 0-2 2v14" />
                  <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9" />
                  <polyline points="13 7 16 10 22 4" />
                </svg>
                <svg
                  v-else-if="tb.loai === 'hang_moi'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div class="flex-1">
                <h4
                  class="text-sm font-semibold text-gray-800 mb-1"
                  :class="{ 'text-primary': !tb.da_doc }"
                >
                  {{ tb.tieu_de }}
                </h4>
                <p class="text-sm text-gray-600 mb-2 leading-snug">
                  {{ tb.noi_dung }}
                </p>
                <span class="text-xs text-gray-400">{{
                  formatTime(tb.thoi_gian_gui)
                }}</span>
              </div>
              <div
                v-if="!tb.da_doc"
                class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.notification-dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: -50px;
  width: 360px;
  background: white;
  border-radius: 16px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  margin-top: 16px;
  overflow: hidden;
  text-align: left;
}

/* Mũi tên chỉ lên cho dropdown */
.dropdown-menu::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 68px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  color: #455a64;
  transition:
    background 0.15s,
    color 0.15s;
  font-family: "Inter", sans-serif;
}
.action-btn:hover {
  background: #f1f8e9;
  color: #2e7d32;
}
.action-btn-icon {
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}
.action-btn-label {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 1300px) {
  .action-btn-label {
    display: none;
  }
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-don_hang {
  background: #e3f2fd;
  color: #1976d2;
}
.icon-hang_moi {
  background: #e8f5e9;
  color: #2e7d32;
}
.icon-bai_dang {
  background: #fff3e0;
  color: #f57c00;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.bg-blue-50 {
  background-color: #eff6ff;
}
</style>
