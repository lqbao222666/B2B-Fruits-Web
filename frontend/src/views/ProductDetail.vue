<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { BaiDang } from '@/service/baidang.ts'
import VueEasyLightbox from 'vue-easy-lightbox'
import { notify } from '@/utils/notifier.ts'
import { DonHang } from '@/service/donhang.ts'
import api from '@/service/api.ts'
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

const route = useRoute()
const router = useRouter()
const post = ref<any>(null)
const loading = ref(true)
const quantity = ref<number>(1)
const selectedPhanLoai = ref<any>(null)
const isCheckingOut = ref(false)
const showPaymentModal = ref(false)
const paymentStep = ref(0) // 0 = showing QR, 1 = success

const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

// Lightbox
const isLightboxOpen = ref(false)
const imgsRef = ref<string[]>([])
const lightboxIndex = ref(0)

// --- KHO HÀNG & PHÍ VẬN CHUYỂN ---
const savedLocations = ref<any[]>([])
const selectedSavedLocation = ref('')
const searchLocationText = ref('')
const isSearching = ref(false)
const warehouseLocation = ref<{ lat: number, lng: number } | null>(null)
const distanceKm = ref(0)
const shippingFee = ref(0)
let map: L.Map | null = null
let farmerMarker: L.Marker | null = null
let warehouseMarker: L.Marker | null = null
let routeLine: L.Polyline | null = null

// Số lượng cho từng phân loại (key = phanloai_id, val = số lượng)
const phanLoaiQuantities = ref<Record<number, number | string>>({})

