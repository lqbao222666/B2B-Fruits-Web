<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DonHang } from "@/service/donhang.ts";
import { notify } from "@/utils/notifier.ts";

import { computed } from "vue";

const orders = ref<any[]>([]);
const loading = ref(true);
const searchKeyword = ref("");

const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orders.value;
  const kw = searchKeyword.value.toLowerCase();
  return orders.value.filter((o: any) => {
    return (
      (o.ma_don_hang && o.ma_don_hang.toLowerCase().includes(kw)) ||
      (o.nguoiMua?.ten_cong_ty && o.nguoiMua.ten_cong_ty.toLowerCase().includes(kw)) ||
      (o.nguoiBan?.ho_ten && o.nguoiBan.ho_ten.toLowerCase().includes(kw))
    );
  });
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const loadOrders = async () => {
  loading.value = true;
  currentPage.value = 1;
  try {
    const res = await DonHang.getAll();
    orders.value = Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    notify.error("Lỗi khi tải danh sách đơn hàng");
  } finally {
    loading.value = false;
  }
};

const handleDeleteOrder = async (order: any) => {
  if (!confirm(`Bạn có chắc muốn xoá/huỷ đơn hàng ${order.ma_don_hang}?`))
    return;
  try {
    await DonHang.delete(order.donhang_id);
    notify.success("Đã xoá đơn hàng");
    loadOrders();
  } catch (err) {
    notify.error("Lỗi khi xoá đơn hàng");
  }
};

const handleDispatchTruck = async (order: any) => {
  if (
    !confirm(
      `Xác nhận điều xe vận chuyển B2B đến kho Nông dân để lấy hàng đơn #${order.ma_don_hang}?`,
    )
  )
    return;
  try {
    await DonHang.update(order.donhang_id, { trang_thai_don: "dang_giao" });
    notify.success("Đã điều xe B2B đến kho Nông dân thành công!");
    loadOrders();
  } catch (err) {
    notify.error("Lỗi khi điều xe B2B");
  }
};

