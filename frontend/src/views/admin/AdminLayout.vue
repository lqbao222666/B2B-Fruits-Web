<script setup lang="ts">
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import auth from '@/service/auth.ts'
import { notify } from '@/utils/notifier.ts'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(true)
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const getAvatarUrl = (path: string | null) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`
}

const handleLogout = () => {
  auth.logout()
  notify.success('Đăng xuất quản trị thành công')
  router.push('/login')
}
</script>

<template>
  <div class="admin-root">
    <!-- ===== SIDEBAR ===== -->
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--closed': !isSidebarOpen }">
      <div class="sidebar-header">
        <RouterLink to="/admin" class="sidebar-logo">
          <div class="sidebar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.7 3.46 20.34 4.09 21 4.82 21h12.69a1 1 0 0 0 .97-.76L20 14"/>
              <path d="M9.25 14C9.25 14 8.5 11 9.5 9"/>
              <path d="M14.75 14C14.75 14 15.5 11 14.5 9"/>
              <path d="M12 6V3"/>
              <path d="M20 4C20 4 20 8 16 10"/>
              <path d="M4 4C4 4 4 8 8 10"/>
            </svg>
          </div>
          <span v-if="isSidebarOpen" class="sidebar-logo-text">AgroMarket</span>
        </RouterLink>
        <button class="toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
          <span class="material-symbols-outlined text-white/70">{{ isSidebarOpen ? 'menu_open' : 'menu' }}</span>
        </button>
      </div>

      <div class="sidebar-nav">
        <RouterLink to="/admin" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-dashboard' }">
          <span class="material-symbols-outlined nav-icon">dashboard</span>
          <span v-if="isSidebarOpen" class="nav-text">Tổng quan</span>
        </RouterLink>

        <div class="nav-group-title" v-if="isSidebarOpen">QUẢN LÝ GIAO DỊCH</div>

        <RouterLink to="/admin/products" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-products' }">
          <span class="material-symbols-outlined nav-icon">inventory_2</span>
          <span v-if="isSidebarOpen" class="nav-text">Bài đăng (Nông sản)</span>
        </RouterLink>

        <RouterLink to="/admin/categories" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-categories' }">
          <span class="material-symbols-outlined nav-icon">category</span>
          <span v-if="isSidebarOpen" class="nav-text">Danh mục Nông sản</span>
        </RouterLink>

        <RouterLink to="/admin/orders" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-orders' }">
          <span class="material-symbols-outlined nav-icon">shopping_cart</span>
          <span v-if="isSidebarOpen" class="nav-text">Đơn hàng B2B</span>
        </RouterLink>

        <RouterLink to="/admin/reports" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-reports' }">
          <span class="material-symbols-outlined nav-icon">report_problem</span>
          <span v-if="isSidebarOpen" class="nav-text">Báo cáo Sự cố</span>
        </RouterLink>

        <div class="nav-group-title" v-if="isSidebarOpen">QUẢN LÝ NGƯỜI DÙNG</div>

        <RouterLink to="/admin/accounts" class="nav-item" :class="{ 'nav-item--active': route.name === 'admin-accounts' }">
          <span class="material-symbols-outlined nav-icon">group</span>
          <span v-if="isSidebarOpen" class="nav-text">Doanh nghiệp / Nông dân</span>
        </RouterLink>
      </div>

      <div class="sidebar-footer">
        <RouterLink to="/" class="nav-item nav-item--back">
          <span class="material-symbols-outlined nav-icon">storefront</span>
          <span v-if="isSidebarOpen" class="nav-text">Trở về trang chủ</span>
        </RouterLink>
      </div>
    </aside>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="admin-main">
      <!-- HEADER -->
      <header class="admin-header">
        <div class="header-left">
          <h2 class="page-title">
            {{ 
              route.name === 'admin-dashboard' ? 'Tổng quan hệ thống' :
              route.name === 'admin-products' ? 'Quản lý Bài đăng Nông sản' :
              route.name === 'admin-categories' ? 'Quản lý Danh mục Nông sản' :
              route.name === 'admin-orders' ? 'Quản lý Đơn hàng B2B' :
              route.name === 'admin-reports' ? 'Quản lý Báo cáo Sự cố' :
              route.name === 'admin-accounts' ? 'Quản lý Người dùng' : 'Admin Panel'
            }}
          </h2>
        </div>
        <div class="header-right">
          <div class="admin-profile">
            <div class="admin-info">
              <span class="admin-role">Admin</span>
              <span class="admin-name">{{ user.fullName || user.email }}</span>
            </div>
            <div class="admin-avatar">
              <img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" alt="Avatar" />
              <span v-else class="material-symbols-outlined">shield_person</span>
            </div>
            <button @click="handleLogout" class="logout-btn" title="Đăng xuất">
              <span class="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- VIEW -->
      <div class="admin-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.admin-root {
  display: flex;
  min-height: 100vh;
  background: #f4f7f6;
  font-family: 'Inter', sans-serif;
}

/* ══════════ SIDEBAR ══════════ */
.admin-sidebar {
  width: 260px;
  background: #1B5E20; /* Xanh lá đậm */
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  flex-shrink: 0;
  box-shadow: 4px 0 16px rgba(0,0,0,0.05);
  z-index: 10;
}
.admin-sidebar--closed { width: 80px; }

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
}
.sidebar-logo-icon {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.sidebar-logo-text { font-weight: 800; font-size: 1.2rem; letter-spacing: -0.5px; }

.toggle-btn {
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.nav-group-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #A5D6A7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 16px 0 8px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.95rem;
}
.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}
.nav-item--active {
  background: white;
  color: #1B5E20;
  font-weight: 700;
}
.nav-icon { font-size: 1.3rem; }

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.nav-item--back {
  background: rgba(255,255,255,0.1);
  color: white;
}
.nav-item--back:hover { background: rgba(255,255,255,0.2); }

/* ══════════ MAIN CONTENT ══════════ */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 72px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  z-index: 5;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}
.admin-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}
.admin-role { font-size: 0.7rem; color: #2E7D32; font-weight: 700; text-transform: uppercase; }
.admin-name { font-size: 0.9rem; font-weight: 600; color: #333; }
.admin-avatar {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: #E8F5E9;
  display: flex; align-items: center; justify-content: center;
  color: #2E7D32; border: 2px solid #C8E6C9; overflow: hidden;
}
.admin-avatar img { width: 100%; height: 100%; object-fit: cover; }
.logout-btn {
  background: #fff0f0; color: #d32f2f;
  border: none; border-radius: 8px;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.2s;
}
.logout-btn:hover { background: #ffe0e0; }

.admin-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
</style>
