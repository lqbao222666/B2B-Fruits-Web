import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { notify } from "@/utils/notifier.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: Home },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Register.vue"),
    },
    // ── Trang auth riêng theo vai trò ──
    {
      path: "/auth/nong-dan",
      name: "auth-nong-dan",
      component: () => import("../views/AuthNongDan.vue"),
    },
    {
      path: "/auth/doanh-nghiep",
      name: "auth-doanh-nghiep",
      component: () => import("../views/AuthDoanhNghiep.vue"),
    },
    {
      path: "/product/:id",
      name: "productdetail",
      component: () => import("../views/ProductDetail.vue"),
    },
    {
      path: "/manage-posts",
      name: "ManagePosts",
      component: () => import("../views/ManagePosts.vue"),
    },
    {
      path: "/edit-post/:id",
      name: "EditPost",
      component: () => import("../views/EditPost.vue"),
    },

    {
      path: "/payment-momo",
      name: "FakePaymentMoMo",
      component: () => import("../views/FakePaymentMoMo.vue"),
    },
    {
      path: "/payment-paypal",
      name: "FakePaymentPayPal",
      component: () => import("../views/FakePaymentPayPal.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Profile.vue"),
    },
    {
      path: "/partner/:id",
      alias: ["/user/:id", "/ho-so/:id"],
      name: "partner-profile",
      component: () => import("../views/PartnerProfile.vue"),
    },
    {
      path: "/messages",
      name: "messages",
      component: () => import("../views/Messages.vue"),
    },
    {
      path: "/change_password",
      name: "change_password",
      component: () => import("../views/Change_password.vue"),
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/Products.vue"),
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("../views/Order.vue"),
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("../views/Cart.vue"),
    },
    {
      path: "/detail-orders/:id",
      alias: ["/orders/:id", "/order/:id"],
      name: "detailorders",
      component: () => import("../views/OrderDetail.vue"),
    },
    {
      path: "/change-password",
      name: "ChangePassword",
      component: () => import("../views/Change_password.vue"),
    },
    {
      path: "/reset-password",
      name: "ResetPassword",
      component: () => import("@/views/ResetPassword.vue"),
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: () => import("@/views/ForgotPassword.vue"),
    },
    {
      path: "/about",
      name: "About",
      component: () => import("@/views/About.vue"),
    },
    {
      path: "/create-post",
      name: "CreatePost",
      component: () => import("@/views/CreatePost.vue"),
      meta: { requiresAuth: true },
    },
    // === NHU CẦU THU MUA B2B ===
    {
      path: "/nhu-cau",
      name: "NhuCauThuMua",
      component: () => import("@/views/NhuCauThuMua.vue"),
    },
    {
      path: "/nhu-cau/:id",
      name: "NhuCauDetail",
      component: () => import("@/views/NhuCauDetail.vue"),
    },
    {
      path: "/quan-ly-nhu-cau",
      name: "ManageNhuCau",
      component: () => import("@/views/ManageNhuCau.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/create-nhu-cau",
      name: "CreateNhuCau",
      component: () => import("@/views/CreateNhuCau.vue"),
      meta: { requiresAuth: true },
    },
    // === THƯƠNG LƯỢNG B2B (Bài Đăng) ===
    {
      path: "/quan-ly-thuong-luong",
      name: "ManageThuongLuong",
      component: () => import("@/views/ManageThuongLuong.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/thuong-luong/:id",
      name: "ThuongLuongDetail",
      component: () => import("@/views/ThuongLuongDetail.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/edit-nhu-cau/:id",
      name: "EditNhuCau",
      component: () => import("@/views/EditNhuCau.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/phan-hoi-bao-gia/:id",
      name: "PhanHoiBaoGia",
      component: () => import("@/views/PhanHoiBaoGia.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/gui-bao-gia/:id",
      name: "GuiBaoGia",
      component: () => import("@/views/GuiBaoGia.vue"),
      meta: { requiresAuth: true },
    },
    // === ADMIN ROUTE (có bảo vệ) ===
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/AdminLayout.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import("../views/admin/Dashboard.vue"),
        },
        {
          path: "products",
          name: "admin-products",
          component: () => import("../views/admin/ProductManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true }, // bảo vệ thêm
        },
        {
          path: "nhu-cau",
          name: "admin-nhucau",
          component: () => import("../views/admin/NhuCauManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "orders",
          name: "admin-orders",
          component: () => import("../views/admin/OrderManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "accounts",
          name: "admin-accounts",
          component: () => import("../views/admin/AccountManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "comments",
          name: "admin-comments",
          component: () => import("../views/admin/CommentManagement.vue"),
        },
        {
          path: "reports",
          name: "admin-reports",
          component: () => import("../views/admin/ReportManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("../views/admin/CategoryManagement.vue"),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
  ],
});

// === GUARD ROUTER (đặt sau khi tạo router) ===
router.beforeEach((to) => {
  const userStr = localStorage.getItem("user");
  let user: any = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (_) {}
  }

  // Yêu cầu đăng nhập
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      if (to.matched.some((record) => record.meta.requiresAdmin)) {
        notify.error(
          "Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập.",
        );
        return "/login";
      } else {
        notify.info("Vui lòng đăng nhập để tiếp tục");
        return "/auth/doanh-nghiep";
      }
    }
  }

  // Yêu cầu quyền ADMIN
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (user?.role?.toLowerCase() !== "admin") {
      notify.error("Bạn không có quyền truy cập trang quản trị");
      return "/login";
    }
  }

  return true;
});

export default router;
