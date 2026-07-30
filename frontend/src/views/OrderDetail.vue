<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DonHang } from '../service/donhang.ts'
import api from '../service/api.ts'
import ReportModal from '../components/ReportModal.vue'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const userId = ref<number | null>(null)

const selectedOrder = ref<any>(null)
const loading = ref(false)
const isCanceling = ref(false)

const showReportModal = ref(false)
const reportingOrder = ref<any>(null)

// --- CÁC HÀM FORMAT & HELPER ---
const formatCurrency = (amount: number | string) => {
  if (!amount) return '0đ'
  return Number(amount).toLocaleString('vi-VN') + 'đ'
}

const getImageUrl = (images: any) => {
  if (Array.isArray(images) && images.length > 0) {
    return images[0].startsWith('http') ? images[0] : `http://localhost:3000${images[0]}`
  }
  return 'https://placehold.co/300x300?text=AgroMarket'
}

const getStatusInfo = (status: string) => {
  const map: Record<string, any> = {
    cho_xac_nhan: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', step: 0 },
    da_xac_nhan: { label: 'Đã thanh toán cọc', color: 'bg-blue-100 text-blue-700', step: 1 },
    dang_giao: { label: 'Bắt đầu giao dịch', color: 'bg-indigo-100 text-indigo-700', step: 2 },
    hoan_thanh: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700', step: 3 },
    da_huy: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700', step: -1 },
  }
  return map[status] || { label: status, color: 'bg-slate-100 text-slate-700', step: 0 }
}

// --- TÁCH THÔNG TIN GIAO HÀNG TỪ CHUỖI ---
const parsedShippingInfo = computed(() => {
  if (!selectedOrder.value?.dia_chi_giao) return { name: '', phone: '', address: '' }
  const addressString = selectedOrder.value.dia_chi_giao
  const parts = addressString.split(' - ')
  if (parts.length >= 3) {
    return {
      name: parts[0].trim(),
      phone: parts[1].trim(),
      address: parts.slice(2).join(' - ').trim()
    }
  }
  return {
    name: selectedOrder.value.nguoiMua?.user?.full_name || 'Khách hàng',
    phone: selectedOrder.value.nguoiMua?.user?.phone || '---',
    address: addressString
  }
})

// --- CÁC HÀM GỌI API ---
const fetchDetail = async () => {
  if (!orderId) return
  loading.value = true
  try {
    const orderData = await DonHang.getById(orderId)
    if (orderData) {
      selectedOrder.value = orderData
    }
  } catch (error: any) {
    notify.error(error?.message || 'Lỗi tải chi tiết đơn hàng!')
  } finally {
    loading.value = false
  }
}

const handleCancelOrder = async (id: number) => {
  const confirmCancel = confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')
  if (!confirmCancel) return
  isCanceling.value = true
  try {
    await DonHang.update(id, { trang_thai_don: 'da_huy' })
    notify.success('Đã hủy đơn hàng thành công!')
    selectedOrder.value.trang_thai_don = 'da_huy'
  } catch (error) {
    notify.error('Không thể hủy đơn hàng lúc này.')
  } finally {
    isCanceling.value = false
  }
}

const isUpdating = ref(false)
const handleUpdateStatus = async (orderId: number, newStatus: string, confirmMsg?: string) => {
  if (confirmMsg && !confirm(confirmMsg)) return;
  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, { trang_thai_don: newStatus });
    notify.success('Cập nhật trạng thái thành công!');
    await fetchDetail();
  } catch (error) {
    notify.error('Lỗi khi cập nhật trạng thái đơn hàng');
  } finally {
    isUpdating.value = false;
  }
}

const handleReorder = async (order: any) => {
  if (!order.baidang_id) {
    notify.error('Đơn hàng này không có sản phẩm để mua lại.')
    return
  }
  router.push(`/product/${order.baidang_id}`)
}

const handleReportIssue = (order: any) => {
  reportingOrder.value = order
  showReportModal.value = true
}

