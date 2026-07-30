<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import CommentService from '@/service/comment'
import { notify } from '@/utils/notifier'

const comments = ref<any[]>([])
const loading = ref(true)

// --- Filter state ---
const filter = ref({
  visibility: 'ALL',
  rating: 0, // 0 = tất cả sao
  productId: '', // '' = tất cả sản phẩm
})

// --- Pagination state ---
const currentPage = ref(1)
const pageSize = ref(8)

// --- Danh sách sản phẩm duy nhất từ comments ---
const productList = computed(() => {
  const map = new Map<string, string>()
  comments.value.forEach((c) => {
    if (c.product?.id && c.product?.name) {
      map.set(c.product.id, c.product.name)
    }
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

// --- Lọc comments theo filter ---
const filteredComments = computed(() => {
  return comments.value.filter((c) => {
    const matchVisibility =
      filter.value.visibility === 'ALL' ||
      (filter.value.visibility === 'VISIBLE' && !c.isHidden) ||
      (filter.value.visibility === 'HIDDEN' && c.isHidden)

    const matchRating = filter.value.rating === 0 || c.rating === filter.value.rating

    const matchProduct = !filter.value.productId || c.product?.id === filter.value.productId

    return matchVisibility && matchRating && matchProduct
  })
})

// --- Phân trang ---
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredComments.value.length / pageSize.value)),
)

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredComments.value.slice(start, start + pageSize.value)
})

// Reset về trang 1 khi filter thay đổi
watch(
  filter,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// --- Danh sách số trang hiển thị ---
const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range: (number | '...')[] = []

  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)

  range.push(1)
  if (start > 2) range.push('...')
  for (let i = start; i <= end; i++) range.push(i)
  if (end < total - 1) range.push('...')
  if (total > 1) range.push(total)

  return range
})

