"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QrImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrImageService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = require("qrcode");
const jimp_1 = require("jimp");
const VIETQR_LOGO_URL = 'https://img.vietqr.io/image/logo-vietqr.png';
const LOGO_RATIO = 0.22;
let QrImageService = QrImageService_1 = class QrImageService {
    constructor() {
        this.logger = new common_1.Logger(QrImageService_1.name);
        this.logoBuffer = null;
    }
    async fetchLogo() {
        if (this.logoBuffer)
            return this.logoBuffer;
        try {
            const res = await fetch(VIETQR_LOGO_URL);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            this.logoBuffer = globalThis.Buffer.from(await res.arrayBuffer());
            this.logger.log('VietQR logo cached');
        }
        catch (e) {
            this.logger.warn(`Cannot fetch VietQR logo: ${e.message}`);
        }
        return this.logoBuffer;
    }
    async generateWithLogo(qrString, size = 400) {
        const qrBuffer = globalThis.Buffer.from(await QRCode.toBuffer(qrString, {
            width: size,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        }));
        const logoRaw = await this.fetchLogo();
        if (!logoRaw) {
            return qrBuffer;
        }
        const qrImg = await jimp_1.default.read(qrBuffer);
        const logoImg = await jimp_1.default.read(logoRaw);
        const logoSize = Math.round(size * LOGO_RATIO);
        const padding = Math.round(logoSize * 0.12);
        const bgSize = logoSize + padding * 2;
        const bgImg = new jimp_1.default(bgSize, bgSize, 0xffffffff);
        logoImg.resize(logoSize, logoSize);
        bgImg.composite(logoImg, padding, padding);
        const x = Math.round((size - bgSize) / 2);
        const y = Math.round((size - bgSize) / 2);
        qrImg.composite(bgImg, x, y);
        return qrImg.getBufferAsync(jimp_1.default.MIME_PNG);
    }
};
exports.QrImageService = QrImageService;
exports.QrImageService = QrImageService = QrImageService_1 = __decorate([
    (0, common_1.Injectable)()
], QrImageService);
//# sourceMappingURL=qr-image.service.js.map