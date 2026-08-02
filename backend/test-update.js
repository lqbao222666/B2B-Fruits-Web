async function test() {
  try {
    // Generate a new post first
    const login = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0941520408',
        password: 'password123'
      })
    });
    const loginData = await login.json();
    const token = loginData.access_token;
    
    console.log("Logged in");
    
    const updateRes = await fetch('http://localhost:3000/bai-dang/36', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tieu_de: "Cà Phê Đắk Lắk Chất Lượng Cao",
        ten_nong_san: "Cà Phê",
        danhmuc_id: 38,
        so_luong_co: 1500,
        so_luong_con_lai: 1500,
        don_vi_tinh: "kg",
        gia_per_kg: 80000,
        tinh_thanh: "Đắk Lắk",
        mo_ta: "Test update",
        phan_loais: [
          {
            ten_phan_loai: "Loại 1",
            gia: 80000,
            so_luong_co: 1500,
            so_luong_con_lai: 1500
          }
        ]
      })
    });
    
    const updateData = await updateRes.json();
    console.log(JSON.stringify(updateData, null, 2));
  } catch(e) {
    console.error(e.message);
  }
}
test();
