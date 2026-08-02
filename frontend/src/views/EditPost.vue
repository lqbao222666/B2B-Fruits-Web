<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaiDang } from '@/service/baidang.ts'
import api from '@/service/api.ts'
import { notify } from '@/utils/notifier.ts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const router = useRouter()
const route = useRoute()
const categories = ref<any[]>([])
const tieuChuansList = ref<any[]>([])
const loading = ref(false)
const fetching = ref(true)
const isSuggesting = ref(false)
const suggestingPriceIdx = ref<number | null>(null)

// Map states
let map: L.Map | null = null
let userMarker: L.Marker | null = null
const savedLocations = ref<any[]>([])
const searchLocationText = ref('')
const selectedSavedLocation = ref('')
const isSearching = ref(false)

const vietnamProvinces = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn",
  "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng",
  "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn",
  "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An",
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
  "Vĩnh Phúc", "Yên Bái"
]

const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null
const postId = Number(route.params.id)

const form = ref({
  tieu_de: '',
  ten_nong_san: '',
  danhmuc_id: '',
  don_vi_tinh: 'kg',
  tinh_thanh: '',
  mo_ta: '',
  latitude: null as number | null,
  longitude: null as number | null,
  tieu_chuan_ids: [] as number[],
})

const phanLoais = ref<any[]>([])

const addPhanLoai = () => {
  phanLoais.value.push({ ten_phan_loai: `Loại ${phanLoais.value.length + 1}`, gia: null, so_luong_co: null, so_luong_con_lai: null })
}
const removePhanLoai = (index: number) => {
  if (phanLoais.value.length > 1) {
    phanLoais.value.splice(index, 1)
  }
}

const existingImages = ref<any[]>([])
const selectedImages = ref<{ file: File; isMain: boolean }[]>([])

const fetchSavedLocations = async () => {
  if (!user) return
  try {
    const res = await api.get(`/dia-chi-luu/user/${user.user_id || user.id}`)
    savedLocations.value = res.data || []
  } catch (err) {
    console.error(err)
  }
}

const initMap = (initLat?: number | null, initLng?: number | null) => {
  const container = document.getElementById('edit-post-map')
  if (!container || map) return

  const defaultLat = initLat || 10.762622
  const defaultLng = initLng || 106.660172

  map = L.map('edit-post-map').setView([defaultLat, defaultLng], initLat ? 14 : 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map)

  if (initLat && initLng) {
    userMarker = L.marker([initLat, initLng])
      .addTo(map)
      .bindPopup('Vị trí lô hàng')
      .openPopup()
  }

  map.on('click', (e: L.LeafletMouseEvent) => {
    moveToLocation(e.latlng.lat, e.latlng.lng)
  })
}

const moveToLocation = (lat: number, lng: number) => {
  if (!map) return
  map.setView([lat, lng], 14)
  if (userMarker) map.removeLayer(userMarker)
  userMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup('Vị trí lô hàng')
    .openPopup()
  form.value.latitude = lat
  form.value.longitude = lng
}

const handleSearchLocation = async () => {
  if (!searchLocationText.value) return
  const text = searchLocationText.value.trim()

  const coordRegex = /^\s*\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?\s*$/
  const match = text.match(coordRegex)
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[3])
    moveToLocation(lat, lng)
    return
  }

  isSearching.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
    )
    const data = await res.json()
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      moveToLocation(lat, lng)
      notify.success('Đã tìm thấy vị trí!')
    } else {
      notify.error('Không tìm thấy địa điểm này!')
    }
  } catch (e) {
    notify.error('Lỗi khi tìm kiếm địa điểm!')
  } finally {
    isSearching.value = false
  }
}

watch(selectedSavedLocation, (val) => {
  if (val) {
    const loc = savedLocations.value.find((l) => l.id == val)
    if (loc) {
      moveToLocation(Number(loc.latitude), Number(loc.longitude))
      form.value.tinh_thanh = loc.dia_chi || form.value.tinh_thanh
    }
  }
})

