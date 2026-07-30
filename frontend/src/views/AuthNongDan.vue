<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { reactive, ref, computed, onMounted } from 'vue'
import auth from '../service/auth.ts'
import Account from '../service/account.ts'
import { notify } from '@/utils/notifier.ts'
import api from '../service/api.ts'
import LocationSelector from '../components/LocationSelector.vue'

const router = useRouter()
const route = useRoute()

// ─── Mode: 'login' | 'register' ───
const mode = ref<'login' | 'register'>('login')
const step = ref(1) // register step 1 or 2
const loading = ref(false)

// ─── Form đăng nhập ───
const loginForm = reactive({ email: '', password: '' })
const showLoginPassword = ref(false)

// ─── Form đăng ký bước 1: tài khoản ───
const regForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  full_name: '',
  tinh_thanh: '',
  so_dien_thoai: '',
  ma_so_thue: '',
  ten_co_so_kd: '',
  doi_tuong_dang_ky: '',
  quan_huyen: '',
  phuong_xa: '',
  dia_chi_cu_the: '',
  giay_phep_urls: [] as string[],
  thong_tin_xuat_hoa_don: '',
})
const showRegPassword = ref(false)
const showRegConfirm = ref(false)

// ─── Quên mật khẩu ───
const isForgot = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)

// ─── Google redirect ───
onMounted(() => {
  const { token, id, email, role } = route.query
  if (token) {
    auth.saveToken(token as string)
    localStorage.setItem('user', JSON.stringify({ id, email, role }))
    notify.success(`Chào mừng ${email}!`)
    router.replace({ query: {} })
    setTimeout(() => router.push('/'), 500)
  }
})

// ─── Đăng nhập ───
const handleLogin = async () => {
  loading.value = true
  try {
    const res = await auth.Login(loginForm.email, loginForm.password)
    if (res?.token) {
      auth.saveToken(res.token)
      localStorage.setItem('user', JSON.stringify(res.user || res))
      notify.success(`Chào mừng trở lại, ${res.user?.full_name || res.user?.email}!`)
      setTimeout(() => router.push('/'), 800)
    }
  } catch (err: any) {
    let msg = err.response?.data?.message || 'Email hoặc mật khẩu không đúng'
    if (Array.isArray(msg)) msg = msg.join(', ')
    notify.error(msg)
  } finally {
    loading.value = false
  }
}

// ─── Đăng ký bước 1 → bước 2 ───
const goStep2 = () => {
  if (!regForm.full_name.trim()) { notify.error('Vui lòng nhập họ và tên'); return }
  if (!regForm.email.trim()) { notify.error('Vui lòng nhập email'); return }
  if (!regForm.so_dien_thoai.trim()) { notify.error('Vui lòng nhập số điện thoại'); return }
  if (!regForm.ma_so_thue.trim()) { notify.error('Vui lòng nhập Mã số thuế'); return }
  if (!regForm.ten_co_so_kd.trim()) { notify.error('Vui lòng nhập Tên theo giấy phép kinh doanh'); return }
  if (!regForm.doi_tuong_dang_ky.trim()) { notify.error('Vui lòng chọn Đối tượng đăng ký'); return }
  if (!regForm.tinh_thanh.trim()) { notify.error('Vui lòng nhập tỉnh thành'); return }
  if (regForm.password.length < 8) { notify.error('Mật khẩu tối thiểu 8 ký tự'); return }
  if (regForm.password !== regForm.confirmPassword) { notify.error('Mật khẩu xác nhận không khớp'); return }
  step.value = 2
}

const uploadGiayPhep = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  const files = Array.from(target.files)
  if (regForm.giay_phep_urls.length + files.length > 3) {
    notify.error('Chỉ được upload tối đa 3 file')
    return
  }
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/bai-dang/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data && res.data.url) {
        regForm.giay_phep_urls.push(res.data.url)
      }
    } catch (err) {
      notify.error('Lỗi upload file')
    }
  }
}

