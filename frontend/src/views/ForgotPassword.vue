<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Auth from "@/service/auth.ts";
import { notify } from "@/utils/notifier.ts";

const router = useRouter();

// 1: Nhập email, 2: Nhập OTP, 3: Nhập mật khẩu mới
const step = ref<number>(1);
const loading = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

const form = reactive({
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
});

// Bước 1: Gửi email lấy mã OTP
const handleSendOtp = async () => {
  if (!form.email) {
    notify.error("Vui lòng nhập địa chỉ email!");
    return;
  }
  loading.value = true;
  try {
    const res = await Auth.forgotPassword(form.email);
    notify.success(res.message || "Mã OTP đã được gửi đến email của bạn!");
    step.value = 2;
  } catch (err: any) {
    let msg =
      err.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại!";
    if (Array.isArray(msg)) msg = msg.join(", ");
    notify.error(msg);
  } finally {
    loading.value = false;
  }
};

// Bước 2: Xác nhận mã OTP
const handleVerifyOtp = async () => {
  if (!form.otp || form.otp.length !== 6) {
    notify.error("Mã OTP phải đúng 6 chữ số!");
    return;
  }
  loading.value = true;
  try {
    const res = await Auth.verifyOtp(form.email, form.otp);
    notify.success(res.message || "Mã OTP hợp lệ!");
    step.value = 3;
  } catch (err: any) {
    let msg =
      err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!";
    if (Array.isArray(msg)) msg = msg.join(", ");
    notify.error(msg);
  } finally {
    loading.value = false;
  }
};

