<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import Chatbot from "./components/Chatbot.vue";

const route = useRoute();

// Ẩn Navbar & Footer nếu là trang login/register hoặc trang admin
const isAuthPage = computed(() => {
  return (
    ["login", "register", "auth-nong-dan", "auth-doanh-nghiep"].includes(
      route.name as string,
    ) || route.path.startsWith("/admin")
  );
});
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col bg-slate-50/60 text-slate-800 antialiased"
  >
    <!-- Soft Decorative Ambient Background Gradients -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-1/3 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float"
        style="animation-delay: -2s"
      ></div>
      <div
        class="absolute bottom-10 left-1/4 w-96 h-96 bg-green-200/25 rounded-full blur-3xl animate-float"
        style="animation-delay: -4s"
      ></div>
    </div>

    <Navbar v-if="!isAuthPage" class="relative z-30" />

    <main
      class="flex-grow relative z-10 transition-all duration-300"
      :class="{ 'px-4 sm:px-6 lg:px-8 py-6': !isAuthPage }"
    >
      <div :class="{ 'container mx-auto': !isAuthPage }">
        <RouterView v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>

    <Chatbot v-if="!isAuthPage" />
    <Footer v-if="!isAuthPage" class="relative z-20" />
  </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
