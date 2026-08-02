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
exports.PhanLoaiDto = void 0;
var class_validator_1 = require("class-validator");
var PhanLoaiDto = function () {
    var _a;
    var _ten_phan_loai_decorators;
    var _ten_phan_loai_initializers = [];
    var _ten_phan_loai_extraInitializers = [];
    var _gia_decorators;
    var _gia_initializers = [];
    var _gia_extraInitializers = [];
    var _so_luong_co_decorators;
    var _so_luong_co_initializers = [];
    var _so_luong_co_extraInitializers = [];
    var _so_luong_con_lai_decorators;
    var _so_luong_con_lai_initializers = [];
    var _so_luong_con_lai_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PhanLoaiDto() {
                this.ten_phan_loai = __runInitializers(this, _ten_phan_loai_initializers, void 0);
                this.gia = (__runInitializers(this, _ten_phan_loai_extraInitializers), __runInitializers(this, _gia_initializers, void 0));
                this.so_luong_co = (__runInitializers(this, _gia_extraInitializers), __runInitializers(this, _so_luong_co_initializers, void 0));
                this.so_luong_con_lai = (__runInitializers(this, _so_luong_co_extraInitializers), __runInitializers(this, _so_luong_con_lai_initializers, void 0));
                __runInitializers(this, _so_luong_con_lai_extraInitializers);
            }
            return PhanLoaiDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ten_phan_loai_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _gia_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _so_luong_co_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _so_luong_con_lai_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _ten_phan_loai_decorators, { kind: "field", name: "ten_phan_loai", static: false, private: false, access: { has: function (obj) { return "ten_phan_loai" in obj; }, get: function (obj) { return obj.ten_phan_loai; }, set: function (obj, value) { obj.ten_phan_loai = value; } }, metadata: _metadata }, _ten_phan_loai_initializers, _ten_phan_loai_extraInitializers);
            __esDecorate(null, null, _gia_decorators, { kind: "field", name: "gia", static: false, private: false, access: { has: function (obj) { return "gia" in obj; }, get: function (obj) { return obj.gia; }, set: function (obj, value) { obj.gia = value; } }, metadata: _metadata }, _gia_initializers, _gia_extraInitializers);
            __esDecorate(null, null, _so_luong_co_decorators, { kind: "field", name: "so_luong_co", static: false, private: false, access: { has: function (obj) { return "so_luong_co" in obj; }, get: function (obj) { return obj.so_luong_co; }, set: function (obj, value) { obj.so_luong_co = value; } }, metadata: _metadata }, _so_luong_co_initializers, _so_luong_co_extraInitializers);
            __esDecorate(null, null, _so_luong_con_lai_decorators, { kind: "field", name: "so_luong_con_lai", static: false, private: false, access: { has: function (obj) { return "so_luong_con_lai" in obj; }, get: function (obj) { return obj.so_luong_con_lai; }, set: function (obj, value) { obj.so_luong_con_lai = value; } }, metadata: _metadata }, _so_luong_con_lai_initializers, _so_luong_con_lai_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.PhanLoaiDto = PhanLoaiDto;
