"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BANK_BIN = void 0;
exports.generateVietQR = generateVietQR;
exports.vietQRImageUrl = vietQRImageUrl;
exports.BANK_BIN = {
    BIDV: '970418',
    VCB: '970436',
    VIETCOMBANK: '970436',
    CTG: '970415',
    VIETINBANK: '970415',
    VBA: '970405',
    AGRIBANK: '970405',
    MBB: '970422',
    MB: '970422',
    TCB: '970407',
    TECHCOMBANK: '970407',
    ACB: '970416',
    STB: '970403',
    SACOMBANK: '970403',
    VPB: '970432',
    VPBANK: '970432',
    TPB: '970423',
    TPBANK: '970423',
    VIB: '970441',
    HDB: '970437',
    HDBANK: '970437',
    SHB: '970443',
    MSB: '970426',
    LPB: '970449',
    OCB: '970448',
    ABB: '970425',
    ABBANK: '970425',
    SEAB: '970440',
    EIB: '970431',
    EXIMBANK: '970431',
    NCB: '970419',
    SCB: '970429',
    BAB: '970409',
    KLB: '970452',
    NAB: '970428',
    PVB: '970412',
    PGB: '970430',
    VAB: '970427',
    BVB: '970438',
    GPB: '970408',
    CBB: '970444',
    OJB: '970414',
    IVB: '970434',
    VBSP: '999888',
    VIETBANK: '970433',
    CAKE: '546034',
    UBANK: '546035',
};
function tlv(tag, value) {
    return `${tag}${value.length.toString().padStart(2, '0')}${value}`;
}
function crc16(data) {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}
function resolveBin(input) {
    const upper = input.toUpperCase();
    if (/^\d{6}$/.test(input))
        return input;
    return exports.BANK_BIN[upper] ?? '';
}
function generateVietQR(opts) {
    const bin = resolveBin(opts.bankBin);
    if (!bin)
        throw new Error(`Bank BIN not found for: ${opts.bankBin}`);
    const isDynamic = opts.amount != null && opts.amount > 0;
    const beneficiary = tlv('00', bin) + tlv('01', opts.accountNumber);
    const merchantAccount = tlv('00', 'A000000727') +
        tlv('01', beneficiary);
    const desc = (opts.description ?? '').slice(0, 25);
    const additionalData = desc ? tlv('08', desc) : '';
    const parts = [
        tlv('00', '01'),
        tlv('01', isDynamic ? '12' : '11'),
        tlv('38', merchantAccount),
        tlv('52', '0000'),
        tlv('53', '704'),
        ...(isDynamic ? [tlv('54', String(opts.amount))] : []),
        tlv('58', 'VN'),
        tlv('59', opts.accountName.slice(0, 25)),
        tlv('60', (opts.city ?? 'HO CHI MINH').slice(0, 15)),
        ...(additionalData ? [tlv('62', additionalData)] : []),
        '6304',
    ];
    const raw = parts.join('');
    return raw + crc16(raw);
}
function vietQRImageUrl(opts, template = 'compact2') {
    const bin = resolveBin(opts.bankBin);
    if (!bin)
        throw new Error(`Bank BIN not found for: ${opts.bankBin}`);
    const params = new URLSearchParams();
    if (opts.amount)
        params.set('amount', String(opts.amount));
    if (opts.description)
        params.set('addInfo', opts.description);
    if (opts.accountName)
        params.set('accountName', opts.accountName);
    const qs = params.toString();
    return `https://img.vietqr.io/image/${bin}-${opts.accountNumber}-${template}.png${qs ? '?' + qs : ''}`;
}
//# sourceMappingURL=vietqr.util.js.map