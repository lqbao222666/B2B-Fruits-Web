<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/service/api.ts'
import { notify } from '@/utils/notifier.ts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const router = useRouter()
const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

const cartItems = ref<any[]>([])
const loading = ref(true)
const activeTab = ref<'cart' | 'orders'>('cart')
const myOrders = ref<any[]>([])
const loadingOrders = ref(false)
const payingOrder = ref<any>(null)
const showPayRemainingModal = ref(false)
const remainingPaymentMethod = ref('chuyen_khoan')
const isPayingRemaining = ref(false)

const fetchMyOrders = async () => {
  if (!user) return
  loadingOrders.value = true
  try {
    const res = await api.get(`/don-hang/user/${user.user_id || user.id}`)
    myOrders.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loadingOrders.value = false
  }
}

const openPayRemaining = (order: any) => {
  payingOrder.value = order
  showPayRemainingModal.value = true
}

const confirmPayRemaining = async () => {
  if (!payingOrder.value) return
  isPayingRemaining.value = true
  try {
    await api.patch(`/don-hang/${payingOrder.value.donhang_id}`, {
      trang_thai_don: 'hoan_thanh',
      trang_thai_tt: 'da_thanh_toan',
      phuong_thuc_tt: remainingPaymentMethod.value,
      ngay_hoan_thanh: new Date()
    })
    notify.success('Xác nhận đã nhận hàng & Thanh toán 85% còn lại thành công!')
    showPayRemainingModal.value = false
    await fetchMyOrders()
  } catch (err: any) {
    console.error(err)
    notify.error('Lỗi khi hoàn tất thanh toán!')
  } finally {
    isPayingRemaining.value = false
  }
}

// State giỏ hàng
const selectedItemIds = ref<number[]>([])

// Phân nhóm giỏ hàng theo bài đăng
const groupedCart = computed(() => {
  const map = new Map<number, any>()
  cartItems.value.forEach(item => {
    if (!map.has(item.baidang_id)) {
      map.set(item.baidang_id, {
        baidang_id: item.baidang_id,
        tieu_de: item.baiDang.tieu_de,
        ten_nong_san: item.baiDang.ten_nong_san,
        nguoi_ban_id: item.baiDang.nguoi_dang_id,
        items: []
      })
    }
    map.get(item.baidang_id).items.push(item)
  })
  return Array.from(map.values())
})

const isItemSelected = (id: number) => selectedItemIds.value.includes(id)

const toggleItemSelection = (id: number) => {
  if (selectedItemIds.value.includes(id)) {
    selectedItemIds.value = selectedItemIds.value.filter(i => i !== id)
  } else {
    selectedItemIds.value.push(id)
  }
}

const isGroupSelected = (group: any) => {
  return group.items.length > 0 && group.items.every((i: any) => selectedItemIds.value.includes(i.id))
}

const toggleGroupSelection = (group: any) => {
  const allGroupIds = group.items.map((i: any) => i.id)
  if (isGroupSelected(group)) {
    selectedItemIds.value = selectedItemIds.value.filter(id => !allGroupIds.includes(id))
  } else {
    allGroupIds.forEach((id: number) => {
      if (!selectedItemIds.value.includes(id)) selectedItemIds.value.push(id)
    })
  }
}

const getGroupSubtotal = (group: any) => {
  let sum = 0
  group.items.forEach((item: any) => {
    if (selectedItemIds.value.includes(item.id)) {
      sum += Number(item.so_luong) * Number(item.phanLoai.gia)
    }
  })
  return sum
}

