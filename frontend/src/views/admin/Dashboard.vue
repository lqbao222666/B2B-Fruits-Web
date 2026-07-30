<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UsersAdmin } from '@/service/users.ts'
import { BaiDang } from '@/service/baidang.ts'
import { DonHang } from '@/service/donhang.ts'

const stats = ref({
  totalNongDan: 0,
  totalDoanhNghiep: 0,
  totalBaiDang: 0,
  totalDonHang: 0,
})

const isLoading = ref(true)

const loadDashboardData = async () => {
  isLoading.value = true
  try {
    const [usersRes, postsRes, ordersRes] = await Promise.all([
      UsersAdmin.getAll().catch(() => []),
      BaiDang.getAllForAdmin().catch(() => []),
      DonHang.getAll().catch(() => []),
    ])
    
    const users = Array.isArray(usersRes) ? usersRes : usersRes?.data || []
    const posts = Array.isArray(postsRes) ? postsRes : postsRes?.data || []
    const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || []

    stats.value.totalNongDan = users.filter((u: any) => u.role === 'NONG_DAN' || u.role_id === 2).length
    stats.value.totalDoanhNghiep = users.filter((u: any) => u.role === 'DOANH_NGHIEP' || u.role_id === 3).length
    stats.value.totalBaiDang = posts.length
    stats.value.totalDonHang = orders.length
  } catch (err) {
    console.error('Error loading dashboard:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-header">
      <h1 class="page-title">Tổng quan B2B AgroMarket</h1>
      <p class="page-subtitle">Thống kê hoạt động kinh doanh trên nền tảng</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-green-100 text-green-700">
          <span class="material-symbols-outlined">agriculture</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Tổng Nông dân (Người bán)</div>
          <div class="stat-value">
            <span v-if="isLoading" class="skeleton skeleton-text w-16"></span>
            <span v-else>{{ stats.totalNongDan }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-700">
          <span class="material-symbols-outlined">domain</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Tổng Doanh nghiệp (Người mua)</div>
          <div class="stat-value">
            <span v-if="isLoading" class="skeleton skeleton-text w-16"></span>
            <span v-else>{{ stats.totalDoanhNghiep }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-orange-100 text-orange-700">
          <span class="material-symbols-outlined">inventory_2</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Bài đăng Nông sản</div>
          <div class="stat-value">
            <span v-if="isLoading" class="skeleton skeleton-text w-16"></span>
            <span v-else>{{ stats.totalBaiDang }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100 text-purple-700">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Đơn hàng B2B</div>
          <div class="stat-value">
            <span v-if="isLoading" class="skeleton skeleton-text w-16"></span>
            <span v-else>{{ stats.totalDonHang }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State for Charts (Placeholder) -->
    <div class="dashboard-charts">
      <div class="chart-card">
        <h3 class="chart-title">Biểu đồ giao dịch gần đây</h3>
        <div class="chart-placeholder">
          <span class="material-symbols-outlined">bar_chart</span>
          <p>Dữ liệu biểu đồ đang được cập nhật...</p>
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">Phân bổ Danh mục</h3>
        <div class="chart-placeholder">
          <span class="material-symbols-outlined">pie_chart</span>
          <p>Dữ liệu biểu đồ đang được cập nhật...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-root {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1B5E20;
  margin: 0 0 4px;
}
.page-subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  border: 1px solid #f0f0f0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon span { font-size: 28px; }

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.1;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  border: 1px solid #f0f0f0;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #eee;
}
.chart-placeholder span {
  font-size: 3rem;
  color: #ccc;
}

.skeleton {
  background: #eee;
  border-radius: 4px;
  display: inline-block;
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-text {
  height: 32px;
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 1024px) {
  .dashboard-charts { grid-template-columns: 1fr; }
}
</style>
