-- =================================================================
-- Migration: remove_lichsugia_farmer_self_pricing
-- Mô tả: Xoá bảng LichSuGia & enum TrangThaiGia,
--         Nông Dân tự định giá (gia_per_kg bắt buộc),
--         Thêm so_luong_con_lai và checked_at vào BaiDang,
--         Cập nhật enum TrangThaiBaiDang và LoaiThongBao.
-- An toàn: Không xoá dữ liệu người dùng, đơn hàng, bài đăng cũ.
-- =================================================================

-- BƯỚC 1: Chuẩn bị dữ liệu cũ trước khi đổi enum
-- Chuyển các trạng thái cũ không còn tồn tại về giá trị hợp lệ mới:
--   cho_dinh_gia → cho_duyet  (bài mới đăng, chưa có giá admin)
--   bi_tu_choi   → an         (bài bị từ chối → coi như đã ẩn)
UPDATE "bai_dang"
SET "trang_thai" = 'dang_ban'
WHERE "trang_thai"::text = 'dang_ban';   -- giữ nguyên (no-op, chỉ để rõ ý)

UPDATE "bai_dang"
SET "trang_thai" = 'dang_ban'
WHERE "trang_thai"::text IN ('cho_dinh_gia', 'bi_tu_choi');
-- ^^^ Lý do: dữ liệu test/cũ chưa có giá → coi như đang bán để không mất data.
--     Bạn có thể đổi thành 'cho_duyet' nếu muốn admin review lại.

-- BƯỚC 2: Điền gia_per_kg cho bản ghi cũ bị NULL (nếu có)
UPDATE "bai_dang"
SET "gia_per_kg" = 0
WHERE "gia_per_kg" IS NULL;

-- BƯỚC 3: Điền so_luong_con_lai = so_luong_co (cho bản ghi cũ chưa có)
--         (cột này chưa tồn tại, sẽ được thêm ở bước sau với giá trị DEFAULT từ so_luong_co)

-- BƯỚC 4: Đổi enum LoaiThongBao — bỏ giá trị 'dinh_gia'
BEGIN;
CREATE TYPE "LoaiThongBao_new" AS ENUM ('don_hang', 'hang_moi', 'thanh_toan', 'bai_dang', 'he_thong', 'tin_nhan');
-- Chuyển bản ghi có loai = 'dinh_gia' → 'he_thong' trước khi đổi type
UPDATE "thong_bao" SET "loai" = 'he_thong' WHERE "loai"::text = 'dinh_gia';
ALTER TABLE "thong_bao" ALTER COLUMN "loai" TYPE "LoaiThongBao_new" USING ("loai"::text::"LoaiThongBao_new");
ALTER TYPE "LoaiThongBao" RENAME TO "LoaiThongBao_old";
ALTER TYPE "LoaiThongBao_new" RENAME TO "LoaiThongBao";
DROP TYPE "LoaiThongBao_old";
COMMIT;

-- BƯỚC 5: Đổi enum TrangThaiBaiDang (đã chuẩn bị dữ liệu ở bước 1)
BEGIN;
CREATE TYPE "TrangThaiBaiDang_new" AS ENUM ('cho_duyet', 'dang_ban', 'da_ban', 'an');
ALTER TABLE "bai_dang" ALTER COLUMN "trang_thai" DROP DEFAULT;
ALTER TABLE "bai_dang" ALTER COLUMN "trang_thai" TYPE "TrangThaiBaiDang_new" USING ("trang_thai"::text::"TrangThaiBaiDang_new");
ALTER TYPE "TrangThaiBaiDang" RENAME TO "TrangThaiBaiDang_old";
ALTER TYPE "TrangThaiBaiDang_new" RENAME TO "TrangThaiBaiDang";
DROP TYPE "TrangThaiBaiDang_old";
ALTER TABLE "bai_dang" ALTER COLUMN "trang_thai" SET DEFAULT 'cho_duyet';
COMMIT;

-- BƯỚC 6: Xoá FK ràng buộc của bảng lich_su_gia
ALTER TABLE "lich_su_gia" DROP CONSTRAINT "lich_su_gia_admin_id_fkey";
ALTER TABLE "lich_su_gia" DROP CONSTRAINT "lich_su_gia_baidang_id_fkey";

-- BƯỚC 7: Xoá index liên quan đến định giá admin
DROP INDEX "bai_dang_trang_thai_gia_idx";

-- BƯỚC 8: Sửa bảng bai_dang
--   - Xoá các cột định giá admin
--   - Thêm so_luong_con_lai (mặc định = so_luong_co)
--   - Thêm checked_at
--   - Đặt gia_per_kg NOT NULL
ALTER TABLE "bai_dang"
  DROP COLUMN "gia_admin",
  DROP COLUMN "ly_do_khieu_nai",
  DROP COLUMN "ngay_dinh_gia",
  DROP COLUMN "nguoi_dinh_gia_id",
  DROP COLUMN "trang_thai_gia",
  ADD COLUMN  "checked_at" TIMESTAMP(3),
  ADD COLUMN  "so_luong_con_lai" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ALTER COLUMN "gia_per_kg" SET NOT NULL;

-- Đồng bộ so_luong_con_lai = so_luong_co cho tất cả bản ghi cũ
UPDATE "bai_dang" SET "so_luong_con_lai" = "so_luong_co";

-- Bỏ DEFAULT tạm (Prisma quản lý qua application logic)
ALTER TABLE "bai_dang" ALTER COLUMN "so_luong_con_lai" DROP DEFAULT;

-- BƯỚC 9: Xoá bảng lich_su_gia
DROP TABLE "lich_su_gia";

-- BƯỚC 10: Xoá enum TrangThaiGia
DROP TYPE "TrangThaiGia";