const fetchSavedLocations = async () => {
  if (!user) return
  try {
    const res = await api.get(`/dia-chi-luu/user/${user.user_id || user.id}`)
    savedLocations.value = res.data || []
    if (savedLocations.value.length > 0) {
      selectedSavedLocation.value = savedLocations.value[0].id
      moveToWarehouse(Number(savedLocations.value[0].latitude), Number(savedLocations.value[0].longitude))
    }
  } catch (err) {
    console.error(err)
  }
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

const totalQuantitySelected = computed(() => {
  if (!post.value?.phanLoais) return 0
  let total = 0
  post.value.phanLoais.forEach((pl: any) => {
    const q = Number(phanLoaiQuantities.value[pl.phanloai_id]) || 0
    total += q
  })
  return total
})

const subtotalAmount = computed(() => {
  if (!post.value?.phanLoais) return 0
  let total = 0
  post.value.phanLoais.forEach((pl: any) => {
    const q = Number(phanLoaiQuantities.value[pl.phanloai_id]) || 0
    total += q * Number(pl.gia)
  })
  return total
})

const grandTotalAmount = computed(() => {
  return subtotalAmount.value + shippingFee.value
})

const updateCalculations = () => {
  const totalQty = totalQuantitySelected.value
  if (warehouseLocation.value && post.value?.latitude && post.value?.longitude && totalQty > 0) {
    const farmerLat = Number(post.value.latitude)
    const farmerLng = Number(post.value.longitude)
    distanceKm.value = haversineDistance(farmerLat, farmerLng, warehouseLocation.value.lat, warehouseLocation.value.lng)
    shippingFee.value = calculateShippingFee(totalQty, distanceKm.value)
  } else {
    distanceKm.value = 0
    shippingFee.value = 0
  }
}

const updatePhanLoaiQty = (phanloai_id: number, val: number) => {
  const pl = post.value?.phanLoais?.find((p: any) => p.phanloai_id === phanloai_id)
  const maxStock = pl?.so_luong_con_lai ?? 999
  const current = Number(phanLoaiQuantities.value[phanloai_id]) || 0
  const nextVal = current + val
  if (nextVal < 0) return
  if (nextVal > maxStock) {
    notify.info(`Số lượng tối đa còn lại của ${pl?.ten_phan_loai} là ${maxStock}`)
    return
  }
  phanLoaiQuantities.value[phanloai_id] = nextVal
  updateCalculations()
}

const onPhanLoaiInput = (phanloai_id: number, e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = target.value
  if (raw === '') {
    phanLoaiQuantities.value[phanloai_id] = ''
    updateCalculations()
    return
  }
  let val = parseInt(raw)
  const pl = post.value?.phanLoais?.find((p: any) => p.phanloai_id === phanloai_id)
  const maxStock = pl?.so_luong_con_lai ?? 999
  if (!isNaN(val)) {
    if (val > maxStock) {
      phanLoaiQuantities.value[phanloai_id] = maxStock
      notify.info(`Số lượng tối đa còn lại của ${pl?.ten_phan_loai} là ${maxStock}`)
    } else if (val < 0) {
      phanLoaiQuantities.value[phanloai_id] = 0
    } else {
      phanLoaiQuantities.value[phanloai_id] = val
    }
  }
  updateCalculations()
}

const onPhanLoaiBlur = (phanloai_id: number) => {
  const pl = post.value?.phanLoais?.find((p: any) => p.phanloai_id === phanloai_id)
  const maxStock = pl?.so_luong_con_lai ?? 999
  const val = phanLoaiQuantities.value[phanloai_id]
  if (val === '' || val === null || val === undefined || Number(val) < 0) {
    phanLoaiQuantities.value[phanloai_id] = 0
  } else if (Number(val) > maxStock) {
    phanLoaiQuantities.value[phanloai_id] = maxStock
  }
  updateCalculations()
}

const moveToWarehouse = (lat: number, lng: number) => {
  warehouseLocation.value = { lat, lng }
  localStorage.setItem('user_warehouse_location', JSON.stringify({
    lat,
    lng,
    address: searchLocationText.value || '',
    savedId: selectedSavedLocation.value || ''
  }))
  if (map) {
    if (warehouseMarker) map.removeLayer(warehouseMarker)
    if (routeLine) map.removeLayer(routeLine)
    
    warehouseMarker = L.marker([lat, lng]).addTo(map).bindPopup('Kho hàng nhận của bạn').openPopup()
    
    const farmerLat = post.value?.latitude ? Number(post.value.latitude) : 10.762622
    const farmerLng = post.value?.longitude ? Number(post.value.longitude) : 106.660172
    
    routeLine = L.polyline([[farmerLat, farmerLng], [lat, lng]], { color: '#2E7D32', weight: 4, dashArray: '8, 8' }).addTo(map)
    map.fitBounds([[farmerLat, farmerLng], [lat, lng]], { padding: [40, 40] })
  }
  updateCalculations()
}

const handleSearchWarehouse = async () => {
  if (!searchLocationText.value) return
  const text = searchLocationText.value.trim()
  const coordRegex = /^\s*\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?\s*$/
  const match = text.match(coordRegex)
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[3])
    moveToWarehouse(lat, lng)
    return
  }
  isSearching.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`)
    const data = await res.json()
    if (data && data.length > 0) {
      moveToWarehouse(parseFloat(data[0].lat), parseFloat(data[0].lon))
    } else {
      notify.error('Không tìm thấy địa điểm!')
    }
  } catch (e) {
    notify.error('Lỗi tìm kiếm vị trí!')
  } finally {
    isSearching.value = false
  }
}

watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find(l => l.id == val)
    if (loc) {
      moveToWarehouse(Number(loc.latitude), Number(loc.longitude))
    }
  }
})

const initMap = () => {
  if (map) return;
  const farmerLat = post.value?.latitude ? Number(post.value.latitude) : 10.762622;
  const farmerLng = post.value?.longitude ? Number(post.value.longitude) : 106.660172;

  map = L.map('view-map').setView([farmerLat, farmerLng], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  farmerMarker = L.marker([farmerLat, farmerLng]).addTo(map).bindPopup('Vị trí lô hàng (Nông dân)').openPopup();

  map.on('click', (e: L.LeafletMouseEvent) => {
    moveToWarehouse(e.latlng.lat, e.latlng.lng);
  });

  if (warehouseLocation.value) {
    moveToWarehouse(warehouseLocation.value.lat, warehouseLocation.value.lng)
  }
}

const getImageUrl = (img: any) => {
  if (!img) return 'https://placehold.co/600x600?text=Không+có+ảnh'
  const path = typeof img === 'string' ? img : img.url;
  return path.startsWith('http') ? path : `http://localhost:3000${path}`
}

