-- CreateEnum
CREATE TYPE "Role" AS ENUM ('htx', 'ho_vuon', 'doanh_nghiep', 'admin');

-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('pending', 'active', 'locked');

-- CreateEnum
CREATE TYPE "LoaiToChuc" AS ENUM ('htx', 'ho_vuon', 'ca_nhan');

-- CreateEnum
CREATE TYPE "TrangThaiDonHang" AS ENUM ('pending', 'confirmed', 'preparing', 'shipping', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "TrangThaiThanhToan" AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "PhuongThucThanhToan" AS ENUM ('vnpay', 'momo', 'bank_transfer');

-- CreateEnum
CREATE TYPE "TrangThaiSanPham" AS ENUM ('active', 'out_of_stock', 'seasonal', 'deleted');

-- CreateEnum
CREATE TYPE "TrangThaiRFQ" AS ENUM ('open', 'closed', 'expired');

-- CreateEnum
CREATE TYPE "TrangThaiPhanHoi" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "TrangThaiHopDong" AS ENUM ('active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "TrangThaiQuyetToan" AS ENUM ('pending', 'da_chuyen', 'xac_nhan');

-- CreateEnum
CREATE TYPE "LoaiSuKien" AS ENUM ('view', 'search', 'add_cart', 'purchase', 'review');

-- CreateEnum
CREATE TYPE "LoaiGoiY" AS ENUM ('collaborative', 'content_based', 'hybrid', 'seasonal');

-- CreateEnum
CREATE TYPE "LoaiThongBao" AS ENUM ('order', 'promotion', 'review', 'system', 'payment');

-- CreateEnum
CREATE TYPE "KenhThongBao" AS ENUM ('app', 'sms', 'zalo');

-- CreateEnum
CREATE TYPE "LoaiKhuyenMai" AS ENUM ('percent', 'fixed', 'qty_threshold');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(15),
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL,
    "avatar_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "htx" (
    "htx_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ten_htx" VARCHAR(200) NOT NULL,
    "ma_so_thue" VARCHAR(20),
    "tinh_thanh" VARCHAR(100) NOT NULL,
    "dia_chi" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "phan_tram_phi_dv" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "phi_co_dinh" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "chung_nhan" VARCHAR(100),
    "logo_url" TEXT,
    "mo_ta" TEXT,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "htx_pkey" PRIMARY KEY ("htx_id")
);

-- CreateTable
CREATE TABLE "ho_vuon" (
    "hovuon_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "htx_id" INTEGER,
    "ten_chu_ho" VARCHAR(100) NOT NULL,
    "dien_tich_ha" DECIMAL(8,2),
    "tinh_thanh" VARCHAR(100) NOT NULL,
    "dia_chi" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "chung_nhan" VARCHAR(100),
    "giay_phep" JSONB,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ho_vuon_pkey" PRIMARY KEY ("hovuon_id")
);

-- CreateTable
CREATE TABLE "doanh_nghiep" (
    "dn_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ten_cong_ty" VARCHAR(200) NOT NULL,
    "nganh_kinh_doanh" VARCHAR(100),
    "ma_so_thue" VARCHAR(20),
    "tinh_thanh" VARCHAR(100) NOT NULL,
    "dia_chi" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "han_muc_tin_dung" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doanh_nghiep_pkey" PRIMARY KEY ("dn_id")
);

-- CreateTable
CREATE TABLE "hop_dong_htx_hnv" (
    "hopdong_id" SERIAL NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "hovuon_id" INTEGER NOT NULL,
    "ngay_ky" DATE NOT NULL,
    "ngay_het_han" DATE NOT NULL,
    "phan_tram_hoa_hong" DECIMAL(5,2) NOT NULL,
    "phi_co_dinh_thang" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dieu_khoan" TEXT,
    "file_hop_dong_url" TEXT,
    "trang_thai" "TrangThaiHopDong" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hop_dong_htx_hnv_pkey" PRIMARY KEY ("hopdong_id")
);

-- CreateTable
CREATE TABLE "danh_muc" (
    "danhmuc_id" SERIAL NOT NULL,
    "danhmuc_cha_id" INTEGER,
    "ten_danh_muc" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "thu_tu" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "danh_muc_pkey" PRIMARY KEY ("danhmuc_id")
);

-- CreateTable
CREATE TABLE "san_pham" (
    "sp_id" SERIAL NOT NULL,
    "hovuon_id" INTEGER NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "danhmuc_id" INTEGER NOT NULL,
    "ten_sp" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT,
    "don_vi_tinh" VARCHAR(20) NOT NULL,
    "sl_ton_kho" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sl_dat_toi_thieu" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "ngay_thu_hoach" DATE,
    "han_su_dung" DATE,
    "tinh_thanh_xuat_xu" VARCHAR(100),
    "chung_nhan_sp" VARCHAR(100),
    "images" JSONB,
    "video_url" TEXT,
    "is_seasonal" BOOLEAN NOT NULL DEFAULT false,
    "season_months" JSONB,
    "trang_thai" "TrangThaiSanPham" NOT NULL DEFAULT 'active',
    "diem_trung_binh" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "luot_xem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "san_pham_pkey" PRIMARY KEY ("sp_id")
);

-- CreateTable
CREATE TABLE "bang_gia_si" (
    "banggia_id" SERIAL NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "sl_tu" DECIMAL(10,2) NOT NULL,
    "sl_den" DECIMAL(10,2),
    "gia_si" DECIMAL(12,2) NOT NULL,
    "hieu_luc_tu" DATE,
    "hieu_luc_den" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bang_gia_si_pkey" PRIMARY KEY ("banggia_id")
);

-- CreateTable
CREATE TABLE "khuyen_mai" (
    "km_id" SERIAL NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "loai_km" "LoaiKhuyenMai" NOT NULL,
    "gia_tri_giam" DECIMAL(10,2) NOT NULL,
    "sl_toi_thieu" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ma_coupon" VARCHAR(50),
    "ngay_bat_dau" DATE NOT NULL,
    "ngay_ket_thuc" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khuyen_mai_pkey" PRIMARY KEY ("km_id")
);

-- CreateTable
CREATE TABLE "yeu_cau_bao_gia" (
    "rfq_id" SERIAL NOT NULL,
    "dn_id" INTEGER NOT NULL,
    "danhmuc_id" INTEGER NOT NULL,
    "ten_nong_san" VARCHAR(200) NOT NULL,
    "so_luong_yc" DECIMAL(10,2) NOT NULL,
    "don_vi" VARCHAR(20) NOT NULL,
    "tinh_thanh_giao" VARCHAR(100),
    "ngay_giao_mong_muon" DATE,
    "yeu_cau_chung_nhan" VARCHAR(100),
    "ghi_chu" TEXT,
    "trang_thai" "TrangThaiRFQ" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "het_han_at" TIMESTAMP(3),

    CONSTRAINT "yeu_cau_bao_gia_pkey" PRIMARY KEY ("rfq_id")
);

-- CreateTable
CREATE TABLE "phan_hoi_bao_gia" (
    "phanhoi_id" SERIAL NOT NULL,
    "rfq_id" INTEGER NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "gia_de_xuat" DECIMAL(12,2) NOT NULL,
    "sl_co_the_cung" DECIMAL(10,2) NOT NULL,
    "thoi_gian_giao_ngay" INTEGER,
    "ghi_chu" TEXT,
    "trang_thai" "TrangThaiPhanHoi" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phan_hoi_bao_gia_pkey" PRIMARY KEY ("phanhoi_id")
);

-- CreateTable
CREATE TABLE "don_hang" (
    "donhang_id" SERIAL NOT NULL,
    "dn_id" INTEGER NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "ma_don_hang" VARCHAR(50) NOT NULL,
    "tong_tien_hang" DECIMAL(15,2) NOT NULL,
    "phi_dich_vu_htx" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tien_ve_hnv" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "phuong_thuc_tt" "PhuongThucThanhToan",
    "trang_thai_tt" "TrangThaiThanhToan" NOT NULL DEFAULT 'pending',
    "dia_chi_giao" TEXT NOT NULL,
    "tinh_thanh_giao" VARCHAR(100) NOT NULL,
    "ghi_chu" TEXT,
    "trang_thai_don" "TrangThaiDonHang" NOT NULL DEFAULT 'pending',
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_xac_nhan" TIMESTAMP(3),
    "ngay_hoan_thanh" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "don_hang_pkey" PRIMARY KEY ("donhang_id")
);

-- CreateTable
CREATE TABLE "chi_tiet_don" (
    "chitiet_id" SERIAL NOT NULL,
    "donhang_id" INTEGER NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "hovuon_id" INTEGER NOT NULL,
    "so_luong" DECIMAL(10,2) NOT NULL,
    "don_gia" DECIMAL(12,2) NOT NULL,
    "thanh_tien" DECIMAL(15,2) NOT NULL,
    "tien_htx_phi" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tien_ve_hovuon" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,

    CONSTRAINT "chi_tiet_don_pkey" PRIMARY KEY ("chitiet_id")
);

-- CreateTable
CREATE TABLE "thanh_toan" (
    "thanhtoan_id" SERIAL NOT NULL,
    "donhang_id" INTEGER NOT NULL,
    "so_tien" DECIMAL(15,2) NOT NULL,
    "phuong_thuc" "PhuongThucThanhToan" NOT NULL,
    "ma_gd_cong" VARCHAR(100),
    "trang_thai" "TrangThaiThanhToan" NOT NULL DEFAULT 'pending',
    "thoi_gian_tt" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thanh_toan_pkey" PRIMARY KEY ("thanhtoan_id")
);

-- CreateTable
CREATE TABLE "quyet_toan_htx" (
    "qt_id" SERIAL NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "hovuon_id" INTEGER NOT NULL,
    "ky_quyet_toan" VARCHAR(7) NOT NULL,
    "tong_doanh_thu_hnv" DECIMAL(15,2) NOT NULL,
    "tong_phi_htx" DECIMAL(15,2) NOT NULL,
    "so_tien_chuyen_hnv" DECIMAL(15,2) NOT NULL,
    "trang_thai" "TrangThaiQuyetToan" NOT NULL DEFAULT 'pending',
    "ngay_quyet_toan" TIMESTAMP(3),
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quyet_toan_htx_pkey" PRIMARY KEY ("qt_id")
);

-- CreateTable
CREATE TABLE "danh_gia" (
    "danhgia_id" SERIAL NOT NULL,
    "donhang_id" INTEGER NOT NULL,
    "dn_id" INTEGER NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "htx_id" INTEGER NOT NULL,
    "diem_chat_luong" SMALLINT NOT NULL,
    "diem_giao_hang" SMALLINT NOT NULL,
    "diem_dich_vu" SMALLINT NOT NULL,
    "nhan_xet" TEXT,
    "images" JSONB,
    "htx_tra_loi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "danh_gia_pkey" PRIMARY KEY ("danhgia_id")
);

-- CreateTable
CREATE TABLE "thong_bao" (
    "tb_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "loai" "LoaiThongBao" NOT NULL,
    "tieu_de" VARCHAR(200) NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "ref_id" INTEGER,
    "ref_type" VARCHAR(50),
    "kenh" "KenhThongBao" NOT NULL DEFAULT 'app',
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "thoi_gian_gui" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thong_bao_pkey" PRIMARY KEY ("tb_id")
);

-- CreateTable
CREATE TABLE "tin_nhan" (
    "tinnhan_id" SERIAL NOT NULL,
    "nguoi_gui_id" INTEGER NOT NULL,
    "nguoi_nhan_id" INTEGER NOT NULL,
    "donhang_id" INTEGER,
    "noi_dung" TEXT NOT NULL,
    "attachments" JSONB,
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tin_nhan_pkey" PRIMARY KEY ("tinnhan_id")
);

-- CreateTable
CREATE TABLE "ai_events" (
    "event_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "loai_sk" "LoaiSuKien" NOT NULL,
    "session_id" VARCHAR(100),
    "thoi_gian_xem" INTEGER,
    "metadata" JSONB,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "ai_goi_y" (
    "goiy_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sp_id" INTEGER NOT NULL,
    "loai_goiy" "LoaiGoiY" NOT NULL,
    "diem_phu_hop" DECIMAL(6,4) NOT NULL,
    "da_click" BOOLEAN NOT NULL DEFAULT false,
    "da_mua" BOOLEAN NOT NULL DEFAULT false,
    "phien_ban_model" VARCHAR(20),
    "thoi_gian_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_goi_y_pkey" PRIMARY KEY ("goiy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "htx_user_id_key" ON "htx"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "htx_ma_so_thue_key" ON "htx"("ma_so_thue");

-- CreateIndex
CREATE UNIQUE INDEX "ho_vuon_user_id_key" ON "ho_vuon"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doanh_nghiep_user_id_key" ON "doanh_nghiep"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doanh_nghiep_ma_so_thue_key" ON "doanh_nghiep"("ma_so_thue");

-- CreateIndex
CREATE UNIQUE INDEX "danh_muc_slug_key" ON "danh_muc"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "khuyen_mai_ma_coupon_key" ON "khuyen_mai"("ma_coupon");

-- CreateIndex
CREATE UNIQUE INDEX "don_hang_ma_don_hang_key" ON "don_hang"("ma_don_hang");

-- CreateIndex
CREATE UNIQUE INDEX "thanh_toan_donhang_id_key" ON "thanh_toan"("donhang_id");

-- CreateIndex
CREATE UNIQUE INDEX "thanh_toan_ma_gd_cong_key" ON "thanh_toan"("ma_gd_cong");

-- CreateIndex
CREATE UNIQUE INDEX "quyet_toan_htx_htx_id_hovuon_id_ky_quyet_toan_key" ON "quyet_toan_htx"("htx_id", "hovuon_id", "ky_quyet_toan");

-- CreateIndex
CREATE UNIQUE INDEX "danh_gia_donhang_id_key" ON "danh_gia"("donhang_id");

-- CreateIndex
CREATE INDEX "ai_events_user_id_thoi_gian_idx" ON "ai_events"("user_id", "thoi_gian");

-- CreateIndex
CREATE INDEX "ai_events_sp_id_loai_sk_idx" ON "ai_events"("sp_id", "loai_sk");

-- CreateIndex
CREATE INDEX "ai_goi_y_user_id_thoi_gian_tao_idx" ON "ai_goi_y"("user_id", "thoi_gian_tao");

-- AddForeignKey
ALTER TABLE "htx" ADD CONSTRAINT "htx_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_vuon" ADD CONSTRAINT "ho_vuon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_vuon" ADD CONSTRAINT "ho_vuon_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doanh_nghiep" ADD CONSTRAINT "doanh_nghiep_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hop_dong_htx_hnv" ADD CONSTRAINT "hop_dong_htx_hnv_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hop_dong_htx_hnv" ADD CONSTRAINT "hop_dong_htx_hnv_hovuon_id_fkey" FOREIGN KEY ("hovuon_id") REFERENCES "ho_vuon"("hovuon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_muc" ADD CONSTRAINT "danh_muc_danhmuc_cha_id_fkey" FOREIGN KEY ("danhmuc_cha_id") REFERENCES "danh_muc"("danhmuc_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "san_pham" ADD CONSTRAINT "san_pham_hovuon_id_fkey" FOREIGN KEY ("hovuon_id") REFERENCES "ho_vuon"("hovuon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "san_pham" ADD CONSTRAINT "san_pham_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "san_pham" ADD CONSTRAINT "san_pham_danhmuc_id_fkey" FOREIGN KEY ("danhmuc_id") REFERENCES "danh_muc"("danhmuc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bang_gia_si" ADD CONSTRAINT "bang_gia_si_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khuyen_mai" ADD CONSTRAINT "khuyen_mai_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khuyen_mai" ADD CONSTRAINT "khuyen_mai_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_bao_gia" ADD CONSTRAINT "yeu_cau_bao_gia_dn_id_fkey" FOREIGN KEY ("dn_id") REFERENCES "doanh_nghiep"("dn_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_bao_gia" ADD CONSTRAINT "yeu_cau_bao_gia_danhmuc_id_fkey" FOREIGN KEY ("danhmuc_id") REFERENCES "danh_muc"("danhmuc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_hoi_bao_gia" ADD CONSTRAINT "phan_hoi_bao_gia_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "yeu_cau_bao_gia"("rfq_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_hoi_bao_gia" ADD CONSTRAINT "phan_hoi_bao_gia_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_dn_id_fkey" FOREIGN KEY ("dn_id") REFERENCES "doanh_nghiep"("dn_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don" ADD CONSTRAINT "chi_tiet_don_donhang_id_fkey" FOREIGN KEY ("donhang_id") REFERENCES "don_hang"("donhang_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don" ADD CONSTRAINT "chi_tiet_don_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don" ADD CONSTRAINT "chi_tiet_don_hovuon_id_fkey" FOREIGN KEY ("hovuon_id") REFERENCES "ho_vuon"("hovuon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanh_toan" ADD CONSTRAINT "thanh_toan_donhang_id_fkey" FOREIGN KEY ("donhang_id") REFERENCES "don_hang"("donhang_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quyet_toan_htx" ADD CONSTRAINT "quyet_toan_htx_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quyet_toan_htx" ADD CONSTRAINT "quyet_toan_htx_hovuon_id_fkey" FOREIGN KEY ("hovuon_id") REFERENCES "ho_vuon"("hovuon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_donhang_id_fkey" FOREIGN KEY ("donhang_id") REFERENCES "don_hang"("donhang_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_dn_id_fkey" FOREIGN KEY ("dn_id") REFERENCES "doanh_nghiep"("dn_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_htx_id_fkey" FOREIGN KEY ("htx_id") REFERENCES "htx"("htx_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tin_nhan" ADD CONSTRAINT "tin_nhan_nguoi_gui_id_fkey" FOREIGN KEY ("nguoi_gui_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tin_nhan" ADD CONSTRAINT "tin_nhan_nguoi_nhan_id_fkey" FOREIGN KEY ("nguoi_nhan_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tin_nhan" ADD CONSTRAINT "tin_nhan_donhang_id_fkey" FOREIGN KEY ("donhang_id") REFERENCES "don_hang"("donhang_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_events" ADD CONSTRAINT "ai_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_events" ADD CONSTRAINT "ai_events_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_goi_y" ADD CONSTRAINT "ai_goi_y_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_goi_y" ADD CONSTRAINT "ai_goi_y_sp_id_fkey" FOREIGN KEY ("sp_id") REFERENCES "san_pham"("sp_id") ON DELETE RESTRICT ON UPDATE CASCADE;
