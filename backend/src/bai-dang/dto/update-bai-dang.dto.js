"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.UpdateBaiDangDto = void 0;
var mapped_types_1 = require("@nestjs/mapped-types");
var create_bai_dang_dto_1 = require("./create-bai-dang.dto");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var phan_loai_dto_1 = require("./phan-loai.dto");
var UpdateBaiDangDto = function () {
    var _a;
    var _classSuper = (0, mapped_types_1.PartialType)(create_bai_dang_dto_1.CreateBaiDangDto);
    var _trang_thai_decorators;
    var _trang_thai_initializers = [];
    var _trang_thai_extraInitializers = [];
    var _ly_do_tu_choi_decorators;
    var _ly_do_tu_choi_initializers = [];
    var _ly_do_tu_choi_extraInitializers = [];
    var _so_luong_con_lai_decorators;
    var _so_luong_con_lai_initializers = [];
    var _so_luong_con_lai_extraInitializers = [];
    var _phan_loais_decorators;
    var _phan_loais_initializers = [];
    var _phan_loais_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(UpdateBaiDangDto, _super);
            function UpdateBaiDangDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.trang_thai = __runInitializers(_this, _trang_thai_initializers, void 0);
                /// Admin ghi lý do khi ẩn / xoá bài đăng không hợp lệ
                _this.ly_do_tu_choi = (__runInitializers(_this, _trang_thai_extraInitializers), __runInitializers(_this, _ly_do_tu_choi_initializers, void 0));
                /// Cập nhật số lượng còn lại (hệ thống tự trừ sau đơn hàng)
                _this.so_luong_con_lai = (__runInitializers(_this, _ly_do_tu_choi_extraInitializers), __runInitializers(_this, _so_luong_con_lai_initializers, void 0));
                _this.phan_loais = (__runInitializers(_this, _so_luong_con_lai_extraInitializers), __runInitializers(_this, _phan_loais_initializers, void 0));
                __runInitializers(_this, _phan_loais_extraInitializers);
                return _this;
            }
            return UpdateBaiDangDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _trang_thai_decorators = [(0, class_validator_1.IsOptional)()];
            _ly_do_tu_choi_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _so_luong_con_lai_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _phan_loais_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return phan_loai_dto_1.PhanLoaiDto; })];
            __esDecorate(null, null, _trang_thai_decorators, { kind: "field", name: "trang_thai", static: false, private: false, access: { has: function (obj) { return "trang_thai" in obj; }, get: function (obj) { return obj.trang_thai; }, set: function (obj, value) { obj.trang_thai = value; } }, metadata: _metadata }, _trang_thai_initializers, _trang_thai_extraInitializers);
            __esDecorate(null, null, _ly_do_tu_choi_decorators, { kind: "field", name: "ly_do_tu_choi", static: false, private: false, access: { has: function (obj) { return "ly_do_tu_choi" in obj; }, get: function (obj) { return obj.ly_do_tu_choi; }, set: function (obj, value) { obj.ly_do_tu_choi = value; } }, metadata: _metadata }, _ly_do_tu_choi_initializers, _ly_do_tu_choi_extraInitializers);
            __esDecorate(null, null, _so_luong_con_lai_decorators, { kind: "field", name: "so_luong_con_lai", static: false, private: false, access: { has: function (obj) { return "so_luong_con_lai" in obj; }, get: function (obj) { return obj.so_luong_con_lai; }, set: function (obj, value) { obj.so_luong_con_lai = value; } }, metadata: _metadata }, _so_luong_con_lai_initializers, _so_luong_con_lai_extraInitializers);
            __esDecorate(null, null, _phan_loais_decorators, { kind: "field", name: "phan_loais", static: false, private: false, access: { has: function (obj) { return "phan_loais" in obj; }, get: function (obj) { return obj.phan_loais; }, set: function (obj, value) { obj.phan_loais = value; } }, metadata: _metadata }, _phan_loais_initializers, _phan_loais_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateBaiDangDto = UpdateBaiDangDto;
