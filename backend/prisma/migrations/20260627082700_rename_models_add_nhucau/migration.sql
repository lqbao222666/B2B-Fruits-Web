/*
  Warnings:

  - The values [collaborative,content_based,hybrid,seasonal] on the enum `LoaiGoiY` will be removed. If these variants are still used in the database, this will fail.
  - The values [view,search,add_cart,purchase,review] on the enum `LoaiSuKien` will be removed. If these variants are still used in the database, this will fail.
  - The values [order,promotion,review,system,payment] on the enum `LoaiThongBao` will be removed. If these variants are still used in the database, this will fail.
  - The values [bank_transfer] on the enum `PhuongThucThanhToan` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,confirmed,preparing,shipping,done,cancelled] on the enum `TrangThaiDonHang` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,accepted,rejected] on the enum `TrangThaiPhanHoi` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,paid,refunded,failed] on the enum `TrangThaiThanhToan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sp_id` on the `ai_events` table. All the data in the column will be lost.
  - You are about to drop the column `da_mua` on the `ai_goi_y` table. All the data in the column will be lost.
  - You are about to drop the column `sp_id` on the `ai_goi_y` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ai_goi_y` table. All the data in the column will be lost.
  - You are about to drop the column `diem_dich_vu` on the `danh_gia` table. All the data in the column will be lost.
  - You are about to drop the column `diem_giao_hang` on the `danh_gia` table. All the data in the column will be lost.
  - You are about to drop the column `dn_id` on the `danh_gia` table. All the data in the column will be lost.
  - You are about to drop the column `htx_id` on the `danh_gia` table. All the data in the column will be lost.
  - You are about to drop the column `htx_tra_loi` on the `danh_gia` table. All the data in the column will be lost.
  - You are about to drop the column `sp_id` on the `danh_gia` table. All the data in the column will be lost.
  - The primary key for the `doanh_nghiep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dn_id` on the `doanh_nghiep` table. All the data in the column will be lost.
  - You are about to drop the column `han_muc_tin_dung` on the `doanh_nghiep` table. All the data in the column will be lost.
  - You are about to drop the column `dn_id` on the `don_hang` table. All the data in the column will be lost.
  - You are about to drop the column `htx_id` on the `don_hang` table. All the data in the column will be lost.
  - You are about to drop the column `phi_dich_vu_htx` on the `don_hang` table. All the data in the column will be lost.
  - You are about to drop the column `tien_ve_hnv` on the `don_hang` table. All the data in the column will be lost.
  - You are about to drop the column `tong_tien_hang` on the `don_hang` table. All the data in the column will be lost.
  - You are about to drop the column `htx_id` on the `phan_hoi_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `rfq_id` on the `phan_hoi_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `sl_co_the_cung` on the `phan_hoi_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - The primary key for the `yeu_cau_bao_gia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dn_id` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `ghi_chu` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `het_han_at` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `ngay_giao_mong_muon` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `rfq_id` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - You are about to drop the column `so_luong_yc` on the `yeu_cau_bao_gia` table. All the data in the column will be lost.
  - The `trang_thai` column on the `yeu_cau_bao_gia` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `bang_gia_si` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chi_tiet_don` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ho_vuon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hop_dong_htx_hnv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `htx` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `khuyen_mai` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quyet_toan_htx` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `san_pham` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nguoi_nhan_id` to the `ai_goi_y` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baidang_id` to the `danh_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diem_tong` to the `danh_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_danhgia_id` to the `danh_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_duoc_dg_id` to the `danh_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baidang_id` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `don_gia` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `don_vi_tinh` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_ban_id` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_mua_id` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_luong` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tong_tien` to the `don_hang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_phan_hoi_id` to the `phan_hoi_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_luong_co_the` to the `phan_hoi_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `phan_hoi_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yeucau_id` to the `phan_hoi_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nguoi_gui_id` to the `yeu_cau_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_luong_can` to the `yeu_cau_bao_gia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `yeu_cau_bao_gia` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrangThaiBaiDang" AS ENUM ('cho_duyet', 'dang_ban', 'da_ban', 'bi_tu_choi', 'an');

-- CreateEnum
CREATE TYPE "TrangThaiYeuCau" AS ENUM ('dang_mo', 'da_phan_hoi', 'chap_nhan', 'tu_choi', 'het_han');

-- CreateEnum
CREATE TYPE "LoaiBaoCao" AS ENUM ('san_pham_gia_mao', 'lua_dao', 'noi_dung_khong_phu_hop', 'khac');

-- CreateEnum
CREATE TYPE "TrangThaiBaoCao" AS ENUM ('cho_xu_ly', 'dang_xu_ly', 'da_xu_ly', 'dong_lai');

-- CreateEnum
CREATE TYPE "TrangThaiNhuCau" AS ENUM ('dang_thu_mua', 'du_so_luong', 'tam_ngung', 'da_dong');

-- AlterEnum
ALTER TYPE "KenhThongBao" ADD VALUE 'email';

-- AlterEnum
BEGIN;
CREATE TYPE "LoaiGoiY_new" AS ENUM ('san_pham_phu_hop', 'doi_tac_nong_dan', 'doi_tac_doanh_nghiep', 'san_pham_tuong_tu', 'theo_mua_vu');
ALTER TABLE "ai_goi_y" ALTER COLUMN "loai_goiy" TYPE "LoaiGoiY_new" USING ("loai_goiy"::text::"LoaiGoiY_new");
ALTER TYPE "LoaiGoiY" RENAME TO "LoaiGoiY_old";
ALTER TYPE "LoaiGoiY_new" RENAME TO "LoaiGoiY";
DROP TYPE "LoaiGoiY_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LoaiSuKien_new" AS ENUM ('xem_san_pham', 'tim_kiem', 'gui_yeu_cau', 'dat_hang', 'danh_gia', 'xem_ho_so');
ALTER TABLE "ai_events" ALTER COLUMN "loai_sk" TYPE "LoaiSuKien_new" USING ("loai_sk"::text::"LoaiSuKien_new");
ALTER TYPE "LoaiSuKien" RENAME TO "LoaiSuKien_old";
ALTER TYPE "LoaiSuKien_new" RENAME TO "LoaiSuKien";
DROP TYPE "LoaiSuKien_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LoaiThongBao_new" AS ENUM ('don_hang', 'bao_gia', 'thanh_toan', 'bai_dang', 'he_thong', 'tin_nhan');
ALTER TABLE "thong_bao" ALTER COLUMN "loai" TYPE "LoaiThongBao_new" USING ("loai"::text::"LoaiThongBao_new");
ALTER TYPE "LoaiThongBao" RENAME TO "LoaiThongBao_old";
ALTER TYPE "LoaiThongBao_new" RENAME TO "LoaiThongBao";
DROP TYPE "LoaiThongBao_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PhuongThucThanhToan_new" AS ENUM ('vnpay', 'momo', 'chuyen_khoan', 'tien_mat');
ALTER TABLE "don_hang" ALTER COLUMN "phuong_thuc_tt" TYPE "PhuongThucThanhToan_new" USING ("phuong_thuc_tt"::text::"PhuongThucThanhToan_new");
ALTER TABLE "thanh_toan" ALTER COLUMN "phuong_thuc" TYPE "PhuongThucThanhToan_new" USING ("phuong_thuc"::text::"PhuongThucThanhToan_new");
ALTER TYPE "PhuongThucThanhToan" RENAME TO "PhuongThucThanhToan_old";
ALTER TYPE "PhuongThucThanhToan_new" RENAME TO "PhuongThucThanhToan";
DROP TYPE "PhuongThucThanhToan_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TrangThaiDonHang_new" AS ENUM ('cho_xac_nhan', 'da_xac_nhan', 'dang_giao', 'hoan_thanh', 'da_huy');
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_don" DROP DEFAULT;
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_don" TYPE "TrangThaiDonHang_new" USING ("trang_thai_don"::text::"TrangThaiDonHang_new");
ALTER TYPE "TrangThaiDonHang" RENAME TO "TrangThaiDonHang_old";
ALTER TYPE "TrangThaiDonHang_new" RENAME TO "TrangThaiDonHang";
DROP TYPE "TrangThaiDonHang_old";
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_don" SET DEFAULT 'cho_xac_nhan';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TrangThaiPhanHoi_new" AS ENUM ('cho_xem_xet', 'duoc_chap_nhan', 'bi_tu_choi');
ALTER TABLE "phan_hoi_bao_gia" ALTER COLUMN "trang_thai" DROP DEFAULT;
ALTER TABLE "phan_hoi_bao_gia" ALTER COLUMN "trang_thai" TYPE "TrangThaiPhanHoi_new" USING ("trang_thai"::text::"TrangThaiPhanHoi_new");
ALTER TYPE "TrangThaiPhanHoi" RENAME TO "TrangThaiPhanHoi_old";
ALTER TYPE "TrangThaiPhanHoi_new" RENAME TO "TrangThaiPhanHoi";
DROP TYPE "TrangThaiPhanHoi_old";
ALTER TABLE "phan_hoi_bao_gia" ALTER COLUMN "trang_thai" SET DEFAULT 'cho_xem_xet';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TrangThaiThanhToan_new" AS ENUM ('chua_thanh_toan', 'da_thanh_toan', 'hoan_tien', 'that_bai');
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_tt" DROP DEFAULT;
ALTER TABLE "thanh_toan" ALTER COLUMN "trang_thai" DROP DEFAULT;
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_tt" TYPE "TrangThaiThanhToan_new" USING ("trang_thai_tt"::text::"TrangThaiThanhToan_new");
ALTER TABLE "thanh_toan" ALTER COLUMN "trang_thai" TYPE "TrangThaiThanhToan_new" USING ("trang_thai"::text::"TrangThaiThanhToan_new");
ALTER TYPE "TrangThaiThanhToan" RENAME TO "TrangThaiThanhToan_old";
ALTER TYPE "TrangThaiThanhToan_new" RENAME TO "TrangThaiThanhToan";
DROP TYPE "TrangThaiThanhToan_old";
ALTER TABLE "don_hang" ALTER COLUMN "trang_thai_tt" SET DEFAULT 'chua_thanh_toan';
ALTER TABLE "thanh_toan" ALTER COLUMN "trang_thai" SET DEFAULT 'chua_thanh_toan';
COMMIT;

-- DropForeignKey
ALTER TABLE "ai_events" DROP CONSTRAINT "ai_events_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_goi_y" DROP CONSTRAINT "ai_goi_y_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_goi_y" DROP CONSTRAINT "ai_goi_y_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bang_gia_si" DROP CONSTRAINT "bang_gia_si_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "chi_tiet_don" DROP CONSTRAINT "chi_tiet_don_donhang_id_fkey";

-- DropForeignKey
ALTER TABLE "chi_tiet_don" DROP CONSTRAINT "chi_tiet_don_hovuon_id_fkey";

-- DropForeignKey
ALTER TABLE "chi_tiet_don" DROP CONSTRAINT "chi_tiet_don_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "danh_gia" DROP CONSTRAINT "danh_gia_dn_id_fkey";

-- DropForeignKey
ALTER TABLE "danh_gia" DROP CONSTRAINT "danh_gia_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "danh_gia" DROP CONSTRAINT "danh_gia_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "don_hang" DROP CONSTRAINT "don_hang_dn_id_fkey";

-- DropForeignKey
ALTER TABLE "don_hang" DROP CONSTRAINT "don_hang_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "ho_vuon" DROP CONSTRAINT "ho_vuon_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "ho_vuon" DROP CONSTRAINT "ho_vuon_user_id_fkey";

-- DropForeignKey
ALTER TABLE "hop_dong_htx_hnv" DROP CONSTRAINT "hop_dong_htx_hnv_hovuon_id_fkey";

-- DropForeignKey
ALTER TABLE "hop_dong_htx_hnv" DROP CONSTRAINT "hop_dong_htx_hnv_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "htx" DROP CONSTRAINT "htx_user_id_fkey";

-- DropForeignKey
ALTER TABLE "khuyen_mai" DROP CONSTRAINT "khuyen_mai_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "khuyen_mai" DROP CONSTRAINT "khuyen_mai_sp_id_fkey";

-- DropForeignKey
ALTER TABLE "phan_hoi_bao_gia" DROP CONSTRAINT "phan_hoi_bao_gia_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "phan_hoi_bao_gia" DROP CONSTRAINT "phan_hoi_bao_gia_rfq_id_fkey";

-- DropForeignKey
ALTER TABLE "quyet_toan_htx" DROP CONSTRAINT "quyet_toan_htx_hovuon_id_fkey";

-- DropForeignKey
ALTER TABLE "quyet_toan_htx" DROP CONSTRAINT "quyet_toan_htx_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "san_pham" DROP CONSTRAINT "san_pham_danhmuc_id_fkey";

-- DropForeignKey
ALTER TABLE "san_pham" DROP CONSTRAINT "san_pham_hovuon_id_fkey";

-- DropForeignKey
ALTER TABLE "san_pham" DROP CONSTRAINT "san_pham_htx_id_fkey";

-- DropForeignKey
ALTER TABLE "yeu_cau_bao_gia" DROP CONSTRAINT "yeu_cau_bao_gia_dn_id_fkey";

-- DropIndex
DROP INDEX "ai_events_sp_id_loai_sk_idx";

-- DropIndex
DROP INDEX "ai_goi_y_user_id_thoi_gian_tao_idx";

-- DropIndex
DROP INDEX "doanh_nghiep_user_id_key";

-- AlterTable
ALTER TABLE "ai_events" DROP COLUMN "sp_id",
ADD COLUMN     "baidang_id" INTEGER;

-- AlterTable
ALTER TABLE "ai_goi_y" DROP COLUMN "da_mua",
DROP COLUMN "sp_id",
DROP COLUMN "user_id",
ADD COLUMN     "baidang_id" INTEGER,
ADD COLUMN     "da_giao_dich" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "doi_tac_id" INTEGER,
ADD COLUMN     "ly_do_goi_y" TEXT,
ADD COLUMN     "nguoi_nhan_id" INTEGER NOT NULL,
ALTER COLUMN "phien_ban_model" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "danh_gia" DROP COLUMN "diem_dich_vu",
DROP COLUMN "diem_giao_hang",
DROP COLUMN "dn_id",
DROP COLUMN "htx_id",
DROP COLUMN "htx_tra_loi",
DROP COLUMN "sp_id",
ADD COLUMN     "baidang_id" INTEGER NOT NULL,
ADD COLUMN     "diem_dung_hen" SMALLINT,
ADD COLUMN     "diem_thai_do" SMALLINT,
ADD COLUMN     "diem_tong" SMALLINT NOT NULL,
ADD COLUMN     "nguoi_danhgia_id" INTEGER NOT NULL,
ADD COLUMN     "nguoi_duoc_dg_id" INTEGER NOT NULL,
ADD COLUMN     "tra_loi" TEXT,
ALTER COLUMN "diem_chat_luong" DROP NOT NULL;

-- AlterTable
ALTER TABLE "danh_muc" ADD COLUMN     "mo_ta" TEXT;

-- AlterTable
ALTER TABLE "doanh_nghiep" DROP CONSTRAINT "doanh_nghiep_pkey",
DROP COLUMN "dn_id",
DROP COLUMN "han_muc_tin_dung",
ADD COLUMN     "diem_trung_binh" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "giay_phep_kd_url" TEXT,
ADD COLUMN     "mo_ta" TEXT,
ADD COLUMN     "tong_giao_dich" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website" VARCHAR(200),
ADD CONSTRAINT "doanh_nghiep_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "don_hang" DROP COLUMN "dn_id",
DROP COLUMN "htx_id",
DROP COLUMN "phi_dich_vu_htx",
DROP COLUMN "tien_ve_hnv",
DROP COLUMN "tong_tien_hang",
ADD COLUMN     "baidang_id" INTEGER NOT NULL,
ADD COLUMN     "don_gia" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "don_vi_tinh" VARCHAR(20) NOT NULL,
ADD COLUMN     "ly_do_huy" TEXT,
ADD COLUMN     "ngay_giao_du_kien" TIMESTAMP(3),
ADD COLUMN     "nguoi_ban_id" INTEGER NOT NULL,
ADD COLUMN     "nguoi_mua_id" INTEGER NOT NULL,
ADD COLUMN     "so_luong" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tong_tien" DECIMAL(15,2) NOT NULL,
ALTER COLUMN "trang_thai_tt" SET DEFAULT 'chua_thanh_toan',
ALTER COLUMN "trang_thai_don" SET DEFAULT 'cho_xac_nhan';

-- AlterTable
ALTER TABLE "phan_hoi_bao_gia" DROP COLUMN "htx_id",
DROP COLUMN "rfq_id",
DROP COLUMN "sl_co_the_cung",
ADD COLUMN     "hieu_luc_den" DATE,
ADD COLUMN     "nguoi_phan_hoi_id" INTEGER NOT NULL,
ADD COLUMN     "so_luong_co_the" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yeucau_id" INTEGER NOT NULL,
ALTER COLUMN "trang_thai" SET DEFAULT 'cho_xem_xet';

-- AlterTable
ALTER TABLE "thanh_toan" ALTER COLUMN "trang_thai" SET DEFAULT 'chua_thanh_toan';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role_id" INTEGER NOT NULL,
ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "yeu_cau_bao_gia" DROP CONSTRAINT "yeu_cau_bao_gia_pkey",
DROP COLUMN "dn_id",
DROP COLUMN "ghi_chu",
DROP COLUMN "het_han_at",
DROP COLUMN "ngay_giao_mong_muon",
DROP COLUMN "rfq_id",
DROP COLUMN "so_luong_yc",
ADD COLUMN     "baidang_id" INTEGER,
ADD COLUMN     "gia_mong_muon" DECIMAL(12,2),
ADD COLUMN     "het_han_vao" TIMESTAMP(3),
ADD COLUMN     "mo_ta_them" TEXT,
ADD COLUMN     "ngay_can_giao" DATE,
ADD COLUMN     "nguoi_gui_id" INTEGER NOT NULL,
ADD COLUMN     "so_luong_can" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yeucau_id" SERIAL NOT NULL,
DROP COLUMN "trang_thai",
ADD COLUMN     "trang_thai" "TrangThaiYeuCau" NOT NULL DEFAULT 'dang_mo',
ADD CONSTRAINT "yeu_cau_bao_gia_pkey" PRIMARY KEY ("yeucau_id");

-- DropTable
DROP TABLE "bang_gia_si";

-- DropTable
DROP TABLE "chi_tiet_don";

-- DropTable
DROP TABLE "ho_vuon";

-- DropTable
DROP TABLE "hop_dong_htx_hnv";

-- DropTable
DROP TABLE "htx";

-- DropTable
DROP TABLE "khuyen_mai";

-- DropTable
DROP TABLE "quyet_toan_htx";

-- DropTable
DROP TABLE "san_pham";

-- DropEnum
DROP TYPE "LoaiKhuyenMai";

-- DropEnum
DROP TYPE "LoaiToChuc";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TrangThaiHopDong";

-- DropEnum
DROP TYPE "TrangThaiQuyetToan";

-- DropEnum
DROP TYPE "TrangThaiRFQ";

-- DropEnum
DROP TYPE "TrangThaiSanPham";

-- CreateTable
CREATE TABLE "vai_tro" (
    "role_id" SERIAL NOT NULL,
    "ten_vai_tro" VARCHAR(50) NOT NULL,
    "mo_ta" TEXT,

    CONSTRAINT "vai_tro_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "nong_dan" (
    "user_id" INTEGER NOT NULL,
    "ho_ten" VARCHAR(150) NOT NULL,
    "so_cmnd_cccd" VARCHAR(20),
    "tinh_thanh" VARCHAR(100) NOT NULL,
    "huyen_xa" VARCHAR(100),
    "dia_chi_cu_the" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "dien_tich_ha" DECIMAL(8,2),
    "nong_san_chinh" VARCHAR(200),
    "chung_nhan" VARCHAR(100),
    "giay_phep_urls" JSONB,
    "mo_ta_ban_than" TEXT,
    "diem_trung_binh" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "tong_giao_dich" INTEGER NOT NULL DEFAULT 0,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nong_dan_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "nhu_cau_thu_mua" (
    "nhucau_id" SERIAL NOT NULL,
    "doanh_nghiep_id" INTEGER NOT NULL,
    "danhmuc_id" INTEGER,
    "ten_nong_san" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT,
    "so_luong_can" DECIMAL(10,2) NOT NULL,
    "don_vi" VARCHAR(20) NOT NULL,
    "gia_tham_khao" DECIMAL(12,2),
    "cho_thuong_luong" BOOLEAN NOT NULL DEFAULT true,
    "yeu_cau_chung_nhan" VARCHAR(100),
    "tinh_thanh_giao" VARCHAR(100),
    "dia_chi_giao" TEXT,
    "ngay_bat_dau" DATE,
    "ngay_ket_thuc" DATE,
    "trang_thai" "TrangThaiNhuCau" NOT NULL DEFAULT 'dang_thu_mua',
    "luot_xem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nhu_cau_thu_mua_pkey" PRIMARY KEY ("nhucau_id")
);

-- CreateTable
CREATE TABLE "bai_dang" (
    "baidang_id" SERIAL NOT NULL,
    "nguoi_dang_id" INTEGER NOT NULL,
    "danhmuc_id" INTEGER NOT NULL,
    "tieu_de" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT NOT NULL,
    "ten_nong_san" VARCHAR(150) NOT NULL,
    "don_vi_tinh" VARCHAR(20) NOT NULL,
    "so_luong_co" DECIMAL(10,2) NOT NULL,
    "gia_ban" DECIMAL(12,2) NOT NULL,
    "cho_thuong_luong" BOOLEAN NOT NULL DEFAULT true,
    "so_luong_toi_thieu" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "tinh_thanh" VARCHAR(100) NOT NULL,
    "dia_chi_lay_hang" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "ngay_thu_hoach" DATE,
    "han_su_dung" DATE,
    "chung_nhan" VARCHAR(100),
    "images" JSONB,
    "video_url" TEXT,
    "is_seasonal" BOOLEAN NOT NULL DEFAULT false,
    "trang_thai" "TrangThaiBaiDang" NOT NULL DEFAULT 'cho_duyet',
    "ly_do_tu_choi" TEXT,
    "duoc_duyet_boi" INTEGER,
    "ngay_duyet" TIMESTAMP(3),
    "luot_xem" INTEGER NOT NULL DEFAULT 0,
    "diem_trung_binh" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bai_dang_pkey" PRIMARY KEY ("baidang_id")
);

-- CreateTable
CREATE TABLE "bao_cao" (
    "baocao_id" SERIAL NOT NULL,
    "nguoi_baocao_id" INTEGER NOT NULL,
    "nguoi_bi_bc_id" INTEGER,
    "baidang_id" INTEGER,
    "loai" "LoaiBaoCao" NOT NULL,
    "mo_ta" TEXT NOT NULL,
    "bang_chung" JSONB,
    "trang_thai" "TrangThaiBaoCao" NOT NULL DEFAULT 'cho_xu_ly',
    "xu_ly_boi" INTEGER,
    "ghi_chu_xu_ly" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bao_cao_pkey" PRIMARY KEY ("baocao_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vai_tro_ten_vai_tro_key" ON "vai_tro"("ten_vai_tro");

-- CreateIndex
CREATE UNIQUE INDEX "nong_dan_so_cmnd_cccd_key" ON "nong_dan"("so_cmnd_cccd");

-- CreateIndex
CREATE INDEX "nhu_cau_thu_mua_trang_thai_ten_nong_san_idx" ON "nhu_cau_thu_mua"("trang_thai", "ten_nong_san");

-- CreateIndex
CREATE INDEX "nhu_cau_thu_mua_doanh_nghiep_id_idx" ON "nhu_cau_thu_mua"("doanh_nghiep_id");

-- CreateIndex
CREATE INDEX "bai_dang_danhmuc_id_trang_thai_idx" ON "bai_dang"("danhmuc_id", "trang_thai");

-- CreateIndex
CREATE INDEX "bai_dang_tinh_thanh_trang_thai_idx" ON "bai_dang"("tinh_thanh", "trang_thai");

-- CreateIndex
CREATE INDEX "bai_dang_nguoi_dang_id_idx" ON "bai_dang"("nguoi_dang_id");

-- CreateIndex
CREATE INDEX "ai_events_baidang_id_loai_sk_idx" ON "ai_events"("baidang_id", "loai_sk");

-- CreateIndex
CREATE INDEX "ai_goi_y_nguoi_nhan_id_loai_goiy_thoi_gian_tao_idx" ON "ai_goi_y"("nguoi_nhan_id", "loai_goiy", "thoi_gian_tao");

-- CreateIndex
CREATE INDEX "don_hang_nguoi_mua_id_trang_thai_don_idx" ON "don_hang"("nguoi_mua_id", "trang_thai_don");

-- CreateIndex
CREATE INDEX "don_hang_nguoi_ban_id_trang_thai_don_idx" ON "don_hang"("nguoi_ban_id", "trang_thai_don");

-- CreateIndex
CREATE INDEX "thong_bao_user_id_da_doc_idx" ON "thong_bao"("user_id", "da_doc");

-- CreateIndex
CREATE INDEX "tin_nhan_nguoi_gui_id_nguoi_nhan_id_idx" ON "tin_nhan"("nguoi_gui_id", "nguoi_nhan_id");

-- CreateIndex
CREATE INDEX "yeu_cau_bao_gia_nguoi_gui_id_trang_thai_idx" ON "yeu_cau_bao_gia"("nguoi_gui_id", "trang_thai");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "vai_tro"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nong_dan" ADD CONSTRAINT "nong_dan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhu_cau_thu_mua" ADD CONSTRAINT "nhu_cau_thu_mua_doanh_nghiep_id_fkey" FOREIGN KEY ("doanh_nghiep_id") REFERENCES "doanh_nghiep"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhu_cau_thu_mua" ADD CONSTRAINT "nhu_cau_thu_mua_danhmuc_id_fkey" FOREIGN KEY ("danhmuc_id") REFERENCES "danh_muc"("danhmuc_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_dang" ADD CONSTRAINT "bai_dang_nguoi_dang_id_fkey" FOREIGN KEY ("nguoi_dang_id") REFERENCES "nong_dan"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bai_dang" ADD CONSTRAINT "bai_dang_danhmuc_id_fkey" FOREIGN KEY ("danhmuc_id") REFERENCES "danh_muc"("danhmuc_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_bao_gia" ADD CONSTRAINT "yeu_cau_bao_gia_nguoi_gui_id_fkey" FOREIGN KEY ("nguoi_gui_id") REFERENCES "doanh_nghiep"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_bao_gia" ADD CONSTRAINT "yeu_cau_bao_gia_baidang_id_fkey" FOREIGN KEY ("baidang_id") REFERENCES "bai_dang"("baidang_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_hoi_bao_gia" ADD CONSTRAINT "phan_hoi_bao_gia_yeucau_id_fkey" FOREIGN KEY ("yeucau_id") REFERENCES "yeu_cau_bao_gia"("yeucau_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_hoi_bao_gia" ADD CONSTRAINT "phan_hoi_bao_gia_nguoi_phan_hoi_id_fkey" FOREIGN KEY ("nguoi_phan_hoi_id") REFERENCES "nong_dan"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_nguoi_mua_id_fkey" FOREIGN KEY ("nguoi_mua_id") REFERENCES "doanh_nghiep"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_nguoi_ban_id_fkey" FOREIGN KEY ("nguoi_ban_id") REFERENCES "nong_dan"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_baidang_id_fkey" FOREIGN KEY ("baidang_id") REFERENCES "bai_dang"("baidang_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_baidang_id_fkey" FOREIGN KEY ("baidang_id") REFERENCES "bai_dang"("baidang_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_nguoi_danhgia_id_fkey" FOREIGN KEY ("nguoi_danhgia_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_nguoi_duoc_dg_id_fkey" FOREIGN KEY ("nguoi_duoc_dg_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bao_cao" ADD CONSTRAINT "bao_cao_nguoi_baocao_id_fkey" FOREIGN KEY ("nguoi_baocao_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bao_cao" ADD CONSTRAINT "bao_cao_nguoi_bi_bc_id_fkey" FOREIGN KEY ("nguoi_bi_bc_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_events" ADD CONSTRAINT "ai_events_baidang_id_fkey" FOREIGN KEY ("baidang_id") REFERENCES "bai_dang"("baidang_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_goi_y" ADD CONSTRAINT "ai_goi_y_nguoi_nhan_id_fkey" FOREIGN KEY ("nguoi_nhan_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_goi_y" ADD CONSTRAINT "ai_goi_y_baidang_id_fkey" FOREIGN KEY ("baidang_id") REFERENCES "bai_dang"("baidang_id") ON DELETE SET NULL ON UPDATE CASCADE;