const fetchCart = async () => {
  if (!user) {
    router.push('/login')
    return
  }
  loading.value = true
  try {
    const res = await api.get('/gio-hang')
    cartItems.value = res.data || []
    if (cartItems.value.length > 0) {
      // Auto select all items by default
      selectedItemIds.value = cartItems.value.map(i => i.id)
    }
  } catch (err: any) {
    console.error(err)
    notify.error('Lỗi khi tải giỏ hàng')
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (id: number, current: number, change: number, maxStock: number) => {
  const newQty = current + change
  if (newQty < 1 || newQty > maxStock) return
  try {
    await api.patch(`/gio-hang/${id}`, { so_luong: newQty })
    const item = cartItems.value.find(i => i.id === id)
    if (item) item.so_luong = newQty
    updateCheckoutTotals()
  } catch (err) {
    notify.error('Lỗi khi cập nhật số lượng')
  }
}

const handleCartQtyInputChange = async (item: any, valStr: string) => {
  let val = parseInt(valStr)
  const maxStock = Number(item.phanLoai.so_luong_con_lai)
  if (isNaN(val) || val < 1) val = 1
  if (val > maxStock) {
    val = maxStock
    notify.info(`Số lượng tối đa còn lại là ${maxStock}`)
  }
  try {
    await api.patch(`/gio-hang/${item.id}`, { so_luong: val })
    item.so_luong = val
    updateCheckoutTotals()
  } catch (err) {
    notify.error('Lỗi khi cập nhật số lượng')
  }
}

const removeItem = async (id: number) => {
  if (!confirm('Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?')) return
  try {
    await api.delete(`/gio-hang/${id}`)
    cartItems.value = cartItems.value.filter(i => i.id !== id)
    selectedItemIds.value = selectedItemIds.value.filter(i => i !== id)
    notify.success('Đã xoá sản phẩm khỏi giỏ hàng')
  } catch (err) {
    notify.error('Lỗi khi xoá sản phẩm')
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

// === LOGIC CHECKOUT ===
const showCheckoutModal = ref(false)
const checkoutGroup = ref<any>(null)

// Checkout Map State
const deliveryLocation = ref<{ lat: number, lng: number } | null>(null)
const deliveryAddress = ref('')
const deliveryPhone = ref('')
const deliveryName = ref(user?.full_name || user?.username || '')
const distanceKm = ref(0)
let map: L.Map | null = null
let userMarker: L.Marker | null = null

const savedLocations = ref<any[]>([])
const searchLocationText = ref('')
const selectedSavedLocation = ref('')
const saveLocationName = ref('')
const isSavingLocation = ref(false)
const isSearching = ref(false)
const isProcessing = ref(false)

const loadSavedWarehouse = () => {
  const savedStr = localStorage.getItem('user_warehouse_location')
  if (savedStr) {
    try {
      const parsed = JSON.parse(savedStr)
      if (parsed && parsed.lat && parsed.lng) {
        deliveryLocation.value = { lat: Number(parsed.lat), lng: Number(parsed.lng) }
        if (parsed.address) deliveryAddress.value = parsed.address
        if (parsed.savedId) selectedSavedLocation.value = parsed.savedId
      }
    } catch (err) {}
  }
}

const totalCheckoutItemsCount = computed(() => {
  let count = 0
  const itemsToCount = checkoutGroup.value 
    ? checkoutGroup.value.items.filter((i: any) => selectedItemIds.value.includes(i.id))
    : cartItems.value.filter(i => selectedItemIds.value.includes(i.id))
  itemsToCount.forEach((i: any) => {
    count += Number(i.so_luong)
  })
  return count
})

const totalCheckoutGoods = computed(() => {
  let sum = 0
  const itemsToCount = checkoutGroup.value 
    ? checkoutGroup.value.items.filter((i: any) => selectedItemIds.value.includes(i.id))
    : cartItems.value.filter(i => selectedItemIds.value.includes(i.id))
  itemsToCount.forEach((i: any) => {
    sum += Number(i.so_luong) * Number(i.phanLoai.gia)
  })
  return sum
})

const totalCheckoutShipping = computed(() => {
  if (!deliveryLocation.value) return 0
  
  const groupsToCalculate = checkoutGroup.value 
    ? [checkoutGroup.value] 
    : groupedCart.value.filter(g => g.items.some((i: any) => selectedItemIds.value.includes(i.id)))
    
  let totalShipping = 0
  groupsToCalculate.forEach(g => {
    const selectedInGroup = g.items.filter((i: any) => selectedItemIds.value.includes(i.id))
    if (selectedInGroup.length > 0) {
      let groupQty = 0
      selectedInGroup.forEach((i: any) => groupQty += Number(i.so_luong))
      
      const firstItem = selectedInGroup[0]
      const farmerLat = firstItem.baiDang.latitude ? Number(firstItem.baiDang.latitude) : 10.762622
      const farmerLng = firstItem.baiDang.longitude ? Number(firstItem.baiDang.longitude) : 106.660172
      
      const dist = haversineDistance(farmerLat, farmerLng, deliveryLocation.value!.lat, deliveryLocation.value!.lng)
      totalShipping += calculateShippingFee(groupQty, dist)
    }
  })
  return totalShipping
})

const updateCheckoutTotals = () => {
  if (deliveryLocation.value) {
    const firstItem = checkoutGroup.value ? checkoutGroup.value.items[0] : cartItems.value[0]
    if (firstItem && firstItem.baiDang) {
      const farmerLat = firstItem.baiDang.latitude ? Number(firstItem.baiDang.latitude) : 10.762622
      const farmerLng = firstItem.baiDang.longitude ? Number(firstItem.baiDang.longitude) : 106.660172
      distanceKm.value = haversineDistance(farmerLat, farmerLng, deliveryLocation.value.lat, deliveryLocation.value.lng)
    }
  }
}

const openCheckout = (group?: any) => {
  if (group) {
    const selectedInGroup = group.items.filter((i: any) => selectedItemIds.value.includes(i.id))
    if (selectedInGroup.length === 0) {
      group.items.forEach((i: any) => {
        if (!selectedItemIds.value.includes(i.id)) selectedItemIds.value.push(i.id)
      })
    }
    checkoutGroup.value = group
  } else {
    if (selectedItemIds.value.length === 0) {
      notify.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!')
      return
    }
    checkoutGroup.value = null
  }

  showCheckoutModal.value = true
  fetchSavedLocations()
  loadSavedWarehouse()
  setTimeout(() => {
    initMap()
    if (deliveryLocation.value) {
      moveToLocation(deliveryLocation.value.lat, deliveryLocation.value.lng)
    }
  }, 200)
}

const fetchSavedLocations = async () => {
  try {
    const res = await api.get(`/dia-chi-luu/user/${user.user_id || user.id}`)
    savedLocations.value = res.data || []
  } catch (err) {
    console.error(err)
  }
}

const moveToLocation = (lat: number, lng: number) => {
  if (!map) return;
  map.setView([lat, lng], 14);
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([lat, lng]).addTo(map);
  deliveryLocation.value = { lat, lng };
  
  const targetGroup = checkoutGroup.value || groupedCart.value[0]
  if (targetGroup && targetGroup.items.length > 0) {
    const firstItem = targetGroup.items[0]
    const farmerLat = firstItem.baiDang.latitude ? Number(firstItem.baiDang.latitude) : 10.762622;
    const farmerLng = firstItem.baiDang.longitude ? Number(firstItem.baiDang.longitude) : 106.660172;
    distanceKm.value = haversineDistance(farmerLat, farmerLng, lat, lng);
  }
}

const handleSearchLocation = async () => {
  if (!searchLocationText.value) return;
  const text = searchLocationText.value.trim();
  
  const coordRegex = /^\s*\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?\s*$/;
  const match = text.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    moveToLocation(lat, lng);
    return;
  }
  
  isSearching.value = true;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      moveToLocation(lat, lng);
    } else {
      notify.error('Không tìm thấy địa điểm này!');
    }
  } catch (e) {
    notify.error('Lỗi khi tìm kiếm địa điểm!');
  } finally {
    isSearching.value = false;
  }
}

import { watch } from 'vue'
watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find(l => l.id == val)
    if (loc) {
      moveToLocation(Number(loc.latitude), Number(loc.longitude))
      deliveryAddress.value = loc.dia_chi || ''
    }
  }
})

