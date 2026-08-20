<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UsersAdmin } from "@/service/users.ts";
import { notify } from "@/utils/notifier.ts";

import { computed } from "vue";

const users = ref<any[]>([]);
const loading = ref(true);
const searchKeyword = ref("");

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value;
  const kw = searchKeyword.value.toLowerCase();
  return users.value.filter((u: any) => {
    return (
      (u.email && u.email.toLowerCase().includes(kw)) ||
      (u.full_name && u.full_name.toLowerCase().includes(kw)) ||
      (u.ho_ten && u.ho_ten.toLowerCase().includes(kw)) ||
      (u.ten_cong_ty && u.ten_cong_ty.toLowerCase().includes(kw)) ||
      (u.phone && u.phone.includes(kw)) ||
      (u.so_dien_thoai && u.so_dien_thoai.includes(kw))
    );
  });
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const loadUsers = async () => {
  loading.value = true;
  currentPage.value = 1;
  try {
    const res = await UsersAdmin.getAll();
    // Backend trả về mảng user
    users.value = Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    notify.error("Lỗi khi tải danh sách người dùng");
  } finally {
    loading.value = false;
  }
};

const toggleActive = async (user: any) => {
  try {
    await UsersAdmin.updateActive(user.user_id || user.id, !user.is_active);
    user.is_active = !user.is_active;
    notify.success(
      `Đã ${user.is_active ? "mở khóa" : "khóa"} tài khoản ${user.email}`,
    );
  } catch (err) {
    notify.error("Lỗi khi cập nhật trạng thái");
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="accounts-root">
    <div class="page-header">
      <h1 class="page-title">Quản lý Doanh Nghiệp & Nông Dân</h1>
      <div class="header-actions" style="display: flex; gap: 12px; align-items: center;">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Tìm tên, email, SĐT..."
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all min-w-[260px]"
        />
        <button @click="loadUsers" class="refresh-btn">
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Họ Tên / Công Ty</th>
            <th>Vai Trò</th>
            <th>Số Điện Thoại</th>
            <th>Ngày Tạo</th>
            <th>Trạng Thái</th>
            <th class="text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="8" class="text-center py-8 text-gray-500">
              Chưa có người dùng nào
            </td>
          </tr>
          <tr v-for="u in paginatedUsers" :key="u.user_id || u.id">
            <td class="font-medium text-gray-500">#{{ u.user_id || u.id }}</td>
            <td class="font-semibold text-gray-800">{{ u.email }}</td>
            <td>{{ u.full_name || u.ho_ten || u.ten_cong_ty || "-" }}</td>
            <td>
              <span
                class="role-badge"
                :class="
                  u.role === 'ADMIN'
                    ? 'bg-red-100 text-red-700'
                    : u.role === 'DOANH_NGHIEP'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                "
              >
                {{ u.role || u.vaiTro?.ten_vai_tro }}
              </span>
            </td>
            <td>{{ u.phone || u.so_dien_thoai || "-" }}</td>
            <td class="text-gray-500 text-sm">
              {{ new Date(u.created_at).toLocaleDateString("vi-VN") }}
            </td>
            <td>
              <div
                class="status-badge"
                :class="u.is_active ? 'status-active' : 'status-locked'"
              >
                <span class="status-dot"></span>
                {{ u.is_active ? "Hoạt động" : "Đã khóa" }}
              </div>
            </td>
            <td class="text-right">
              <button
                @click="toggleActive(u)"
                class="action-btn"
                :class="u.is_active ? 'btn-lock' : 'btn-unlock'"
                :title="u.is_active ? 'Khóa tài khoản' : 'Mở khóa'"
              >
                <span class="material-symbols-outlined">{{
                  u.is_active ? "lock" : "lock_open"
                }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          &lt;
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="page-btn"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accounts-root {
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

.data-table tbody tr:hover {
  background: #f8fafc;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-active {
  background: #ecfdf5;
  color: #059669;
}
.status-locked {
  background: #fef2f2;
  color: #dc2626;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-active .status-dot {
  background: #10b981;
}
.status-locked .status-dot {
  background: #ef4444;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-lock {
  color: #f59e0b;
}
.btn-lock:hover {
  background: #fef3c7;
}
.btn-unlock {
  color: #10b981;
}
.btn-unlock:hover {
  background: #d1fae5;
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
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #edf2f7;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-btn.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