// Bước 3: Đổi mật khẩu mới
const handleResetPassword = async () => {
  if (!form.newPassword) {
    notify.error("Vui lòng nhập mật khẩu mới!");
    return;
  }
  if (form.newPassword.length < 6) {
    notify.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    notify.error("Mật khẩu xác nhận không trùng khớp!");
    return;
  }
  loading.value = true;
  try {
    const res = await Auth.resetPasswordWithOtp({
      email: form.email,
      otp: form.otp,
      newPassword: form.newPassword,
    });
    const targetRole = res.role?.toLowerCase();
    notify.success(
      res.message ||
        "Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...",
    );
    setTimeout(() => {
      if (targetRole === "doanh_nghiep") {
        router.push("/auth/doanh-nghiep");
      } else if (targetRole === "nong_dan") {
        router.push("/auth/nong-dan");
      } else {
        router.push("/login");
      }
    }, 1500);
  } catch (err: any) {
    let msg =
      err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!";
    if (Array.isArray(msg)) msg = msg.join(", ");
    notify.error(msg);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="forgot-root">
    <div class="forgot-box">
      <!-- Header -->
      <div class="forgot-header">
        <div class="logo-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2E7D32"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17 8C8 10 5.9 16.17 3.82 19.7 3.46 20.34 4.09 21 4.82 21h12.69a1 1 0 0 0 .97-.76L20 14"
            />
            <path d="M9.25 14C9.25 14 8.5 11 9.5 9" />
            <path d="M14.75 14C14.75 14 15.5 11 14.5 9" />
            <path d="M12 6V3" />
            <path d="M20 4C20 4 20 8 16 10" />
            <path d="M4 4C4 4 4 8 8 10" />
          </svg>
        </div>
        <h1>Khôi Phục Mật Khẩu</h1>
        <p v-if="step === 1">
          Nhập email tài khoản của bạn để nhận mã xác nhận OTP
        </p>
        <p v-else-if="step === 2">
          Nhập mã OTP 6 chữ số vừa được gửi đến
          <strong>{{ form.email }}</strong>
        </p>
        <p v-else>Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <!-- Step Progress Bar -->
      <div class="step-bar">
        <div
          class="step-item"
          :class="{ active: step >= 1, completed: step > 1 }"
        >
          <span class="step-num">1</span>
          <span class="step-text">Email</span>
        </div>
        <div class="step-line" :class="{ active: step >= 2 }"></div>
        <div
          class="step-item"
          :class="{ active: step >= 2, completed: step > 2 }"
        >
          <span class="step-num">2</span>
          <span class="step-text">Mã OTP</span>
        </div>
        <div class="step-line" :class="{ active: step >= 3 }"></div>
        <div class="step-item" :class="{ active: step >= 3 }">
          <span class="step-num">3</span>
          <span class="step-text">Mật khẩu</span>
        </div>
      </div>

      <!-- STEP 1: NHẬP EMAIL -->
      <form
        v-if="step === 1"
        @submit.prevent="handleSendOtp"
        class="forgot-form"
      >
        <div class="form-group">
          <label>Địa chỉ Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="nhapemail@domain.com"
          />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? "Đang gửi mã..." : "Gửi mã xác nhận" }}
        </button>
      </form>

      <!-- STEP 2: NHẬP OTP -->
      <form
        v-else-if="step === 2"
        @submit.prevent="handleVerifyOtp"
        class="forgot-form"
      >
        <div class="form-group">
          <label>Mã xác nhận (OTP 6 số)</label>
          <input
            v-model="form.otp"
            type="text"
            maxlength="6"
            required
            placeholder="123456"
            class="otp-input"
          />
        </div>
        <div class="otp-actions">
          <button
            type="button"
            class="resend-link"
            @click="handleSendOtp"
            :disabled="loading"
          >
            Gửi lại mã OTP
          </button>
          <button type="button" class="change-email" @click="step = 1">
            Đổi email khác
          </button>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? "Đang kiểm tra..." : "Xác nhận OTP" }}
        </button>
      </form>

      <!-- STEP 3: MẬT KHẨU MỚI -->
      <form v-else @submit.prevent="handleResetPassword" class="forgot-form">
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <div class="input-wrap">
            <input
              v-model="form.newPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
            >
              <span class="material-symbols-outlined">{{
                showPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <div class="input-wrap">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <span class="material-symbols-outlined">{{
                showConfirmPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? "Đang cập nhật..." : "Đổi mật khẩu" }}
        </button>
      </form>

      <!-- Back to Login -->
      <div class="back-home">
        <p style="font-size: 12px; color: #78909c; margin-bottom: 6px">
          Quay lại trang đăng nhập:
        </p>
        <div
          style="
            display: flex;
            justify-content: center;
            gap: 12px;
            font-size: 13px;
          "
        >
          <router-link
            to="/auth/nong-dan"
            style="color: #2e7d32; font-weight: 600; text-decoration: none"
            >Nông Dân</router-link
          >
          <span style="color: #cfd8dc">|</span>
          <router-link
            to="/auth/doanh-nghiep"
            style="color: #2e7d32; font-weight: 600; text-decoration: none"
            >Doanh Nghiệp</router-link
          >
          <span style="color: #cfd8dc">|</span>
          <router-link
            to="/"
            style="color: #546e7a; font-weight: 500; text-decoration: none"
            >Trang chủ</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.forgot-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  font-family: "Inter", sans-serif;
  padding: 20px;
}

.forgot-box {
  background: white;
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #c8e6c9;
}

.forgot-header {
  text-align: center;
  margin-bottom: 24px;
}
.logo-icon {
  width: 64px;
  height: 64px;
  background: #f1f8e9;
  border: 2px solid #a5d6a7;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.forgot-header h1 {
  font-size: 22px;
  font-weight: 800;
  color: #1b5e20;
  margin: 0 0 6px;
}
.forgot-header p {
  color: #546e7a;
  font-size: 13.5px;
  line-height: 1.5;
  margin: 0;
}

/* Step Bar */
.step-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 0 10px;
}
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.step-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eceff1;
  color: #78909c;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.step-text {
  font-size: 11px;
  font-weight: 600;
  color: #90a4ae;
}
.step-item.active .step-num {
  background: #2e7d32;
  color: white;
}
.step-item.active .step-text {
  color: #2e7d32;
}
.step-item.completed .step-num {
  background: #4caf50;
  color: white;
}
.step-line {
  flex: 1;
  height: 3px;
  background: #eceff1;
  margin: 0 8px;
  margin-bottom: 16px;
  transition: all 0.3s;
}
.step-line.active {
  background: #4caf50;
}

/* Form inputs */
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 8px;
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #cfd8dc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.form-group input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.otp-input {
  letter-spacing: 12px;
  font-size: 24px !important;
  font-weight: 700;
  text-align: center;
}

.otp-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.resend-link,
.change-email {
  background: none;
  border: none;
  color: #2e7d32;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.resend-link:hover,
.change-email:hover {
  text-decoration: underline;
}

.input-wrap {
  position: relative;
}
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #90a4ae;
  cursor: pointer;
  padding: 0;
  display: flex;
}
.eye-btn:hover {
  color: #2e7d32;
}

.submit-btn {
  width: 100%;
  background: #2e7d32;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  margin-top: 10px;
}
.submit-btn:hover:not(:disabled) {
  background: #1b5e20;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-home {
  text-align: center;
  margin-top: 24px;
}
.back-home a {
  color: #546e7a;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.back-home a:hover {
  color: #2e7d32;
  text-decoration: underline;
}
</style>
