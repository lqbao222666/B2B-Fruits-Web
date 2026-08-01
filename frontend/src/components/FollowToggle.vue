<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { TheoDoiService } from '@/service/theo-doi';
import { notify } from '@/utils/notifier.ts';

const props = defineProps<{
  sellerId: number;
  sellerName: string;
}>();

const isSubscribed = ref(false);
const hasPurchased = ref(false);
const loading = ref(false);

const checkStatus = async () => {
  try {
    const res = await TheoDoiService.getStatus(props.sellerId);
    isSubscribed.value = res.data?.isSubscribed || res.isSubscribed;
    hasPurchased.value = res.data?.hasPurchased || res.hasPurchased;
  } catch (e) {
    console.error('Lỗi khi kiểm tra trạng thái theo dõi', e);
  }
};

const toggleFollow = async () => {
  if (!hasPurchased.value) {
    notify.error('Bạn chỉ có thể nhận thông báo từ nông dân bạn đã từng mua hàng.');
    return;
  }
  
  loading.value = true;
  try {
    const res = await TheoDoiService.toggleTheoDoi(props.sellerId);
    isSubscribed.value = res.data?.is_active || res.is_active;
    if (isSubscribed.value) {
      notify.success(`Đã bật thông báo từ ${props.sellerName}`);
    } else {
      notify.success(`Đã tắt thông báo từ ${props.sellerName}`);
    }
  } catch (e: any) {
    notify.error(e?.response?.data?.message || 'Lỗi khi thay đổi cài đặt thông báo');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkStatus();
});
</script>

<template>
  <button 
    v-if="hasPurchased"
    @click="toggleFollow" 
    :disabled="loading"
    class="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors mt-2 border"
    :class="isSubscribed ? 'bg-primary text-white border-primary hover:bg-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
  >
    <span class="material-symbols-outlined text-[14px]">
      {{ isSubscribed ? 'notifications_active' : 'notifications_off' }}
    </span>
    {{ isSubscribed ? 'Đang nhận thông báo' : 'Bật thông báo' }}
  </button>
</template>
