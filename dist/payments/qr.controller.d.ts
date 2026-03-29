import { Response } from 'express';
import { QrImageService } from './qr-image.service';
export declare class QrController {
    private readonly qrImageService;
    constructor(qrImageService: QrImageService);
    getBanks(): {
        code: string;
        bin: string;
    }[];
    generate(bankBin: string, accountNumber: string, accountName: string, amount?: string, description?: string, template?: string): Promise<{
        qrString: string;
        imageUrl: string;
    }>;
    image(res: Response, bankBin: string, accountNumber: string, accountName: string, amount?: string, description?: string): Promise<void>;
    private validateRequired;
}