const getMainImageUrl = () => {
  if (!post.value?.images || post.value.images.length === 0) return getImageUrl(null);
  const mainImg = post.value.images.find((i: any) => i.is_main) || post.value.images[0];
  return getImageUrl(mainImg);
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString))
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const openLightbox = (index: number) => {
  if (post.value?.images && Array.isArray(post.value.images)) {
    imgsRef.value = post.value.images.map((img: any) => getImageUrl(img))
    lightboxIndex.value = index
    isLightboxOpen.value = true
  }
}

const fetchData = async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    const res = await BaiDang.getById(id)
    post.value = res.data || res
    if (post.value.phanLoais && post.value.phanLoais.length > 0) {
      post.value.phanLoais.forEach((pl: any, idx: number) => {
        phanLoaiQuantities.value[pl.phanloai_id] = idx === 0 ? 1 : 0
      })
    }
    fetchSavedLocations()
    setTimeout(initMap, 200)
  } catch (e) {
    console.error('Lỗi tải bài đăng:', e)
    notify.error('Không tìm thấy bài đăng')
    router.push('/products')
  } finally {
    loading.value = false
  }
}

const handleCheckout = () => {
  if (!user) {
    notify.error('Vui lòng đăng nhập bằng tài khoản doanh nghiệp để mua hàng!')
    return
  }
  
  if (user.role === 'nong_dan' || user.role === 'NONG_DAN') {
    notify.error('Tài khoản nông dân không thể mua hàng!')
    return
  }

  const selectedItems = post.value?.phanLoais?.filter((pl: any) => Number(phanLoaiQuantities.value[pl.phanloai_id]) > 0) || []

  if (selectedItems.length === 0) {
    notify.error('Vui lòng nhập số lượng > 0 cho ít nhất 1 loại sản phẩm!')
    return
  }
  
  if (!warehouseLocation.value) {
    notify.error('Vui lòng chọn vị trí kho nhận hàng trên bản đồ hoặc tìm kiếm địa chỉ!')
    return
  }

  showPaymentModal.value = true
  paymentStep.value = 0
  
  // Giả lập quét mã QR 3s
  setTimeout(() => {
    paymentStep.value = 1
    setTimeout(() => {
      executeCheckout(selectedItems)
    }, 1000)
  }, 3000)
}

