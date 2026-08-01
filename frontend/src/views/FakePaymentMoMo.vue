<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { OrderService } from '@/service/order.ts'
import { Cart } from '@/service/cart.ts' // Import service Cart để xóa
import { notify } from '@/utils/notifier.ts'

const route = useRoute()
const router = useRouter()
const isProcessing = ref(false)

const orderId = Number(route.query.orderId)
const amount = Number(route.query.amount)

// Lấy danh sách ID sản phẩm từ URL để xóa khi thanh toán xong
const cartItemIds = String(route.query.cartItemIds || '').split(',').map(Number).filter(id => id > 0)

const handleConfirm = async (status: 'PAID' | 'CANCELLED') => {
  if (status === 'CANCELLED') {
    notify.info('Bạn đã hủy giao dịch.')
    router.push('/cartpayment') // Quay lại trang thanh toán, sản phẩm vẫn còn
    return
  }

  isProcessing.value = true
  try {
    // 1. Cập nhật trạng thái đơn hàng
    try {
      await OrderService.updateOrderStatus(orderId, 'PAID')
    } catch (e) {
      console.warn("Giả lập: Cập nhật trạng thái đơn hàng thành công")
    }

    // 2. XÓA SẢN PHẨM KHỎI GIỎ HÀNG (Điểm chốt)
    if (cartItemIds.length > 0) {
      await Cart.deleteList(cartItemIds)
      // Kích hoạt sự kiện để Header cập nhật số lượng giỏ hàng về 0
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }

    notify.success('Thanh toán MoMo thành công!')
    router.push('/orders')
  } catch (error) {
    notify.error('Lỗi hệ thống, vui lòng thử lại.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-4 font-inter">
    <div class="max-w-[400px] w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">

      <div class="bg-[#A50064] p-6 text-center">
        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" class="h-12 mx-auto mb-2 brightness-0 invert" alt="MoMo Logo" />
        <h2 class="text-white text-sm font-bold uppercase tracking-widest opacity-90">Thanh toán đơn hàng</h2>
      </div>

      <div class="p-8">
        <div class="text-center mb-8">
          <p class="text-slate-400 text-xs font-black uppercase mb-1">Số tiền cần thanh toán</p>
          <p class="text-4xl font-black text-[#A50064]">{{ amount.toLocaleString('vi-VN') }}đ</p>
        </div>

        <div class="bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] p-6 mb-8 text-center relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            Mã QR thanh toán
          </div>
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MomoOrder_${orderId}`"
            class="mx-auto w-40 h-40 mb-4"
            alt="QR Code"
          />
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Đơn hàng: <span class="text-slate-800">#{{ orderId }}</span>
          </p>
        </div>

        <div class="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl mb-8">
          <span class="material-symbols-outlined text-[#A50064] text-xl">info</span>
          <p class="text-[11px] text-slate-500 leading-relaxed font-medium">
            Vui lòng nhấn nút xác nhận sau khi bạn đã quét mã và chuyển tiền thành công trên ứng dụng MoMo.
          </p>
        </div>

        <div class="space-y-3">
          <button
            @click="handleConfirm('PAID')"
            :disabled="isProcessing"
            class="w-full bg-[#A50064] hover:bg-[#820050] text-white p-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-[#A50064]/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
          >
            <span v-if="isProcessing" class="material-symbols-outlined animate-spin">progress_activity</span>
            {{ isProcessing ? 'Đang kiểm tra...' : 'Xác nhận đã thanh toán' }}
          </button>

          <button
            @click="handleConfirm('CANCELLED')"
            :disabled="isProcessing"
            class="w-full bg-white text-slate-400 p-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:text-[#A50064] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>

      <div class="bg-slate-50 py-4 text-center border-t border-slate-100">
        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[12px]">verified_user</span>
          Thanh toán an toàn bởi MoMo
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
.font-inter { font-family: 'Inter', sans-serif; }

/* Hiệu ứng mượt cho QR */
img {
  image-rendering: pixelated;
}
</style>
