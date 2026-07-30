<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { BaiDang } from '@/service/baidang.ts'
import api from '@/service/api.ts'

const posts = ref<any[]>([])
const categories = ref<any[]>([])
const chungLoais = ref<any[]>([])
const loading = ref(true)
const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const sortOption = ref('newest')

// Phân trang
const currentPage = ref(1)
const itemsPerPage = 15

// Menu danh mục mobile/desktop
const isCategoryOpen = ref(false)

// Các biến trạng thái cho bộ lọc
const filterProvince = ref<string>('')
const filterPriceRange = ref<string>('')
const filterStandard = ref<string>('')
const filterMinRating = ref<number>(0)

// Trích xuất danh sách tỉnh thành và tiêu chuẩn từ posts
const availableProvinces = computed(() => {
  const p = new Set(posts.value.map(x => x.tinh_thanh).filter(Boolean))
  return Array.from(p).sort()
})

const availableStandards = computed(() => {
  const s = new Set<string>()
  posts.value.forEach(p => {
    if (p.tieuChuans) {
      p.tieuChuans.forEach((t: any) => s.add(t.ten_tieu_chuan))
    }
  })
  return Array.from(s).sort()
})

const getImageUrl = (images: any) => {
  if (!images) return 'https://placehold.co/300x300?text=Khong+co+anh'
  let firstImage = Array.isArray(images) && images.length > 0 ? images[0] : images;
  if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    firstImage = firstImage.url;
  }
  if (typeof firstImage === 'string') {
    return firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage.startsWith('/') ? '' : '/'}${firstImage}`
  }
  return 'https://placehold.co/300x300?text=Khong+co+anh'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const fetchCategories = async () => {
  try {
    const [catRes, clRes] = await Promise.all([
      api.get('/danh-muc').catch(() => ({ data: [] })),
      api.get('/chung-loai').catch(() => ({ data: [] }))
    ])
    categories.value = catRes.data?.value || catRes.data || []
    chungLoais.value = clRes.data?.value || clRes.data || []
  } catch (e) {
    console.error('Lỗi lấy danh mục:', e)
  }
}

const getChildCategories = (chungloaiId: number) => {
  return categories.value.filter(c => c.chungloai_id === chungloaiId)
}

const expandedCategory = ref<number | null>(null)
const toggleCategory = (id: number) => {
  expandedCategory.value = expandedCategory.value === id ? null : id
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await BaiDang.getAll({ trang_thai: 'dang_ban' })
    let allPosts = Array.isArray(res) ? res : (res.value || res.data || [])
    
    // Nếu có query category thì lọc theo danhmuc_id hoặc chungloai_id
    if (route.query.category) {
      const catQuery = String(route.query.category)
      if (catQuery.startsWith('cl_')) {
        const clId = Number(catQuery.split('_')[1])
        allPosts = allPosts.filter((p: any) => {
          const category = categories.value.find(c => c.danhmuc_id === p.danhmuc_id)
          return category && category.chungloai_id === clId
        })
      } else {
        allPosts = allPosts.filter((p: any) => p.danhmuc_id === Number(catQuery))
      }
    }
    
    posts.value = allPosts
    currentPage.value = 1
  } catch (e) {
    console.error('Lỗi lấy bài đăng:', e)
  } finally {
    loading.value = false
  }
}

const filteredAndSortedPosts = computed(() => {
  let list = [...posts.value]

  // Lọc theo từ khóa
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.tieu_de?.toLowerCase().includes(q) ||
        p.ten_nong_san?.toLowerCase().includes(q) ||
        p.tinh_thanh?.toLowerCase().includes(q)
    )
  }

  // Lọc theo tỉnh thành
  if (filterProvince.value) {
    list = list.filter(p => p.tinh_thanh === filterProvince.value)
  }

  // Lọc theo giá
  if (filterPriceRange.value) {
    if (filterPriceRange.value === 'under-50') {
      list = list.filter(p => p.gia_per_kg < 50000)
    } else if (filterPriceRange.value === '50-100') {
      list = list.filter(p => p.gia_per_kg >= 50000 && p.gia_per_kg <= 100000)
    } else if (filterPriceRange.value === 'over-100') {
      list = list.filter(p => p.gia_per_kg > 100000)
    }
  }

  // Lọc theo tiêu chuẩn
  if (filterStandard.value) {
    list = list.filter(p => {
      if (!p.tieuChuans) return false;
      return p.tieuChuans.some((t: any) => t.ten_tieu_chuan === filterStandard.value)
    })
  }

  // Lọc theo đánh giá người bán
  if (filterMinRating.value > 0) {
    list = list.filter(p => p.nguoiDang && Number(p.nguoiDang.diem_trung_binh) >= filterMinRating.value)
  }

  // Sắp xếp
  if (sortOption.value === 'price-asc') {
    list.sort((a, b) => a.gia_per_kg - b.gia_per_kg)
  } else if (sortOption.value === 'price-desc') {
    list.sort((a, b) => b.gia_per_kg - a.gia_per_kg)
  } else {
    // newest (updated_at)
    list.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
  }

  return list
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAndSortedPosts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedPosts.value.length / itemsPerPage)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch([searchQuery, sortOption, filterProvince, filterPriceRange, filterStandard, filterMinRating], () => {
  currentPage.value = 1
})

watch(() => route.query, () => {
  if (route.query.category !== undefined) {
    fetchPosts()
    isCategoryOpen.value = false
  }
  
  if (route.query.province !== undefined) {
    filterProvince.value = route.query.province ? String(route.query.province) : ''
  }
  
  if (route.query.standard !== undefined) {
    filterStandard.value = route.query.standard ? String(route.query.standard) : ''
  }
  
  if (route.query.price !== undefined) {
    filterPriceRange.value = route.query.price ? String(route.query.price) : ''
  }
  
  if (route.query.rating !== undefined) {
    filterMinRating.value = route.query.rating ? Number(route.query.rating) : 0
  }
}, { deep: true })

onMounted(() => {
  if (route.query.province) filterProvince.value = String(route.query.province)
  if (route.query.standard) filterStandard.value = String(route.query.standard)
  if (route.query.price) filterPriceRange.value = String(route.query.price)
  if (route.query.rating) filterMinRating.value = Number(route.query.rating)

  fetchCategories()
  fetchPosts()
})
</script>

<template>
  <div class="products-root bg-[#f8fafc] min-h-screen">
    <!-- Backdrop cho mobile menu -->
    <transition name="fade">
      <div v-if="isCategoryOpen" @click="isCategoryOpen = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"></div>
    </transition>

    <!-- Sidebar Danh mục -->
    <aside
      class="fixed top-0 left-0 h-screen w-80 max-w-full bg-white z-50 shadow-[20px_0_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out overflow-y-auto"
      :class="isCategoryOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 md:p-8">
        <div class="flex items-center justify-between mb-8">
          <h3 class="font-black text-2xl text-slate-800 flex items-center gap-3 uppercase tracking-tight">
            <span class="w-10 h-10 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">category</span>
            </span>
            Danh mục
          </h3>
          <button @click="isCategoryOpen = false" class="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-500">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <ul class="space-y-4">
          <li>
            <RouterLink
              to="/products"
              class="group flex items-center justify-between py-4 px-5 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide relative overflow-hidden"
              :class="[!route.query.category ? 'bg-[#2E7D32] text-white shadow-lg transform -translate-y-0.5' : 'text-slate-600 bg-slate-50 hover:bg-[#E8F5E9] hover:text-[#2E7D32]']"
            >
              <span class="relative z-10">Tất cả sản phẩm</span>
              <span v-if="!route.query.category" class="material-symbols-outlined text-[18px] relative z-10">check_circle</span>
            </RouterLink>
          </li>

          <li v-for="cl in chungLoais" :key="cl.chungloai_id" class="border border-slate-100 rounded-2xl overflow-hidden bg-white">
            <div 
              class="flex items-center justify-between py-4 px-5 cursor-pointer transition-colors"
              :class="[expandedCategory === cl.chungloai_id ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-slate-700 hover:bg-slate-50']"
              @click="toggleCategory(cl.chungloai_id)"
            >
              <span class="font-bold text-sm uppercase tracking-wide">{{ cl.ten_chung_loai }}</span>
              <span class="material-symbols-outlined text-[18px] transition-transform duration-300" :class="{'rotate-180': expandedCategory === cl.chungloai_id}">expand_more</span>
            </div>
            
            <ul v-show="expandedCategory === cl.chungloai_id" class="px-3 pb-3 space-y-1">
              <li>
                <RouterLink
                  :to="`/products?category=cl_${cl.chungloai_id}`"
                  class="flex items-center justify-between py-2.5 px-4 rounded-xl transition-all text-sm font-medium"
                  :class="[route.query.category === `cl_${cl.chungloai_id}` ? 'bg-[#2E7D32] text-white shadow-md' : 'text-slate-600 hover:bg-[#E8F5E9] hover:text-[#2E7D32]']"
                >
                  <span>Tất cả {{ cl.ten_chung_loai }}</span>
                  <span v-if="route.query.category === `cl_${cl.chungloai_id}`" class="material-symbols-outlined text-[16px]">check_circle</span>
                </RouterLink>
              </li>
              <li v-for="child in getChildCategories(cl.chungloai_id)" :key="child.danhmuc_id">
                <RouterLink
                  :to="`/products?category=${child.danhmuc_id}`"
                  class="flex items-center justify-between py-2.5 px-4 rounded-xl transition-all text-sm font-medium"
                  :class="[route.query.category == child.danhmuc_id ? 'bg-[#2E7D32] text-white shadow-md' : 'text-slate-600 hover:bg-[#E8F5E9] hover:text-[#2E7D32]']"
                >
                  <span>{{ child.ten_danh_muc }}</span>
                  <span v-if="route.query.category == child.danhmuc_id" class="material-symbols-outlined text-[16px]">check_circle</span>
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>

        <!-- BỘ LỌC -->
        <div class="mt-8 space-y-6 border-t border-slate-100 pt-6">
          <h3 class="font-black text-lg text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <span class="material-symbols-outlined text-[#2E7D32]">filter_alt</span>
            Bộ Lọc
          </h3>

          <!-- Mức giá -->
          <div class="space-y-3">
            <h4 class="font-bold text-sm text-slate-700 uppercase">Mức giá</h4>
            <div class="space-y-2 text-sm text-slate-600 font-medium">
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterPriceRange" value="" class="accent-[#2E7D32] size-4"> Tất cả
              </label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterPriceRange" value="under-50" class="accent-[#2E7D32] size-4"> Dưới 50.000đ
              </label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterPriceRange" value="50-100" class="accent-[#2E7D32] size-4"> Từ 50.000đ - 100.000đ
              </label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterPriceRange" value="over-100" class="accent-[#2E7D32] size-4"> Trên 100.000đ
              </label>
            </div>
          </div>

          <!-- Khu vực -->
          <div class="space-y-3" v-if="availableProvinces.length > 0">
            <h4 class="font-bold text-sm text-slate-700 uppercase">Khu vực</h4>
            <select v-model="filterProvince" class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none text-sm font-medium transition-all cursor-pointer">
              <option value="">Tất cả khu vực</option>
              <option v-for="prov in availableProvinces" :key="prov" :value="prov">{{ prov }}</option>
            </select>
          </div>

          <!-- Tiêu chuẩn -->
          <div class="space-y-3" v-if="availableStandards.length > 0">
            <h4 class="font-bold text-sm text-slate-700 uppercase">Tiêu chuẩn</h4>
            <select v-model="filterStandard" class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none text-sm font-medium transition-all cursor-pointer">
              <option value="">Tất cả tiêu chuẩn</option>
              <option v-for="std in availableStandards" :key="std" :value="std">{{ std }}</option>
            </select>
          </div>

          <!-- Đánh giá người bán -->
          <div class="space-y-3">
            <h4 class="font-bold text-sm text-slate-700 uppercase">Đánh giá người bán</h4>
            <div class="space-y-2 text-sm text-slate-600 font-medium">
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterMinRating" :value="0" class="accent-[#2E7D32] size-4"> Tất cả
              </label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterMinRating" :value="4" class="accent-[#2E7D32] size-4">
                <div class="flex items-center text-amber-400 -mt-0.5">
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px] text-slate-300" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="text-slate-500 ml-1.5 text-xs font-semibold">trở lên</span>
                </div>
              </label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-[#2E7D32]">
                <input type="radio" v-model="filterMinRating" :value="3" class="accent-[#2E7D32] size-4">
                <div class="flex items-center text-amber-400 -mt-0.5">
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px] text-slate-300" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="material-symbols-outlined text-[16px] text-slate-300" style="font-variation-settings: 'FILL' 1">star</span>
                  <span class="text-slate-500 ml-1.5 text-xs font-semibold">trở lên</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Nội dung chính -->
    <main class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans selection:bg-[#E8F5E9] selection:text-[#2E7D32]">
      <div class="w-full">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 border-b border-slate-200 pb-6">
          <div>
            <h1 class="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Khám Phá <span class="text-[#2E7D32]">Nông Sản</span>
            </h1>
            <p class="text-slate-500 mt-2 font-medium text-sm tracking-wide">
              Tìm kiếm nguồn cung cấp nông sản trực tiếp từ nhà vườn, số lượng lớn, giá sỉ
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button @click="isCategoryOpen = true" class="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 h-[46px]">
              <span class="material-symbols-outlined">filter_list</span>
              DANH MỤC
            </button>

            <div class="relative flex-1 min-w-[200px] sm:w-64 lg:w-72">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input v-model="searchQuery" type="text" placeholder="Tìm theo tên hoặc khu vực..." class="w-full h-[46px] bg-white border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-bold text-sm placeholder:text-slate-400 shadow-sm" />
            </div>

            <div class="relative w-full sm:w-48">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D32] text-[18px] pointer-events-none">sort</span>
              <select v-model="sortOption" class="w-full h-[46px] bg-white border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 outline-none transition-all font-bold text-sm appearance-none cursor-pointer shadow-sm">
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          <span class="material-symbols-outlined text-4xl text-[#2E7D32] animate-bounce mb-3">agriculture</span>
          <p class="font-bold text-sm uppercase tracking-widest">Đang tải nông sản...</p>
        </div>

        <!-- Không có sản phẩm -->
        <div v-else-if="paginatedPosts.length === 0" class="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-500">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
          <p class="font-bold text-lg">Chưa tìm thấy bài đăng nào</p>
        </div>

        <!-- Grid sản phẩm -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          <div v-for="post in paginatedPosts" :key="post.baidang_id" class="group bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-200 hover:border-[#2E7D32]/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-3 relative">
            
            <div class="aspect-square relative overflow-hidden rounded-[18px] bg-slate-50 mb-4 cursor-pointer" @click="router.push(`/product/${post.baidang_id}`)">
              <img :src="getImageUrl(post.images)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" :alt="post.ten_nong_san" />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>

              <div class="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1.5 text-xs font-bold z-10 text-slate-700">
                <span class="material-symbols-outlined text-[14px] text-[#2E7D32]">location_on</span>
                {{ post.tinh_thanh }}
              </div>
            </div>

            <div class="flex flex-col flex-grow px-2">
              <RouterLink :to="`/product/${post.baidang_id}`" class="font-black text-slate-800 text-[15px] mb-1 line-clamp-2 leading-snug group-hover:text-[#2E7D32] transition-colors" :title="post.tieu_de">
                {{ post.tieu_de }}
              </RouterLink>
              
              <div class="text-xs font-semibold text-slate-500 mb-2">{{ post.ten_nong_san }}</div>

              <div v-if="post.tieuChuans && post.tieuChuans.length > 0" class="flex flex-wrap gap-1 mb-3">
                <span v-for="tc in post.tieuChuans" :key="tc.tieuchuan_id" 
                      class="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2E7D32] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-[#2E7D32]/20">
                  <span v-if="tc.icon_url" class="material-symbols-outlined text-[10px]">{{ tc.icon_url }}</span>
                  {{ tc.ten_tieu_chuan }}
                </span>
              </div>

              <div class="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="text-slate-500 font-medium">Sản lượng còn:</span>
                  <span class="font-bold text-slate-800">{{ post.so_luong_con_lai }} {{ post.don_vi_tinh }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 font-medium">Cập nhật:</span>
                  <span class="font-bold text-slate-700">{{ formatDate(post.updated_at) }}</span>
                </div>
              </div>

              <div class="mt-auto pt-1 flex items-center justify-between gap-y-2">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Giá bán</span>
                  <span class="text-[18px] font-black text-[#d00000]">
                    {{ formatPrice(post.gia_per_kg) }}<span class="text-xs text-slate-500 ml-1">/ {{ post.don_vi_tinh }}</span>
                  </span>
                </div>

                <RouterLink :to="`/product/${post.baidang_id}`" class="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center hover:bg-[#2E7D32] hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm" title="Xem chi tiết">
                  <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Phân trang -->
        <div v-if="totalPages > 1" class="mt-14 flex justify-center items-center gap-2">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-30 border border-slate-200 hover:border-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9] text-slate-600 bg-white shadow-sm">
            <span class="material-symbols-outlined text-sm">arrow_back_ios_new</span>
          </button>

          <div class="flex gap-2">
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="['w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all border shadow-sm', currentPage === page ? 'bg-[#2E7D32] border-[#2E7D32] text-white transform -translate-y-1' : 'bg-white border-slate-200 text-slate-600 hover:border-[#2E7D32] hover:text-[#2E7D32] hover:-translate-y-0.5']">
              {{ page }}
            </button>
          </div>

          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-30 border border-slate-200 hover:border-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9] text-slate-600 bg-white shadow-sm">
            <span class="material-symbols-outlined text-sm">arrow_forward_ios</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
