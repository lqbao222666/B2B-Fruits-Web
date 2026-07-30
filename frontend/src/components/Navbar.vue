<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import auth from "@/service/auth.ts";
import { notify } from "@/utils/notifier.ts";
import { Cart } from "@/service/cart.ts";

const router = useRouter();
const isMenuOpen = ref(false);
const user = ref<any>(null);
const cartCount = ref(0);
const searchQuery = ref("");
const showCategoryMenu = ref(false);

const getAvatarUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:3000${path}`;
};

const updateCartCount = async () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) {
    cartCount.value = 0;
    return;
  }
  try {
    const userData = JSON.parse(savedUser);
    const userId = userData.user_id || userData.id;
    const response = await Cart.getByUser(userId);
    const items = Array.isArray(response) ? response : response.data || [];
    cartCount.value = items.reduce(
      (total: number, item: any) => total + Number(item.so_luong),
      0,
    );
  } catch (e: any) {
    cartCount.value = 0;
  }
};

const checkAuth = () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser);
      updateCartCount();
    } catch (e) {
      user.value = null;
    }
  } else {
    user.value = null;
    cartCount.value = 0;
  }
};

const handleGlobalUpdate = () => {
  updateCartCount();
  checkAuth();
};

onMounted(() => {
  checkAuth();
  window.addEventListener("cart-updated", updateCartCount);
  window.addEventListener("user-updated", handleGlobalUpdate);
  window.addEventListener("click", (e: any) => {
    if (!e.target.closest(".user-menu-container")) isMenuOpen.value = false;
    if (!e.target.closest(".category-menu-container"))
      showCategoryMenu.value = false;
  });
});

onUnmounted(() => {
  window.removeEventListener("cart-updated", updateCartCount);
  window.removeEventListener("user-updated", handleGlobalUpdate);
});

const handleLogout = () => {
  notify.success("Đăng xuất thành công");
  isMenuOpen.value = false;
  const isAdmin = user.value?.role?.toUpperCase() === "ADMIN";

  user.value = null;
  cartCount.value = 0;
  auth.logout(isAdmin ? "/login" : "/");
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(
      `/products?search=${encodeURIComponent(searchQuery.value.trim())}`,
    );
  }
};
</script>

<template>
  <div class="navbar-root">
    <!-- ===== TẦNG 1: TOP BAR ===== -->
    <div class="topbar">
      <div class="topbar-inner">
        <!-- Trái: địa chỉ -->
        <div class="topbar-left">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Phường Ba Đình, Thành phố Hà Nội</span>
        </div>

        <!-- Giữa: link tìm hiểu -->
        <div class="topbar-center">
          <RouterLink to="/about" class="topbar-link"
            >Tìm hiểu về AgroMarket</RouterLink
          >
        </div>

        <!-- Phải: auth links -->
        <div class="topbar-right">
          <RouterLink
            to="/auth/nong-dan"
            class="topbar-link topbar-link--highlight"
            >Kênh người bán</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- ===== TẦNG 2: MAIN NAVBAR ===== -->
    <header class="main-navbar">
      <div class="main-navbar-inner">
        <!-- Logo -->
        <RouterLink to="/" class="logo-link">
          <div class="logo-icon">
            <svg
              width="28"
              height="28"
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
          <div class="logo-text-block">
            <span class="logo-brand">AgroMarket</span>
            <span class="logo-sub">phần mềm giao dịch nông sản</span>
          </div>
        </RouterLink>

        <!-- Search Block -->
        <div class="search-block">
          <!-- Nút Danh mục -->
          <div class="category-menu-container">
            <button
              class="category-btn"
              @click.stop="showCategoryMenu = !showCategoryMenu"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Danh mục</span>
              <svg
                class="chevron-icon"
                :class="{ 'rotate-180': showCategoryMenu }"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <transition name="dropdown">
              <div v-if="showCategoryMenu" class="category-dropdown">
                <RouterLink
                  to="/products?category=rau-cu"
                  @click="showCategoryMenu = false"
                  class="category-item"
                >
                  <span class="cat-icon">🥬</span> Rau củ quả
                </RouterLink>
                <RouterLink
                  to="/products?category=trai-cay"
                  @click="showCategoryMenu = false"
                  class="category-item"
                >
                  <span class="cat-icon">🍎</span> Trái cây tươi
                </RouterLink>
                <RouterLink
                  to="/products?category=ngu-coc"
                  @click="showCategoryMenu = false"
                  class="category-item"
                >
                  <span class="cat-icon">🌾</span> Ngũ cốc & Lúa
                </RouterLink>
                <RouterLink
                  to="/products?category=thuy-san"
                  @click="showCategoryMenu = false"
                  class="category-item"
                >
                  <span class="cat-icon">🐟</span> Thủy sản
                </RouterLink>
                <RouterLink
                  to="/products?category=gia-vi"
                  @click="showCategoryMenu = false"
                  class="category-item"
                >
                  <span class="cat-icon">🌶️</span> Gia vị & Hương liệu
                </RouterLink>
                <RouterLink
                  to="/products"
                  @click="showCategoryMenu = false"
                  class="category-item category-item--all"
                >
                  Xem tất cả danh mục →
                </RouterLink>
              </div>
            </transition>
          </div>

          <!-- Search input -->
          <div class="search-input-wrap">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm sản phẩm, nhà cung cấp..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <!-- Tin nhắn -->
          <RouterLink to="/messages" class="action-btn">
            <div class="action-btn-icon relative">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span class="action-btn-label">Tin nhắn</span>
          </RouterLink>


          <!-- Đơn hàng -->
          <RouterLink to="/orders" class="action-btn">
            <div class="action-btn-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M9 17H5a2 2 0 0 0-2 2" />
                <path d="M9 3H5a2 2 0 0 0-2 2v14" />
                <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9" />
                <polyline points="13 7 16 10 22 4" />
              </svg>
            </div>
            <span class="action-btn-label">Đơn hàng</span>
          </RouterLink>

          <!-- Separator -->
          <div class="action-sep"></div>

          <!-- NÔNG DÂN TOOLS -->
          <template v-if="user?.role?.toUpperCase() === 'NONG_DAN'">
            <RouterLink
              to="/manage-posts"
              class="action-btn action-btn--farmer"
            >
              <div class="action-btn-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <span class="action-btn-label text-[#2E7D32]">Quản lý bài</span>
            </RouterLink>

            <RouterLink
              to="/create-post"
              class="action-btn action-btn--farmer-create"
            >
              <div class="action-btn-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span class="action-btn-label">Tạo bài mới</span>
            </RouterLink>

            <!-- Separator -->
            <div class="action-sep"></div>
          </template>

          <!-- User menu / Login -->
          <div v-if="user" class="relative user-menu-container">
            <button
              @click.stop="isMenuOpen = !isMenuOpen"
              class="user-btn"
              :class="{ 'user-btn--open': isMenuOpen }"
            >
              <div class="user-avatar">
                <img
                  v-if="user.avatar"
                  :src="getAvatarUrl(user.avatar)"
                  class="avatar-img"
                  alt="Avatar"
                />
                <span v-else class="avatar-initials">
                  {{
                    user.email ? user.email.substring(0, 2).toUpperCase() : "AD"
                  }}
                </span>
              </div>
              <div class="user-info">
                <span class="user-role">
                  {{
                    user.role?.toUpperCase() === "ADMIN"
                      ? "Quản trị viên"
                      : user.role?.toUpperCase() === "NONG_DAN"
                        ? "Nông dân"
                        : "Doanh nghiệp"
                  }}
                </span>
                <span class="user-name">
                  {{
                    user.fullName || user.username || user.email?.split("@")[0]
                  }}
                </span>
              </div>
              <svg
                class="chevron-icon"
                :class="{ 'rotate-180': isMenuOpen }"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <transition name="dropdown">
              <div v-if="isMenuOpen" class="user-dropdown">
                <div class="user-dropdown-header">
                  <p class="dropdown-label">Tài khoản của bạn</p>
                  <p class="dropdown-email">{{ user.email }}</p>
                </div>

                <RouterLink
                  v-if="user.role?.toUpperCase() === 'ADMIN'"
                  to="/admin"
                  @click="isMenuOpen = false"
                  class="dropdown-item dropdown-item--admin"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Quản trị hệ thống
                </RouterLink>

                <RouterLink
                  to="/profile"
                  @click="isMenuOpen = false"
                  class="dropdown-item"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Hồ sơ cá nhân
                </RouterLink>

                <template v-if="user.role?.toUpperCase() === 'NONG_DAN'">
                  <RouterLink
                    to="/create-post"
                    @click="isMenuOpen = false"
                    class="dropdown-item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Tạo bài đăng mới
                  </RouterLink>

                  <RouterLink
                    to="/manage-posts"
                    @click="isMenuOpen = false"
                    class="dropdown-item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    Quản lý bài đăng
                  </RouterLink>
                </template>

                <RouterLink
                  to="/orders"
                  @click="isMenuOpen = false"
                  class="dropdown-item"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                  Đơn hàng của tôi
                </RouterLink>

                <div class="dropdown-divider"></div>

                <button
                  @click="handleLogout"
                  class="dropdown-item dropdown-item--logout"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </transition>
          </div>

          <RouterLink v-else to="/auth/doanh-nghiep" class="login-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Đăng nhập
          </RouterLink>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

/* =================== ROOT =================== */
.navbar-root {
  position: sticky;
  top: 0;
  z-index: 50;
  font-family: "Inter", sans-serif;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* =================== TOP BAR =================== */
.topbar {
  background-color: #1b5e20;
  height: 36px;
  display: flex;
  align-items: center;
}

.topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.topbar-center {
  flex: 1;
  text-align: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.topbar-link {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s;
}

.topbar-link:hover {
  color: #ffffff;
}

.topbar-link--highlight {
  color: #a5d6a7;
  font-weight: 700;
}

.topbar-link--highlight:hover {
  color: #ffffff;
}

.topbar-divider {
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
}

/* =================== MAIN NAVBAR =================== */
.main-navbar {
  background: #ffffff;
  border-bottom: 1.5px solid #e8f5e9;
}

.main-navbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  height: 72px;
}

/* ---- LOGO ---- */
.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: #e8f5e9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.logo-link:hover .logo-icon {
  background: #2e7d32;
}

.logo-link:hover .logo-icon svg {
  stroke: #ffffff;
}

.logo-icon svg {
  transition: stroke 0.2s;
}

.logo-text-block {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.logo-brand {
  font-size: 20px;
  font-weight: 800;
  color: #1b5e20;
  letter-spacing: -0.5px;
}

.logo-sub {
  font-size: 10px;
  color: #66bb6a;
  font-weight: 500;
  text-transform: lowercase;
  letter-spacing: 0.02em;
}

/* ---- SEARCH BLOCK ---- */
.search-block {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1.5px solid #c8e6c9;
  border-radius: 10px;
  overflow: visible;
  height: 46px;
  background: #fff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  position: relative;
}

.search-block:focus-within {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

/* Category button */
.category-menu-container {
  position: relative;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 44px;
  background: #f1f8e9;
  border: none;
  border-right: 1.5px solid #c8e6c9;
  border-radius: 8px 0 0 8px;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  font-family: "Inter", sans-serif;
}

.category-btn:hover {
  background: #dcedc8;
}

.chevron-icon {
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Category dropdown */
.category-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  background: #fff;
  border: 1.5px solid #c8e6c9;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 200;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 500;
  color: #37474f;
  text-decoration: none;
  transition:
    background 0.12s,
    color 0.12s;
}

.category-item:hover {
  background: #f1f8e9;
  color: #2e7d32;
}

.category-item--all {
  color: #2e7d32;
  font-weight: 600;
  border-top: 1px solid #e8f5e9;
}

.cat-icon {
  font-size: 16px;
}

/* Search input */
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 44px;
  position: relative;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 16px;
  font-size: 14px;
  color: #263238;
  background: transparent;
  font-family: "Inter", sans-serif;
}

.search-input::placeholder {
  color: #b0bec5;
}

.search-btn {
  height: 44px;
  padding: 0 16px;
  background: #2e7d32;
  border: none;
  border-radius: 0 8px 8px 0;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.search-btn:hover {
  background: #1b5e20;
}

/* ---- ACTION BUTTONS ---- */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  color: #455a64;
  transition:
    background 0.15s,
    color 0.15s;
  font-family: "Inter", sans-serif;
}

.action-btn:hover {
  background: #f1f8e9;
  color: #2e7d32;
}

.action-btn--farmer-create {
  background: #e8f5e9;
  color: #2e7d32;
}
.action-btn--farmer-create:hover {
  background: #c8e6c9;
}

.action-btn-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
}

.action-btn-label {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #d32f2f;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.action-sep {
  width: 1px;
  height: 36px;
  background: #e0e0e0;
  margin: 0 4px;
}

/* ---- USER MENU ---- */
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "Inter", sans-serif;
}

.user-btn:hover,
.user-btn--open {
  border-color: #c8e6c9;
  background: #f1f8e9;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #a5d6a7;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 12px;
  font-weight: 800;
  color: #2e7d32;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-role {
  font-size: 10px;
  font-weight: 700;
  color: #66bb6a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #263238;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* User dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: #fff;
  border: 1.5px solid #c8e6c9;
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 200;
}

.user-dropdown-header {
  padding: 14px 18px;
  background: #f1f8e9;
  border-bottom: 1px solid #e8f5e9;
}

.dropdown-label {
  font-size: 10px;
  font-weight: 700;
  color: #81c784;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: 13px;
  font-weight: 600;
  color: #263238;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  font-size: 13.5px;
  font-weight: 500;
  color: #455a64;
  text-decoration: none;
  transition:
    background 0.12s,
    color 0.12s;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  text-align: left;
}

.dropdown-item:hover {
  background: #f1f8e9;
  color: #2e7d32;
}

.dropdown-item--admin {
  color: #1565c0;
}

.dropdown-item--admin:hover {
  background: #e3f2fd;
  color: #1565c0;
}

.dropdown-item--logout {
  color: #c62828;
}

.dropdown-item--logout:hover {
  background: #ffebee;
  color: #c62828;
}

.dropdown-divider {
  height: 1px;
  background: #f1f8e9;
  margin: 4px 0;
}

/* ---- LOGIN BUTTON ---- */
.login-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: #2e7d32;
  color: #fff;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.15s,
    transform 0.1s;
  white-space: nowrap;
}

.login-btn:hover {
  background: #1b5e20;
  transform: translateY(-1px);
}

/* =================== ANIMATIONS =================== */
.pop-enter-active {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-8px);
}

/* =================== RESPONSIVE =================== */
@media (max-width: 768px) {
  .topbar {
    display: none;
  }

  .main-navbar-inner {
    padding: 0 12px;
    gap: 10px;
    height: 60px;
  }

  .logo-sub {
    display: none;
  }

  .logo-brand {
    font-size: 17px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .category-btn span:not(.chevron-icon) {
    display: none;
  }

  .category-btn {
    padding: 0 10px;
  }

  .action-btn-label {
    display: none;
  }

  .user-info {
    display: none;
  }

  .user-name,
  .user-role {
    display: none;
  }
}

@media (max-width: 480px) {
  .topbar-center {
    display: none;
  }
  .action-sep {
    display: none;
  }
}
</style>
