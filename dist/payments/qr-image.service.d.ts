export declare class QrImageService {
    private readonly logger;
    private logoBuffer;
    private fetchLogo;
    generateWithLogo(qrString: string, size?: number): Promise<Buffer>;
}
