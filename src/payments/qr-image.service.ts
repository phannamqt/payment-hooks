import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import Jimp from 'jimp';

// VietQR logo lấy từ CDN chính thức, cache lại sau lần đầu
const VIETQR_LOGO_URL = 'https://img.vietqr.io/image/logo-vietqr.png';

// Logo size = 22% chiều rộng QR (đủ nhìn thấy, không che module QR)
const LOGO_RATIO = 0.22;

@Injectable()
export class QrImageService {
  private readonly logger = new Logger(QrImageService.name);
  private logoBuffer: Buffer | null = null;

  /** Lấy logo VietQR, cache sau lần đầu */
  private async fetchLogo(): Promise<Buffer | null> {
    if (this.logoBuffer) return this.logoBuffer;
    try {
      const res = await fetch(VIETQR_LOGO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.logoBuffer = globalThis.Buffer.from(await res.arrayBuffer());
      this.logger.log('VietQR logo cached');
    } catch (e) {
      this.logger.warn(`Cannot fetch VietQR logo: ${e.message}`);
    }
    return this.logoBuffer;
  }

  /**
   * Tạo QR PNG có logo VietQR ở giữa
   * @param qrString  chuỗi EMVCo đã generate
   * @param size      kích thước ảnh output (default 400px)
   */
  async generateWithLogo(qrString: string, size = 400): Promise<Buffer> {
    // 1. Render QR plain
    const qrBuffer = globalThis.Buffer.from(
      await QRCode.toBuffer(qrString, {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H', // High = chịu được che 30%, cần để logo không làm hỏng QR
      }),
    );

    // 2. Lấy logo
    const logoRaw = await this.fetchLogo();
    if (!logoRaw) {
      // Không có logo → trả plain QR
      return qrBuffer;
    }

    // 3. Composite bằng Jimp
    const qrImg   = await Jimp.read(qrBuffer);
    const logoImg = await Jimp.read(logoRaw);

    const logoSize = Math.round(size * LOGO_RATIO);

    // Bo góc logo bằng cách tạo vùng nền trắng tròn
    const padding  = Math.round(logoSize * 0.12);
    const bgSize   = logoSize + padding * 2;
    const bgImg    = new Jimp(bgSize, bgSize, 0xffffffff); // trắng

    logoImg.resize(logoSize, logoSize);
    bgImg.composite(logoImg, padding, padding);

    // Đặt vào giữa QR
    const x = Math.round((size - bgSize) / 2);
    const y = Math.round((size - bgSize) / 2);
    qrImg.composite(bgImg, x, y);

    return qrImg.getBufferAsync(Jimp.MIME_PNG);
  }
}
