<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { OrderService } from '@/service/order.ts'
import { Cart } from '@/service/cart.ts' // Import service Cart
import { notify } from '@/utils/notifier.ts'

const route = useRoute()
const router = useRouter()
const isProcessing = ref(false)

const orderId = Number(route.query.orderId)
const amountVnd = Number(route.query.amount)

// Lấy danh sách ID sản phẩm để xóa khi thanh toán xong
const cartItemIds = String(route.query.cartItemIds || '').split(',').map(Number).filter(id => id > 0)

const amountUsd = computed(() => (amountVnd / 25000).toFixed(2))

const handleConfirm = async (status: 'PAID' | 'CANCELLED') => {
  if (status === 'CANCELLED') {
    notify.info('Transaction cancelled.')
    router.push('/cartpayment') // Quay lại, sản phẩm vẫn còn
    return
  }

  isProcessing.value = true
  try {
    // 1. Cập nhật trạng thái đơn hàng
    try {
      await OrderService.updateOrderStatus(orderId, { status: 'PAID' })
    } catch (e) {
      console.warn("Simulated: Order status updated to PAID")
    }

    // 2. XÓA SẢN PHẨM KHỎI GIỎ HÀNG (Điểm chốt)
    if (cartItemIds.length > 0) {
      await Cart.deleteList(cartItemIds)
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }

    notify.success('PayPal: Payment successful!')
    router.push('/orders')
  } catch (error) {
    notify.error('PayPal: Payment failed.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-inter">
    <div class="max-w-[450px] w-full bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">

      <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" class="h-7" alt="PayPal Logo" />
        <div class="text-right">
          <p class="text-2xl font-medium text-[#2c2e2f]">${{ amountUsd }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
        </div>
      </div>

      <div class="p-8">
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-[#2c2e2f] mb-4">Pay with PayPal</h3>
          <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div class="w-12 h-12 bg-white rounded-md border border-slate-200 flex items-center justify-center">
              <span class="material-symbols-outlined text-[#0070ba]">shopping_cart</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-700">Order #{{ orderId }}</p>
              <p class="text-xs text-slate-400">Zero Waste Store Checkout</p>
            </div>
          </div>
        </div>

        <div class="mb-8 p-5 rounded-xl border-2 border-[#0070ba] bg-[#f0f7fd] flex items-center gap-4 relative">
          <div class="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-[#0070ba] uppercase tracking-widest">
            Payment Method
          </div>
          <span class="material-symbols-outlined text-3xl text-[#003087]">credit_card</span>
          <div>
            <p class="text-sm font-bold text-slate-800">Visa •••• 4242</p>
            <p class="text-xs text-slate-500">Fast and secure payment</p>
          </div>
          <span class="material-symbols-outlined ml-auto text-slate-400">check_circle</span>
        </div>

        <div class="space-y-4">
          <button
            @click="handleConfirm('PAID')"
            :disabled="isProcessing"
            class="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white py-4 rounded-full font-bold text-lg transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            <span v-if="isProcessing" class="material-symbols-outlined animate-spin">progress_activity</span>
            {{ isProcessing ? 'Processing...' : 'Complete Purchase' }}
          </button>

          <button
            @click="handleConfirm('CANCELLED')"
            :disabled="isProcessing"
            class="w-full bg-white text-[#0070ba] py-2 rounded-full font-bold text-sm hover:underline transition-all"
          >
            Cancel and return to store
          </button>
        </div>
      </div>

      <div class="bg-slate-50 p-6 text-center border-t border-slate-100 space-y-4">
        <div class="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <span>Policies</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
        <p class="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[14px]">lock</span>
          Secure Checkout. Powered by PayPal.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.font-inter { font-family: 'Inter', sans-serif; }
</style>
