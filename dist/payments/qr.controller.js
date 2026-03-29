"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const vietqr_util_1 = require("./vietqr.util");
const qr_image_service_1 = require("./qr-image.service");
let QrController = class QrController {
    constructor(qrImageService) {
        this.qrImageService = qrImageService;
    }
    getBanks() {
        return Object.entries(vietqr_util_1.BANK_BIN).map(([code, bin]) => ({ code, bin }));
    }
    async generate(bankBin, accountNumber, accountName, amount, description, template) {
        this.validateRequired({ bankBin, accountNumber, accountName });
        const opts = {
            bankBin,
            accountNumber,
            accountName,
            amount: amount ? Number(amount) : undefined,
            description: description ?? '',
        };
        const validTemplates = ['compact', 'compact2', 'qr_only', 'print'];
        const tpl = validTemplates.includes(template) ? template : 'compact2';
        const qrString = (0, vietqr_util_1.generateVietQR)(opts);
        const imageUrl = (0, vietqr_util_1.vietQRImageUrl)(opts, tpl);
        return { qrString, imageUrl };
    }
    async image(res, bankBin, accountNumber, accountName, amount, description) {
        this.validateRequired({ bankBin, accountNumber, accountName });
        const qrString = (0, vietqr_util_1.generateVietQR)({
            bankBin,
            accountNumber,
            accountName,
            amount: amount ? Number(amount) : undefined,
            description: description ?? '',
        });
        const buffer = await this.qrImageService.generateWithLogo(qrString);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store');
        res.send(buffer);
    }
    validateRequired(fields) {
        for (const [key, val] of Object.entries(fields)) {
            if (!val?.trim())
                throw new common_1.BadRequestException(`Missing required field: ${key}`);
        }
    }
};
exports.QrController = QrController;
__decorate([
    (0, common_1.Get)('banks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QrController.prototype, "getBanks", null);
__decorate([
    (0, common_1.Get)('generate'),
    __param(0, (0, common_1.Query)('bankBin')),
    __param(1, (0, common_1.Query)('accountNumber')),
    __param(2, (0, common_1.Query)('accountName')),
    __param(3, (0, common_1.Query)('amount')),
    __param(4, (0, common_1.Query)('description')),
    __param(5, (0, common_1.Query)('template')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('image'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('bankBin')),
    __param(2, (0, common_1.Query)('accountNumber')),
    __param(3, (0, common_1.Query)('accountName')),
    __param(4, (0, common_1.Query)('amount')),
    __param(5, (0, common_1.Query)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "image", null);
exports.QrController = QrController = __decorate([
    (0, common_1.Controller)('api/qr'),
    __metadata("design:paramtypes", [qr_image_service_1.QrImageService])
], QrController);
//# sourceMappingURL=qr.controller.js.map