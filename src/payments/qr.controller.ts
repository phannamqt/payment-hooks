import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { generateVietQR, vietQRImageUrl, BANK_BIN } from './vietqr.util';

@Controller('api/qr')
export class QrController {

  /** GET /api/qr/banks — danh sách ngân hàng hỗ trợ */
  @Get('banks')
  getBanks() {
    const banks = Object.entries(BANK_BIN).map(([code, bin]) => ({ code, bin }));
    return banks;
  }

  /** GET /api/qr/generate — trả JSON: qrString + imageUrl CDN + dataUrl base64 */
  @Get('generate')
  async generate(
    @Query('bankBin')       bankBin: string,
    @Query('accountNumber') accountNumber: string,
    @Query('accountName')   accountName: string,
    @Query('amount')        amount?: string,
    @Query('description')   description?: string,
  ) {
    this.validateRequired({ bankBin, accountNumber, accountName });

    const opts = {
      bankBin,
      accountNumber,
      accountName,
      amount:      amount ? Number(amount) : undefined,
      description: description ?? '',
    };

    const qrString  = generateVietQR(opts);
    const imageUrl  = vietQRImageUrl(opts);
    const dataUrl   = await QRCode.toDataURL(qrString, { width: 300, margin: 2 });

    return { qrString, imageUrl, dataUrl };
  }

  /** GET /api/qr/image — trả ảnh PNG trực tiếp */
  @Get('image')
  async image(
    @Query('bankBin')       bankBin: string,
    @Query('accountNumber') accountNumber: string,
    @Query('accountName')   accountName: string,
    @Query('amount')        amount?: string,
    @Query('description')   description?: string,
    @Res() res?: Response,
  ) {
    this.validateRequired({ bankBin, accountNumber, accountName });

    const qrString = generateVietQR({
      bankBin,
      accountNumber,
      accountName,
      amount:      amount ? Number(amount) : undefined,
      description: description ?? '',
    });

    const buffer = await QRCode.toBuffer(qrString, { width: 300, margin: 2 });
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
