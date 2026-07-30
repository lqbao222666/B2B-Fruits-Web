<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaiDang } from '@/service/baidang.ts'
import { notify } from '@/utils/notifier.ts'
import api from '@/service/api.ts'

const router = useRouter()
const posts = ref<any[]>([])
const categories = ref<any[]>([])
const chungLoais = ref<any[]>([])
const filterCategoryId = ref<string | ''>('')
const loading = ref(true)

const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

onMounted(async () => {
  if (!user || (user.role !== 'nong_dan' && user.role !== 'NONG_DAN')) {
    notify.error('Chỉ Nông Dân mới được truy cập quản lý bài đăng!')
    router.push('/')
    return
  }
  await Promise.all([fetchCategories(), fetchMyPosts()])
})

const fetchCategories = async () => {
  try {
    const [catRes, clRes] = await Promise.all([
      api.get('/danh-muc').catch(() => ({ data: [] })),
      api.get('/chung-loai').catch(() => ({ data: [] }))
    ])
    categories.value = catRes.data?.value || catRes.data || []
    chungLoais.value = clRes.data?.value || clRes.data || []
  } catch (e) {
    console.error('Lỗi lấy danh mục', e)
  }
}

const getChildCategories = (chungloaiId: number) => {
  return categories.value.filter(c => c.chungloai_id === chungloaiId)
}

const fetchMyPosts = async () => {
  loading.value = true
  try {
    const res = await BaiDang.getByNongDan(user.user_id || user.id)
    posts.value = Array.isArray(res) ? res : (res.value || res.data || [])
  } catch (err) {
    console.error('Lỗi lấy bài đăng', err)
    notify.error('Không thể tải danh sách bài đăng.')
  } finally {
    loading.value = false
  }
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'cho_duyet': return { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    case 'dang_ban': return { text: 'Đang bán', class: 'bg-green-100 text-green-800 border-green-200' }
    case 'da_ban': return { text: 'Đã bán hết', class: 'bg-slate-100 text-slate-800 border-slate-200' }
    case 'an': return { text: 'Đang ẩn', class: 'bg-red-100 text-red-800 border-red-200' }
    default: return { text: status, class: 'bg-slate-100 text-slate-800' }
  }
}

const deletePost = async (id: number) => {
  if (!confirm('Nếu bài đăng đã có đơn hàng, hệ thống sẽ chuyển sang trạng thái "Ngừng cung cấp". Nếu chưa có đơn hàng nào, bài đăng sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?')) return
  try {
    await BaiDang.delete(id)
    notify.success('Đã xử lý thành công!')
    await fetchMyPosts()
  } catch (err) {
    notify.error('Xoá bài đăng thất bại')
  }
}

const toggleVisibility = async (post: any) => {
  try {
    if (post.trang_thai === 'an') {
      await BaiDang.moLaiBaiDang(post.baidang_id)
      notify.success('Đã hiển thị lại bài đăng')
    } else {
      await BaiDang.anBaiDang(post.baidang_id, 'Người đăng tự ẩn')
      notify.success('Đã ẩn bài đăng')
    }
    await fetchMyPosts()
  } catch (err) {
    notify.error('Thay đổi trạng thái thất bại')
  }
}

const filteredPosts = computed(() => {
  if (!filterCategoryId.value) return posts.value
  return posts.value.filter(p => {
    if (typeof filterCategoryId.value === 'string' && filterCategoryId.value.startsWith('cl_')) {
      const clId = parseInt(filterCategoryId.value.split('_')[1])
      const child = categories.value.find(c => c.danhmuc_id === p.danhmuc_id)
      return child && child.chungloai_id === clId
    } else {
      return p.danhmuc_id === Number(filterCategoryId.value)
    }
  })
})

