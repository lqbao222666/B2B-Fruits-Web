<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Account } from '@/service/account.ts'
import { notify } from '@/utils/notifier.ts'
import api from '@/service/api.ts'
import LocationSelector from '@/components/LocationSelector.vue'

const router = useRouter()
const isEditing = ref(false)
const loading = ref(false)
const avatarLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const showAvatarModal = ref(false)

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mittens',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucy',
]

const accountInfo = reactive({
  id: null as number | null,
  email: '',
  role: '',
  isActive: true,
  avatar: null as string | null,
})

const profile = reactive({
  id: null as number | null,
  fullName: '',
  phone: '',
  address: '',
  gender: 'Nam',
  dob: '',
  accountId: null as number | null,
  ma_so_thue: '',
  ten_co_so_kd: '',
  doi_tuong_dang_ky: '',
  tinh_thanh: '',
  huyen_xa: '',
  quan_huyen: '',
  phuong_xa: '',
  dia_chi_cu_the: '',
  giay_phep_urls: [] as string[],
  thong_tin_xuat_hoa_don: '',
  // Fields for Doanh Nghiep
  ten_cong_ty: '',
  nganh_kinh_doanh: '',
  nguoi_dai_dien: '',
  chuc_vu: '',
  website: '',
  email_lien_he: '',
  mo_ta: '',
  so_cmnd_cccd: '',
  dien_tich_ha: null as number | null,
  nong_san_chinh: '',
  chung_nhan: '',
  mo_ta_ban_than: '',
})

