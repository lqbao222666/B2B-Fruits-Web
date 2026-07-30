<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DonHang } from '../service/donhang.ts'
import api from '../service/api.ts'
import ReportModal from '../components/ReportModal.vue'

const router = useRouter()
const userId = ref<number | null>(null)

const orders = ref<any[]>([])
const loading = ref(false)
const isCanceling = ref(false)

const showReportModal = ref(false)
const reportingOrder = ref<any>(null)

const getImageUrl = (images: any) => {
  if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0]
    const imgUrl = typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage.image_url || firstImage.hinh_anh_url)
    if (imgUrl) {
      return imgUrl.startsWith('http') ? imgUrl : `http://localhost:3000${imgUrl}`
    }
  }
  return 'https://placehold.co/300x300?text=AgroMarket'
}

// --- CẤU HÌNH CÁC TABS ---
const activeTab = ref<string>('ALL')

const tabs = [
  { id: 'ALL', label: 'Tất cả đơn', icon: 'all_inbox' },
  { id: 'cho_xac_nhan', label: 'Chờ xử lý', icon: 'pending_actions' },
  { id: 'da_xac_nhan', label: 'Đã cọc', icon: 'payments' },
  { id: 'dang_giao', label: 'Đang giao', icon: 'local_shipping' },
  { id: 'hoan_thanh', label: 'Hoàn thành', icon: 'check_circle' },
  { id: 'da_huy', label: 'Đã hủy', icon: 'cancel' },
]

const getOrderCount = (tabId: string) => {
  if (tabId === 'ALL') return orders.value.length
  return orders.value.filter((o) => o.trang_thai_don === tabId).length
}

const displayedOrders = computed(() => {
  if (activeTab.value === 'ALL') return orders.value
  return orders.value.filter((o) => o.trang_thai_don === activeTab.value)
})

