"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBaiDangDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var phan_loai_dto_1 = require("./phan-loai.dto");
var CreateBaiDangDto = function () {
    var _a;
    var _nguoi_dang_id_decorators;
    var _nguoi_dang_id_initializers = [];
    var _nguoi_dang_id_extraInitializers = [];
    var _danhmuc_id_decorators;
    var _danhmuc_id_initializers = [];
    var _danhmuc_id_extraInitializers = [];
    var _tieu_de_decorators;
    var _tieu_de_initializers = [];
    var _tieu_de_extraInitializers = [];
    var _mo_ta_decorators;
    var _mo_ta_initializers = [];
    var _mo_ta_extraInitializers = [];
    var _ten_nong_san_decorators;
    var _ten_nong_san_initializers = [];
    var _ten_nong_san_extraInitializers = [];
    var _don_vi_tinh_decorators;
    var _don_vi_tinh_initializers = [];
    var _don_vi_tinh_extraInitializers = [];
    var _so_luong_co_decorators;
    var _so_luong_co_initializers = [];
    var _so_luong_co_extraInitializers = [];
    var _so_luong_toi_thieu_decorators;
    var _so_luong_toi_thieu_initializers = [];
    var _so_luong_toi_thieu_extraInitializers = [];
    var _gia_per_kg_decorators;
    var _gia_per_kg_initializers = [];
    var _gia_per_kg_extraInitializers = [];
    var _tinh_thanh_decorators;
    var _tinh_thanh_initializers = [];
    var _tinh_thanh_extraInitializers = [];
    var _dia_chi_lay_hang_decorators;
    var _dia_chi_lay_hang_initializers = [];
    var _dia_chi_lay_hang_extraInitializers = [];
    var _latitude_decorators;
    var _latitude_initializers = [];
    var _latitude_extraInitializers = [];
    var _longitude_decorators;
    var _longitude_initializers = [];
    var _longitude_extraInitializers = [];
    var _ngay_thu_hoach_decorators;
    var _ngay_thu_hoach_initializers = [];
    var _ngay_thu_hoach_extraInitializers = [];
    var _han_su_dung_decorators;
    var _han_su_dung_initializers = [];
    var _han_su_dung_extraInitializers = [];
    var _tieu_chuan_ids_decorators;
    var _tieu_chuan_ids_initializers = [];
    var _tieu_chuan_ids_extraInitializers = [];
    var _images_decorators;
    var _images_initializers = [];
    var _images_extraInitializers = [];
    var _video_url_decorators;
    var _video_url_initializers = [];
    var _video_url_extraInitializers = [];
    var _is_seasonal_decorators;
    var _is_seasonal_initializers = [];
    var _is_seasonal_extraInitializers = [];
    var _phan_loais_decorators;
    var _phan_loais_initializers = [];
    var _phan_loais_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateBaiDangDto() {
                this.nguoi_dang_id = __runInitializers(this, _nguoi_dang_id_initializers, void 0);
                this.danhmuc_id = (__runInitializers(this, _nguoi_dang_id_extraInitializers), __runInitializers(this, _danhmuc_id_initializers, void 0));
                this.tieu_de = (__runInitializers(this, _danhmuc_id_extraInitializers), __runInitializers(this, _tieu_de_initializers, void 0));
                this.mo_ta = (__runInitializers(this, _tieu_de_extraInitializers), __runInitializers(this, _mo_ta_initializers, void 0));
                this.ten_nong_san = (__runInitializers(this, _mo_ta_extraInitializers), __runInitializers(this, _ten_nong_san_initializers, void 0));
                /// Đơn vị: kg | tấn | thùng | bao | trái
                this.don_vi_tinh = (__runInitializers(this, _ten_nong_san_extraInitializers), __runInitializers(this, _don_vi_tinh_initializers, void 0));
                /// Số lượng ban đầu của lô hàng
                this.so_luong_co = (__runInitializers(this, _don_vi_tinh_extraInitializers), __runInitializers(this, _so_luong_co_initializers, void 0));
                this.so_luong_toi_thieu = (__runInitializers(this, _so_luong_co_extraInitializers), __runInitializers(this, _so_luong_toi_thieu_initializers, void 0));
                /// Giá bán theo kg — Nông Dân tự định
                this.gia_per_kg = (__runInitializers(this, _so_luong_toi_thieu_extraInitializers), __runInitializers(this, _gia_per_kg_initializers, void 0));
                this.tinh_thanh = (__runInitializers(this, _gia_per_kg_extraInitializers), __runInitializers(this, _tinh_thanh_initializers, void 0));
                this.dia_chi_lay_hang = (__runInitializers(this, _tinh_thanh_extraInitializers), __runInitializers(this, _dia_chi_lay_hang_initializers, void 0));
                this.latitude = (__runInitializers(this, _dia_chi_lay_hang_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
                this.longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
                this.ngay_thu_hoach = (__runInitializers(this, _longitude_extraInitializers), __runInitializers(this, _ngay_thu_hoach_initializers, void 0));
                this.han_su_dung = (__runInitializers(this, _ngay_thu_hoach_extraInitializers), __runInitializers(this, _han_su_dung_initializers, void 0));
                this.tieu_chuan_ids = (__runInitializers(this, _han_su_dung_extraInitializers), __runInitializers(this, _tieu_chuan_ids_initializers, void 0));
                this.images = (__runInitializers(this, _tieu_chuan_ids_extraInitializers), __runInitializers(this, _images_initializers, void 0));
                this.video_url = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _video_url_initializers, void 0));
                this.is_seasonal = (__runInitializers(this, _video_url_extraInitializers), __runInitializers(this, _is_seasonal_initializers, void 0));
                this.phan_loais = (__runInitializers(this, _is_seasonal_extraInitializers), __runInitializers(this, _phan_loais_initializers, void 0));
                __runInitializers(this, _phan_loais_extraInitializers);
            }
            return CreateBaiDangDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nguoi_dang_id_decorators = [(0, class_validator_1.IsInt)()];
            _danhmuc_id_decorators = [(0, class_validator_1.IsInt)()];
            _tieu_de_decorators = [(0, class_validator_1.IsString)()];
            _mo_ta_decorators = [(0, class_validator_1.IsString)()];
            _ten_nong_san_decorators = [(0, class_validator_1.IsString)()];
            _don_vi_tinh_decorators = [(0, class_validator_1.IsString)()];
            _so_luong_co_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _so_luong_toi_thieu_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _gia_per_kg_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _tinh_thanh_decorators = [(0, class_validator_1.IsString)()];
            _dia_chi_lay_hang_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _latitude_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _longitude_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _ngay_thu_hoach_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _han_su_dung_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _tieu_chuan_ids_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsInt)({ each: true })];
            _images_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _video_url_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _is_seasonal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _phan_loais_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return phan_loai_dto_1.PhanLoaiDto; })];
            __esDecorate(null, null, _nguoi_dang_id_decorators, { kind: "field", name: "nguoi_dang_id", static: false, private: false, access: { has: function (obj) { return "nguoi_dang_id" in obj; }, get: function (obj) { return obj.nguoi_dang_id; }, set: function (obj, value) { obj.nguoi_dang_id = value; } }, metadata: _metadata }, _nguoi_dang_id_initializers, _nguoi_dang_id_extraInitializers);
            __esDecorate(null, null, _danhmuc_id_decorators, { kind: "field", name: "danhmuc_id", static: false, private: false, access: { has: function (obj) { return "danhmuc_id" in obj; }, get: function (obj) { return obj.danhmuc_id; }, set: function (obj, value) { obj.danhmuc_id = value; } }, metadata: _metadata }, _danhmuc_id_initializers, _danhmuc_id_extraInitializers);
            __esDecorate(null, null, _tieu_de_decorators, { kind: "field", name: "tieu_de", static: false, private: false, access: { has: function (obj) { return "tieu_de" in obj; }, get: function (obj) { return obj.tieu_de; }, set: function (obj, value) { obj.tieu_de = value; } }, metadata: _metadata }, _tieu_de_initializers, _tieu_de_extraInitializers);
            __esDecorate(null, null, _mo_ta_decorators, { kind: "field", name: "mo_ta", static: false, private: false, access: { has: function (obj) { return "mo_ta" in obj; }, get: function (obj) { return obj.mo_ta; }, set: function (obj, value) { obj.mo_ta = value; } }, metadata: _metadata }, _mo_ta_initializers, _mo_ta_extraInitializers);
            __esDecorate(null, null, _ten_nong_san_decorators, { kind: "field", name: "ten_nong_san", static: false, private: false, access: { has: function (obj) { return "ten_nong_san" in obj; }, get: function (obj) { return obj.ten_nong_san; }, set: function (obj, value) { obj.ten_nong_san = value; } }, metadata: _metadata }, _ten_nong_san_initializers, _ten_nong_san_extraInitializers);
            __esDecorate(null, null, _don_vi_tinh_decorators, { kind: "field", name: "don_vi_tinh", static: false, private: false, access: { has: function (obj) { return "don_vi_tinh" in obj; }, get: function (obj) { return obj.don_vi_tinh; }, set: function (obj, value) { obj.don_vi_tinh = value; } }, metadata: _metadata }, _don_vi_tinh_initializers, _don_vi_tinh_extraInitializers);
            __esDecorate(null, null, _so_luong_co_decorators, { kind: "field", name: "so_luong_co", static: false, private: false, access: { has: function (obj) { return "so_luong_co" in obj; }, get: function (obj) { return obj.so_luong_co; }, set: function (obj, value) { obj.so_luong_co = value; } }, metadata: _metadata }, _so_luong_co_initializers, _so_luong_co_extraInitializers);
            __esDecorate(null, null, _so_luong_toi_thieu_decorators, { kind: "field", name: "so_luong_toi_thieu", static: false, private: false, access: { has: function (obj) { return "so_luong_toi_thieu" in obj; }, get: function (obj) { return obj.so_luong_toi_thieu; }, set: function (obj, value) { obj.so_luong_toi_thieu = value; } }, metadata: _metadata }, _so_luong_toi_thieu_initializers, _so_luong_toi_thieu_extraInitializers);
            __esDecorate(null, null, _gia_per_kg_decorators, { kind: "field", name: "gia_per_kg", static: false, private: false, access: { has: function (obj) { return "gia_per_kg" in obj; }, get: function (obj) { return obj.gia_per_kg; }, set: function (obj, value) { obj.gia_per_kg = value; } }, metadata: _metadata }, _gia_per_kg_initializers, _gia_per_kg_extraInitializers);
            __esDecorate(null, null, _tinh_thanh_decorators, { kind: "field", name: "tinh_thanh", static: false, private: false, access: { has: function (obj) { return "tinh_thanh" in obj; }, get: function (obj) { return obj.tinh_thanh; }, set: function (obj, value) { obj.tinh_thanh = value; } }, metadata: _metadata }, _tinh_thanh_initializers, _tinh_thanh_extraInitializers);
            __esDecorate(null, null, _dia_chi_lay_hang_decorators, { kind: "field", name: "dia_chi_lay_hang", static: false, private: false, access: { has: function (obj) { return "dia_chi_lay_hang" in obj; }, get: function (obj) { return obj.dia_chi_lay_hang; }, set: function (obj, value) { obj.dia_chi_lay_hang = value; } }, metadata: _metadata }, _dia_chi_lay_hang_initializers, _dia_chi_lay_hang_extraInitializers);
            __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: function (obj) { return "latitude" in obj; }, get: function (obj) { return obj.latitude; }, set: function (obj, value) { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
            __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: function (obj) { return "longitude" in obj; }, get: function (obj) { return obj.longitude; }, set: function (obj, value) { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
            __esDecorate(null, null, _ngay_thu_hoach_decorators, { kind: "field", name: "ngay_thu_hoach", static: false, private: false, access: { has: function (obj) { return "ngay_thu_hoach" in obj; }, get: function (obj) { return obj.ngay_thu_hoach; }, set: function (obj, value) { obj.ngay_thu_hoach = value; } }, metadata: _metadata }, _ngay_thu_hoach_initializers, _ngay_thu_hoach_extraInitializers);
            __esDecorate(null, null, _han_su_dung_decorators, { kind: "field", name: "han_su_dung", static: false, private: false, access: { has: function (obj) { return "han_su_dung" in obj; }, get: function (obj) { return obj.han_su_dung; }, set: function (obj, value) { obj.han_su_dung = value; } }, metadata: _metadata }, _han_su_dung_initializers, _han_su_dung_extraInitializers);
            __esDecorate(null, null, _tieu_chuan_ids_decorators, { kind: "field", name: "tieu_chuan_ids", static: false, private: false, access: { has: function (obj) { return "tieu_chuan_ids" in obj; }, get: function (obj) { return obj.tieu_chuan_ids; }, set: function (obj, value) { obj.tieu_chuan_ids = value; } }, metadata: _metadata }, _tieu_chuan_ids_initializers, _tieu_chuan_ids_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: function (obj) { return "images" in obj; }, get: function (obj) { return obj.images; }, set: function (obj, value) { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, null, _video_url_decorators, { kind: "field", name: "video_url", static: false, private: false, access: { has: function (obj) { return "video_url" in obj; }, get: function (obj) { return obj.video_url; }, set: function (obj, value) { obj.video_url = value; } }, metadata: _metadata }, _video_url_initializers, _video_url_extraInitializers);
            __esDecorate(null, null, _is_seasonal_decorators, { kind: "field", name: "is_seasonal", static: false, private: false, access: { has: function (obj) { return "is_seasonal" in obj; }, get: function (obj) { return obj.is_seasonal; }, set: function (obj, value) { obj.is_seasonal = value; } }, metadata: _metadata }, _is_seasonal_initializers, _is_seasonal_extraInitializers);
            __esDecorate(null, null, _phan_loais_decorators, { kind: "field", name: "phan_loais", static: false, private: false, access: { has: function (obj) { return "phan_loais" in obj; }, get: function (obj) { return obj.phan_loais; }, set: function (obj, value) { obj.phan_loais = value; } }, metadata: _metadata }, _phan_loais_initializers, _phan_loais_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateBaiDangDto = CreateBaiDangDto;