// Hàm nối chuỗi URL ảnh từ Backend
const getAvatarUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:3000${path}`;
};

const fetchProfile = async () => {
  const userStorage = localStorage.getItem('user')
  if (!userStorage) {
    router.push('/login')
    return
  }

  try {
    const userData = JSON.parse(userStorage)
    const userId = userData.user_id || userData.id
    const accountRes = await Account.getAccount(userId)

    if (accountRes) {
      const accId = accountRes.user_id || accountRes.id || userId;
      accountInfo.id = accId
      accountInfo.email = accountRes.email
      accountInfo.role = accountRes.role
      accountInfo.isActive = accountRes.isActive
      accountInfo.avatar = accountRes.avatar_url || accountRes.avatar

      if (accountRes.avatar) {
        userData.avatar = accountRes.avatar
        localStorage.setItem('user', JSON.stringify(userData))
        window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }))
      }

      profile.accountId = accId
      profile.fullName = accountRes.full_name || ''
      profile.phone = accountRes.phone || ''
      profile.gender = accountRes.gioi_tinh || 'Nam'

      if (accountRes.ngay_sinh) {
        profile.dob = new Date(accountRes.ngay_sinh).toISOString().split('T')[0]
      }

      const roleStr = accountInfo.role ? accountInfo.role.toLowerCase() : '';
      const isNongDan = roleStr === 'nong_dan' || roleStr === 'nông dân' || roleStr === 'nong dan';
      const isDoanhNghiep = roleStr === 'doanh_nghiep' || roleStr === 'doanh nghiệp' || roleStr === 'doanh nghiep';

      if (isNongDan) {
        try {
          const ndRes = await api.get(`/nong-dan/${accId}`)
          if (ndRes.data) {
            const nd = ndRes.data
            profile.ma_so_thue = nd.ma_so_thue || ''
            profile.ten_co_so_kd = nd.ten_co_so_kd || ''
            profile.doi_tuong_dang_ky = nd.doi_tuong_dang_ky || ''
            profile.tinh_thanh = nd.tinh_thanh || ''
            profile.huyen_xa = nd.huyen_xa || ''
            if (nd.huyen_xa) {
              const parts = nd.huyen_xa.split(', ')
              profile.quan_huyen = parts[0] || ''
              profile.phuong_xa = parts[1] || ''
            }
            profile.dia_chi_cu_the = nd.dia_chi_cu_the || ''
            profile.giay_phep_urls = nd.giay_phep_urls || []
            profile.thong_tin_xuat_hoa_don = nd.thong_tin_xuat_hoa_don ? nd.thong_tin_xuat_hoa_don.noi_dung : ''
            profile.so_cmnd_cccd = nd.so_cmnd_cccd || ''
            profile.dien_tich_ha = nd.dien_tich_ha || null
            profile.nong_san_chinh = nd.nong_san_chinh || ''
            profile.chung_nhan = nd.chung_nhan || ''
            profile.mo_ta_ban_than = nd.mo_ta_ban_than || ''
            profile.email_lien_he = nd.email_lien_he || ''

            // Map common fields
            if (!profile.fullName || profile.fullName === 'Người dùng mới') profile.fullName = nd.ho_ten || profile.fullName
            if (!profile.phone) profile.phone = nd.so_dien_thoai || profile.phone
            if (!profile.address) {
              const fullAddress = [nd.dia_chi_cu_the, nd.huyen_xa, nd.tinh_thanh].filter(Boolean).join(', ')
              profile.address = fullAddress || profile.address
            }
          }
        } catch (e) { console.error('Error fetching nong_dan data:', e) }
      } else if (isDoanhNghiep) {
        try {
          const dnRes = await api.get(`/doanh-nghiep/${accId}`)
          if (dnRes.data) {
            const dn = dnRes.data
            profile.ten_cong_ty = dn.ten_cong_ty || ''
            profile.ma_so_thue = dn.ma_so_thue || ''
            profile.nganh_kinh_doanh = dn.nganh_kinh_doanh || ''
            profile.tinh_thanh = dn.tinh_thanh || ''
            profile.dia_chi_cu_the = dn.dia_chi || ''
            profile.website = dn.website || ''
            profile.phone = dn.so_dien_thoai || profile.phone
            profile.email_lien_he = dn.email_lien_he || ''
            profile.nguoi_dai_dien = dn.nguoi_dai_dien || ''
            profile.chuc_vu = dn.chuc_vu || ''
            profile.mo_ta = dn.mo_ta || ''

            // Map common fields
            if (!profile.fullName || profile.fullName === 'Người dùng mới') profile.fullName = dn.nguoi_dai_dien || profile.fullName
            if (!profile.phone) profile.phone = dn.so_dien_thoai || profile.phone
            if (!profile.address) {
              const fullAddress = [dn.dia_chi, dn.tinh_thanh].filter(Boolean).join(', ')
              profile.address = fullAddress || profile.address
            }
          }
        } catch (e) { console.error('Error fetching doanh_nghiep data:', e) }
      }
    }
  } catch (error: any) {
    console.error('Lỗi lấy thông tin profile:', error)
    notify.error('Không thể tải thông tin hồ sơ')
  }
}

const clickFileInput = () => {
  fileInput.value?.click()
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  if (!accountInfo.id) {
    notify.error('Không tìm thấy tài khoản để upload!')
    return
  }
  const responseAccount = await Account.uploadAvatar(accountInfo.id, file)
  console.log('responseAccount sau upload:', responseAccount)
  avatarLoading.value = true
  try {
    const responseAccount = await Account.uploadAvatar(accountInfo.id, file)

    // 1. Cập nhật state hiện tại
    accountInfo.avatar = responseAccount.avatar
    if (responseAccount.profile && responseAccount.profile.fullName) {
      profile.fullName = responseAccount.profile.fullName
    }

    // 2. Cập nhật Local Storage để Header và các trang khác nhận dữ liệu mới
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      userData.avatar = responseAccount.avatar
      localStorage.setItem('user', JSON.stringify(userData))

      // 3. Phát sự kiện để Header cập nhật ảnh tức thì (không cần F5)
      window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }))
    }

    notify.success('Cập nhật ảnh đại diện thành công!')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Cập nhật ảnh thất bại'
    notify.error(msg)
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } finally {
    avatarLoading.value = false
  }
}

const selectDefaultAvatar = async (avatarUrl: string) => {
  if (!accountInfo.id) return
  avatarLoading.value = true
  showAvatarModal.value = false
  try {
    const responseAccount = await Account.updateAvatar(accountInfo.id, avatarUrl)
    accountInfo.avatar = responseAccount.avatar_url || avatarUrl
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      userData.avatar = accountInfo.avatar
      localStorage.setItem('user', JSON.stringify(userData))
      window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }))
    }
    notify.success('Cập nhật ảnh đại diện thành công!')
  } catch (err: any) {
    notify.error('Cập nhật ảnh thất bại')
  } finally {
    avatarLoading.value = false
  }
}

const handleUpdate = async () => {
  if (!profile.accountId) {
    notify.error('Không tìm thấy tài khoản (accountId)!')
    return
  }

  loading.value = true
  try {
    try {
      await api.patch(`/users/${profile.accountId}/profile`, {
        full_name: profile.fullName,
        phone: profile.phone || null,
        gioi_tinh: profile.gender,
        ngay_sinh: profile.dob || null,
      })
    } catch (err) {
      console.warn('Could not update base user profile', err)
    }
    
    const roleStr = accountInfo.role ? accountInfo.role.toLowerCase() : '';
    const isNongDan = roleStr === 'nong_dan' || roleStr === 'nông dân' || roleStr === 'nong dan';
    const isDoanhNghiep = roleStr === 'doanh_nghiep' || roleStr === 'doanh nghiệp' || roleStr === 'doanh nghiep';

    if (isNongDan) {
      await api.patch(`/nong-dan/${profile.accountId}`, {
        ho_ten: profile.fullName || 'Nông dân',
        so_dien_thoai: profile.phone || '',
        tinh_thanh: profile.tinh_thanh || profile.address || 'Chưa cập nhật',
        ma_so_thue: profile.ma_so_thue || '',
        ten_co_so_kd: profile.ten_co_so_kd || '',
        doi_tuong_dang_ky: profile.doi_tuong_dang_ky || '',
        huyen_xa: [profile.quan_huyen, profile.phuong_xa].filter(Boolean).join(', ') || '',
        dia_chi_cu_the: profile.dia_chi_cu_the || '',
        thong_tin_xuat_hoa_don: profile.thong_tin_xuat_hoa_don ? { noi_dung: profile.thong_tin_xuat_hoa_don } : undefined,
        giay_phep_urls: profile.giay_phep_urls || [],
        so_cmnd_cccd: profile.so_cmnd_cccd || '',
        dien_tich_ha: profile.dien_tich_ha ? Number(profile.dien_tich_ha) : undefined,
        nong_san_chinh: profile.nong_san_chinh || '',
        chung_nhan: profile.chung_nhan || '',
        mo_ta_ban_than: profile.mo_ta_ban_than || '',
        email_lien_he: profile.email_lien_he || '',
      })
    } else if (isDoanhNghiep) {
      await api.patch(`/doanh-nghiep/${profile.accountId}`, {
        ten_cong_ty: profile.ten_cong_ty || 'Doanh nghiệp',
        ma_so_thue: profile.ma_so_thue || '',
        nganh_kinh_doanh: profile.nganh_kinh_doanh || '',
        tinh_thanh: profile.tinh_thanh || profile.address || 'Chưa cập nhật',
        dia_chi: [profile.dia_chi_cu_the, profile.phuong_xa, profile.quan_huyen].filter(Boolean).join(', ') || '',
        website: profile.website || '',
        so_dien_thoai: profile.phone || '',
        email_lien_he: profile.email_lien_he || '',
        nguoi_dai_dien: profile.nguoi_dai_dien || '',
        chuc_vu: profile.chuc_vu || '',
        mo_ta: profile.mo_ta || '',
      })
    }

    isEditing.value = false
    notify.success('Cập nhật thông tin thành công!')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Cập nhật thất bại'
    notify.error(Array.isArray(msg) ? msg.join(', ') : msg)
  } finally {
    loading.value = false
  }
}

const goToUpdatePassword = () => {
  router.push('/change-password')
}

onMounted(fetchProfile)
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] py-12 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
          <p class="text-slate-600 text-sm mt-1 font-medium">Quản lý thông tin định danh và bảo mật của bạn.</p>
        </div>

        <button
          @click="isEditing = !isEditing"
          class="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95"
          :class="isEditing ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-[#658a22] text-white hover:bg-[#58791d]'"
        >
          <span class="material-symbols-outlined text-[20px]">{{ isEditing ? 'close' : 'edit' }}</span>
          {{ isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div class="flex flex-col items-center text-center">

              <div class="relative inline-block mb-5">
                <div
                  class="size-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden group relative transition-all"
                  :class="{ 'cursor-pointer hover:border-[#658a22]/30': isEditing }"
                  @click="isEditing && clickFileInput()"
                >
                  <div v-if="avatarLoading" class="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <span class="animate-spin border-2 border-white border-t-transparent rounded-full w-6 h-6"></span>
                  </div>

                  <img
                    v-if="accountInfo.avatar"
                    :src="getAvatarUrl(accountInfo.avatar)"
                    class="w-full h-full object-cover"
                    alt="Avatar"
                  />
                  <div v-else class="w-full h-full bg-[#eef4e6] flex items-center justify-center text-[#658a22] text-3xl font-bold uppercase">
                    {{ accountInfo.email ? accountInfo.email.substring(0, 2) : 'TP' }}
                  </div>

                  <div v-if="isEditing" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <span class="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                  </div>
                </div>

                <button
                  v-if="isEditing"
                  @click="showAvatarModal = true"
                  class="bg-white border border-slate-200 shadow-md rounded-full size-8 flex items-center justify-center absolute bottom-0 right-0 text-slate-600 hover:bg-slate-50 active:scale-95 z-10"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              <!-- Avatar Selection Modal -->
              <div v-if="showAvatarModal" class="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showAvatarModal = false">
                <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn">
                  <button @click="showAvatarModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors">
                    <span class="material-symbols-outlined text-xl">close</span>
                  </button>
                  <h3 class="text-xl font-bold text-slate-800 mb-2">Chọn ảnh đại diện</h3>
                  <p class="text-sm text-slate-500 mb-6">Bạn có thể chọn một ảnh có sẵn hoặc tải lên từ thiết bị của mình.</p>
                  
                  <div class="grid grid-cols-4 gap-4 mb-6">
                    <button 
                      v-for="(url, idx) in DEFAULT_AVATARS" 
                      :key="idx"
                      @click="selectDefaultAvatar(url)"
                      class="aspect-square rounded-2xl border-2 border-transparent hover:border-[#658a22] hover:shadow-lg transition-all overflow-hidden bg-slate-50 group p-1"
                    >
                      <img :src="url" class="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="h-px bg-slate-200 flex-1"></div>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc</span>
                    <div class="h-px bg-slate-200 flex-1"></div>
                  </div>
                  
                  <button 
                    @click="clickFileInput" 
                    class="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">upload</span>
                    Tải ảnh từ máy tính
                  </button>
                  
                  <!-- Ẩn input file thực sự -->
                  <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" class="hidden" />
                </div>
              </div>

              <h2 class="font-bold text-xl text-slate-900">{{ profile.fullName || 'Chưa có tên' }}</h2>
              <p class="text-slate-500 font-medium text-sm mt-1">{{ accountInfo.email }}</p>

              <div class="mt-5 flex flex-wrap justify-center gap-2">
                <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">ID: #{{ accountInfo.id }}</span>
                <span class="px-3 py-1 bg-[#658a22]/10 text-[#658a22] rounded-lg text-xs font-bold border border-[#658a22]/20">{{ accountInfo.role }}</span>
              </div>
            </div>

            <hr class="my-6 border-slate-100" />

            <button
              @click="goToUpdatePassword"
              class="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span class="material-symbols-outlined text-[20px]">lock</span>
              Đổi mật khẩu bảo mật
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <form @submit.prevent="handleUpdate" class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 class="font-bold text-lg text-slate-800">Thông tin cá nhân</h3>
            </div>

            <div class="p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Họ và tên</label>
                  <input
                    v-model="profile.fullName"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Giới tính</label>
                  <select
                    v-model="profile.gender"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Số điện thoại</label>
                  <input
                    v-model="profile.phone"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Ngày sinh</label>
                  <input
                    v-model="profile.dob"
                    type="date"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Địa chỉ</label>
                <textarea
                  v-model="profile.address"
                  :disabled="!isEditing"
                  rows="3"
                  class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all resize-none disabled:bg-slate-50"
                  placeholder="Nhập địa chỉ thường trú"
                ></textarea>
              </div>

              <!-- Thêm form Nông Dân -->
              <template v-if="accountInfo.role && (accountInfo.role.toLowerCase() === 'nong_dan' || accountInfo.role.toLowerCase() === 'nông dân' || accountInfo.role.toLowerCase() === 'nong dan')">
                <div class="mt-8 border-t border-slate-100 pt-6">
                  <h4 class="font-bold text-md text-slate-800 mb-4">Thông tin Kinh Doanh (Dành cho Nông Dân/Người bán)</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Mã số thuế (*)</label>
                      <input
                        v-model="profile.ma_so_thue"
                        :disabled="!isEditing"
                        required
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="Mã số thuế doanh nghiệp/hộ kinh doanh"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Tên Cơ Sở Kinh Doanh (*)</label>
                      <input
                        v-model="profile.ten_co_so_kd"
                        :disabled="!isEditing"
                        required
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="Nhập tên theo giấy phép"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Đối tượng đăng ký (*)</label>
                      <select
                        v-model="profile.doi_tuong_dang_ky"
                        :disabled="!isEditing"
                        required
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                      >
                        <option value="" disabled>Chọn đối tượng</option>
                        <option value="CaNhan">Cá nhân kinh doanh</option>
                        <option value="HoKinhDoanh">Hộ kinh doanh</option>
                        <option value="HopTacXa">Hợp tác xã</option>
                        <option value="DoanhNghiep">Doanh nghiệp</option>
                      </select>
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Khu vực (Tỉnh/Quận/Xã)</label>
                      <div :class="{'opacity-50 pointer-events-none': !isEditing}">
                        <LocationSelector
                          v-model:province="profile.tinh_thanh"
                          v-model:district="profile.quan_huyen"
                          v-model:ward="profile.phuong_xa"
                        />
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Địa chỉ chi tiết</label>
                      <input
                        v-model="profile.dia_chi_cu_the"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                    
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Số CMND / CCCD</label>
                      <input
                        v-model="profile.so_cmnd_cccd"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="Căn cước công dân"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Diện tích (Hecta)</label>
                      <input
                        v-model="profile.dien_tich_ha"
                        type="number"
                        step="0.01"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="2.5"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Nông sản chính</label>
                      <input
                        v-model="profile.nong_san_chinh"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="VD: Sầu riêng, Bưởi..."
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Chứng nhận đạt được</label>
                      <input
                        v-model="profile.chung_nhan"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="VD: VietGAP, GlobalGAP..."
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email liên hệ</label>
                      <input
                        v-model="profile.email_lien_he"
                        :disabled="!isEditing"
                        type="email"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="Email làm việc"
                      />
                    </div>
                  </div>
                  <div class="mt-4 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Mô tả bản thân / Cơ sở</label>
                    <textarea
                      v-model="profile.mo_ta_ban_than"
                      :disabled="!isEditing"
                      rows="3"
                      class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all resize-none disabled:bg-slate-50"
                      placeholder="Giới thiệu về kinh nghiệm, quy trình canh tác..."
                    ></textarea>
                  </div>
                  <div class="mt-4 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Thông tin xuất hoá đơn</label>
                    <textarea
                      v-model="profile.thong_tin_xuat_hoa_don"
                      :disabled="!isEditing"
                      rows="2"
                      class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all resize-none disabled:bg-slate-50"
                      placeholder="Tên cty, MST, Địa chỉ (Không bắt buộc)"
                    ></textarea>
                  </div>
                </div>
              </template>

              <!-- Thêm form Doanh Nghiệp -->
              <template v-if="accountInfo.role && (accountInfo.role.toLowerCase() === 'doanh_nghiep' || accountInfo.role.toLowerCase() === 'doanh nghiệp' || accountInfo.role.toLowerCase() === 'doanh nghiep')">
                <div class="mt-8 border-t border-slate-100 pt-6">
                  <h4 class="font-bold text-md text-slate-800 mb-4">Thông tin Doanh Nghiệp (Dành cho Người mua)</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Tên Công Ty (*)</label>
                      <input
                        v-model="profile.ten_cong_ty"
                        :disabled="!isEditing"
                        required
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="Tên doanh nghiệp"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Mã số thuế (*)</label>
                      <input
                        v-model="profile.ma_so_thue"
                        :disabled="!isEditing"
                        required
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="Mã số thuế"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Ngành kinh doanh</label>
                      <input
                        v-model="profile.nganh_kinh_doanh"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="VD: Thu mua xuất khẩu, siêu thị..."
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Website</label>
                      <input
                        v-model="profile.website"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-4 focus:ring-[#658a22]/10 outline-none transition-all disabled:bg-slate-50"
                        placeholder="https://..."
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Người đại diện</label>
                      <input
                        v-model="profile.nguoi_dai_dien"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="Họ và tên người đại diện"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Chức vụ</label>
                      <input
                        v-model="profile.chuc_vu"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="VD: Giám đốc, Trưởng phòng thu mua..."
                      />
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Khu vực (Tỉnh/Quận/Xã)</label>
                      <div :class="{'opacity-50 pointer-events-none': !isEditing}">
                        <LocationSelector
                          v-model:province="profile.tinh_thanh"
                          v-model:district="profile.quan_huyen"
                          v-model:ward="profile.phuong_xa"
                        />
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Địa chỉ chi tiết</label>
                      <input
                        v-model="profile.dia_chi_cu_the"
                        :disabled="!isEditing"
                        class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all disabled:bg-slate-50"
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                  </div>
                  <div class="mt-4 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Mô tả doanh nghiệp</label>
                    <textarea
                      v-model="profile.mo_ta"
                      :disabled="!isEditing"
                      rows="3"
                      class="w-full px-4 py-3 text-slate-900 font-medium bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none transition-all resize-none disabled:bg-slate-50"
                      placeholder="Giới thiệu về quy mô, lĩnh vực hoạt động..."
                    ></textarea>
                  </div>
                </div>
              </template>

              <div v-if="isEditing" class="pt-4 flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-8 py-3.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-[#658a22]/20 active:scale-95"
                >
                  <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                  {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