// --- CÁC HÀM FORMAT ---
const formatCurrency = (amount: number | string) => {
  if (!amount) return '0đ'
  return Number(amount).toLocaleString('vi-VN') + 'đ'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const getStatusInfo = (status: string) => {
  const map: Record<string, any> = {
    cho_xac_nhan: { label: 'Chờ xử lý', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: 'hourglass_empty', step: 0 },
    da_xac_nhan: { label: 'Đã thanh toán cọc', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: 'verified', step: 1 },
    dang_giao: { label: 'Bắt đầu giao dịch', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: 'local_shipping', step: 2 },
    hoan_thanh: { label: 'Hoàn thành', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: 'task_alt', step: 3 },
    da_huy: { label: 'Đã hủy', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: 'block', step: -1 },
  }
  return map[status] || { label: status, color: 'text-slate-600 bg-slate-50 border-slate-200', icon: 'info', step: 0 }
}

const getTotalQuantity = (order: any) => {
  if (!order.chiTiets || order.chiTiets.length === 0) return 0;
  return order.chiTiets.reduce((sum: number, item: any) => sum + Number(item.so_luong), 0);
}

// --- CÁC HÀM GỌI API ---
const fetchOrders = async () => {
  if (!userId.value) return
  loading.value = true
  try {
    const res = await DonHang.getByUser(userId.value)
    orders.value = Array.isArray(res) ? res : res.data || []
  } catch (error: any) {
    notify.error(error?.message || 'Lỗi tải danh sách đơn hàng!')
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

    const index = orders.value.findIndex((o) => o.donhang_id === id)
    if (index !== -1) {
      orders.value[index].trang_thai_don = 'da_huy'
    }
  } catch (error) {
    notify.error('Không thể hủy đơn hàng lúc này. Vui lòng thử lại sau!')
  } finally {
    isCanceling.value = false
  }
}

const handleReportIssue = (order: any) => {
  reportingOrder.value = order
  showReportModal.value = true
}

const isUpdating = ref(false)
const showPaymentModal = ref(false)
const paymentStep = ref(0)
const selectedOrderId = ref<number | null>(null)
const selectedOrderTotal = ref<number>(0)
let paymentTimeout1: any = null
let paymentTimeout2: any = null

const handleUpdateStatus = async (orderId: number, newStatus: string, confirmMsg?: string) => {
  if (confirmMsg && !confirm(confirmMsg)) return;
  isUpdating.value = true;
  try {
    await api.patch(`/don-hang/${orderId}`, { trang_thai_don: newStatus });
    notify.success('Cập nhật trạng thái thành công!');
    await fetchOrders();
  } catch (error) {
    notify.error('Lỗi khi cập nhật trạng thái đơn hàng');
  } finally {
    isUpdating.value = false;
  }
}

const handleFinalPayment = (order: any) => {
  selectedOrderId.value = order.donhang_id
  selectedOrderTotal.value = order.tong_tien - (order.tien_coc || 0)
  showPaymentModal.value = true
  paymentStep.value = 0

  paymentTimeout1 = setTimeout(() => {
    paymentStep.value = 1
    paymentTimeout2 = setTimeout(() => {
      executeFinalPayment()
    }, 1000)
  }, 3000)
}

const cancelPayment = () => {
  clearTimeout(paymentTimeout1)
  clearTimeout(paymentTimeout2)
  showPaymentModal.value = false
}

const executeFinalPayment = async () => {
  if (!selectedOrderId.value) return
  isUpdating.value = true
  try {
    await api.patch(`/don-hang/${selectedOrderId.value}`, { trang_thai_don: 'hoan_thanh' })
    notify.success('Đã xác nhận nhận hàng và thanh toán thành công!')
    showPaymentModal.value = false
    await fetchOrders()
  } catch (error) {
    notify.error('Lỗi khi cập nhật trạng thái đơn hàng')
    showPaymentModal.value = false
  } finally {
    isUpdating.value = false
  }
}

const handleReorder = async (order: any) => {
  if (!order.baidang_id) {
    notify.error('Đơn hàng này không có sản phẩm để mua lại.')
    return
  }

  // Thay vì thêm vào giỏ hàng cũ, ta chuyển thẳng sang trang chi tiết để mua lại
  router.push(`/product/${order.baidang_id}`)
}

// --- CHUYỂN TRANG CHI TIẾT ---
const viewDetail = (id: number) => {
  router.push({ name: 'detailorders', params: { id: id } })
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const userData = JSON.parse(userStr)
      userId.value = userData.id
    } catch (e) {
      console.error('Lỗi đọc thông tin user từ localStorage', e)
    }
  }
  if (userId.value) fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Đơn hàng của tôi</h1>
          <p class="text-slate-500 mt-1">Quản lý giao dịch và theo dõi tiến trình</p>
        </div>
        <button @click="fetchOrders" class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#2E7D32] hover:border-[#2E7D32] transition-colors shadow-sm" title="Làm mới">
          <span class="material-symbols-outlined text-[20px]" :class="{'animate-spin': loading}">refresh</span>
        </button>
      </div>

      <!-- TABS -->
      <div class="bg-white rounded-2xl p-2 mb-6 border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
        <div class="flex gap-2 min-w-max">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 relative group overflow-hidden"
            :class="activeTab === tab.id ? 'text-[#2E7D32] bg-[#E8F5E9]' : 'text-slate-500 hover:bg-slate-50'"
          >
            <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
            <span class="text-sm">{{ tab.label }}</span>
            
            <div 
              v-if="getOrderCount(tab.id) > 0"
              class="ml-1 px-2 py-0.5 rounded-full text-[11px]"
              :class="activeTab === tab.id ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'"
            >
              {{ getOrderCount(tab.id) }}
            </div>
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div v-if="loading && orders.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-[#2E7D32] rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500 font-medium">Đang tải dữ liệu đơn hàng...</p>
      </div>

      <div v-else-if="displayedOrders.length === 0" class="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
        </div>
        <h3 class="text-xl font-black text-slate-700 mb-2">Chưa có đơn hàng nào</h3>
        <p class="text-slate-500 max-w-sm mb-8">Bạn hiện tại chưa có giao dịch nào ở trạng thái "{{ tabs.find(t => t.id === activeTab)?.label }}".</p>
        <RouterLink to="/products" class="bg-[#2E7D32] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg shadow-green-900/20">
          Khám phá nông sản ngay
        </RouterLink>
      </div>

      <div v-else class="grid gap-6">
        <div
          v-for="order in displayedOrders"
          :key="order.donhang_id"
          @click="viewDetail(order.donhang_id)"
          class="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 cursor-pointer hover:border-[#2E7D32] hover:shadow-xl transition-all duration-300 group flex flex-col relative overflow-hidden"
        >
          <!-- Status Banner for specific states -->
          <div v-if="order.trang_thai_don === 'da_xac_nhan'" class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">verified</span> Đã đặt cọc
          </div>
          
          <div v-if="order.trang_thai_don === 'dang_giao'" class="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">local_shipping</span> Bắt đầu giao dịch
          </div>

          <!-- Header: Order ID & Date -->
          <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32] group-hover:border-[#2E7D32]/20 transition-colors">
                <span class="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <div>
                <p class="text-sm text-slate-500 font-medium mb-0.5">Mã đơn hàng</p>
                <p class="font-black text-slate-800 text-lg uppercase">#{{ order.ma_don_hang || order.donhang_id }}</p>
              </div>
            </div>
            
            <div class="text-right">
              <p class="text-xs text-slate-400 font-medium mb-1">{{ formatDate(order.ngay_tao) }}</p>
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold" :class="getStatusInfo(order.trang_thai_don).color">
                <span class="material-symbols-outlined text-[16px]">{{ getStatusInfo(order.trang_thai_don).icon }}</span>
                {{ getStatusInfo(order.trang_thai_don).label }}
              </div>
            </div>
          </div>

          <!-- Body: Product Info & Price -->
          <div class="bg-slate-50 rounded-2xl p-4 flex flex-col md:flex-row gap-5 items-center justify-between border border-slate-100">
            <!-- Product -->
            <div class="flex items-center gap-4 w-full md:w-1/2">
              <img 
                :src="getImageUrl(order.baiDang?.images)" 
                class="w-20 h-20 rounded-xl object-cover shadow-sm border border-slate-200"
                alt="Product"
              />
              <div>
                <h4 class="font-bold text-slate-800 text-base mb-1 line-clamp-1">{{ order.baiDang?.ten_nong_san || 'Sản phẩm nông sản' }}</h4>
                <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <span class="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">{{ getTotalQuantity(order) }} {{ order.baiDang?.don_vi_tinh || 'kg' }}</span>
                  <span v-if="order.chiTiets?.length > 1" class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-bold">
                    {{ order.chiTiets.length }} loại
                  </span>
                </div>
                <!-- Partner Info -->
                <p class="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">person</span>
                  <span v-if="order.nguoi_mua_id === userId">Cung cấp bởi: <span class="font-bold text-slate-800">{{ order.nguoiBan?.user?.full_name || 'Nông dân' }}</span></span>
                  <span v-else>Khách mua: <span class="font-bold text-slate-800">{{ order.nguoiMua?.user?.full_name || 'Doanh nghiệp' }}</span></span>
                </p>
              </div>
            </div>
            
            <!-- Price Summary -->
            <div class="w-full md:w-auto flex md:flex-col justify-between md:justify-center items-center md:items-end gap-1 md:gap-2 px-4 md:px-0 py-2 md:py-0 border-t md:border-t-0 border-slate-200 mt-2 md:mt-0 pt-4 md:pt-0">
              <div class="text-left md:text-right">
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                <p class="text-2xl font-black text-[#d00000]">{{ formatCurrency(order.tong_tien) }}</p>
              </div>
              <div v-if="order.tien_coc > 0 && order.trang_thai_don !== 'da_huy'" class="bg-[#E8F5E9] border border-[#2E7D32]/20 px-3 py-1.5 rounded-lg flex flex-col items-end">
                <span class="text-[10px] font-bold text-[#2E7D32] uppercase">Tiền cọc cần thanh toán</span>
                <span class="text-sm font-black text-slate-800">{{ formatCurrency(order.tien_coc) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-5 flex justify-end gap-3 flex-wrap" @click.stop>
            
            <!-- Action buttons cho Nông dân (Người bán) -->
            <button
              v-if="order.trang_thai_don === 'cho_xac_nhan' && order.nguoi_ban_id === userId"
              @click="handleUpdateStatus(order.donhang_id, 'da_xac_nhan')"
              :disabled="isUpdating"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              Xác nhận đơn
            </button>

            <button
              v-if="order.trang_thai_don === 'da_xac_nhan' && order.nguoi_ban_id === userId"
              @click="handleUpdateStatus(order.donhang_id, 'dang_giao')"
              :disabled="isUpdating"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FFF3E0] text-[#E65100] hover:bg-[#FFE0B2] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[18px]">local_shipping</span>
              Bắt đầu giao
            </button>

            <button
              v-if="(order.trang_thai_don === 'dang_giao' || order.trang_thai_don === 'da_xac_nhan') && order.nguoi_mua_id === userId"
              @click="handleFinalPayment(order)"
              :disabled="isUpdating"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[18px]">payments</span>
              Đã nhận hàng & TT 85%
            </button>

            <button
              v-if="order.trang_thai_don === 'cho_xac_nhan' && order.nguoi_mua_id === userId"
              @click="handleCancelOrder(order.donhang_id)"
              :disabled="isCanceling"
              class="px-5 py-2.5 rounded-xl text-sm font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
              Hủy đơn
            </button>
            
            <button
              v-if="order.nguoi_ban_id === userId && !['hoan_thanh', 'da_huy'].includes(order.trang_thai_don)"
              @click="handleReportIssue(order)"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FFF8E1] border border-[#FFE082] text-[#FF8F00] hover:bg-[#FFECB3] transition-all flex items-center gap-2 shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">report_problem</span>
              Báo cáo sự cố
            </button>
            
            <button
              @click="viewDetail(order.donhang_id)"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Xem chi tiết
            </button>
            
            <button
              v-if="['hoan_thanh', 'da_huy'].includes(order.trang_thai_don) && order.nguoi_mua_id === userId"
              @click="handleReorder(order)"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
              Mua lại
            </button>
          </div>
        </div>
      </div>

      <ReportModal 
        v-if="userId && reportingOrder"
        :show="showReportModal"
        :order="reportingOrder"
        :userId="userId"
        @close="showReportModal = false"
        @success="fetchOrders"
      />

      <!-- Modal Thanh Toán TT 85% -->
      <div v-if="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden text-center">
          <button v-if="paymentStep === 0" @click="cancelPayment" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <h3 class="text-2xl font-black text-slate-800 mb-6 font-sans">
            Thanh toán 85% còn lại
          </h3>
          <p class="text-slate-600 text-sm mb-4">Mở app Ngân hàng hoặc MoMo để quét mã QR dưới đây</p>

          <div class="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center mb-6 relative">
            <div v-if="paymentStep === 0" class="w-48 h-48 bg-white border-4 border-[#2E7D32] p-2 rounded-xl">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=B2B_NONG_SAN_MOCK_PAYMENT_85" alt="QR Code" class="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <!-- Scanning overlay -->
            <div v-if="paymentStep === 0" class="absolute inset-0 flex items-center justify-center flex-col gap-3">
               <div class="w-full h-1 bg-[#2E7D32]/50 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_#2E7D32]"></div>
            </div>
            
            <!-- Success State -->
            <div v-if="paymentStep === 1" class="w-48 h-48 bg-white rounded-xl flex flex-col items-center justify-center text-[#2E7D32]">
              <span class="material-symbols-outlined text-7xl mb-2">check_circle</span>
              <span class="font-bold">Đã nhận thanh toán!</span>
            </div>
          </div>

          <div class="bg-[#e8f5e9] p-4 rounded-xl border border-[#2E7D32]/20 mb-6">
            <div class="flex justify-between items-center text-base font-black text-slate-900 pt-2">
              <span>Số tiền cần thanh toán:</span>
              <span class="text-xl text-[#d00000]">{{ formatCurrency(selectedOrderTotal) }}</span>
            </div>
          </div>
          
          <p v-if="paymentStep === 0" class="text-xs text-slate-500 flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[14px] animate-spin">sync</span>
            Đang chờ quét mã thanh toán...
          </p>

          <button v-if="paymentStep === 0" @click="cancelPayment" class="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all w-full">
            Hủy thanh toán
          </button>
          
          <p v-if="paymentStep === 1" class="text-sm font-bold text-[#2E7D32] flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            Đang hoàn tất đơn hàng...
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