// ─── Đăng ký hoàn tất ───
const handleRegister = async () => {
  loading.value = true
  try {
    await auth.RegisterNongDan({
      email: regForm.email,
      password: regForm.password,
      full_name: regForm.full_name,
      ho_ten: regForm.full_name,
      tinh_thanh: regForm.tinh_thanh,
      so_dien_thoai: regForm.so_dien_thoai,
      ma_so_thue: regForm.ma_so_thue,
      ten_co_so_kd: regForm.ten_co_so_kd,
      doi_tuong_dang_ky: regForm.doi_tuong_dang_ky,
      huyen_xa: [regForm.quan_huyen, regForm.phuong_xa].filter(Boolean).join(', '),
      dia_chi_cu_the: regForm.dia_chi_cu_the,
      giay_phep_urls: regForm.giay_phep_urls,
      thong_tin_xuat_hoa_don: regForm.thong_tin_xuat_hoa_don ? { noi_dung: regForm.thong_tin_xuat_hoa_don } : null,
    })
    notify.success('Đăng ký thành công! Tài khoản đang chờ duyệt.')
    setTimeout(() => { mode.value = 'login'; step.value = 1 }, 1200)
  } catch (err: any) {
    let msg = err.response?.data?.message || 'Lỗi hệ thống'
    if (Array.isArray(msg)) msg = msg.join(', ')
    notify.error(msg)
  } finally {
    loading.value = false
  }
}