const handleConfirmArrival = async (order: any) => {
  if (
    !confirm(
      `Xác nhận xe vận chuyển B2B đã giao hàng #${order.ma_don_hang} tới nơi của Doanh nghiệp?`,
    )
  )
    return;
  try {
    await DonHang.update(order.donhang_id, { trang_thai_don: "da_giao_hang" });
    notify.success("Đã xác nhận xe B2B giao hàng tới nơi thành công!");
    loadOrders();
  } catch (err) {
    notify.error("Lỗi khi xác nhận giao hàng");
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
    case "cho_xac_nhan":
      return "Chờ Cọc / Phí";
    case "da_xac_nhan":
      return "Đã Đủ Cọc / Phí";
    case "dang_giao":
      return "Xe B2B Đang Giao";
    case "da_giao_hang":
      return "Đã Giao - Chờ Trả 85%";
    case "hoan_thanh":
      return "Hoàn Thành 100%";
    case "da_huy":
      return "Đã Huỷ";
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "cho_xac_nhan":
      return "bg-amber-100 text-amber-700";
    case "da_xac_nhan":
      return "bg-blue-100 text-blue-700";
    case "dang_giao":
      return "bg-indigo-100 text-indigo-700";
    case "da_giao_hang":
      return "bg-purple-100 text-purple-700";
    case "hoan_thanh":
      return "bg-emerald-100 text-emerald-700";
    case "da_huy":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getTotalQuantity = (order: any) => {
  if (!order.chiTiets || order.chiTiets.length === 0) return 0;
  return order.chiTiets.reduce(
    (sum: number, item: any) => sum + Number(item.so_luong),
    0,
  );
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="orders-root">
    <div class="page-header">
      <h1 class="page-title">Quản lý Đơn Hàng B2B</h1>
      <div class="header-actions" style="display: flex; gap: 12px; align-items: center;">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Tìm mã đơn, tên DN, tên Nông dân..."
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all min-w-[280px]"
        />
        <button @click="loadOrders" class="refresh-btn">
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu đơn hàng...</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Mã Đơn</th>
            <th>Người Mua (DN)</th>
            <th>Người Bán (Nông Dân)</th>
            <th>Sản Phẩm</th>
            <th>Tổng Tiền</th>
            <th>Ngày Đặt</th>
            <th>Trạng Thái</th>
            <th class="text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orders.length === 0">
            <td colspan="8" class="text-center py-8 text-gray-500">
              Chưa có đơn hàng nào
            </td>
          </tr>
          <tr v-for="o in paginatedOrders" :key="o.donhang_id">
            <td class="font-bold text-gray-700">{{ o.ma_don_hang }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{
                  o.nguoiMua?.ten_cong_ty || `DN #${o.nguoi_mua_id}`
                }}</span>
              </div>
            </td>
            <td>
              <div class="user-info">
                <span class="user-name">{{
                  o.nguoiBan?.ho_ten || `ND #${o.nguoi_ban_id}`
                }}</span>
              </div>
            </td>
            <td>
              <div class="order-product">
                <span class="op-name">{{
                  o.baiDang?.ten_nong_san || "Nông sản"
                }}</span>
                <span class="op-qty"
                  >{{ getTotalQuantity(o) }}
                  {{ o.baiDang?.don_vi_tinh || "kg" }}</span
                >
              </div>
            </td>
            <td class="font-bold text-green-700">
              {{ formatPrice(o.tong_tien) }}
            </td>
            <td class="text-sm text-gray-500">
              {{ new Date(o.ngay_tao).toLocaleDateString("vi-VN") }}
            </td>
            <td>
              <div class="space-y-1">
                <span
                  class="status-badge"
                  :class="getStatusClass(o.trang_thai_don)"
                >
                  {{ getStatusLabel(o.trang_thai_don) }}
                </span>
                <div v-if="o.doanh_nghiep_da_tt_coc && o.trang_thai_don !== 'da_huy'" class="text-[11px] mt-1">
                  <span
                    v-if="o.nong_dan_xac_nhan_giao"
                    class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1"
                  >
                    ✓ Nông dân đã sẵn sàng
                  </span>
                  <span
                    v-else
                    class="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1"
                  >
                    ⌛ Chờ Nông dân xác nhận
                  </span>
                </div>
              </div>
            </td>
            <td class="text-right flex items-center justify-end gap-2">
              <button
                v-if="o.trang_thai_don === 'da_xac_nhan' || (o.doanh_nghiep_da_tt_coc && o.trang_thai_don !== 'dang_giao' && o.trang_thai_don !== 'da_giao_hang' && o.trang_thai_don !== 'hoan_thanh' && o.trang_thai_don !== 'da_huy')"
                @click="handleDispatchTruck(o)"
                :class="[
                  'px-3 py-1 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1',
                  o.nong_dan_xac_nhan_giao ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50' : 'bg-indigo-600 hover:bg-indigo-700 opacity-90'
                ]"
                :title="o.nong_dan_xac_nhan_giao ? 'Nông dân ĐÃ xác nhận vườn đủ điều kiện. Click để điều xe B2B!' : 'Chờ Nông dân xác nhận đủ điều kiện giao hàng'"
              >
                <span class="material-symbols-outlined text-sm"
                  >local_shipping</span
                >
                {{ o.nong_dan_xac_nhan_giao ? 'Điều Xe Lấy Hàng (Đã Sẵn Sàng)' : 'Điều Xe B2B Lấy Hàng' }}
              </button>

              <button
                v-if="
                  o.trang_thai_don === 'dang_giao' ||
                  o.trang_thai_don === 'da_xac_nhan'
                "
                @click="handleConfirmArrival(o)"
                class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1"
                title="Xác nhận xe B2B đã giao hàng đến điểm nhận của Doanh nghiệp"
              >
                <span class="material-symbols-outlined text-sm"
                  >where_to_vote</span
                >
                Đã Giao Tới Nơi
              </button>

              <button
                @click="handleDeleteOrder(o)"
                class="action-btn btn-delete"
                title="Xoá đơn hàng"
              >
                <span class="material-symbols-outlined">delete</span>
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
.orders-root {
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

.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.order-product {
  display: flex;
  flex-direction: column;
}
.op-name {
  font-weight: 600;
  color: #333;
}
.op-qty {
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
.btn-delete {
  color: #ef4444;
}
.btn-delete:hover {
  background: #fee2e2;
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