const goToProduct = (productId: number | undefined) => {
  if (productId) router.push(`/product/${productId}`)
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) userId.value = JSON.parse(userStr).id
  if (orderId) fetchDetail()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <div v-if="loading" class="p-10 text-center text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</div>

      <div v-else-if="selectedOrder" class="animate-fadeIn">
        <button @click="router.back()" class="mb-6 flex items-center text-slate-400 hover:text-slate-800 transition-colors font-black uppercase text-xs tracking-widest gap-1">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Quay lại danh sách
        </button>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <!-- HEDAER ĐƠN HÀNG -->
          <div class="bg-slate-50 p-6 md:p-8 border-b border-slate-200">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2 class="font-black text-2xl text-slate-800 tracking-tight uppercase">Mã đơn: #{{ selectedOrder.ma_don_hang || selectedOrder.donhang_id }}</h2>
                <p class="text-slate-500 text-sm mt-1">{{ new Date(selectedOrder.ngay_tao).toLocaleString('vi-VN') }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span :class="['px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest', getStatusInfo(selectedOrder.trang_thai_don).color]">
                  {{ getStatusInfo(selectedOrder.trang_thai_don).label }}
                </span>
                
                <button v-if="selectedOrder.trang_thai_don === 'cho_xac_nhan' && selectedOrder.nguoi_mua_id === userId" @click="handleCancelOrder(selectedOrder.donhang_id)" :disabled="isCanceling" class="px-4 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                  {{ isCanceling ? 'Đang hủy...' : 'Hủy đơn hàng' }}
                </button>

                <!-- Nông dân -->
                <button
                  v-if="selectedOrder.trang_thai_don === 'cho_xac_nhan' && selectedOrder.nguoi_ban_id === userId"
                  @click="handleUpdateStatus(selectedOrder.donhang_id, 'da_xac_nhan')"
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]">check_circle</span>
                  Xác nhận đơn
                </button>

                <button
                  v-if="selectedOrder.trang_thai_don === 'da_xac_nhan' && selectedOrder.nguoi_ban_id === userId"
                  @click="handleUpdateStatus(selectedOrder.donhang_id, 'dang_giao')"
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                  Bắt đầu giao
                </button>

                <!-- Doanh nghiệp -->
                <button
                  v-if="selectedOrder.trang_thai_don === 'dang_giao' && selectedOrder.nguoi_mua_id === userId"
                  @click="handleUpdateStatus(selectedOrder.donhang_id, 'hoan_thanh', 'Bạn xác nhận đã nhận đủ hàng, kiểm tra chất lượng đạt yêu cầu và đã thanh toán 85% phần còn lại?')"
                  :disabled="isUpdating"
                  class="px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  Đã nhận hàng & Hoàn tất
                </button>
                
                <button v-if="selectedOrder.nguoi_ban_id === userId && !['hoan_thanh', 'da_huy'].includes(selectedOrder.trang_thai_don)" @click="handleReportIssue(selectedOrder)" class="px-4 py-2 bg-[#FFF8E1] border border-[#FFE082] text-[#FF8F00] hover:bg-[#FFECB3] rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">report_problem</span> Báo cáo sự cố
                </button>
              </div>
            </div>

            <!-- THANH TIẾN TRÌNH -->
            <div v-if="selectedOrder.trang_thai_don !== 'da_huy'" class="flex items-center justify-between mt-8 px-6 relative">
              <div v-for="step in [0, 1, 2, 3]" :key="step" :class="['w-10 h-10 rounded-full flex items-center justify-center z-10 font-black transition-all duration-500 shadow-sm text-sm border-2', getStatusInfo(selectedOrder.trang_thai_don).step >= step ? 'bg-[#2E7D32] border-[#2E7D32] text-white scale-110' : 'bg-white text-slate-300 border-slate-200']">
                {{ step + 1 }}
              </div>
              <div class="absolute h-1.5 bg-slate-100 left-12 right-12 top-[1.15rem] z-0 overflow-hidden rounded-full shadow-inner">
                <div class="h-full bg-[#2E7D32] transition-all duration-700 ease-in-out" :style="{ width: `${(getStatusInfo(selectedOrder.trang_thai_don).step / 3) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- CỘT TRÁI: SẢN PHẨM -->
            <div>
              <h3 class="font-black mb-5 text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">inventory_2</span> Sản phẩm đã đặt (B2B)
              </h3>
              
              <div class="space-y-3">
                <div v-for="item in selectedOrder.chiTiets" :key="item.id" @click="goToProduct(selectedOrder.baidang_id)" class="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer hover:border-[#2E7D32]/50 transition-all group">
                  <div class="flex-1">
                    <p class="font-black text-sm text-slate-800 group-hover:text-[#2E7D32] transition-colors line-clamp-2">{{ selectedOrder.baiDang?.ten_nong_san || 'Bài đăng nông sản' }} - {{ item.phanLoai?.ten_phan_loai }}</p>
                    <p class="font-bold text-[#d00000] text-sm mt-1">{{ formatCurrency(item.don_gia) }} / {{ selectedOrder.baiDang?.don_vi_tinh || 'kg' }}</p>
                    <div class="mt-2 inline-flex bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-slate-600 uppercase">
                      Số lượng: {{ item.so_luong }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <h3 class="font-black mb-3 text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">storefront</span> Đối tác giao dịch
                </h3>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div v-if="selectedOrder.nguoi_mua_id === userId">
                    <p class="text-xs font-black text-slate-400 uppercase">Nông dân (Người bán)</p>
                    <p class="text-sm font-bold text-slate-800">{{ selectedOrder.nguoiBan?.user?.full_name || 'Không rõ' }}</p>
                    <p class="text-sm text-slate-600 flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-[14px]">call</span> {{ selectedOrder.nguoiBan?.user?.phone || '---' }}</p>
                  </div>
                  <div v-else>
                    <p class="text-xs font-black text-slate-400 uppercase">Doanh nghiệp (Người mua)</p>
                    <p class="text-sm font-bold text-slate-800">{{ selectedOrder.nguoiMua?.user?.full_name || 'Không rõ' }}</p>
                    <p class="text-sm text-slate-600 flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-[14px]">call</span> {{ selectedOrder.nguoiMua?.user?.phone || '---' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CỘT PHẢI: GIAO HÀNG & THANH TOÁN -->
            <div class="space-y-6">
              <!-- Giao hàng -->
              <div>
                <h4 class="font-black text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">local_shipping</span> Thông tin nhận hàng
                </h4>
                <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                      <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Người nhận</p>
                      <p class="font-bold text-slate-800 text-sm">{{ parsedShippingInfo.name }}</p>
                    </div>
                    <div class="flex-1">
                      <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Số điện thoại</p>
                      <p class="font-bold text-slate-800 text-sm">{{ parsedShippingInfo.phone }}</p>
                    </div>
                  </div>
                  <div class="pt-2 border-t border-slate-100">
                    <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Địa chỉ chi tiết</p>
                    <p class="font-medium text-slate-700 text-sm">{{ parsedShippingInfo.address }}</p>
                  </div>
                  <div class="pt-2 border-t border-slate-100">
                    <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Phương thức vận chuyển</p>
                    <p class="font-bold text-[#2E7D32] text-sm">{{ selectedOrder.hinh_thuc_giao_hang === 'tu_den_lay' ? 'Doanh nghiệp tự đến lấy' : 'Nông dân giao tận nơi' }}</p>
                  </div>
                </div>
              </div>

              <!-- Thanh toán -->
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div class="space-y-3 mb-4 text-sm font-medium text-slate-600">
                  <div class="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span>{{ formatCurrency(selectedOrder.tong_tien - selectedOrder.phi_van_chuyen) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{{ formatCurrency(selectedOrder.phi_van_chuyen) }}</span>
                  </div>
                  <div class="flex justify-between font-black text-slate-800 text-lg pt-3 border-t border-slate-200">
                    <span>Tổng hóa đơn:</span>
                    <span class="text-[#d00000]">{{ formatCurrency(selectedOrder.tong_tien) }}</span>
                  </div>
                </div>
                
                <div v-if="selectedOrder.tien_coc > 0" class="bg-[#E8F5E9] border border-[#2E7D32]/20 p-4 rounded-xl flex justify-between items-center mt-4">
                  <div>
                    <p class="text-[10px] font-black text-[#2E7D32] uppercase tracking-widest">Tiền cọc (15%)</p>
                    <p class="text-xs text-[#1B5E20] font-medium mt-0.5">Trạng thái: {{ selectedOrder.trang_thai_tt === 'da_thanh_toan' ? 'Đã hoàn tất cọc' : 'Chưa thanh toán' }}</p>
                  </div>
                  <p class="text-xl font-black text-[#1B5E20]">{{ formatCurrency(selectedOrder.tien_coc) }}</p>
                </div>
              </div>

              <button v-if="['hoan_thanh', 'da_huy'].includes(selectedOrder.trang_thai_don) && selectedOrder.nguoi_mua_id === userId" @click="handleReorder(selectedOrder)" class="w-full mt-2 bg-[#2E7D32] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#1B5E20] transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">shopping_cart</span> Mua lại sản phẩm này
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ReportModal 
      v-if="userId && reportingOrder"
      :show="showReportModal"
      :order="reportingOrder"
      :userId="userId"
      @close="showReportModal = false"
      @success="fetchDetail"
    />
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
