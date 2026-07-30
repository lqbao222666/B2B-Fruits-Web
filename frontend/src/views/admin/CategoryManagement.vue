<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Category } from '@/service/category.ts'
import { notify } from '@/utils/notifier.ts'

import { ChungLoaiService } from '@/service/chungloai.ts'

interface DanhMuc {
  danhmuc_id: number
  chungloai_id: number | null
  ten_danh_muc: string
  slug: string
  is_active: boolean
  chungLoai?: { ten_chung_loai: string }
}

interface ChungLoai {
  chungloai_id: number
  ten_chung_loai: string
}

const categories = ref<DanhMuc[]>([])
const chungLoais = ref<ChungLoai[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const form = ref({
  danhmuc_id: 0,
  ten_danh_muc: '',
  slug: '',
  chungloai_id: null as number | null
})

const getChungLoaiName = (cat: DanhMuc) => {
  return cat.chungLoai?.ten_chung_loai || '—'
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const [data, clData] = await Promise.all([
      Category.getAllCategories(),
      ChungLoaiService.getAll()
    ])
    categories.value = data
    chungLoais.value = clData
  } catch (error) {
    notify.error('Lỗi khi tải danh sách danh mục')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  form.value = { danhmuc_id: 0, ten_danh_muc: '', slug: '', chungloai_id: null }
  showModal.value = true
}

const openEditModal = (cat: DanhMuc) => {
  isEditing.value = true
  form.value = {
    danhmuc_id: cat.danhmuc_id,
    ten_danh_muc: cat.ten_danh_muc,
    slug: cat.slug,
    chungloai_id: cat.chungloai_id
  }
  showModal.value = true
}

const saveCategory = async () => {
  if (!form.value.ten_danh_muc.trim() || !form.value.slug.trim()) {
    notify.error('Vui lòng nhập tên và slug')
    return
  }

  try {
    const payload = {
      ten_danh_muc: form.value.ten_danh_muc,
      slug: form.value.slug,
      chungloai_id: form.value.chungloai_id || null
    }

    if (isEditing.value) {
      await Category.updateCategory(form.value.danhmuc_id, payload)
      notify.success('Cập nhật thành công')
    } else {
      await Category.createCategory(payload as any)
      notify.success('Thêm danh mục thành công')
    }
    showModal.value = false
    fetchCategories()
  } catch (error: any) {
    notify.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu')
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
  try {
    await Category.deleteCategory(id)
    notify.success('Đã xóa danh mục')
    fetchCategories()
  } catch (error: any) {
    notify.error(error.response?.data?.message || 'Lỗi khi xóa')
  }
}

// Generate slug tự động từ tên
const generateSlug = () => {
  let str = form.value.ten_danh_muc.toLowerCase()
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a')
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e')
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i')
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o')
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u')
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y')
  str = str.replace(/(đ)/g, 'd')
  str = str.replace(/([^0-9a-z-\s])/g, '')
  str = str.replace(/(\s+)/g, '-')
  str = str.replace(/^-+/g, '')
  str = str.replace(/-+$/g, '')
  form.value.slug = str
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Quản lý Danh mục & Chủng loại</h1>
        <p class="text-sm text-gray-500 mt-1">Cấu hình cây danh mục cho hệ thống</p>
      </div>
      <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">add</span>
        Thêm danh mục
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-10 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">ID</th>
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Tên Danh mục</th>
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Chủng loại (Cha)</th>
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Slug URL</th>
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Trạng thái</th>
            <th class="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="cat in categories" :key="cat.danhmuc_id" class="hover:bg-gray-50/50 transition-colors">
            <td class="py-3 px-6 text-gray-500">#{{ cat.danhmuc_id }}</td>
            <td class="py-3 px-6">
              <span class="font-medium text-gray-900">
                {{ cat.ten_danh_muc }}
              </span>
            </td>
            <td class="py-3 px-6 text-gray-600">{{ getChungLoaiName(cat) }}</td>
            <td class="py-3 px-6 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
            <td class="py-3 px-6">
              <span class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold" v-if="cat.is_active">Hoạt động</span>
              <span class="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold" v-else>Đã ẩn</span>
            </td>
            <td class="py-3 px-6 text-right">
              <button @click="openEditModal(cat)" class="text-blue-600 hover:text-blue-800 p-1 mr-2 rounded hover:bg-blue-50 transition-colors" title="Sửa">
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button @click="deleteCategory(cat.danhmuc_id)" class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Xóa">
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="6" class="py-8 text-center text-gray-500">Chưa có danh mục nào.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Tên danh mục <span class="text-red-500">*</span></label>
            <input v-model="form.ten_danh_muc" @input="!isEditing && generateSlug()" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nhập tên..." />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Slug URL <span class="text-red-500">*</span></label>
            <input v-model="form.slug" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm" placeholder="nhap-ten-slug" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Chủng loại</label>
            <select v-model="form.chungloai_id" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
              <option :value="null">-- Không chọn --</option>
              <option v-for="cl in chungLoais" :key="cl.chungloai_id" :value="cl.chungloai_id">
                {{ cl.ten_chung_loai }}
              </option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button @click="showModal = false" class="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
          <button @click="saveCategory" class="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg transition-colors">Lưu lại</button>
        </div>
      </div>
    </div>
  </div>
</template>
