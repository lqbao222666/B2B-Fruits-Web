const { plainToInstance } = require('class-transformer');
const { validateSync } = require('class-validator');
const { UpdateBaiDangDto } = require('./dist/bai-dang/dto/update-bai-dang.dto');

const payload = {
  tieu_de: "Test",
  phan_loais: [
    { ten_phan_loai: "Loại 1", gia: 80000, so_luong_co: 500 }
  ]
};

const instance = plainToInstance(UpdateBaiDangDto, payload);
const errors = validateSync(instance, { whitelist: true });
console.log("Instance:", JSON.stringify(instance, null, 2));
console.log("Errors:", errors);