onMounted(async () => {
  const roleStr = user?.role ? user.role.toLowerCase() : ''
  const isNongDan = roleStr === 'nong_dan' || roleStr === 'nông dân' || roleStr === 'nong dan'

  if (!user || !isNongDan) {
    notify.error('Chỉ Nông Dân mới được sửa bài đăng!')
    router.push('/')
    return
  }

  try {
    const resCat = await api.get('/danh-muc')
    categories.value = resCat.data || []

    const tcRes = await api.get('/tieu-chuan')
    tieuChuansList.value = tcRes.data || []

    const resPost = await BaiDang.getById(postId)
    const post = resPost.data || resPost
    
    if (post.nguoi_dang_id !== (user.user_id || user.id)) {
      notify.error('Bạn không có quyền sửa bài đăng này!')
      router.push('/manage-posts')
      return
    }

    form.value = {
      tieu_de: post.tieu_de || '',
      ten_nong_san: post.ten_nong_san || '',
      danhmuc_id: post.danhmuc_id ? String(post.danhmuc_id) : '',
      don_vi_tinh: post.don_vi_tinh || 'kg',
      tinh_thanh: post.tinh_thanh || '',
      mo_ta: post.mo_ta || '',
      latitude: post.latitude ? Number(post.latitude) : null,
      longitude: post.longitude ? Number(post.longitude) : null,
      tieu_chuan_ids: post.tieuChuans ? post.tieuChuans.map((tc: any) => Number(tc.tieuchuan_id)) : [],
    }

    if (post.phanLoais && post.phanLoais.length > 0) {
      phanLoais.value = post.phanLoais.map((pl: any) => ({
        ten_phan_loai: pl.ten_phan_loai,
        gia: Number(pl.gia),
        so_luong_co: Number(pl.so_luong_co),
        so_luong_con_lai: Number(pl.so_luong_con_lai ?? pl.so_luong_co),
        original_so_luong_co: Number(pl.so_luong_co),
        original_so_luong_con_lai: Number(pl.so_luong_con_lai ?? pl.so_luong_co)
      }))
    } else {
      phanLoais.value = [
        { 
          ten_phan_loai: 'Loại 1', 
          gia: Number(post.gia_per_kg || 0), 
          so_luong_co: Number(post.so_luong_co || 0), 
          so_luong_con_lai: Number(post.so_luong_con_lai || post.so_luong_co || 0),
          original_so_luong_co: Number(post.so_luong_co || 0),
          original_so_luong_con_lai: Number(post.so_luong_con_lai || post.so_luong_co || 0)
        }
      ]
    }
    
    let rawImgs = post.images
    if (typeof rawImgs === 'string') {
      try { rawImgs = JSON.parse(rawImgs) } catch(e) {}
    }
    existingImages.value = Array.isArray(rawImgs) ? JSON.parse(JSON.stringify(rawImgs)) : []
    
    fetching.value = false
    fetchSavedLocations()
    setTimeout(() => {
      initMap(form.value.latitude, form.value.longitude)
    }, 200)
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu bài đăng:', err)
    notify.error('Không tìm thấy bài đăng')
    router.push('/manage-posts')
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach(file => {
      const isFirst = existingImages.value.length === 0 && selectedImages.value.length === 0
      selectedImages.value.push({ file, isMain: isFirst })
    })
  }
}

const removeSelectedImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const removeExistingImage = (index: number) => {
  existingImages.value.splice(index, 1)
}

const setMainImage = (type: 'existing' | 'new', index: number) => {
  existingImages.value.forEach(img => {
    if (typeof img === 'object') img.is_main = false
  })
  selectedImages.value.forEach(img => img.isMain = false)
  if (type === 'existing') {
    if (typeof existingImages.value[index] === 'object') {
      existingImages.value[index].is_main = true
    } else {
      existingImages.value[index] = { url: existingImages.value[index], is_main: true }
    }
  } else {
    selectedImages.value[index].isMain = true
  }
}

const uploadImages = async () => {
  const urls: { url: string; is_main: boolean }[] = []
  for (const imgObj of selectedImages.value) {
    const formData = new FormData()
    formData.append('file', imgObj.file)
    try {
      const res = await api.post('/bai-dang/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data && res.data.url) {
        urls.push({
          url: res.data.url,
          is_main: imgObj.isMain
        })
      }
    } catch (err) {
      console.error('Lỗi upload ảnh:', err)
    }
  }
  return urls
}

const handleSuggestDescription = async () => {
  if (!form.value.ten_nong_san || !form.value.tinh_thanh) {
    notify.error('Vui lòng nhập Tên nông sản và Khu vực trước khi dùng AI gợi ý!');
    return;
  }
  
  isSuggesting.value = true;
  try {
    const payload = {
      tieu_de: form.value.tieu_de,
      ten_nong_san: form.value.ten_nong_san,
      so_luong_co: phanLoais.value.length > 0 ? Number(phanLoais.value[0].so_luong_co) : undefined,
      don_vi_tinh: form.value.don_vi_tinh,
      tinh_thanh: form.value.tinh_thanh
    };
    const res = await api.post('/ai/suggest-post', payload);
    if (res.data) {
      const data = res.data;
      if (data.tieu_de) form.value.tieu_de = data.tieu_de;
      if (data.mo_ta) form.value.mo_ta = data.mo_ta;
      
      notify.success('AI đã gợi ý xong nội dung!');
    }
  } catch (err: any) {
    console.error('Lỗi khi gợi ý mô tả:', err);
    notify.error('Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.');
  } finally {
    isSuggesting.value = false;
  }
}

const handleSuggestPrice = async (index: number) => {
  if (!form.value.ten_nong_san || !form.value.tinh_thanh) {
    notify.error('Vui lòng nhập Tên nông sản và Khu vực trước khi gợi ý giá!');
    return;
  }

  suggestingPriceIdx.value = index;
  try {
    const payload = {
      ten_nong_san: form.value.ten_nong_san + (phanLoais.value[index].ten_phan_loai ? ` (${phanLoais.value[index].ten_phan_loai})` : ''),
      don_vi_tinh: form.value.don_vi_tinh,
      tinh_thanh: form.value.tinh_thanh
    };
    
    const res = await api.post('/ai/suggest-price', payload);
    if (res.data && res.data.gia_goi_y) {
      phanLoais.value[index].gia = res.data.gia_goi_y;
      notify.success('Đã điền giá gợi ý từ AI!');
    }
  } catch (err) {
    console.error('Lỗi khi gợi ý giá:', err);
    notify.error('Không thể lấy gợi ý giá lúc này.');
  } finally {
    suggestingPriceIdx.value = null;
  }
}

const handleSubmit = async () => {
  let isValidPhanLoai = true
  let tongSoLuong = 0
  let tongSoLuongConLai = 0
  let minGia = Infinity
  
  phanLoais.value.forEach(pl => {
    if (!pl.ten_phan_loai || !pl.gia || !pl.so_luong_co) isValidPhanLoai = false
    tongSoLuong += Number(pl.so_luong_co)

    let diff = Number(pl.so_luong_co) - (pl.original_so_luong_co || Number(pl.so_luong_co))
    let baseConLai = (pl.original_so_luong_con_lai !== undefined && pl.original_so_luong_con_lai !== null) ? Number(pl.original_so_luong_con_lai) : Number(pl.so_luong_co)
    let calculatedConLai = baseConLai + diff
    if (calculatedConLai < 0) calculatedConLai = 0

    tongSoLuongConLai += calculatedConLai
    if (Number(pl.gia) < minGia) minGia = Number(pl.gia)
  })

  if (!form.value.tieu_de || !form.value.danhmuc_id || !form.value.tinh_thanh || !isValidPhanLoai) {
    notify.error('Vui lòng điền đầy đủ các thông tin bắt buộc có dấu *, và đảm bảo các phân loại đều có Tên, Giá, Sản lượng')
    return
  }
  
  loading.value = true
  try {
    const uploadedImageObjects = await uploadImages()
    const finalImages = [...existingImages.value, ...uploadedImageObjects]

    const payload = {
      tieu_de: form.value.tieu_de,
      ten_nong_san: form.value.ten_nong_san,
      danhmuc_id: Number(form.value.danhmuc_id),
      so_luong_co: tongSoLuong,
      so_luong_con_lai: tongSoLuongConLai,
      don_vi_tinh: form.value.don_vi_tinh,
      gia_per_kg: minGia === Infinity ? 0 : minGia,
      tinh_thanh: form.value.tinh_thanh,
      mo_ta: form.value.mo_ta,
      latitude: form.value.latitude ? Number(form.value.latitude) : null,
      longitude: form.value.longitude ? Number(form.value.longitude) : null,
      tieu_chuan_ids: form.value.tieu_chuan_ids,
      images: finalImages,
      phan_loais: phanLoais.value.map(pl => {
        let diff = Number(pl.so_luong_co) - (pl.original_so_luong_co || Number(pl.so_luong_co));
        let baseConLai = (pl.original_so_luong_con_lai !== undefined && pl.original_so_luong_con_lai !== null) ? Number(pl.original_so_luong_con_lai) : Number(pl.so_luong_co);
        let calculatedConLai = baseConLai + diff;
        if (calculatedConLai < 0) calculatedConLai = 0;
        
        return {
          ten_phan_loai: pl.ten_phan_loai,
          gia: Number(pl.gia),
          so_luong_co: Number(pl.so_luong_co),
          so_luong_con_lai: calculatedConLai
        };
      })
    }

    await BaiDang.update(postId, payload)
    notify.success('Cập nhật bài đăng thành công!')
    router.push('/manage-posts')
  } catch (err: any) {
    console.error(err)
    notify.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.')
  } finally {
    loading.value = false
  }
}

const getFullUrl = (path: any) => {
  if (!path) return ''
  let imgPath = typeof path === 'object' && (path.url || path.image_url) ? (path.url || path.image_url) : path;
  if (typeof imgPath !== 'string') return ''
  return imgPath.startsWith('http') ? imgPath : `http://localhost:3000${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
}
</script>

<template>
  <div class="edit-post-root bg-[#f8fafc] py-12 px-4 min-h-screen font-sans">
    
    <!-- LOADING SKELETON -->
    <div v-if="fetching" class="max-w-4xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mb-4"></div>
      <p class="text-slate-500 font-medium">Đang tải thông tin bài đăng...</p>
    </div>

    <div v-else class="max-w-4xl mx-auto bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
      <!-- Trang trí nền góc trên -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#e8f5e9] rounded-full opacity-50 pointer-events-none"></div>

      <div class="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6 relative z-10">
        <div class="w-14 h-14 bg-[#E3F2FD] rounded-2xl flex items-center justify-center shadow-inner">
          <span class="text-3xl material-symbols-outlined text-[#1565C0]">edit_square</span>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Cập nhật Bài Đăng</h1>
          <p class="text-slate-500 text-sm mt-1 font-medium">Chỉnh sửa thông tin, số lượng, giá và vị trí của lô hàng.</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-8 relative z-10">
        
        <!-- THÔNG TIN CƠ BẢN -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#2E7D32]">info</span> Thông tin cơ bản
            </h2>
            <button type="button" @click="handleSuggestDescription" :disabled="isSuggesting" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5e9] rounded-lg text-sm font-bold text-[#2E7D32] hover:bg-[#c8e6c9] transition-colors disabled:opacity-50 border border-[#2E7D32]/20 shadow-sm">
              <span v-if="isSuggesting" class="animate-spin material-symbols-outlined text-sm">sync</span>
              <span v-else class="material-symbols-outlined text-sm">smart_toy</span>
              {{ isSuggesting ? 'AI Đang Xử Lý...' : 'AI Điền Tự Động' }}
            </button>
          </div>
          <div class="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề bài đăng <span class="text-red-500">*</span></label>
              <input v-model="form.tieu_de" type="text" required placeholder="Ví dụ: Cà chua Cherry Đà Lạt..." 
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Tên nông sản <span class="text-red-500">*</span></label>
                <input v-model="form.ten_nong_san" type="text" required
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800" />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Danh mục <span class="text-red-500">*</span></label>
                <select v-model="form.danhmuc_id" required 
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer">
                  <option value="" disabled>-- Chọn danh mục --</option>
                  <option v-for="cat in categories" :key="cat.danhmuc_id" :value="cat.danhmuc_id">
                    {{ cat.ten_danh_muc }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- PHÂN LOẠI & SẢN LƯỢNG -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#2E7D32]">category</span> Phân loại Sản phẩm
            </h2>
            <button type="button" @click="addPhanLoai" class="flex items-center gap-1 text-sm font-bold text-[#2E7D32] hover:bg-[#e8f5e9] px-3 py-1.5 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-[18px]">add</span> Thêm phân loại
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="(pl, index) in phanLoais" :key="index" class="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative group">
              <button v-if="phanLoais.length > 1" type="button" @click="removePhanLoai(index)" class="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="md:col-span-1">
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Phân Loại <span class="text-red-500">*</span></label>
                  <input v-model="pl.ten_phan_loai" type="text" required placeholder="VD: Loại 1, Trái lớn..." 
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800" />
                </div>
                <div class="md:col-span-1">
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sản Lượng ({{ form.don_vi_tinh }}) <span class="text-red-500">*</span></label>
                  <input v-model="pl.so_luong_co" type="number" min="1" required placeholder="VD: 100" 
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800" />
                </div>
                <div class="md:col-span-1">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Giá Bán (VNĐ) <span class="text-red-500">*</span></label>
                    <button type="button" @click="handleSuggestPrice(index)" :disabled="suggestingPriceIdx === index" class="text-[10px] font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 disabled:opacity-50 transition-colors">
                      <span v-if="suggestingPriceIdx === index" class="animate-spin material-symbols-outlined text-[14px]">sync</span>
                      <span v-else class="material-symbols-outlined text-[14px]">smart_toy</span>
                      Gợi ý
                    </button>
                  </div>
                  <input v-model="pl.gia" type="number" min="500" required placeholder="VD: 50000" 
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-bold text-[#d00000]" />
                  <p v-if="form.don_vi_tinh === 'tấn' && pl.gia" class="text-[10px] font-bold text-[#2E7D32] mt-1">
                    ~ {{ (pl.gia / 1000).toLocaleString('vi-VN') }} VNĐ/kg
                  </p>
                  <p v-if="form.don_vi_tinh === 'kg' && pl.gia" class="text-[10px] font-bold text-[#2E7D32] mt-1">
                    ~ {{ (pl.gia * 1000).toLocaleString('vi-VN') }} VNĐ/tấn
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div class="max-w-xs">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Đơn vị tính (Chung cho lô hàng)</label>
              <select v-model="form.don_vi_tinh" 
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer">
                <option value="kg">Kg</option>
                <option value="tấn">Tấn</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Khu vực / Tỉnh thành <span class="text-red-500">*</span></label>
              <select v-model="form.tinh_thanh" required 
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 cursor-pointer">
                <option value="" disabled>-- Chọn tỉnh thành --</option>
                <option v-for="prov in vietnamProvinces" :key="prov" :value="prov">{{ prov }}</option>
              </select>
            </div>

            <div v-if="tieuChuansList.length > 0">
              <label class="block text-sm font-bold text-slate-700 mb-2">Tiêu chuẩn nông sản đạt được</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label v-for="tc in tieuChuansList" :key="tc.tieuchuan_id" class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#2E7D32] transition-colors">
                  <input type="checkbox" :value="tc.tieuchuan_id" v-model="form.tieu_chuan_ids" class="w-5 h-5 text-[#2E7D32] rounded focus:ring-[#2E7D32] border-slate-300" />
                  <span class="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <span v-if="tc.icon_url" class="material-symbols-outlined text-sm text-[#2E7D32]">{{ tc.icon_url }}</span>
                    {{ tc.ten_tieu_chuan }}
                  </span>
                </label>
              </div>
            </div>

            <!-- VỊ TRÍ & BẢN ĐỒ LẤY HÀNG -->
            <div class="mt-4 border-t border-slate-200 pt-4">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-bold text-slate-700">Tọa độ lấy hàng (Bản đồ)</label>
                <select
                  v-if="savedLocations.length > 0"
                  v-model="selectedSavedLocation"
                  class="text-xs p-2 border border-slate-200 rounded-lg outline-none bg-white cursor-pointer w-48 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  <option value="">-- Chọn tọa độ đã lưu --</option>
                  <option
                    v-for="loc in savedLocations"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.ten_goi }}
                  </option>
                </select>
              </div>

              <!-- Search box -->
              <div class="flex gap-2 mb-3">
                <input
                  v-model="searchLocationText"
                  @keyup.enter.prevent="handleSearchLocation"
                  type="text"
                  placeholder="Nhập địa chỉ hoặc tọa độ (ví dụ: 10.7626, 106.6601) rồi nhấn Tìm..."
                  class="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#2E7D32]"
                />
                <button
                  type="button"
                  @click="handleSearchLocation"
                  :disabled="isSearching"
                  class="px-4 py-2 bg-[#2E7D32] text-white text-xs font-bold rounded-lg hover:bg-[#1B5E20] transition-colors flex items-center gap-1"
                >
                  <span
                    v-if="isSearching"
                    class="animate-spin material-symbols-outlined text-xs"
                    >sync</span
                  >
                  <span v-else class="material-symbols-outlined text-xs"
                    >search</span
                  >
                  Tìm vị trí
                </button>
              </div>

              <!-- Map Container -->
              <div
                id="edit-post-map"
                class="w-full h-64 rounded-xl border border-slate-200 overflow-hidden shadow-inner z-0"
              ></div>

              <div
                v-if="form.latitude && form.longitude"
                class="mt-2 text-xs font-bold text-[#2E7D32] flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-sm">location_on</span>
                Tọa độ đã chọn: {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}
              </div>
            </div>
          </div>
        </section>

        <!-- HÌNH ẢNH & MÔ TẢ -->
        <section>
          <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#2E7D32]">photo_library</span> Hình ảnh & Chi tiết
          </h2>
          <div class="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <!-- Hình ảnh cũ -->
            <div v-if="existingImages.length > 0">
              <label class="block text-sm font-bold text-slate-700 mb-2">Hình ảnh hiện tại</label>
              <div class="flex flex-wrap gap-3">
                <div v-for="(img, idx) in existingImages" :key="idx" class="relative text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 flex flex-col items-center gap-1 group/img" :class="img.is_main ? 'ring-2 ring-[#2E7D32] bg-[#c8e6c9]' : ''">
                  <!-- Badge ảnh chính -->
                  <span v-if="img.is_main" class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                    <span class="material-symbols-outlined text-[10px]">star</span>
                    Chính
                  </span>
                  
                  <div class="w-24 h-24 rounded-lg overflow-hidden relative group">
                    <img :src="getFullUrl(img)" class="w-full h-full object-cover" />
                  </div>
                  
                  <div class="flex gap-1 mt-1">
                    <button v-if="!img.is_main" @click.prevent="setMainImage('existing', idx)" class="px-2 py-1 bg-white text-[#2E7D32] rounded border border-[#2E7D32]/20 hover:bg-[#2E7D32] hover:text-white transition-colors" title="Đặt làm ảnh chính">Chọn chính</button>
                    <button @click.prevent="removeExistingImage(idx)" class="px-2 py-1 bg-white text-red-500 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors" title="Xoá ảnh">Xoá</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tải thêm hình -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Tải thêm hình ảnh mới</label>
              <div class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-300 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-colors relative group">
                <div class="space-y-2 text-center relative z-10">
                  <div class="w-16 h-16 bg-[#e8f5e9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <div class="flex text-sm text-slate-600 justify-center">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-bold text-[#2E7D32] hover:text-[#1B5E20] focus-within:outline-none">
                      <span>Nhấn để chọn ảnh</span>
                      <input id="file-upload" type="file" class="sr-only" multiple accept="image/*" @change="handleFileChange">
                    </label>
                    <p class="pl-1 text-slate-500 font-medium">hoặc kéo thả vào đây</p>
                  </div>
                  <p class="text-xs text-slate-400 font-medium">Định dạng hỗ trợ: PNG, JPG, GIF (Tối đa 5MB)</p>

                  <div v-if="selectedImages.length > 0" class="mt-6 flex flex-wrap gap-3 justify-center">
                    <div v-for="(imgObj, index) in selectedImages" :key="'new'+index" class="relative text-xs font-bold bg-[#e8f5e9] text-[#2E7D32] px-3 py-2 rounded-xl border border-[#2E7D32]/20 flex flex-col items-center gap-1 group/img" :class="imgObj.isMain ? 'ring-2 ring-[#2E7D32] bg-[#c8e6c9]' : ''">
                      <!-- Badge ảnh chính -->
                      <span v-if="imgObj.isMain" class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <span class="material-symbols-outlined text-[10px]">star</span>
                        Chính
                      </span>
                      
                      <span class="material-symbols-outlined text-[18px]">image</span>
                      <span class="truncate w-20 text-center">{{ imgObj.file.name }}</span>
                      
                      <div class="flex gap-1 mt-1">
                        <button v-if="!imgObj.isMain" @click.prevent="setMainImage('new', index)" class="px-2 py-1 bg-white text-[#2E7D32] rounded border border-[#2E7D32]/20 hover:bg-[#2E7D32] hover:text-white transition-colors" title="Đặt làm ảnh chính">Chọn chính</button>
                        <button @click.prevent="removeSelectedImage(index)" class="px-2 py-1 bg-white text-red-500 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors" title="Xoá ảnh">Xoá</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mô tả -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
              <textarea v-model="form.mo_ta" rows="5" 
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-medium text-slate-800 resize-none"></textarea>
            </div>
          </div>
        </section>

        <!-- BUTTONS -->
        <div class="pt-6 flex flex-col sm:flex-row gap-4 justify-end border-t border-slate-100">
          <button type="button" @click="router.back()" class="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all">
            Hủy bỏ
          </button>
          <button type="submit" :disabled="loading" class="w-full sm:w-auto px-10 py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
            <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            {{ loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