const initMap = () => {
  if (map) return;
  const targetGroup = checkoutGroup.value || groupedCart.value[0]
  if (!targetGroup || !targetGroup.items || targetGroup.items.length === 0) return

  const firstItem = targetGroup.items[0]
  const farmerLat = firstItem.baiDang.latitude ? Number(firstItem.baiDang.latitude) : 10.762622;
  const farmerLng = firstItem.baiDang.longitude ? Number(firstItem.baiDang.longitude) : 106.660172;

  map = L.map('checkout-map').setView([farmerLat, farmerLng], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([farmerLat, farmerLng]).addTo(map).bindPopup('Vị trí lấy hàng (Nông dân)').openPopup();

  map.on('click', (e: L.LeafletMouseEvent) => {
    moveToLocation(e.latlng.lat, e.latlng.lng);
  });
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

const calculateShippingFee = (so_luong: number, khoang_cach: number): number => {
    if (!khoang_cach || khoang_cach <= 0) return 0;
    
    let base_price = 0;
    let price_per_km = 0;
    
    if (so_luong < 1500) { 
      base_price = 200000;
      if (khoang_cach <= 50) price_per_km = 18000;
      else if (khoang_cach <= 200) price_per_km = 15000;
      else price_per_km = 12000;
    } else if (so_luong <= 3000) { 
      base_price = 400000;
      if (khoang_cach <= 50) price_per_km = 19000;
      else if (khoang_cach <= 200) price_per_km = 17500;
      else price_per_km = 15500;
    } else if (so_luong <= 5000) { 
      base_price = 700000;
      if (khoang_cach <= 50) price_per_km = 23000;
      else if (khoang_cach <= 200) price_per_km = 21000;
      else price_per_km = 18000;
    } else { 
      base_price = 1250000;
      if (khoang_cach <= 50) price_per_km = 26000;
      else if (khoang_cach <= 200) price_per_km = 24500;
      else price_per_km = 22500;
    }
    
    let fee = base_price;
    if (khoang_cach > 4) {
      fee += (khoang_cach - 4) * price_per_km;
    }
    return fee;
}

// State Giả lập Thanh toán QR 3s
const showMockPaymentModal = ref(false)
const mockPaymentCountdown = ref(3)
const isMockPaymentSuccess = ref(false)
const mockPaymentAmount = ref(0)
let mockTimer: any = null

const startMockPayment = () => {
  if (!deliveryLocation.value) {
    notify.error('Vui lòng chọn vị trí giao hàng trên bản đồ!');
    return;
  }
  if (!deliveryAddress.value || !deliveryPhone.value || !deliveryName.value) {
    notify.error('Vui lòng nhập đầy đủ thông tin giao nhận hàng!');
    return;
  }

  const grandTotal = totalCheckoutGoods.value + totalCheckoutShipping.value
  mockPaymentAmount.value = grandTotal * 0.15

  showCheckoutModal.value = false
  showMockPaymentModal.value = true
  mockPaymentCountdown.value = 3
  isMockPaymentSuccess.value = false

  if (mockTimer) clearInterval(mockTimer)

  mockTimer = setInterval(async () => {
    if (mockPaymentCountdown.value > 1) {
      mockPaymentCountdown.value--
    } else {
      clearInterval(mockTimer)
      mockPaymentCountdown.value = 0
      isMockPaymentSuccess.value = true
      await executeCheckout()
    }
  }, 1000)
}

const closeMockPaymentModal = () => {
  showMockPaymentModal.value = false
  if (mockTimer) clearInterval(mockTimer)
}

const executeCheckout = async () => {
  isProcessing.value = true;
  try {
    const groupsToProcess = checkoutGroup.value 
      ? [checkoutGroup.value] 
      : groupedCart.value.filter(g => g.items.some((i: any) => selectedItemIds.value.includes(i.id)))

    for (const group of groupsToProcess) {
      const selectedInGroup = group.items.filter((i: any) => selectedItemIds.value.includes(i.id))
      if (selectedInGroup.length === 0) continue

      const firstItem = selectedInGroup[0]
      const farmerLat = firstItem.baiDang.latitude ? Number(firstItem.baiDang.latitude) : 10.762622
      const farmerLng = firstItem.baiDang.longitude ? Number(firstItem.baiDang.longitude) : 106.660172
      
      const groupDist = haversineDistance(farmerLat, farmerLng, deliveryLocation.value!.lat, deliveryLocation.value!.lng)

      const payload = {
        nguoi_ban_id: Number(group.nguoi_ban_id),
        baidang_id: Number(group.baidang_id),
        giohang_ids: selectedInGroup.map((i: any) => Number(i.id)),
        dia_chi_giao: `${deliveryName.value} - ${deliveryPhone.value} - ${deliveryAddress.value}`,
        tinh_thanh_giao: firstItem.baiDang.tinh_thanh || 'Cần Thơ',
        hinh_thuc_giao_hang: 'giao_tan_noi',
        khoang_cach: Number(groupDist.toFixed(2)),
      }
      
      await api.post('/don-hang/checkout', payload)
    }

    if (isSavingLocation.value && saveLocationName.value && deliveryLocation.value) {
      try {
        await api.post('/dia-chi-luu', {
          user_id: Number(user.user_id || user.id),
          ten_goi: saveLocationName.value,
          dia_chi: deliveryAddress.value,
          latitude: deliveryLocation.value.lat,
          longitude: deliveryLocation.value.lng
        });
      } catch (err) {}
    }

    setTimeout(async () => {
      notify.success('Đã quét mã & Đặt cọc 15% thành công!');
      showMockPaymentModal.value = false;
      await fetchCart();
      activeTab.value = 'orders';
      await fetchMyOrders();
    }, 800)
  } catch (e: any) {
    console.error(e);
    notify.error(e.response?.data?.message || 'Lỗi khi tạo đơn hàng!');
    showMockPaymentModal.value = false;
  } finally {
    isProcessing.value = false;
  }
}

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <main class="mx-auto max-w-[1000px] w-full px-4 py-8 font-sans">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-3xl font-black text-slate-900 flex items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-[#2E7D32]">shopping_cart</span>
        Quản lý Giỏ hàng & Thanh toán lô hàng
      </h1>
      <button v-if="activeTab === 'cart' && cartItems.length > 0" 
              @click="openCheckout()" 
              class="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95">
        <span class="material-symbols-outlined text-xl">payments</span>
        Đặt cọc 15% Tất cả đơn đã chọn
      </button>
    </div>

    <!-- Tab Navigation -->
    <div class="flex border-b border-slate-200 mb-8 gap-4">
      <button @click="activeTab = 'cart'" 
              class="pb-3 px-2 font-bold text-base transition-colors border-b-2 flex items-center gap-2 cursor-pointer"
              :class="activeTab === 'cart' ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-transparent text-slate-400 hover:text-slate-600'">
        <span class="material-symbols-outlined text-xl">shopping_bag</span>
        Giỏ hàng sản phẩm ({{ cartItems.length }})
      </button>
      <button @click="activeTab = 'orders'; fetchMyOrders();" 
              class="pb-3 px-2 font-bold text-base transition-colors border-b-2 flex items-center gap-2 cursor-pointer"
              :class="activeTab === 'orders' ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-transparent text-slate-400 hover:text-slate-600'">
        <span class="material-symbols-outlined text-xl">local_shipping</span>
        Đơn hàng đã đặt & Thanh toán 85% còn lại ({{ myOrders.length }})
      </button>
    </div>

    <!-- TAB 1: GIỎ HÀNG -->
    <div v-if="activeTab === 'cart'">
      <div v-if="loading" class="flex justify-center py-20 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl text-[#2E7D32]">sync</span>
      </div>

      <div v-else-if="groupedCart.length === 0" class="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">remove_shopping_cart</span>
        <p class="font-bold text-lg text-slate-500 mb-4">Giỏ hàng trống</p>
        <button @click="router.push('/products')" class="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-colors">
          Tiếp tục mua sắm
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Mỗi group là 1 lô hàng -->
        <div v-for="group in groupedCart" :key="group.baidang_id" class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 class="font-black text-slate-800 text-lg flex items-center gap-2">
              <span class="material-symbols-outlined text-[#2E7D32]">store</span>
              Lô hàng: {{ group.tieu_de }}
            </h2>
            <!-- Select All cho group -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" 
                     :checked="isGroupSelected(group)"
                     @change="toggleGroupSelection(group)"
                     class="w-5 h-5 text-[#2E7D32] rounded focus:ring-[#2E7D32]" />
              <span class="text-sm font-bold text-slate-600">Chọn tất cả loại trong lô</span>
            </label>
          </div>

          <div class="divide-y divide-slate-100">
            <div v-for="item in group.items" :key="item.id" class="p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-slate-50/50 transition-colors">
              
              <input type="checkbox" :checked="isItemSelected(item.id)" @change="toggleItemSelection(item.id)" class="w-5 h-5 text-[#2E7D32] rounded focus:ring-[#2E7D32]" />

              <div class="flex-1">
                <h3 class="font-bold text-slate-800 text-lg">{{ item.phanLoai.ten_phan_loai }}</h3>
                <p class="text-sm font-bold text-[#d00000]">{{ formatPrice(item.phanLoai.gia) }} <span class="text-xs text-slate-500 font-normal">/ {{ item.baiDang.don_vi_tinh }}</span></p>
                <p class="text-xs text-slate-500 mt-1">Còn lại: {{ item.phanLoai.so_luong_con_lai }} {{ item.baiDang.don_vi_tinh }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button @click="updateQuantity(item.id, Number(item.so_luong), -1, Number(item.phanLoai.so_luong_con_lai))" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black transition-colors">-</button>
                <input type="number" 
                       :value="item.so_luong" 
                       @change="e => handleCartQtyInputChange(item, (e.target as HTMLInputElement).value)" 
                       min="1" 
                       :max="item.phanLoai.so_luong_con_lai" 
                       class="w-20 h-8 text-center font-black text-base border border-slate-200 rounded-lg focus:border-[#2E7D32] focus:outline-none bg-white" />
                <button @click="updateQuantity(item.id, Number(item.so_luong), 1, Number(item.phanLoai.so_luong_con_lai))" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black transition-colors">+</button>
              </div>

              <div class="w-32 text-right">
                <p class="font-black text-[#d00000]">{{ formatPrice(Number(item.so_luong) * Number(item.phanLoai.gia)) }}</p>
              </div>

              <button @click="removeItem(item.id)" class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>

          <div class="bg-slate-50 px-6 py-5 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-sm font-bold text-slate-600 flex flex-wrap items-center gap-4">
              <span>Đã chọn: <strong class="text-[#2E7D32]">{{ group.items.filter((i: any) => isItemSelected(i.id)).length }}</strong> loại</span>
              <span>&bull;</span>
              <span>Tiền hàng lô: <strong class="text-[#d00000] text-base">{{ formatPrice(getGroupSubtotal(group)) }}</strong></span>
            </div>
            <button @click="openCheckout(group)" class="px-8 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">shopping_bag</span>
              Đặt cọc 15% & Đặt lô hàng này
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: ĐƠN HÀNG CỦA TÔI & THANH TOÁN 85% CÒN LẠI -->
    <div v-else-if="activeTab === 'orders'" class="space-y-6">
      <div v-if="loadingOrders" class="flex justify-center py-20 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl text-[#2E7D32]">sync</span>
      </div>

      <div v-else-if="myOrders.length === 0" class="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">inventory_2</span>
        <p class="font-bold text-lg text-slate-500">Bạn chưa có đơn hàng nào.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in myOrders" :key="order.donhang_id" class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-3">
              <span class="font-black text-slate-900 text-base">Mã đơn: #{{ order.ma_don_hang || order.donhang_id }}</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="order.trang_thai_don === 'hoan_thanh' ? 'bg-green-100 text-green-700' : (order.trang_thai_don === 'da_huy' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')">
                {{ order.trang_thai_don === 'hoan_thanh' ? 'Đã hoàn thành 100%' : (order.trang_thai_don === 'da_huy' ? 'Đã hủy' : 'Đã đặt cọc 15%') }}
              </span>
            </div>
            <p class="text-base font-bold text-slate-800">{{ order.baiDang?.tieu_de || order.baiDang?.ten_nong_san }}</p>
            <p class="text-xs text-slate-500">Giao tới: {{ order.dia_chi_giao }}</p>
            <div class="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <span>Tổng giá trị đơn: <strong class="text-slate-900">{{ formatPrice(Number(order.tong_tien)) }}</strong></span>
              <span>Đã cọc (15%): <strong class="text-[#2E7D32]">{{ formatPrice(Number(order.tien_coc || Number(order.tong_tien)*0.15)) }}</strong></span>
              <span>Còn lại (85%): <strong class="text-[#d00000]">{{ formatPrice(Number(order.tong_tien) - Number(order.tien_coc || Number(order.tong_tien)*0.15)) }}</strong></span>
            </div>
          </div>

          <div class="flex flex-col gap-2 w-full md:w-auto">
            <button v-if="order.trang_thai_don !== 'hoan_thanh' && order.trang_thai_don !== 'da_huy'"
                    @click="openPayRemaining(order)"
                    class="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-sm">verified</span>
              Xác nhận nhận hàng & Thanh toán 85% còn lại
            </button>
            <div v-else class="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl text-center border border-green-200 flex items-center gap-1.5 justify-center">
              <span class="material-symbols-outlined text-sm">check_circle</span> Đã thanh toán đủ 100%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHECKOUT MODAL (Đặt cọc 15%) -->
    <div v-if="showCheckoutModal" class="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-fit max-h-fit flex flex-col relative mt-16 mb-10">
        <button @click="showCheckoutModal = false" class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10">
          <span class="material-symbols-outlined text-slate-600">close</span>
        </button>
        
        <div class="p-6 md:p-8">
          <div class="mb-6">
            <h2 class="text-2xl font-black text-slate-900 uppercase italic">Xác Nhận Đặt Cọc 15% & Tạo Đơn Hàng</h2>
            <p class="text-sm font-bold text-[#2E7D32] mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-base">inventory_2</span>
              {{ checkoutGroup ? 'Bài đăng lô hàng: ' + checkoutGroup.tieu_de : 'Thanh toán gộp cho tất cả các lô hàng đã chọn trong giỏ' }}
            </p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left col: Map -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="font-bold text-slate-700 text-sm">1. Vị trí giao nhận hàng (Đã tự động lấy từ Chi Tiết)</p>
                <select v-if="savedLocations.length > 0" v-model="selectedSavedLocation" class="text-xs p-2 border border-slate-200 rounded-lg outline-none bg-slate-50 cursor-pointer w-48 text-ellipsis overflow-hidden whitespace-nowrap">
                  <option value="">-- Chọn kho đã lưu --</option>
                  <option v-for="loc in savedLocations" :key="loc.id" :value="loc.id">{{ loc.ten_goi }}</option>
                </select>
              </div>
              
              <div class="flex gap-2">
                <input v-model="searchLocationText" @keyup.enter="handleSearchLocation" type="text" placeholder="Nhập địa chỉ (VD: Đồng Tháp) hoặc Tọa độ (lat, lng)..." class="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-[#2E7D32]" />
                <button @click="handleSearchLocation" :disabled="isSearching" class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 rounded-xl flex items-center justify-center transition-colors">
                  <span v-if="isSearching" class="animate-spin material-symbols-outlined text-sm">sync</span>
                  <span v-else class="material-symbols-outlined text-sm">search</span>
                </button>
              </div>

              <div id="checkout-map" class="w-full h-[320px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative z-0"></div>
              
              <div v-if="deliveryLocation && !selectedSavedLocation" class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label class="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" v-model="isSavingLocation" class="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]" />
                  <span class="text-sm font-bold text-slate-700">Lưu tọa độ kho này cho lần sau</span>
                </label>
                <div v-if="isSavingLocation" class="flex gap-2">
                  <input v-model="saveLocationName" type="text" placeholder="Nhập tên gợi nhớ (VD: Kho hàng 1)..." class="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none focus:border-[#2E7D32]" />
                </div>
              </div>

              <div v-if="distanceKm > 0" class="bg-[#E8F5E9] p-3.5 rounded-xl border border-[#2E7D32]/20 flex justify-between items-center">
                <span class="font-bold text-[#2E7D32] text-sm">Khoảng cách tới vườn:</span>
                <span class="font-black text-xl text-[#2E7D32]">{{ distanceKm.toFixed(2) }} km</span>
              </div>
            </div>
            
            <!-- Right col: Info & Explicit 15% Breakdown -->
            <div class="space-y-6 flex flex-col">
              <div>
                <p class="font-bold text-slate-700 text-sm mb-3">2. Thông tin người nhận hàng</p>
                <div class="space-y-3">
                  <input v-model="deliveryName" type="text" placeholder="Tên người nhận" class="w-full p-3 rounded-xl border border-slate-200 focus:border-[#2E7D32] outline-none text-sm font-medium" />
                  <input v-model="deliveryPhone" type="text" placeholder="Số điện thoại" class="w-full p-3 rounded-xl border border-slate-200 focus:border-[#2E7D32] outline-none text-sm font-medium" />
                  <textarea v-model="deliveryAddress" placeholder="Địa chỉ chi tiết (để tài xế dễ tìm)" class="w-full p-3 rounded-xl border border-slate-200 focus:border-[#2E7D32] outline-none text-sm font-medium h-20 resize-none"></textarea>
                </div>
              </div>
              
              <!-- Bảng tính toán chi tiết 15% (Bao gồm Tiền hàng + Tiền xe) -->
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-[#2E7D32]">receipt_long</span>
                  Chi tiết Giá trị Giao dịch & Đặt Cọc
                </h3>

                <div class="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>Tổng số lượng đặt mua:</span>
                  <span class="font-black text-slate-900 text-base">{{ totalCheckoutItemsCount }}</span>
                </div>

                <div class="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>1. Tổng tiền hàng (Tất cả sản phẩm/loại):</span>
                  <span class="text-slate-900">{{ formatPrice(totalCheckoutGoods) }}</span>
                </div>

                <div class="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>2. Phí vận chuyển (Tiền xe):</span>
                  <span v-if="!deliveryLocation" class="text-slate-400 font-normal italic">Vui lòng chọn vị trí kho</span>
                  <span v-else class="text-slate-900">{{ formatPrice(totalCheckoutShipping) }}</span>
                </div>

                <div class="flex justify-between items-center pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>TỔNG GIÁ TRỊ ĐƠN (HÀNG + XE):</span>
                  <span class="text-[#d00000] text-xl">{{ formatPrice(totalCheckoutGoods + totalCheckoutShipping) }}</span>
                </div>

                <div class="bg-green-50 p-4 rounded-xl border border-green-200 space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-black text-[#2E7D32] text-sm uppercase">SỐ TIỀN CẦN ĐẶT CỌC (15% TỔNG HÀNG + XE):</span>
                    <span class="font-black text-2xl text-[#2E7D32]">{{ formatPrice((totalCheckoutGoods + totalCheckoutShipping) * 0.15) }}</span>
                  </div>
                  <p class="text-[11px] text-[#2E7D32]/80 italic">* Đặt cọc 15% bao gồm cả tiền hàng và cước xe vận chuyển</p>
                </div>

                <div class="flex justify-between items-center text-xs font-bold text-slate-500 pt-1">
                  <span>Số tiền 85% còn lại (Thanh toán khi nhận & kiểm tra hàng):</span>
                  <span class="text-slate-800 font-black">{{ formatPrice((totalCheckoutGoods + totalCheckoutShipping) * 0.85) }}</span>
                </div>
              </div>
              
              <button @click="startMockPayment" :disabled="isProcessing || !deliveryLocation" class="w-full mt-auto bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-slate-300 text-white p-4 rounded-xl font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-lg">qr_code_scanner</span>
                {{ isProcessing ? 'Đang xử lý...' : 'Thanh Toán Cọc 15% Qua Mã QR' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOCK PAYMENT MODAL (Quét mã QR 3s giả lập) -->
    <div v-if="showMockPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center relative overflow-hidden animate-fade-in">
        
        <button @click="closeMockPaymentModal" class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10">
          <span class="material-symbols-outlined text-slate-600">close</span>
        </button>

        <div v-if="!isMockPaymentSuccess" class="space-y-4">
          <div class="flex items-center justify-center gap-2 text-[#2E7D32] font-black uppercase text-xs tracking-wider">
            <span class="material-symbols-outlined text-lg animate-bounce">qr_code_scanner</span>
            Cổng Thanh Toán QR Giả Lập (MoMo / Banking)
          </div>
          
          <h3 class="text-xl font-black text-slate-900">Quét Mã QR Đặt Cọc 15%</h3>
          <p class="text-xs text-slate-500">Hệ thống đang tự động nhận diện quét mã QR trong 3 giây...</p>

          <!-- Bảng thông tin giá tiền -->
          <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl inline-block w-full">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Số tiền đặt cọc 15% cần thanh toán</span>
            <span class="text-3xl font-black text-[#2E7D32]">{{ formatPrice(mockPaymentAmount) }}</span>
          </div>

          <!-- Khung QR Code đẹp với hiệu ứng laser quét 3s -->
          <div class="relative w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-4 border-[#2E7D32] shadow-inner flex items-center justify-center overflow-hidden">
            <!-- QR Code Image simulation -->
            <svg class="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 10h30v30H10zM15 15v20h20V15zM20 20h10v10H20zM60 10h30v30H60zM65 15v20h20V15zM70 20h10v10H70zM10 60h30v30H10zM15 65v20h20V65zM20 70h10v10H20zM50 50h10v10H50zM70 50h20v10H70zM50 70h20v10H50zM80 70h10v20H80zM60 80h10v10H60z"/>
            </svg>
            <!-- Laser scanning line -->
            <div class="absolute inset-x-0 h-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse top-1/2"></div>
          </div>

          <div class="flex items-center justify-center gap-2 bg-green-50 text-[#2E7D32] px-4 py-2.5 rounded-full text-xs font-bold w-fit mx-auto border border-green-200">
            <span class="material-symbols-outlined text-sm animate-spin">sync</span>
            Tự động xác nhận sau: <strong class="text-sm text-green-800 font-black">{{ mockPaymentCountdown }}s</strong>
          </div>
        </div>

        <!-- Giao diện Thành công -->
        <div v-else class="py-6 space-y-4">
          <div class="w-20 h-20 bg-green-100 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <span class="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900">Đã Quét Mã & Thanh Toán 15% Thành Công!</h3>
          <p class="text-xs text-slate-500 font-medium">Hệ thống đang trừ số lượng tồn kho bài đăng và tạo đơn hàng...</p>
        </div>
      </div>
    </div>

    <!-- MODAL THANH TOÁN 85% CÒN LẠI -->
    <div v-if="showPayRemainingModal && payingOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-6 relative">
        <button @click="showPayRemainingModal = false" class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
          <span class="material-symbols-outlined text-slate-600">close</span>
        </button>

        <div>
          <h2 class="text-xl font-black text-slate-900 mb-1">Xác Nhận Nhận Hàng & Thanh Toán 85%</h2>
          <p class="text-xs text-slate-500">Mã đơn hàng: #{{ payingOrder.ma_don_hang || payingOrder.donhang_id }}</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm">
          <div class="flex justify-between text-slate-600">
            <span>Tổng giá trị đơn hàng:</span>
            <span class="font-bold text-slate-800">{{ formatPrice(Number(payingOrder.tong_tien)) }}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Đã cọc trước (15%):</span>
            <span class="font-bold text-[#2E7D32]">- {{ formatPrice(Number(payingOrder.tien_coc || Number(payingOrder.tong_tien)*0.15)) }}</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between text-base">
            <span class="font-black text-slate-900">Số tiền 85% cần thanh toán:</span>
            <span class="font-black text-xl text-[#d00000]">{{ formatPrice(Number(payingOrder.tong_tien) - Number(payingOrder.tien_coc || Number(payingOrder.tong_tien)*0.15)) }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phương thức thanh toán 85% còn lại</label>
          <div class="grid grid-cols-2 gap-3 text-xs font-bold">
            <button @click="remainingPaymentMethod = 'chuyen_khoan'" 
                    class="p-3 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer"
                    :class="remainingPaymentMethod === 'chuyen_khoan' ? 'border-[#2E7D32] bg-green-50 text-[#2E7D32]' : 'border-slate-200 bg-white text-slate-600'">
              <span class="material-symbols-outlined text-sm">account_balance</span> Chuyển khoản
            </button>
            <button @click="remainingPaymentMethod = 'momo'" 
                    class="p-3 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer"
                    :class="remainingPaymentMethod === 'momo' ? 'border-[#2E7D32] bg-green-50 text-[#2E7D32]' : 'border-slate-200 bg-white text-slate-600'">
              <span class="material-symbols-outlined text-sm">wallet</span> Ví MoMo / App
            </button>
          </div>
        </div>

        <button @click="confirmPayRemaining" :disabled="isPayingRemaining" class="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white p-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer">
          {{ isPayingRemaining ? 'Đang xử lý...' : 'Xác Nhận Đã Kiểm Tra Hàng & Thanh Toán 85%' }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.font-sans { font-family: 'Inter', sans-serif; }
</style>
