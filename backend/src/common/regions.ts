export const MIEN_BAC_PROVINCES = [
  'Hà Nội',
  'Hải Phòng',
  'Quảng Ninh',
  'Bắc Giang',
  'Sơn La',
  'Lạng Sơn',
  'Thái Nguyên',
  'Hòa Bình',
  'Hưng Yên',
  'Hải Dương',
  'Nam Định',
  'Thái Bình',
  'Ninh Bình',
  'Hà Nam',
  'Vĩnh Phúc',
  'Phú Thọ',
  'Lào Cai',
  'Yên Bái',
  'Cao Bằng',
  'Hà Giang',
  'Tuyên Quang',
  'Bắc Kạn',
  'Điện Biên',
  'Lai Châu',
];

export const MIEN_TRUNG_PROVINCES = [
  'Thừa Thiên Huế',
  'Huế',
  'Đà Nẵng',
  'Quảng Nam',
  'Quảng Ngãi',
  'Bình Định',
  'Phú Yên',
  'Khánh Hòa',
  'Ninh Thuận',
  'Bình Thuận',
  'Kon Tum',
  'Gia Lai',
  'Đắc Lắc',
  'Đắk Lắk',
  'Đắk Nông',
  'Lâm Đồng',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Bình',
  'Quảng Trị',
];

export const MIEN_NAM_PROVINCES = [
  'Hồ Chí Minh',
  'TP.HCM',
  'TP HCM',
  'Sài Gòn',
  'TP. Hồ Chí Minh',
  'Cần Thơ',
  'Tiền Giang',
  'Bến Tre',
  'An Giang',
  'Đồng Tháp',
  'Vĩnh Long',
  'Long An',
  'Hậu Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Cà Mau',
  'Kiên Giang',
  'Trà Vinh',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Bà Rịa',
  'Tây Ninh',
  'Bình Phước',
];

export function getProvincesByRegion(mien?: string): string[] {
  if (!mien) return [];
  const normalized = mien.toLowerCase().trim();
  if (
    normalized === 'bac' ||
    normalized === 'miền bắc' ||
    normalized === 'mien bac'
  ) {
    return MIEN_BAC_PROVINCES;
  }
  if (
    normalized === 'trung' ||
    normalized === 'miền trung' ||
    normalized === 'mien trung' ||
    normalized === 'tây nguyên'
  ) {
    return MIEN_TRUNG_PROVINCES;
  }
  if (
    normalized === 'nam' ||
    normalized === 'miền nam' ||
    normalized === 'mien nam' ||
    normalized === 'miền tây' ||
    normalized === 'mien tay' ||
    normalized === 'đông nam bộ'
  ) {
    return MIEN_NAM_PROVINCES;
  }
  return [];
}