const getImageUrl = (images: any) => {
  if (!images) return 'https://placehold.co/100x100?text=Khong+co+anh'
  let firstImage = Array.isArray(images) && images.length > 0 ? images[0] : images;
  if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    firstImage = firstImage.url;
  }
  if (typeof firstImage === 'string') {
    return firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage.startsWith('/') ? '' : '/'}${firstImage}`
  }
  return 'https://placehold.co/100x100?text=Khong+co+anh'
}
</script>

<template>
  <div class="manage-posts-root bg-[#f8fafc] py-10 px-4 min-h-screen font-sans">
    <div class="max-w-6xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-800 uppercase tracking-tight">Quản lý <span class="text-[#2E7D32]">Bài đăng</span></h1>
          <p class="text-slate-500 font-medium text-sm mt-1">Quản lý lô hàng nông sản bạn đang rao bán</p>
        </div>
        <div class="flex items-center gap-3">
          <select v-model="filterCategoryId" class="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 outline-none focus:border-[#2E7D32] transition-colors cursor-pointer">
            <option value="">Tất cả danh mục</option>
            <template v-for="cl in chungLoais" :key="'cl_'+cl.chungloai_id">
              <option :value="'cl_' + cl.chungloai_id" class="font-bold text-slate-800">{{ cl.ten_chung_loai }}</option>
              <option v-for="child in getChildCategories(cl.chungloai_id)" :key="child.danhmuc_id" :value="String(child.danhmuc_id)">
                &nbsp;&nbsp;&nbsp;&nbsp;↳ {{ child.ten_danh_muc }}
              </option>
            </template>
          </select>
          <RouterLink to="/create-post" class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
            <span class="material-symbols-outlined font-bold">add</span>
            ĐĂNG BÁN MỚI
          </RouterLink>
        </div>
      </div>

      <!-- SKELETON LOADING -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 flex gap-6">
          <div class="w-24 h-24 bg-slate-200 rounded-xl"></div>
          <div class="flex-1 space-y-3">
            <div class="h-6 bg-slate-200 rounded w-1/3"></div>
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="posts.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
        <div class="w-24 h-24 bg-[#e8f5e9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Chưa có bài đăng nào</h3>
        <p class="text-slate-500 mb-6">Bạn chưa tạo bài đăng bán nông sản nào trên hệ thống.</p>
        <button @click="router.push('/create-post')" class="px-8 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition-all shadow-sm">
          Tạo Bài Đăng Ngay
        </button>
      </div>

      <!-- POST LIST -->
      <div v-else class="space-y-4">
        <div v-for="post in filteredPosts" :key="post.baidang_id" class="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group">
          
          <!-- Image -->
          <div class="w-full md:w-32 h-40 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative">
            <img :src="getImageUrl(post.images)" :alt="post.ten_nong_san" class="w-full h-full object-cover" />
            <div class="absolute inset-0 border border-black/5 rounded-xl"></div>
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-4">
                <h3 class="text-lg font-bold text-slate-800 line-clamp-2 leading-tight">
                  {{ post.tieu_de }}
                </h3>
                <span class="px-3 py-1 text-xs font-bold rounded-lg border whitespace-nowrap" :class="getStatusBadge(post.trang_thai).class">
                  {{ getStatusBadge(post.trang_thai).text }}
                </span>
              </div>
              <p class="text-sm font-semibold text-[#2E7D32] mt-1">{{ post.ten_nong_san }} &bull; {{ post.danhMuc?.ten_danh_muc || 'Danh mục trống' }}</p>
              
              <div class="grid grid-cols-2 md:flex md:flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                  <span class="font-bold text-[#d00000]">{{ formatPrice(post.gia_per_kg) }} / {{ post.don_vi_tinh }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-slate-400">inventory</span>
                  <span class="font-medium">Còn: <strong class="text-slate-800">{{ post.so_luong_con_lai }}</strong> {{ post.don_vi_tinh }}</span>
                </div>
                <div class="flex items-center gap-1.5 col-span-2">
                  <span class="material-symbols-outlined text-[16px] text-slate-400">update</span>
                  <span class="font-medium">Ngày áp dụng: <strong class="text-slate-800">{{ formatDate(post.updated_at) }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 mt-5 pt-5 border-t border-slate-50 justify-end">
              <button @click="toggleVisibility(post)" class="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">{{ post.trang_thai === 'an' ? 'visibility' : 'visibility_off' }}</span>
                {{ post.trang_thai === 'an' ? 'Hiện bài' : 'Ẩn bài' }}
              </button>
              
              <button @click="router.push(`/edit-post/${post.baidang_id}`)" class="px-4 py-2 text-sm font-bold text-[#1565C0] bg-[#E3F2FD] hover:bg-[#BBDEFB] rounded-lg transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Sửa bài
              </button>
              
              <button @click="deletePost(post.baidang_id)" class="px-4 py-2 text-sm font-bold text-[#C62828] bg-[#FFEBEE] hover:bg-[#FFCDD2] rounded-lg transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">block</span>
                Xóa / Ngừng
              </button>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
