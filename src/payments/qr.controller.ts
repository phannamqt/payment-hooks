import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { generateVietQR, vietQRImageUrl, BANK_BIN } from './vietqr.util';
import { QrImageService } from './qr-image.service';

@Controller('api/qr')
export class QrController {

  constructor(private readonly qrImageService: QrImageService) {}

  /** GET /api/qr/banks — danh sách ngân hàng hỗ trợ */
  @Get('banks')
  getBanks() {
    return Object.entries(BANK_BIN).map(([code, bin]) => ({ code, bin }));
  }

  /** GET /api/qr/generate — trả JSON: qrString + imageUrl CDN */
  @Get('generate')
  async generate(
    @Query('bankBin')       bankBin: string,
    @Query('accountNumber') accountNumber: string,
    @Query('accountName')   accountName: string,
    @Query('amount')        amount?: string,
    @Query('description')   description?: string,
    @Query('template')      template?: string,
  ) {
    this.validateRequired({ bankBin, accountNumber, accountName });

    const opts = {
      bankBin,
      accountNumber,
      accountName,
      amount:      amount ? Number(amount) : undefined,
      description: description ?? '',
    };

    const validTemplates = ['compact', 'compact2', 'qr_only', 'print'];
    const tpl = validTemplates.includes(template) ? template as any : 'compact2';

    const qrString = generateVietQR(opts);
    const imageUrl = vietQRImageUrl(opts, tpl);

    return { qrString, imageUrl };
  }

  /**
   * GET /api/qr/image — tạo QR local có logo VietQR ở giữa
   */
  @Get('image')
  async image(
    @Res() res: Response,
    @Query('bankBin')       bankBin: string,
    @Query('accountNumber') accountNumber: string,
    @Query('accountName')   accountName: string,
    @Query('amount')        amount?: string,
    @Query('description')   description?: string,
  ) {
    this.validateRequired({ bankBin, accountNumber, accountName });

    const qrString = generateVietQR({
      bankBin,
      accountNumber,
      accountName,
      amount:      amount ? Number(amount) : undefined,
      description: description ?? '',
    });

    const buffer = await this.qrImageService.generateWithLogo(qrString);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  }

  private validateRequired(fields: Record<string, string>) {
    for (const [key, val] of Object.entries(fields)) {
      if (!val?.trim()) throw new BadRequestException(`Missing required field: ${key}`);
    }
  }
}
