<script setup lang="ts">
import { ref, onMounted } from "vue";
import { BaiDang } from "@/service/baidang.ts";
import { notify } from "@/utils/notifier.ts";

const posts = ref<any[]>([]);
const loading = ref(true);
const currentTab = ref("tat_ca"); // 'tat_ca', 'cho_duyet', 'dang_ban', 'an'

const loadPosts = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (currentTab.value !== "tat_ca") {
      params.trang_thai = currentTab.value;
    }
    const res = await BaiDang.getAllForAdmin(params);
    posts.value = Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    notify.error("Lỗi khi tải danh sách bài đăng");
  } finally {
    loading.value = false;
  }
};

const handleDuyetPost = async (post: any) => {
  if (!confirm("Bạn có chắc muốn duyệt bài đăng này để cho phép bán?")) return;
  try {
    await BaiDang.duyetBaiDang(post.baidang_id);
    notify.success("Đã duyệt bài đăng thành công!");
    loadPosts();
  } catch (err) {
    notify.error("Lỗi khi duyệt bài đăng");
  }
};

const handleHidePost = async (post: any) => {
  const reason = prompt(
    "Nhập lý do ẩn bài đăng này:",
    "Giá không hợp lệ / Vi phạm nội dung",
  );
  if (!reason) return;

  try {
    await BaiDang.anBaiDang(post.baidang_id, reason);
    notify.success("Đã ẩn bài đăng thành công");
    loadPosts();
  } catch (err) {
    notify.error("Lỗi khi ẩn bài đăng");
  }
};

const handleShowPost = async (post: any) => {
  if (!confirm("Bạn có chắc muốn mở lại bài đăng này?")) return;
  try {
    await BaiDang.moLaiBaiDang(post.baidang_id);
    notify.success("Đã mở lại bài đăng");
    loadPosts();
  } catch (err) {
    notify.error("Lỗi khi mở lại bài đăng");
  }
};

const formatPrice = (price: any) => {
  if (!price) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price));
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "cho_duyet":
      return "Chờ duyệt";
    case "dang_ban":
      return "Đang bán";
    case "da_ban":
      return "Đã bán";
    case "an":
      return "Bị ẩn";
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "cho_duyet":
      return "bg-yellow-100 text-yellow-700";
    case "dang_ban":
      return "bg-green-100 text-green-700";
    case "da_ban":
      return "bg-gray-100 text-gray-700";
    case "an":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="products-root">
    <div class="page-header">
      <h1 class="page-title">Quản lý Bài Đăng Nông Sản</h1>
      <button @click="loadPosts" class="refresh-btn">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>

    <div class="tabs-container">
      <button
        :class="['tab-btn', currentTab === 'tat_ca' ? 'active' : '']"
        @click="
          currentTab = 'tat_ca';
          loadPosts();
        "
      >
        Tất cả
      </button>
      <button
        :class="['tab-btn', currentTab === 'cho_duyet' ? 'active' : '']"
        @click="
          currentTab = 'cho_duyet';
          loadPosts();
        "
      >
        Chờ duyệt
      </button>
      <button
        :class="['tab-btn', currentTab === 'dang_ban' ? 'active' : '']"
        @click="
          currentTab = 'dang_ban';
          loadPosts();
        "
      >
        Đang bán
      </button>
      <button
        :class="['tab-btn', currentTab === 'an' ? 'active' : '']"
        @click="
          currentTab = 'an';
          loadPosts();
        "
      >
        Bị ẩn
      </button>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu bài đăng...</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sản Phẩm</th>
            <th>Người Đăng (Nông Dân)</th>
            <th>Số Lượng Còn</th>
            <th>Giá Bán (/kg)</th>
            <th>Trạng Thái</th>
            <th class="text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="posts.length === 0">
            <td colspan="7" class="text-center py-8 text-gray-500">
              Chưa có bài đăng nào
            </td>
          </tr>
          <tr v-for="p in posts" :key="p.baidang_id">
            <td class="font-medium text-gray-500">#{{ p.baidang_id }}</td>
            <td>
              <div class="product-info">
                <span class="product-name">{{
                  p.ten_nong_san || p.tieu_de
                }}</span>
                <span class="product-cat">{{
                  p.danhMuc?.ten_danh_muc || "Nông sản"
                }}</span>
              </div>
            </td>
            <td class="font-medium">
              {{ p.nguoiDang?.ho_ten || `Nông dân #${p.nguoi_dang_id}` }}
            </td>
            <td>{{ p.so_luong_con_lai }} {{ p.don_vi_tinh || "kg" }}</td>
            <td class="font-bold text-green-700">
              {{ formatPrice(p.gia_per_kg) }}
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(p.trang_thai)">
                {{ getStatusLabel(p.trang_thai) }}
              </span>
            </td>
            <td class="text-right flex items-center justify-end gap-2">
              <button
                v-if="p.trang_thai === 'cho_duyet'"
                @click="handleDuyetPost(p)"
                class="action-btn btn-approve"
                title="Duyệt bài đăng"
              >
                <span class="material-symbols-outlined">check_circle</span>
              </button>

              <button
                v-if="p.trang_thai !== 'an'"
                @click="handleHidePost(p)"
                class="action-btn btn-hide"
                title="Ẩn/Từ chối bài đăng"
              >
                <span class="material-symbols-outlined">visibility_off</span>
              </button>

              <button
                v-if="p.trang_thai === 'an'"
                @click="handleShowPost(p)"
                class="action-btn btn-show"
                title="Mở lại bài đăng"
              >
                <span class="material-symbols-outlined">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.products-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.refresh-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}
.refresh-btn:hover {
  background: #f5f5f5;
  color: #2e7d32;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}

.product-info {
  display: flex;
  flex-direction: column;
}
.product-name {
  font-weight: 600;
  color: #1a1a1a;
}
.product-cat {
  font-size: 0.8rem;
  color: #888;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-hide {
  color: #ef4444;
}
.btn-hide:hover {
  background: #fee2e2;
}
.btn-show {
  color: #10b981;
}
.btn-show:hover {
  background: #d1fae5;
}
.btn-approve {
  color: #2e7d32;
}
.btn-approve:hover {
  background: #e8f5e9;
}

.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}
.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  background: #f8fafc;
}
.tab-btn.active {
  background: #1b5e20;
  color: white;
  border-color: #1b5e20;
}

.loading-state {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #888;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2e7d32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
