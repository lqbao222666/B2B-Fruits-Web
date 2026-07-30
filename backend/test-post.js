async function test() {
  const res = await fetch('http://localhost:3000/don-hang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nguoi_mua_id: 3, nguoi_ban_id: 2, baidang_id: 1, ma_don_hang: "DH1",
      so_luong: 100, don_vi_tinh: "kg", don_gia: 1000, tong_tien: 0,
      dia_chi_giao: "abc", tinh_thanh_giao: "def", hinh_thuc_giao_hang: "giao_tan_noi",
      khoang_cach: 10, phuong_thuc_tt: "chuyen_khoan"
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