// ─── Quên mật khẩu ───
const handleForgot = async () => {
  if (!forgotEmail.value) { notify.error('Vui lòng nhập email'); return }
  forgotLoading.value = true
  try {
    const res = await Account.forgotPassword(forgotEmail.value)
    notify.success(res.message || 'Link khôi phục đã gửi vào email!')
    forgotEmail.value = ''
    isForgot.value = false
  } catch (err: any) {
    notify.error(err.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    forgotLoading.value = false
  }
}

const switchToRegister = () => { mode.value = 'register'; step.value = 1; isForgot.value = false }
const switchToLogin = () => { mode.value = 'login'; isForgot.value = false }

const panelTitle = computed(() =>
  mode.value === 'login' ? 'Chào mừng Nông Dân!' : step.value === 1 ? 'Tạo tài khoản' : 'Hoàn tất hồ sơ'
)
</script>

<template>
  <div class="nd-root">
    <!-- ═══════════════ LEFT PANEL ═══════════════ -->
    <div class="nd-panel cursor-pointer hover:opacity-95 transition-opacity" @click="router.push('/auth/doanh-nghiep')">
      <!-- Decorative blobs -->
      <div class="nd-blob nd-blob-1"></div>
      <div class="nd-blob nd-blob-2"></div>
      <div class="nd-blob nd-blob-3"></div>

      <!-- Logo -->
      <RouterLink to="/" class="nd-logo">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.2)"/>
          <path d="M24 8C24 8 12 16 12 26C12 32.627 17.373 38 24 38C30.627 38 36 32.627 36 26C36 16 24 8 24 8Z" fill="white"/>
          <path d="M24 14C24 14 30 20 30 26C30 29.314 27.314 32 24 32C20.686 32 18 29.314 18 26C18 20 24 14 24 14Z" fill="rgba(0,100,60,0.4)"/>
        </svg>
        <span class="nd-logo-text">AgroMarket</span>
      </RouterLink>

      <!-- ── Placeholder ảnh ── -->
      <div class="nd-image-slot">
        <!-- ✏️ Thêm ảnh của bạn vào đây -->
        <!-- <img src="/path/to/your-image.png" alt="Nông dân" class="nd-hero-img" /> -->
        <div class="nd-placeholder-icon">🌾</div>
        <p class="nd-placeholder-hint">Thêm ảnh minh họa<br/>nông dân tại đây</p>
      </div>

      <!-- Tagline -->
      <div class="nd-tagline">
        <h2>Kết nối nông sản<br/>Việt Nam với thị trường</h2>
        <p>Nền tảng B2B đưa sản phẩm của bạn<br/>đến hàng trăm doanh nghiệp thu mua</p>
      </div>

      <!-- Step indicator (chỉ hiện khi đăng ký) -->
      <div v-if="mode === 'register'" class="nd-steps">
        <div class="nd-step" :class="{ active: step >= 1, done: step > 1 }">
          <div class="nd-step-circle">
            <span v-if="step > 1">✓</span><span v-else>1</span>
          </div>
          <span>Tài khoản</span>
        </div>
        <div class="nd-step-line" :class="{ active: step > 1 }"></div>
        <div class="nd-step" :class="{ active: step >= 2 }">
          <div class="nd-step-circle"><span>2</span></div>
          <span>Xác nhận</span>
        </div>
      </div>

      <!-- Footer links -->
      <div class="nd-panel-footer">
        <RouterLink to="/auth/doanh-nghiep" class="nd-switch-link">
          Bạn là Doanh nghiệp? →
        </RouterLink>
      </div>
    </div>

    <!-- ═══════════════ RIGHT PANEL ═══════════════ -->
    <div class="nd-form-panel">
      <div class="nd-form-inner">

        <!-- ── ĐĂNG NHẬP ── -->
        <template v-if="mode === 'login' && !isForgot">
          <div class="nd-form-header">
            <div class="nd-role-badge nd-role-farmer">🌾 Nông Dân / Người Bán</div>
            <h1 class="nd-form-title">Đăng nhập</h1>
            <p class="nd-form-sub">Tiếp tục quản lý sản phẩm và đơn hàng của bạn</p>
          </div>

          <form @submit.prevent="handleLogin" class="nd-form">
            <div class="nd-field">
              <label class="nd-label">Email</label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="loginForm.email" type="email" required placeholder="email@example.com" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <div class="nd-label-row">
                <label class="nd-label">Mật khẩu</label>
                <RouterLink to="/forgot-password" class="nd-forgot">Quên mật khẩu?</RouterLink>
              </div>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" required placeholder="••••••••" class="nd-input nd-input-pr" />
                <button type="button" @click="showLoginPassword = !showLoginPassword" class="nd-eye">
                  <span class="material-symbols-outlined text-current">{{ showLoginPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="nd-btn-primary">
              <span v-if="loading" class="nd-spinner"></span>
              <span>Đăng Nhập</span>
            </button>
          </form>

          <div class="nd-divider"><span>HOẶC</span></div>

          <button @click="auth.LoginGoogle('nong_dan')" class="nd-btn-google">
            <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 272.3c0-18.7-1.6-37.1-4.7-55H272.5v104.7h146.9c-6.1 33.7-25 61.9-52.5 81.3v68h87.9c51.5-47.5 81.1-117.4 81.1-200z" fill="#4285F4"/>
              <path d="M272.5 544.3c73.4 0 135.2-24.1 180.3-65.7l-87.9-68c-24.2 16.3-55.7 25.8-92.4 25.8-70.3 0-129.9-47.5-151.8-111.4H28.4v68.8C73.8 506.7 167.3 544.3 272.5 544.3z" fill="#34A853"/>
              <path d="M120.7 327.3c-5.8-16.3-9-33.8-9-55s3.2-38.7 9-55V148.6H28.4c-12.7 25.4-20 52.8-20 86.4s7.3 61 20 86.4l92.3-72.1z" fill="#FBBC05"/>
              <path d="M272.5 108.9c39.8 0 75.3 13.7 103.5 40.5l77.4-74.8C407.7 25.4 344.9 0 272.5 0c-105.2 0-198.7 37.6-244.1 108.9l92.3 72.1c21.9-63.9 81.5-111.4 151.8-111.4z" fill="#EA4335"/>
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <p class="nd-switch-text">
            Chưa có tài khoản?
            <a href="#" @click.prevent="switchToRegister" class="nd-link">Đăng ký ngay</a>
          </p>
        </template>

        <!-- ── QUÊN MẬT KHẨU ── -->
        <template v-if="mode === 'login' && isForgot">
          <div class="nd-form-header">
            <div class="nd-icon-circle"><span class="material-symbols-outlined text-current">key</span></div>
            <h1 class="nd-form-title">Quên mật khẩu?</h1>
            <p class="nd-form-sub">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết khôi phục</p>
          </div>
          <form @submit.prevent="handleForgot" class="nd-form">
            <div class="nd-field">
              <label class="nd-label">Email đăng ký</label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="forgotEmail" type="email" required placeholder="email@example.com" class="nd-input" />
              </div>
            </div>
            <button type="submit" :disabled="forgotLoading" class="nd-btn-primary">
              <span v-if="forgotLoading" class="nd-spinner"></span>
              <span>Gửi liên kết khôi phục</span>
            </button>
          </form>
          <p class="nd-switch-text">
            <a href="#" @click.prevent="isForgot = false" class="nd-link">← Quay lại đăng nhập</a>
          </p>
        </template>

        <!-- ── ĐĂNG KÝ BƯỚC 1 ── -->
        <template v-if="mode === 'register' && step === 1">
          <div class="nd-form-header">
            <div class="nd-role-badge nd-role-farmer">🌾 Đăng ký Nông Dân</div>
            <h1 class="nd-form-title">Tạo tài khoản</h1>
            <p class="nd-form-sub">Bước 1/2 — Thông tin đăng nhập</p>
          </div>

          <form @submit.prevent="goStep2" class="nd-form">
            <div class="nd-field">
              <label class="nd-label">Họ và tên <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">person</span></span>
                <input v-model="regForm.full_name" type="text" required placeholder="Nguyễn Văn A" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Email <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="regForm.email" type="email" required placeholder="email@example.com" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Số điện thoại <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">phone</span></span>
                <input v-model="regForm.so_dien_thoai" type="tel" required placeholder="09xxxxxxx" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Khu vực (Tỉnh/Quận/Xã) <span class="nd-required">*</span></label>
              <LocationSelector
                v-model:province="regForm.tinh_thanh"
                v-model:district="regForm.quan_huyen"
                v-model:ward="regForm.phuong_xa"
              />
            </div>

            <div class="nd-field">
              <label class="nd-label">Mã số thuế cơ sở kinh doanh <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">business</span></span>
                <input v-model="regForm.ma_so_thue" type="text" required placeholder="Nhập mã số thuế" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Tên theo giấy phép kinh doanh <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">assignment</span></span>
                <input v-model="regForm.ten_co_so_kd" type="text" required placeholder="Nhập tên theo GPKD" class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Đối tượng đăng ký <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <select v-model="regForm.doi_tuong_dang_ky" class="nd-input" required style="padding-left: 12px;">
                  <option value="" disabled>Chọn đối tượng</option>
                  <option value="CaNhan">Cá nhân kinh doanh</option>
                  <option value="HoKinhDoanh">Hộ kinh doanh</option>
                  <option value="HopTacXa">Hợp tác xã</option>
                  <option value="DoanhNghiep">Doanh nghiệp</option>
                </select>
              </div>
            </div>



            <div class="nd-field">
              <label class="nd-label">Địa chỉ chi tiết</label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">home</span></span>
                <input v-model="regForm.dia_chi_cu_the" type="text" placeholder="Số nhà, tên đường..." class="nd-input" />
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Giấy phép kinh doanh (Tối đa 3 file)</label>
              <div class="nd-input-wrap" style="padding: 10px; border: 1px dashed #ccc; border-radius: 8px;">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.heic" @change="uploadGiayPhep" />
                <div v-if="regForm.giay_phep_urls.length > 0" style="margin-top: 10px;">
                  <span v-for="(url, idx) in regForm.giay_phep_urls" :key="idx" style="display: block; font-size: 0.9em; color: #1a7a4a;">
                    ✓ Đã tải lên file {{ idx + 1 }}
                  </span>
                </div>
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Thông tin xuất hoá đơn</label>
              <div class="nd-input-wrap">
                <textarea v-model="regForm.thong_tin_xuat_hoa_don" placeholder="Tên cty, MST, Địa chỉ (Không bắt buộc)" class="nd-input" style="padding-left: 12px; min-height: 80px; padding-top: 10px;"></textarea>
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Mật khẩu <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="regForm.password" :type="showRegPassword ? 'text' : 'password'" required placeholder="Tối thiểu 8 ký tự" class="nd-input nd-input-pr" />
                <button type="button" @click="showRegPassword = !showRegPassword" class="nd-eye">
                  <span class="material-symbols-outlined text-current">{{ showRegPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="nd-field">
              <label class="nd-label">Xác nhận mật khẩu <span class="nd-required">*</span></label>
              <div class="nd-input-wrap">
                <span class="nd-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="regForm.confirmPassword" :type="showRegConfirm ? 'text' : 'password'" required placeholder="Nhập lại mật khẩu" class="nd-input nd-input-pr" />
                <button type="button" @click="showRegConfirm = !showRegConfirm" class="nd-eye">
                  <span class="material-symbols-outlined text-current">{{ showRegConfirm ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="nd-info-box">
              <span><span class="material-symbols-outlined text-current">info</span></span>
              <span>Sau khi đăng ký, tài khoản sẽ được Admin xét duyệt trước khi hoạt động.</span>
            </div>

            <button type="submit" class="nd-btn-primary">
              Tiếp tục →
            </button>
          </form>

          <p class="nd-switch-text">
            Đã có tài khoản?
            <a href="#" @click.prevent="switchToLogin" class="nd-link">Đăng nhập</a>
          </p>
        </template>

        <!-- ── ĐĂNG KÝ BƯỚC 2 (xác nhận) ── -->
        <template v-if="mode === 'register' && step === 2">
          <div class="nd-form-header">
            <div class="nd-icon-circle nd-success">✓</div>
            <h1 class="nd-form-title">Xác nhận thông tin</h1>
            <p class="nd-form-sub">Bước 2/2 — Kiểm tra và hoàn tất đăng ký</p>
          </div>

          <div class="nd-confirm-card">
            <div class="nd-confirm-row">
              <span class="nd-confirm-label">Họ tên</span>
              <span class="nd-confirm-value">{{ regForm.full_name }}</span>
            </div>
            <div class="nd-confirm-row">
              <span class="nd-confirm-label">Email</span>
              <span class="nd-confirm-value">{{ regForm.email }}</span>
            </div>
            <div class="nd-confirm-row">
              <span class="nd-confirm-label">Số điện thoại</span>
              <span class="nd-confirm-value">{{ regForm.so_dien_thoai }}</span>
            </div>
            <div class="nd-confirm-row">
              <span class="nd-confirm-label">Tỉnh thành</span>
              <span class="nd-confirm-value">{{ regForm.tinh_thanh }}</span>
            </div>
            <div class="nd-confirm-row">
              <span class="nd-confirm-label">Vai trò</span>
              <span class="nd-confirm-value nd-role-farmer-tag">🌾 Nông Dân</span>
            </div>
          </div>

          <div class="nd-terms">
            Bằng cách nhấn <strong>Hoàn tất</strong>, bạn đồng ý với
            <a href="#" class="nd-link">Điều khoản dịch vụ</a> và
            <a href="#" class="nd-link">Chính sách bảo mật</a>.
          </div>

          <div class="nd-btn-group">
            <button @click="step = 1" class="nd-btn-secondary">← Quay lại</button>
            <button @click="handleRegister" :disabled="loading" class="nd-btn-primary nd-btn-flex">
              <span v-if="loading" class="nd-spinner"></span>
              <span>Hoàn tất Đăng Ký</span>
            </button>
          </div>
        </template>

      </div><!-- /nd-form-inner -->

      <!-- Footer -->
      <div class="nd-form-footer">
        <RouterLink to="/" class="nd-footer-link">← Về trang chủ</RouterLink>
        <span class="nd-footer-sep">•</span>
        <a href="#" class="nd-footer-link">Điều khoản</a>
        <span class="nd-footer-sep">•</span>
        <a href="#" class="nd-footer-link">Bảo mật</a>
      </div>
    </div><!-- /nd-form-panel -->
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ═══════════════ ROOT LAYOUT ═══════════════ */
.nd-root {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f0faf4;
}

/* ═══════════════ LEFT PANEL ═══════════════ */
.nd-panel {
  position: relative;
  width: 420px;
  min-height: 100vh;
  background: linear-gradient(145deg, #1a7a4a 0%, #0f5c36 40%, #0a3d25 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
  overflow: hidden;
  flex-shrink: 0;
}

.nd-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: blobFloat 8s ease-in-out infinite;
}
.nd-blob-1 {
  width: 320px; height: 320px;
  background: #4ade80;
  top: -80px; right: -80px;
  animation-delay: 0s;
}
.nd-blob-2 {
  width: 200px; height: 200px;
  background: #86efac;
  bottom: 100px; left: -60px;
  animation-delay: 3s;
}
.nd-blob-3 {
  width: 150px; height: 150px;
  background: #a3f4c8;
  bottom: -40px; right: 40px;
  animation-delay: 5s;
}

@keyframes blobFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Logo */
.nd-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
  align-self: flex-start;
  z-index: 1;
}
.nd-logo-text { color: white; }

/* Image placeholder */
.nd-image-slot {
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin: 24px 0;
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 20px;
  min-height: 220px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.3s;
}
.nd-image-slot:hover { background: rgba(255,255,255,0.1); }
.nd-placeholder-icon { font-size: 3.5rem; }
.nd-placeholder-hint {
  color: rgba(255,255,255,0.5);
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.6;
}
.nd-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}

/* Tagline */
.nd-tagline {
  z-index: 1;
  text-align: center;
  color: white;
  margin-bottom: 24px;
}
.nd-tagline h2 {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 10px;
}
.nd-tagline p {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}

/* Step indicator */
.nd-steps {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 24px;
}
.nd-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  font-weight: 600;
  transition: color 0.3s;
}
.nd-step.active { color: white; }
.nd-step-circle {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s;
}
.nd-step.active .nd-step-circle {
  background: white;
  color: #0f5c36;
  border-color: white;
  box-shadow: 0 0 16px rgba(255,255,255,0.4);
}
.nd-step.done .nd-step-circle { background: #4ade80; color: #0a3d25; border-color: #4ade80; }
.nd-step-line {
  width: 60px; height: 2px;
  background: rgba(255,255,255,0.2);
  margin: 0 8px;
  margin-bottom: 24px;
  border-radius: 2px;
  transition: background 0.3s;
}
.nd-step-line.active { background: #4ade80; }

/* Panel footer */
.nd-panel-footer {
  z-index: 1;
  margin-top: auto;
}
.nd-switch-link {
  color: rgba(255,255,255,0.6);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s;
}
.nd-switch-link:hover { color: white; }

/* ═══════════════ RIGHT FORM PANEL ═══════════════ */
.nd-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow-y: auto;
}

.nd-form-inner {
  flex: 1;
  padding: 52px 56px;
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
}

/* Form header */
.nd-form-header {
  margin-bottom: 32px;
}
.nd-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 16px;
}
.nd-role-farmer {
  background: #dcfce7;
  color: #15803d;
}
.nd-icon-circle {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 16px;
  border: 2px solid #bbf7d0;
}
.nd-icon-circle.nd-success { background: #15803d; color: white; font-size: 1.2rem; }
.nd-form-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0 0 8px;
}
.nd-form-sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Form fields */
.nd-form { display: flex; flex-direction: column; gap: 18px; }
.nd-field { display: flex; flex-direction: column; gap: 6px; }
.nd-label { font-size: 0.85rem; font-weight: 600; color: #334155; }
.nd-required { color: #ef4444; }
.nd-label-row { display: flex; justify-content: space-between; align-items: center; }
.nd-forgot { font-size: 0.8rem; color: #15803d; text-decoration: none; font-weight: 500; }
.nd-forgot:hover { text-decoration: underline; }

.nd-input-wrap { position: relative; display: flex; align-items: center; }
.nd-input-icon {
  position: absolute; left: 14px;
  font-size: 0.95rem; pointer-events: none;
  z-index: 1;
}
.nd-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}
.nd-input:focus {
  border-color: #16a34a;
  background: white;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.12);
}
.nd-input-pr { padding-right: 44px; }
.nd-eye {
  position: absolute; right: 12px;
  background: none; border: none;
  cursor: pointer; font-size: 1rem;
  color: #94a3b8; padding: 4px;
}

/* Info box */
.nd-info-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #166534;
  line-height: 1.5;
}

/* Buttons */
.nd-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(22,163,74,0.3);
}
.nd-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }
.nd-btn-primary:active { transform: scale(0.98); }
.nd-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
.nd-btn-flex { flex: 1; }

.nd-btn-secondary {
  padding: 13px 20px;
  background: white;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.nd-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.nd-btn-group { display: flex; gap: 12px; margin-top: 4px; }

.nd-btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: white;
  color: #334155;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.nd-btn-google:hover { background: #f8fafc; border-color: #cbd5e1; }

/* Divider */
.nd-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}
.nd-divider::before, .nd-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

/* Switch text */
.nd-switch-text {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 20px;
}
.nd-link { color: #16a34a; font-weight: 600; text-decoration: none; }
.nd-link:hover { text-decoration: underline; }

/* Confirm card */
.nd-confirm-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.nd-confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}
.nd-confirm-label { color: #64748b; font-weight: 500; }
.nd-confirm-value { color: #0f172a; font-weight: 600; }
.nd-role-farmer-tag {
  background: #dcfce7;
  color: #15803d;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.8rem;
}

/* Terms */
.nd-terms {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Spinner */
.nd-spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Form footer */
.nd-form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}
.nd-footer-link {
  font-size: 0.78rem;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}
.nd-footer-link:hover { color: #475569; }
.nd-footer-sep { color: #cbd5e1; font-size: 0.7rem; }

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 900px) {
  .nd-root { flex-direction: column; }
  .nd-panel { width: 100%; min-height: auto; padding: 28px 24px; }
  .nd-image-slot { min-height: 140px; }
  .nd-form-inner { padding: 32px 24px; }
}

/* Hide password manager icons */
input::-ms-reveal, input::-ms-clear { display: none; }
input::-webkit-credentials-auto-fill-button { visibility: hidden; display: none !important; }
</style>
