export declare const BANK_BIN: Record<string, string>;
export interface VietQROptions {
    bankBin: string;
    accountNumber: string;
    accountName: string;
    amount?: number;
    description?: string;
    city?: string;
}
export declare function generateVietQR(opts: VietQROptions): string;
export declare function vietQRImageUrl(opts: VietQROptions, template?: 'compact' | 'compact2' | 'qr_only' | 'print'): string;
