<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UsersAdmin } from "@/service/users.ts";
import { BaiDang } from "@/service/baidang.ts";
import { DonHang } from "@/service/donhang.ts";

const stats = ref({
  totalNongDan: 0,
  totalDoanhNghiep: 0,
  totalBaiDang: 0,
  totalDonHang: 0,
  totalShippingFee: 0,
});

const topFarmers = ref<any[]>([]);

const isLoading = ref(true);

const loadDashboardData = async () => {
  isLoading.value = true;
  try {
    const [usersRes, postsRes, ordersRes] = await Promise.all([
      UsersAdmin.getAll().catch(() => []),
      BaiDang.getAllForAdmin().catch(() => []),
      DonHang.getAll().catch(() => []),
    ]);

    const users = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
    const posts = Array.isArray(postsRes) ? postsRes : postsRes?.data || [];
    const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [];

    stats.value.totalNongDan = users.filter(
      (u: any) => u.role === "NONG_DAN" || u.role_id === 2,
    ).length;
    stats.value.totalDoanhNghiep = users.filter(
      (u: any) => u.role === "DOANH_NGHIEP" || u.role_id === 3,
    ).length;
    stats.value.totalBaiDang = posts.length;
    stats.value.totalDonHang = orders.length;

    // Thống kê Doanh thu Phí vận chuyển & Bảng xếp hạng Nông dân
    let shippingRevenue = 0;
    const farmerSalesMap: Record<
      number,
      {
        totalRevenue: number;
        totalOrders: number;
        farmerName: string;
        avatar: string;
      }
    > = {};

    // Tạo lookup từ Users để lấy tên nông dân
    const userMap: Record<number, any> = {};
    users.forEach((u: any) => {
      userMap[u.user_id || u.id] = u;
    });

    orders.forEach((order: any) => {
      if (order.trang_thai_don === "hoan_thanh") {
        // Tính tổng phí vận chuyển B2B
        shippingRevenue += Number(order.phi_van_chuyen || 0);

        // Cộng dồn cho Nông dân (người bán)
        const sellerId = order.nguoi_ban_id;
        if (sellerId) {
          if (!farmerSalesMap[sellerId]) {
            farmerSalesMap[sellerId] = {
              totalRevenue: 0,
              totalOrders: 0,
              farmerName: userMap[sellerId]?.full_name || "Nông dân ẩn danh",
              avatar:
                userMap[sellerId]?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userMap[sellerId]?.full_name || "ND")}&background=E8F5E9&color=2E7D32`,
            };
          }
          farmerSalesMap[sellerId].totalOrders += 1;
          // Doanh thu thực nhận = Tổng tiền - Phí vận chuyển
          farmerSalesMap[sellerId].totalRevenue +=
            Number(order.tong_tien || 0) - Number(order.phi_van_chuyen || 0);
        }
      }
    });

    stats.value.totalShippingFee = shippingRevenue;

    // Sort farmers by totalRevenue descending
    topFarmers.value = Object.entries(farmerSalesMap)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5); // Lấy Top 5
  } catch (err) {
    console.error("Error loading dashboard:", err);
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-header">
      <h1 class="page-title">Tổng quan B2B AgroMarket</h1>
      <p class="page-subtitle">Thống kê hoạt động kinh doanh trên nền tảng</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Mới thêm: Doanh thu phí vận chuyển -->
      <div class="stat-card shipping-card">
        <div class="stat-icon bg-emerald-100 text-emerald-700">
          <span class="material-symbols-outlined">local_shipping</span>
        </div>
        <div class="stat-info">
          <div class="stat-label text-emerald-800">
            Doanh thu Phí vận chuyển
          </div>
          <div class="stat-value text-emerald-700">
            <span v-if="isLoading" class="skeleton skeleton-text w-24"></span>
            <span v-else>{{ formatCurrency(stats.totalShippingFee) }}</span>
          </div>
        </div>
      </div>

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

    <!-- Charts & Leaderboards -->
    <div class="dashboard-charts">
      <div class="chart-card">
        <h3 class="chart-title flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-[24px]"
            >emoji_events</span
          >
          Bảng xếp hạng Top Nông dân có doanh thu cao nhất
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 text-sm">
                <th class="py-3 px-4 font-semibold w-16 text-center">Hạng</th>
                <th class="py-3 px-4 font-semibold">Nông Dân</th>
                <th class="py-3 px-4 font-semibold text-center">
                  Số lượng đơn (Hoàn thành)
                </th>
                <th class="py-3 px-4 font-semibold text-right">
                  Tổng Doanh Thu
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="isLoading"
                v-for="i in 5"
                :key="i"
                class="border-b border-slate-50"
              >
                <td class="py-4 px-4 text-center">
                  <span
                    class="skeleton skeleton-text w-6 h-6 rounded-full inline-block"
                  ></span>
                </td>
                <td class="py-4 px-4">
                  <span class="skeleton skeleton-text w-32"></span>
                </td>
                <td class="py-4 px-4 text-center">
                  <span class="skeleton skeleton-text w-12"></span>
                </td>
                <td class="py-4 px-4 text-right">
                  <span class="skeleton skeleton-text w-24"></span>
                </td>
              </tr>
              <tr v-else-if="topFarmers.length === 0">
                <td colspan="4" class="py-12 text-center text-slate-400">
                  <span
                    class="material-symbols-outlined text-4xl block mb-2 opacity-50"
                    >inbox</span
                  >
                  Chưa có dữ liệu giao dịch hoàn thành
                </td>
              </tr>
              <tr
                v-else
                v-for="(farmer, index) in topFarmers"
                :key="farmer.id"
                class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td class="py-3 px-4 text-center">
                  <div
                    v-if="index === 0"
                    class="w-8 h-8 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black text-sm"
                  >
                    1
                  </div>
                  <div
                    v-else-if="index === 1"
                    class="w-8 h-8 mx-auto bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-black text-sm"
                  >
                    2
                  </div>
                  <div
                    v-else-if="index === 2"
                    class="w-8 h-8 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-sm"
                  >
                    3
                  </div>
                  <div
                    v-else
                    class="w-8 h-8 mx-auto text-slate-500 flex items-center justify-center font-bold text-sm"
                  >
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="farmer.avatar"
                      alt="Avatar"
                      class="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-200"
                    />
                    <span class="font-bold text-slate-800">{{
                      farmer.farmerName
                    }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-center font-semibold text-slate-600">
                  {{ farmer.totalOrders }} đơn
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="font-black text-[#2E7D32]">{{
                    formatCurrency(farmer.totalRevenue)
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="chart-card bg-[#F8FAFC]">
        <h3 class="chart-title">Phân bổ Danh mục (Sắp ra mắt)</h3>
        <div class="chart-placeholder">
          <span class="material-symbols-outlined">pie_chart</span>
          <p>Dữ liệu biểu đồ đang được phát triển...</p>
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
  color: #1b5e20;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
}

.shipping-card {
  border: 2px solid #e8f5e9;
  background: #f9fdfa;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon span {
  font-size: 28px;
}

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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
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
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

@media (max-width: 1024px) {
  .dashboard-charts {
    grid-template-columns: 1fr;
  }
}
</style>