const executeCheckout = async (selectedItems: any[]) => {
  isCheckingOut.value = true
  try {
    const items = selectedItems.map((pl: any) => ({
      phanloai_id: pl.phanloai_id,
      so_luong: Number(phanLoaiQuantities.value[pl.phanloai_id])
    }))

    await api.post('/don-hang/dat-hang', {
      baidang_id: post.value.baidang_id,
      nguoi_ban_id: post.value.nguoi_dang_id,
      items,
      dia_chi_giao: searchLocationText.value || 'Địa chỉ lấy từ bản đồ',
      tinh_thanh_giao: 'Cần Thơ',
      hinh_thuc_giao_hang: 'giao_tan_noi',
      khoang_cach: distanceKm.value,
      phi_van_chuyen: shippingFee.value,
      ghi_chu: ''
    })

    notify.success('Đặt hàng và thanh toán cọc thành công!')
    showPaymentModal.value = false
    router.push('/orders')
  } catch (e: any) {
    console.error(e)
    notify.error(e.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng')
    showPaymentModal.value = false
  } finally {
    isCheckingOut.value = false
  }
}

const contactSeller = () => {
  if (!user) {
    notify.error('Vui lòng đăng nhập để nhắn tin!');
    return;
  }
  const currentId = user.user_id || user.id;
  if (currentId == post.value.nguoi_dang_id) {
    notify.info('Đây là sản phẩm của bạn.');
    return;
  }
  router.push(`/messages?partnerId=${post.value.nguoi_dang_id}`);
}

onMounted(() => {
  fetchData()
})

watch(() => route.params.id, (newId) => {
  if (newId) fetchData()
})
</script>

<template>
  <main class="mx-auto max-w-[1200px] w-full px-4 py-8 font-sans relative">
    
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 text-slate-400">
      <span class="material-symbols-outlined text-5xl text-[#2E7D32] animate-bounce mb-4">agriculture</span>
      <p class="font-bold uppercase tracking-widest text-sm text-[#2E7D32]">Đang tải thông tin...</p>
    </div>

    <div v-else-if="!post" class="text-center py-32 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed text-slate-500">
      <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
      <p class="font-bold text-lg">Không tìm thấy bài đăng này.</p>
    </div>

    <div v-else>
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 mb-8 text-[13px] font-bold text-slate-400 uppercase tracking-wide">
        <RouterLink to="/" class="hover:text-[#2E7D32] transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">home</span> Trang Chủ
        </RouterLink>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <RouterLink to="/products" class="hover:text-[#2E7D32] transition-colors">Khám phá nông sản</RouterLink>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-slate-800 line-clamp-1">{{ post.tieu_de }}</span>
      </nav>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        
        <!-- Cột trái: Hình ảnh -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Ảnh chính -->
          <div class="aspect-square w-full bg-[#E8F5E9]/50 rounded-3xl overflow-hidden flex items-center justify-center border-2 border-[#2E7D32]/10 relative group cursor-zoom-in" @click="openLightbox(0)">
            <img :src="getMainImageUrl()" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined opacity-0 group-hover:opacity-100 text-white drop-shadow-md text-4xl transition-opacity">zoom_in</span>
            </div>
          </div>
          
          <!-- Thumbnail ảnh -->
          <div v-if="post.images && post.images.length > 1" class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div v-for="(img, idx) in post.images" :key="idx" @click="openLightbox(idx)" class="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer border-2 hover:border-[#2E7D32] transition-colors relative" :class="idx === 0 ? 'border-[#2E7D32]' : 'border-transparent'">
              <img :src="getImageUrl(img)" class="w-full h-full object-cover" />
              <span v-if="img.is_main" class="absolute bottom-1 left-1 bg-[#2E7D32] text-white text-[8px] px-1 rounded uppercase font-bold">Chính</span>
            </div>
          </div>

          <div v-if="post.latitude" class="pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-700 flex items-center gap-1">
                <span class="material-symbols-outlined text-[#2E7D32] text-sm">map</span>
                Vị trí & Tính khoảng cách
              </h3>
              <select v-if="savedLocations.length > 0" v-model="selectedSavedLocation" class="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 cursor-pointer max-w-[200px] truncate">
                <option value="">-- Chọn Kho đã lưu --</option>
                <option v-for="loc in savedLocations" :key="loc.id" :value="loc.id">{{ loc.ten_goi }}</option>
              </select>
            </div>

            <!-- Tìm kiếm địa điểm kho -->
            <div class="flex gap-2">
              <input v-model="searchLocationText" @keyup.enter="handleSearchWarehouse" type="text" placeholder="Nhập tên kho / địa chỉ (VD: Kho Cần Thơ)..." class="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#2E7D32]" />
              <button @click="handleSearchWarehouse" :disabled="isSearching" class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 rounded-xl flex items-center justify-center transition-colors">
                <span v-if="isSearching" class="animate-spin material-symbols-outlined text-xs">sync</span>
                <span v-else class="material-symbols-outlined text-xs">search</span>
              </button>
            </div>

            <div id="view-map" class="w-full h-[220px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative z-0"></div>
            <p class="text-[11px] text-slate-400 italic text-center">* Click lên bản đồ để chọn vị trí kho nhận hàng của bạn</p>
          </div>
        </div>

        <!-- Cột phải: Thông tin -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2 text-[#2E7D32] font-bold text-sm">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              {{ post.ten_nong_san }} &bull; Cập nhật: {{ formatDate(post.updated_at) }}
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              {{ post.tieu_de }}
            </h1>
            <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-600 font-medium inline-flex">
              <span class="material-symbols-outlined text-slate-400">location_on</span>
              {{ post.tinh_thanh }}
            </div>
            
            <div v-if="post.tieuChuans && post.tieuChuans.length > 0" class="flex flex-wrap gap-2 mt-3">
              <div v-for="tc in post.tieuChuans" :key="tc.tieuchuan_id" 
                   class="flex items-center gap-1.5 bg-[#e8f5e9] border border-[#2E7D32]/20 px-3 py-1.5 rounded-lg text-[#2E7D32] font-bold text-xs uppercase tracking-wide">
                <span v-if="tc.icon_url" class="material-symbols-outlined text-[16px]">{{ tc.icon_url }}</span>
                {{ tc.ten_tieu_chuan }}
              </div>
            </div>
          </div>

          <!-- Phân loại sản phẩm (Nhập số lượng cho từng loại) -->
          <div v-if="post.phanLoais && post.phanLoais.length > 0" class="space-y-3 mt-2">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800">Các Phân Loại Sản Phẩm Trong Lô Này</h3>
              <span class="text-xs text-[#2E7D32] font-bold">* Nhập số lượng cho nhiều loại cùng lúc</span>
            </div>
            
            <div class="space-y-3">
              <div v-for="pl in post.phanLoais" :key="pl.phanloai_id"
                   class="p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white"
                   :class="Number(phanLoaiQuantities[pl.phanloai_id]) > 0 ? 'border-[#2E7D32] bg-green-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-base text-slate-900">{{ pl.ten_phan_loai }}</span>
                    <span class="font-black text-[#d00000] text-base">{{ formatPrice(pl.gia) }}<span class="text-xs text-slate-500 font-normal">/{{ post.don_vi_tinh }}</span></span>
                  </div>
                  <p class="text-xs text-slate-500">Còn lại trong kho: <strong>{{ pl.so_luong_con_lai }}</strong> {{ post.don_vi_tinh }}</p>
                </div>

                <!-- Ô nhập số lượng riêng cho từng loại -->
                <div class="flex items-center gap-2 self-end sm:self-center">
                  <button @click="updatePhanLoaiQty(pl.phanloai_id, -1)" 
                          :disabled="!phanLoaiQuantities[pl.phanloai_id] || Number(phanLoaiQuantities[pl.phanloai_id]) <= 0" 
                          class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black disabled:opacity-30 transition-colors">-</button>
                  <input type="number" 
                         :value="phanLoaiQuantities[pl.phanloai_id]" 
                         @input="e => onPhanLoaiInput(pl.phanloai_id, e)" 
                         @blur="() => onPhanLoaiBlur(pl.phanloai_id)" 
                         min="0" 
                         :max="pl.so_luong_con_lai" 
                         class="w-24 h-9 text-center font-black text-lg border-2 border-slate-200 rounded-xl focus:border-[#2E7D32] focus:outline-none bg-white shadow-inner" />
                  <button @click="updatePhanLoaiQty(pl.phanloai_id, 1)" 
                          :disabled="Number(phanLoaiQuantities[pl.phanloai_id]) >= pl.so_luong_con_lai" 
                          class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-black disabled:opacity-30 transition-colors">+</button>
                  <span class="text-xs font-bold text-slate-600 ml-1">{{ post.don_vi_tinh }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Thẻ tính tổng chi phí ước tính gộp tất cả loại bao gồm Vận chuyển -->
          <div class="bg-[#e8f5e9]/70 border-2 border-[#2E7D32]/20 p-5 rounded-2xl space-y-3">
            <h3 class="text-xs font-black text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">calculate</span>
              Tổng ước tính chi phí tất cả loại chọn mua
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center text-slate-600">
                <span>Tổng khối lượng chọn ({{ totalQuantitySelected }} {{ post.don_vi_tinh }}):</span>
                <span class="font-bold text-slate-800">{{ formatPrice(subtotalAmount) }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-600">
                <span class="flex items-center gap-1">
                  Khoảng cách kho: 
                  <span v-if="distanceKm > 0" class="font-bold text-[#2E7D32]">({{ distanceKm.toFixed(1) }} km)</span>
                  <span v-else class="text-xs text-slate-400 font-normal">(Chưa chọn vị trí kho)</span>
                </span>
                <span class="font-bold text-slate-800">{{ distanceKm > 0 ? formatPrice(shippingFee) : '0 ₫' }}</span>
              </div>
              <div class="pt-2 border-t border-[#2E7D32]/20 flex justify-between items-center text-base">
                <span class="font-black text-slate-900">TỔNG TIỀN THANH TOÁN (ĐÃ CỘNG VC):</span>
                <span class="font-black text-xl text-[#d00000]">{{ formatPrice(grandTotalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Mô tả -->
          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-2">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide mb-3">Mô tả chi tiết</h3>
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{{ post.mo_ta || 'Chưa có mô tả cho sản phẩm này.' }}</p>
          </div>

          <!-- Hành động -->
          <div class="mt-auto pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-100">
            <button @click="contactSeller" class="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95">
              <span class="material-symbols-outlined">chat</span>
              Nhắn tin Nông dân
            </button>
            <button @click="handleCheckout" :disabled="isCheckingOut || post.trang_thai === 'an' || post.trang_thai === 'da_ban' || post.trang_thai === 'cho_duyet'" class="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] px-6 py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:border-slate-300 disabled:hover:bg-slate-300">
              <span class="material-symbols-outlined">payments</span>
              {{ post.trang_thai === 'an' ? 'Ngừng cung cấp' : (post.trang_thai === 'da_ban' ? 'Đã bán hết' : (post.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : (isCheckingOut ? 'Đang xử lý...' : 'Đặt Hàng & Cọc 15%'))) }}
            </button>
          </div>
          
        </div>
      </div>
    </div>

    <vue-easy-lightbox
      :visible="isLightboxOpen"
      :imgs="imgsRef"
      :index="lightboxIndex"
      @hide="isLightboxOpen = false"
    />

    <!-- Modal Thanh Toán Cọc 15% -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden text-center">
        <!-- Close button if still at step 0 (can cancel) -->
        <button v-if="paymentStep === 0" @click="showPaymentModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        <h3 class="text-2xl font-black text-slate-800 mb-6 font-sans">
          Thanh toán Cọc 15%
        </h3>
        <p class="text-slate-600 text-sm mb-4">Mở app Ngân hàng hoặc MoMo để quét mã QR dưới đây</p>

        <div class="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center mb-6 relative">
          <div v-if="paymentStep === 0" class="w-48 h-48 bg-white border-4 border-[#2E7D32] p-2 rounded-xl">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=B2B_NONG_SAN_MOCK_PAYMENT" alt="QR Code" class="w-full h-full object-contain mix-blend-multiply" />
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
          <div class="flex justify-between items-center text-sm mb-2 text-slate-600">
            <span>Tổng đơn hàng:</span>
            <span class="font-bold">{{ formatPrice(grandTotalAmount) }}</span>
          </div>
          <div class="flex justify-between items-center text-base font-black text-slate-900 border-t border-[#2E7D32]/20 pt-2">
            <span>Số tiền cọc (15%):</span>
            <span class="text-xl text-[#d00000]">{{ formatPrice(grandTotalAmount * 0.15) }}</span>
          </div>
        </div>
        
        <p v-if="paymentStep === 0" class="text-xs text-slate-500 flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[14px] animate-spin">sync</span>
          Đang chờ quét mã thanh toán...
        </p>
        <p v-if="paymentStep === 1" class="text-sm font-bold text-[#2E7D32] flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          Đang tạo đơn hàng, vui lòng đợi...
        </p>
      </div>
    </div>

  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.font-sans { font-family: 'Inter', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
