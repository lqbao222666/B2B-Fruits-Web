<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { notify } from "@/utils/notifier.ts";
import { Account } from "@/service/account.ts"; // Import hàm API vừa tạo

const router = useRouter();
const loading = ref(false);

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleSubmit = async () => {
  // 1. Validate form
  if (form.newPassword.length < 8) {
    notify.error("Mật khẩu mới phải có ít nhất 8 ký tự!");
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    notify.error("Mật khẩu xác nhận không trùng khớp!");
    return;
  }

  const userStorage = localStorage.getItem("user");
  if (!userStorage) {
    notify.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
    router.push("/login");
    return;
  }

  const userData = JSON.parse(userStorage);
  const userId = userData.id;

  // 3. Gọi API NestJS
  loading.value = true;
  try {
    const payload = {
      old_password: form.oldPassword,
      new_password: form.newPassword,
      confirm_password: form.confirmPassword,
    };

    await Account.changePassword(userId, payload);

    notify.success("Đổi mật khẩu thành công!");
    setTimeout(() => {
      router.back();
    }, 1000);
  } catch (error: any) {
    let message =
      error.response?.data?.message ||
      "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.";
    if (Array.isArray(message)) {
      message = message.join(", ");
    }
    notify.error(message);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-white to-[#eef4e6] relative overflow-hidden font-inter"
  >
    <div
      class="absolute inset-0 nature-pattern opacity-30 pointer-events-none"
    ></div>
    <div
      class="absolute -top-24 -left-24 w-96 h-96 bg-[#658a22]/10 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute -bottom-24 -right-24 w-96 h-96 bg-[#658a22]/5 rounded-full blur-3xl"
    ></div>

    <div
      class="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 z-10 p-8"
    >
      <button
        @click="goBack"
        class="flex items-center gap-1 text-slate-400 hover:text-[#658a22] transition-colors mb-6 text-sm font-semibold w-fit"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Quay lại hồ sơ
      </button>

      <div class="text-center mb-8">
        <div
          class="size-16 bg-[#eef4e6] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#658a22]"
        >
          <span class="material-symbols-outlined text-3xl">lock_reset</span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
          Đổi Mật Khẩu
        </h1>
        <p class="text-slate-500 text-sm">
          Tạo mật khẩu mới mạnh mẽ để bảo vệ tài khoản của bạn
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Mật khẩu hiện tại</label
          >
          <div class="relative flex items-center">
            <input
              v-model="form.oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8f9fa] focus:bg-white focus:ring-2 focus:ring-[#658a22]/20 focus:border-[#658a22] outline-none transition-all pr-12 text-sm"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              @click="showOldPassword = !showOldPassword"
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#658a22] transition-colors z-10"
            >
              <span class="material-symbols-outlined text-[20px]">{{
                showOldPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Mật khẩu mới</label
          >
          <div class="relative flex items-center">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8f9fa] focus:bg-white focus:ring-2 focus:ring-[#658a22]/20 focus:border-[#658a22] outline-none transition-all pr-12 text-sm"
              placeholder="Tạo mật khẩu mới"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#658a22] transition-colors z-10"
            >
              <span class="material-symbols-outlined text-[20px]">{{
                showNewPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5"
            >Xác nhận mật khẩu mới</label
          >
          <div class="relative flex items-center">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8f9fa] focus:bg-white focus:ring-2 focus:ring-[#658a22]/20 focus:border-[#658a22] outline-none transition-all pr-12 text-sm"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#658a22] transition-colors z-10"
            >
              <span class="material-symbols-outlined text-[20px]">{{
                showConfirmPassword ? "visibility_off" : "visibility"
              }}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#658a22] hover:bg-[#58791d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#658a22]/20 transition-all transform active:scale-[0.98] mt-4 flex justify-center items-center gap-2 disabled:opacity-70"
        >
          <span
            v-if="loading"
            class="animate-spin border-2 border-white border-t-transparent rounded-full size-4"
          ></span>
          {{ loading ? "Đang cập nhật..." : "Cập nhật mật khẩu" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: "Inter", sans-serif;
}

/* Background chấm bi hạt thiên nhiên */
.nature-pattern {
  background-image: radial-gradient(
    circle at 2px 2px,
    #e5ebd8 1px,
    transparent 0
  );
  background-size: 32px 32px;
}

/* Ẩn icon con mắt mặc định trên Edge/IE để tránh bị đúp 2 icon */
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
</style>
