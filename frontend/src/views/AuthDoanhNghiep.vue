<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import auth from '../service/auth.ts'
import Account from '../service/account.ts'
import { notify } from '@/utils/notifier.ts'
import LocationSelector from '../components/LocationSelector.vue'

const router = useRouter()
const route = useRoute()

// ─── Mode: 'login' | 'register' ───
const mode = ref<'login' | 'register'>('login')
const step = ref(1)
const loading = ref(false)

// ─── Form đăng nhập ───
const loginForm = reactive({ email: '', password: '' })
const showLoginPassword = ref(false)

// ─── Form đăng ký ───
const regForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  full_name: '',
  ten_cong_ty: '',
  tinh_thanh: '',
  quan_huyen: '',
  phuong_xa: '',
  dia_chi_cu_the: '',
  so_dien_thoai: '',
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
  if (!regForm.full_name.trim()) { notify.error('Vui lòng nhập họ và tên / tên người đại diện'); return }
  if (!regForm.ten_cong_ty.trim()) { notify.error('Vui lòng nhập tên công ty'); return }
  if (!regForm.email.trim()) { notify.error('Vui lòng nhập email'); return }
  if (!regForm.so_dien_thoai.trim()) { notify.error('Vui lòng nhập số điện thoại'); return }
  if (!regForm.tinh_thanh.trim()) { notify.error('Vui lòng nhập tỉnh thành'); return }
  if (regForm.password.length < 8) { notify.error('Mật khẩu tối thiểu 8 ký tự'); return }
  if (regForm.password !== regForm.confirmPassword) { notify.error('Mật khẩu xác nhận không khớp'); return }
  step.value = 2
}