// --- API ---
const fetchAllComments = async () => {
  loading.value = true
  try {
    const res = await CommentService.getComments({ visibility: 'ALL' }, true)
    comments.value = res.data || res
  } catch {
    notify.error('Không thể tải danh sách bình luận')
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (comment: any) => {
  try {
    if (comment.isHidden) {
      await CommentService.showComment(comment.id)
      notify.success('Đã hiển thị bình luận')
    } else {
      await CommentService.hideComment(comment.id)
      notify.success('Đã ẩn bình luận')
    }
    await fetchAllComments()
  } catch {
    notify.error('Thao tác thất bại')
  }
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN')

const resetFilters = () => {
  filter.value = { visibility: 'ALL', rating: 0, productId: '' }
}

onMounted(fetchAllComments)
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Quản lý bình luận</h2>
        <p class="text-slate-500 text-sm">
          Xem và kiểm duyệt đánh giá từ khách hàng
          <span v-if="!loading" class="ml-2 font-semibold text-[#658a22]">
            ({{ filteredComments.length }} kết quả)
          </span>
        </p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div
      class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-wrap gap-4 items-end"
    >
      <!-- Lọc theo trạng thái -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest"
          >Trạng thái</label
        >
        <select
          v-model="filter.visibility"
          class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#658a22] min-w-[150px]"
        >
          <option value="ALL">Tất cả</option>
          <option value="VISIBLE">Đang hiển thị</option>
          <option value="HIDDEN">Đang bị ẩn</option>
        </select>
      </div>

      <!-- Lọc theo sao -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest"
          >Số sao</label
        >
        <div
          class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
        >
          <button
            @click="filter.rating = 0"
            :class="
              filter.rating === 0 ? 'bg-[#658a22] text-white' : 'text-slate-500 hover:bg-slate-200'
            "
            class="px-3 py-0.5 rounded-lg text-xs font-black transition-all"
          >
            Tất cả
          </button>
          <button
            v-for="star in [1, 2, 3, 4, 5]"
            :key="star"
            @click="filter.rating = filter.rating === star ? 0 : star"
            :class="
              filter.rating === star
                ? 'bg-yellow-400 text-white'
                : 'text-slate-400 hover:bg-yellow-50'
            "
            class="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-black transition-all"
          >
            {{ star
            }}<span class="text-yellow-400" :class="filter.rating === star ? 'text-white' : ''"
              >★</span
            >
          </button>
        </div>
      </div>

      <!-- Lọc theo sản phẩm -->
      <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest"
          >Sản phẩm</label
        >
        <select
          v-model="filter.productId"
          class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#658a22] w-full"
        >
          <option value="">Tất cả sản phẩm</option>
          <option v-for="p in productList" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>

      <!-- Nút reset -->
      <button
        @click="resetFilters"
        class="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
      >
        <span class="material-symbols-outlined text-base">filter_alt_off</span>
        Xóa bộ lọc
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
      <div v-if="loading" class="p-20 text-center text-slate-400 font-bold">
        <span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
        <p>Đang xử lý dữ liệu...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">
                Khách hàng
              </th>
              <th class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">
                Sản phẩm
              </th>
              <th class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">
                Nội dung & Đánh giá
              </th>
              <th class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">
                Ngày tạo
              </th>
              <th
                class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest text-center"
              >
                Trạng thái
              </th>
              <th
                class="px-6 py-5 font-black text-slate-400 uppercase text-[11px] tracking-widest text-right"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="c in paginatedComments"
              :key="c.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full bg-[#658a22]/10 flex items-center justify-center text-[#658a22] font-bold"
                  >
                    {{ (c.account?.profile?.fullName || 'K')[0] }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-700 text-sm">
                      {{ c.account?.profile?.fullName || 'Khách' }}
                    </div>
                    <div class="text-[11px] text-slate-400">{{ c.account?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-[#658a22] truncate max-w-[150px]">
                  {{ c.product?.name }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex text-yellow-400 text-xs mb-1">
                  <span v-for="s in 5" :key="s">{{ s <= c.rating ? '★' : '☆' }}</span>
                  <span class="ml-1 text-slate-400 font-bold">{{ c.rating }}/5</span>
                </div>
                <div class="text-sm text-slate-600 max-w-xs line-clamp-2 italic">
                  "{{ c.content }}"
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-medium text-slate-500">
                {{ formatDate(c.createdAt) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="
                    c.isHidden
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  "
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border"
                >
                  {{ c.isHidden ? 'Đã ẩn' : 'Hiển thị' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="toggleStatus(c)"
                  :class="
                    c.isHidden
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-red-600 hover:bg-red-50'
                  "
                  class="p-2 rounded-xl transition-all"
                  title="Thay đổi trạng thái"
                >
                  <span class="material-symbols-outlined">{{
                    c.isHidden ? 'visibility' : 'visibility_off'
                  }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && filteredComments.length === 0" class="p-20 text-center">
        <span class="material-symbols-outlined text-6xl text-slate-200 mb-4"
          >comments_disabled</span
        >
        <p class="text-slate-400 font-bold">Không tìm thấy bình luận nào.</p>
        <button @click="resetFilters" class="mt-4 text-sm text-[#658a22] font-bold underline">
          Xóa bộ lọc
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && filteredComments.length > 0"
      class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <!-- Thông tin trang -->
      <p class="text-sm text-slate-400 font-medium">
        Hiển thị
        <span class="font-bold text-slate-700">
          {{ (currentPage - 1) * pageSize + 1 }}–{{
            Math.min(currentPage * pageSize, filteredComments.length)
          }}
        </span>
        trong tổng số
        <span class="font-bold text-slate-700">{{ filteredComments.length }}</span> bình luận
      </p>

      <!-- Nút phân trang -->
      <div class="flex items-center gap-1">
        <!-- Prev -->
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span class="material-symbols-outlined text-base">chevron_left</span>
        </button>

        <!-- Page numbers -->
        <template v-for="(page, idx) in pageNumbers" :key="idx">
          <span
            v-if="page === '...'"
            class="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
            >…</span
          >
          <button
            v-else
            @click="currentPage = page as number"
            :class="
              currentPage === page
                ? 'bg-[#658a22] text-white border-[#658a22] shadow-md'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            "
            class="w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all"
          >
            {{ page }}
          </button>
        </template>

        <!-- Next -->
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span class="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>

      <!-- Page size -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span>Hiển thị</span>
        <select
          v-model="pageSize"
          @change="currentPage = 1"
          class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#658a22]"
        >
          <option :value="5">5</option>
          <option :value="8">8</option>
          <option :value="15">15</option>
          <option :value="30">30</option>
        </select>
        <span>/ trang</span>
      </div>
    </div>
  </div>
</template>