// ─── Đăng ký hoàn tất ───
const handleRegister = async () => {
  loading.value = true
  try {
    await auth.RegisterDoanhNghiep({
      email: regForm.email,
      password: regForm.password,
      full_name: regForm.full_name,
      ten_cong_ty: regForm.ten_cong_ty,
      tinh_thanh: regForm.tinh_thanh,
      dia_chi: [regForm.dia_chi_cu_the, regForm.phuong_xa, regForm.quan_huyen].filter(Boolean).join(', '),
      so_dien_thoai: regForm.so_dien_thoai,
    })
    notify.success('Đăng ký thành công! Tài khoản đang chờ Admin xét duyệt.')
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
</script>

<template>
  <div class="dn-root">
    <!-- ═══════════════ LEFT PANEL ═══════════════ -->
    <div class="dn-panel cursor-pointer hover:opacity-95 transition-opacity" @click="router.push('/auth/nong-dan')">
      <!-- Decorative blobs -->
      <div class="dn-blob dn-blob-1"></div>
      <div class="dn-blob dn-blob-2"></div>
      <div class="dn-blob dn-blob-3"></div>

      <!-- Decorative grid -->
      <div class="dn-grid-overlay"></div>

      <!-- Logo -->
      <RouterLink to="/" class="dn-logo">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)"/>
          <rect x="10" y="22" width="28" height="16" rx="3" fill="white"/>
          <path d="M16 22V16C16 12.686 19.134 10 24 10C28.866 10 32 12.686 32 16V22" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
          <circle cx="24" cy="29" r="3" fill="#0077B6"/>
        </svg>
        <span class="dn-logo-text">AgroMarket</span>
        <span class="dn-logo-badge">Business</span>
      </RouterLink>

      <!-- ── Placeholder ảnh ── -->
      <div class="dn-image-slot">
        <!-- ✏️ Thêm ảnh của bạn vào đây -->
        <!-- <img src="/path/to/your-business-image.png" alt="Doanh nghiệp" class="dn-hero-img" /> -->
        <div class="dn-placeholder-icon"><span class="material-symbols-outlined text-current">business</span></div>
        <p class="dn-placeholder-hint">Thêm ảnh minh họa<br/>doanh nghiệp tại đây</p>
      </div>

      <!-- Tagline -->
      <div class="dn-tagline">
        <h2>Nền tảng thu mua<br/>nông sản thông minh</h2>
        <p>Tìm kiếm nguồn hàng chất lượng từ<br/>hàng nghìn nông dân uy tín trên toàn quốc</p>
      </div>

      <!-- Step indicator -->
      <div v-if="mode === 'register'" class="dn-steps">
        <div class="dn-step" :class="{ active: step >= 1, done: step > 1 }">
          <div class="dn-step-circle">
            <span v-if="step > 1">✓</span><span v-else>1</span>
          </div>
          <span>Tài khoản</span>
        </div>
        <div class="dn-step-line" :class="{ active: step > 1 }"></div>
        <div class="dn-step" :class="{ active: step >= 2 }">
          <div class="dn-step-circle"><span>2</span></div>
          <span>Xác nhận</span>
        </div>
      </div>

      <!-- Stats decorative -->
      <div class="dn-stats">
        <div class="dn-stat">
          <span class="dn-stat-num">500+</span>
          <span class="dn-stat-label">Doanh nghiệp</span>
        </div>
        <div class="dn-stat-div"></div>
        <div class="dn-stat">
          <span class="dn-stat-num">2,000+</span>
          <span class="dn-stat-label">Nông dân</span>
        </div>
        <div class="dn-stat-div"></div>
        <div class="dn-stat">
          <span class="dn-stat-num">63</span>
          <span class="dn-stat-label">Tỉnh thành</span>
        </div>
      </div>

      <!-- Panel footer -->
      <div class="dn-panel-footer">
        <RouterLink to="/auth/nong-dan" class="dn-switch-link">
          Bạn là Nông dân? →
        </RouterLink>
      </div>
    </div>

    <!-- ═══════════════ RIGHT PANEL ═══════════════ -->
    <div class="dn-form-panel">
      <div class="dn-form-inner">

        <!-- ── ĐĂNG NHẬP ── -->
        <template v-if="mode === 'login' && !isForgot">
          <div class="dn-form-header">
            <div class="dn-role-badge"><span class="material-symbols-outlined text-current">business</span> Doanh Nghiệp / Người Mua</div>
            <h1 class="dn-form-title">Đăng nhập</h1>
            <p class="dn-form-sub">Tiếp tục tìm kiếm và thu mua nông sản chất lượng</p>
          </div>

          <form @submit.prevent="handleLogin" class="dn-form">
            <div class="dn-field">
              <label class="dn-label">Email doanh nghiệp</label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="loginForm.email" type="email" required placeholder="contact@company.vn" class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <div class="dn-label-row">
                <label class="dn-label">Mật khẩu</label>
                <RouterLink to="/forgot-password" class="dn-forgot">Quên mật khẩu?</RouterLink>
              </div>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" required placeholder="••••••••" class="dn-input dn-input-pr" />
                <button type="button" @click="showLoginPassword = !showLoginPassword" class="dn-eye">
                  <span class="material-symbols-outlined text-current">{{ showLoginPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="dn-btn-primary">
              <span v-if="loading" class="dn-spinner"></span>
              <span>Đăng Nhập</span>
            </button>
          </form>

          <div class="dn-divider"><span>HOẶC</span></div>

          <button @click="auth.LoginGoogle('doanh_nghiep')" class="dn-btn-google">
            <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 272.3c0-18.7-1.6-37.1-4.7-55H272.5v104.7h146.9c-6.1 33.7-25 61.9-52.5 81.3v68h87.9c51.5-47.5 81.1-117.4 81.1-200z" fill="#4285F4"/>
              <path d="M272.5 544.3c73.4 0 135.2-24.1 180.3-65.7l-87.9-68c-24.2 16.3-55.7 25.8-92.4 25.8-70.3 0-129.9-47.5-151.8-111.4H28.4v68.8C73.8 506.7 167.3 544.3 272.5 544.3z" fill="#34A853"/>
              <path d="M120.7 327.3c-5.8-16.3-9-33.8-9-55s3.2-38.7 9-55V148.6H28.4c-12.7 25.4-20 52.8-20 86.4s7.3 61 20 86.4l92.3-72.1z" fill="#FBBC05"/>
              <path d="M272.5 108.9c39.8 0 75.3 13.7 103.5 40.5l77.4-74.8C407.7 25.4 344.9 0 272.5 0c-105.2 0-198.7 37.6-244.1 108.9l92.3 72.1c21.9-63.9 81.5-111.4 151.8-111.4z" fill="#EA4335"/>
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <p class="dn-switch-text">
            Chưa có tài khoản?
            <a href="#" @click.prevent="switchToRegister" class="dn-link">Đăng ký ngay</a>
          </p>
        </template>

        <!-- ── QUÊN MẬT KHẨU ── -->
        <template v-if="mode === 'login' && isForgot">
          <div class="dn-form-header">
            <div class="dn-icon-circle"><span class="material-symbols-outlined text-current">key</span></div>
            <h1 class="dn-form-title">Quên mật khẩu?</h1>
            <p class="dn-form-sub">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết khôi phục</p>
          </div>
          <form @submit.prevent="handleForgot" class="dn-form">
            <div class="dn-field">
              <label class="dn-label">Email đăng ký</label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="forgotEmail" type="email" required placeholder="contact@company.vn" class="dn-input" />
              </div>
            </div>
            <button type="submit" :disabled="forgotLoading" class="dn-btn-primary">
              <span v-if="forgotLoading" class="dn-spinner"></span>
              <span>Gửi liên kết khôi phục</span>
            </button>
          </form>
          <p class="dn-switch-text">
            <a href="#" @click.prevent="isForgot = false" class="dn-link">← Quay lại đăng nhập</a>
          </p>
        </template>

        <!-- ── ĐĂNG KÝ BƯỚC 1 ── -->
        <template v-if="mode === 'register' && step === 1">
          <div class="dn-form-header">
            <div class="dn-role-badge"><span class="material-symbols-outlined text-current">business</span> Đăng ký Doanh Nghiệp</div>
            <h1 class="dn-form-title">Tạo tài khoản</h1>
            <p class="dn-form-sub">Bước 1/2 — Thông tin đăng nhập</p>
          </div>

          <form @submit.prevent="goStep2" class="dn-form">
            <div class="dn-field">
              <label class="dn-label">Tên người đại diện <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">person</span></span>
                <input v-model="regForm.full_name" type="text" required placeholder="Nguyễn Văn A" class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Tên công ty / Tổ chức <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">business</span></span>
                <input v-model="regForm.ten_cong_ty" type="text" required placeholder="Công ty CP Nông Sản Á Âu" class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Email doanh nghiệp <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">mail</span></span>
                <input v-model="regForm.email" type="email" required placeholder="contact@company.vn" class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Số điện thoại <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">phone</span></span>
                <input v-model="regForm.so_dien_thoai" type="tel" required placeholder="09xxxxxxx" class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Khu vực (Tỉnh/Quận/Xã) <span class="dn-required">*</span></label>
              <LocationSelector
                v-model:province="regForm.tinh_thanh"
                v-model:district="regForm.quan_huyen"
                v-model:ward="regForm.phuong_xa"
              />
            </div>

            <div class="dn-field">
              <label class="dn-label">Địa chỉ chi tiết</label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">home</span></span>
                <input v-model="regForm.dia_chi_cu_the" type="text" placeholder="Số nhà, tên đường..." class="dn-input" />
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Mật khẩu <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="regForm.password" :type="showRegPassword ? 'text' : 'password'" required placeholder="Tối thiểu 8 ký tự" class="dn-input dn-input-pr" />
                <button type="button" @click="showRegPassword = !showRegPassword" class="dn-eye">
                  <span class="material-symbols-outlined text-current">{{ showRegPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="dn-field">
              <label class="dn-label">Xác nhận mật khẩu <span class="dn-required">*</span></label>
              <div class="dn-input-wrap">
                <span class="dn-input-icon"><span class="material-symbols-outlined text-current">lock</span></span>
                <input v-model="regForm.confirmPassword" :type="showRegConfirm ? 'text' : 'password'" required placeholder="Nhập lại mật khẩu" class="dn-input dn-input-pr" />
                <button type="button" @click="showRegConfirm = !showRegConfirm" class="dn-eye">
                  <span class="material-symbols-outlined text-current">{{ showRegConfirm ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="dn-info-box">
              <span><span class="material-symbols-outlined text-current">info</span></span>
              <span>Sau khi đăng ký, tài khoản doanh nghiệp sẽ được Admin xét duyệt. Bạn sẽ nhận thông báo qua email khi được duyệt.</span>
            </div>

            <button type="submit" class="dn-btn-primary">
              Tiếp tục →
            </button>
          </form>

          <p class="dn-switch-text">
            Đã có tài khoản?
            <a href="#" @click.prevent="switchToLogin" class="dn-link">Đăng nhập</a>
          </p>
        </template>

        <!-- ── ĐĂNG KÝ BƯỚC 2 (xác nhận) ── -->
        <template v-if="mode === 'register' && step === 2">
          <div class="dn-form-header">
            <div class="dn-icon-circle dn-success">✓</div>
            <h1 class="dn-form-title">Xác nhận thông tin</h1>
            <p class="dn-form-sub">Bước 2/2 — Kiểm tra và hoàn tất đăng ký</p>
          </div>

          <div class="dn-confirm-card">
            <div class="dn-confirm-row">
              <span class="dn-confirm-label">Người đại diện</span>
              <span class="dn-confirm-value">{{ regForm.full_name }}</span>
            </div>
            <div class="dn-confirm-row">
              <span class="nd-confirm-label">Công ty</span>
              <span class="nd-confirm-value">{{ regForm.ten_cong_ty }}</span>
            </div>
            <div class="dn-confirm-row">
              <span class="dn-confirm-label">Email</span>
              <span class="dn-confirm-value">{{ regForm.email }}</span>
            </div>
            <div class="dn-confirm-row">
              <span class="dn-confirm-label">Số điện thoại</span>
              <span class="dn-confirm-value">{{ regForm.so_dien_thoai }}</span>
            </div>
            <div class="dn-confirm-row">
              <span class="dn-confirm-label">Tỉnh thành</span>
              <span class="dn-confirm-value">{{ regForm.tinh_thanh }}</span>
            </div>
            <div class="dn-confirm-row">
              <span class="dn-confirm-label">Vai trò</span>
              <span class="dn-confirm-value dn-role-biz-tag"><span class="material-symbols-outlined text-current">business</span> Doanh Nghiệp</span>
            </div>
          </div>

          <div class="dn-pending-notice">
            <div class="dn-pending-icon">⏳</div>
            <div>
              <strong>Tài khoản cần xét duyệt</strong>
              <p>Admin sẽ xem xét hồ sơ và kích hoạt tài khoản trong vòng 1-3 ngày làm việc.</p>
            </div>
          </div>

          <div class="dn-terms">
            Bằng cách nhấn <strong>Hoàn tất</strong>, bạn đồng ý với
            <a href="#" class="dn-link">Điều khoản dịch vụ</a> và
            <a href="#" class="dn-link">Chính sách bảo mật</a>.
          </div>

          <div class="dn-btn-group">
            <button @click="step = 1" class="dn-btn-secondary">← Quay lại</button>
            <button @click="handleRegister" :disabled="loading" class="dn-btn-primary dn-btn-flex">
              <span v-if="loading" class="dn-spinner"></span>
              <span>Hoàn tất Đăng Ký</span>
            </button>
          </div>
        </template>

      </div><!-- /dn-form-inner -->

      <!-- Footer -->
      <div class="dn-form-footer">
        <RouterLink to="/" class="dn-footer-link">← Về trang chủ</RouterLink>
        <span class="dn-footer-sep">•</span>
        <a href="#" class="dn-footer-link">Điều khoản</a>
        <span class="dn-footer-sep">•</span>
        <a href="#" class="dn-footer-link">Bảo mật</a>
      </div>
    </div><!-- /dn-form-panel -->
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ═══════════════ ROOT LAYOUT ═══════════════ */
.dn-root {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f0f8ff;
}

/* ═══════════════ LEFT PANEL — Ocean Blue ═══════════════ */
.dn-panel {
  position: relative;
  width: 420px;
  min-height: 100vh;
  background: linear-gradient(145deg, #0077B6 0%, #023E8A 50%, #03045E 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
  overflow: hidden;
  flex-shrink: 0;
}

/* Animated blobs */
.dn-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: dnBlobFloat 10s ease-in-out infinite;
}
.dn-blob-1 {
  width: 360px; height: 360px;
  background: #48CAE4;
  top: -100px; right: -100px;
  animation-delay: 0s;
}
.dn-blob-2 {
  width: 240px; height: 240px;
  background: #90E0EF;
  bottom: 80px; left: -80px;
  animation-delay: 4s;
}
.dn-blob-3 {
  width: 180px; height: 180px;
  background: #ADE8F4;
  bottom: -50px; right: 20px;
  animation-delay: 7s;
}
@keyframes dnBlobFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-25px) scale(1.08); }
}

/* Grid overlay */
.dn-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Logo */
.dn-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.5px;
  align-self: flex-start;
  z-index: 1;
}
.dn-logo-text { color: white; }
.dn-logo-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255,255,255,0.2);
  color: #ADE8F4;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255,255,255,0.2);
}

/* Image placeholder */
.dn-image-slot {
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin: 24px 0;
  border: 2px dashed rgba(255,255,255,0.25);
  border-radius: 20px;
  min-height: 200px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.3s;
}
.dn-image-slot:hover { background: rgba(255,255,255,0.08); }
.dn-placeholder-icon { font-size: 3.5rem; }
.dn-placeholder-hint {
  color: rgba(255,255,255,0.45);
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.6;
}
.dn-hero-img {
  width: 100%; height: 100%;
  object-fit: cover; border-radius: 18px;
}

/* Tagline */
.dn-tagline {
  z-index: 1;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}
.dn-tagline h2 {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 10px;
}
.dn-tagline p {
  font-size: 0.83rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.6;
}

/* Step indicator */
.dn-steps {
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.dn-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  font-weight: 600;
  transition: color 0.3s;
}
.dn-step.active { color: white; }
.dn-step-circle {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid rgba(255,255,255,0.15);
  transition: all 0.3s;
}
.dn-step.active .dn-step-circle {
  background: white;
  color: #023E8A;
  border-color: white;
  box-shadow: 0 0 20px rgba(255,255,255,0.35);
}
.dn-step.done .dn-step-circle { background: #48CAE4; color: #03045E; border-color: #48CAE4; }
.dn-step-line {
  width: 60px; height: 2px;
  background: rgba(255,255,255,0.15);
  margin: 0 8px;
  margin-bottom: 24px;
  border-radius: 2px;
  transition: background 0.3s;
}
.dn-step-line.active { background: #48CAE4; }

/* Stats */
.dn-stats {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(8px);
}
.dn-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.dn-stat-num { font-size: 1.1rem; font-weight: 800; color: white; }
.dn-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.55); font-weight: 500; }
.dn-stat-div { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

/* Panel footer */
.dn-panel-footer { z-index: 1; margin-top: auto; }
.dn-switch-link {
  color: rgba(255,255,255,0.55);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s;
}
.dn-switch-link:hover { color: #90E0EF; }

/* ═══════════════ RIGHT FORM PANEL ═══════════════ */
.dn-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow-y: auto;
}

.dn-form-inner {
  flex: 1;
  padding: 52px 56px;
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
}

/* Form header */
.dn-form-header { margin-bottom: 32px; }
.dn-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
  margin-bottom: 16px;
}
.dn-icon-circle {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 16px;
  border: 2px solid #bfdbfe;
}
.dn-icon-circle.dn-success { background: #0077B6; color: white; font-size: 1.2rem; }
.dn-form-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0 0 8px;
}
.dn-form-sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Form fields */
.dn-form { display: flex; flex-direction: column; gap: 18px; }
.dn-field { display: flex; flex-direction: column; gap: 6px; }
.dn-label { font-size: 0.85rem; font-weight: 600; color: #334155; }
.dn-required { color: #ef4444; }
.dn-label-row { display: flex; justify-content: space-between; align-items: center; }
.dn-forgot { font-size: 0.8rem; color: #0077B6; text-decoration: none; font-weight: 500; }
.dn-forgot:hover { text-decoration: underline; }

.dn-input-wrap { position: relative; display: flex; align-items: center; }
.dn-input-icon {
  position: absolute; left: 14px;
  font-size: 0.95rem; pointer-events: none; z-index: 1;
}
.dn-input {
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
.dn-input:focus {
  border-color: #0077B6;
  background: white;
  box-shadow: 0 0 0 3px rgba(0,119,182,0.12);
}
.dn-input-pr { padding-right: 44px; }
.dn-eye {
  position: absolute; right: 12px;
  background: none; border: none;
  cursor: pointer; font-size: 1rem;
  color: #94a3b8; padding: 4px;
}

/* Info box */
.dn-info-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #1d4ed8;
  line-height: 1.5;
}

/* Pending notice */
.dn-pending-notice {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 0.83rem;
  color: #92400e;
  line-height: 1.5;
}
.dn-pending-icon { font-size: 1.3rem; flex-shrink: 0; }
.dn-pending-notice strong { display: block; margin-bottom: 4px; font-size: 0.87rem; }
.dn-pending-notice p { margin: 0; }

/* Buttons */
.dn-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #0077B6, #023E8A);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(0,119,182,0.35);
}
.dn-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,119,182,0.45); }
.dn-btn-primary:active { transform: scale(0.98); }
.dn-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
.dn-btn-flex { flex: 1; }

.dn-btn-secondary {
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
.dn-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.dn-btn-group { display: flex; gap: 12px; margin-top: 4px; }

.dn-btn-google {
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
.dn-btn-google:hover { background: #f8fafc; border-color: #cbd5e1; }

/* Divider */
.dn-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}
.dn-divider::before, .dn-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

/* Switch text */
.dn-switch-text {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 20px;
}
.dn-link { color: #0077B6; font-weight: 600; text-decoration: none; }
.dn-link:hover { text-decoration: underline; }

/* Confirm card */
.dn-confirm-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dn-confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}
.dn-confirm-label { color: #64748b; font-weight: 500; }
.dn-confirm-value { color: #0f172a; font-weight: 600; }
.dn-role-biz-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.8rem;
}

/* Terms */
.dn-terms {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Spinner */
.dn-spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: dnSpin 0.6s linear infinite;
}
@keyframes dnSpin { to { transform: rotate(360deg); } }

/* Form footer */
.dn-form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}
.dn-footer-link {
  font-size: 0.78rem;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}
.dn-footer-link:hover { color: #475569; }
.dn-footer-sep { color: #cbd5e1; font-size: 0.7rem; }

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 900px) {
  .dn-root { flex-direction: column; }
  .dn-panel { width: 100%; min-height: auto; padding: 28px 24px; }
  .dn-image-slot { min-height: 140px; }
  .dn-stats { flex-wrap: wrap; justify-content: center; }
  .dn-form-inner { padding: 32px 24px; }
}

input::-ms-reveal, input::-ms-clear { display: none; }
input::-webkit-credentials-auto-fill-button { visibility: hidden; display: none !important; }
</style>
