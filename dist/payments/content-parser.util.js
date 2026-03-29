"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransferContent = parseTransferContent;
const BANK_MAP = {
    VCB: 'Vietcombank',
    CTG: 'VietinBank',
    ICB: 'VietinBank',
    IPAY: 'VietinBank',
    BIDV: 'BIDV',
    BID: 'BIDV',
    VBA: 'Agribank',
    AGR: 'Agribank',
    TCB: 'Techcombank',
    MBB: 'MB Bank',
    ACB: 'ACB',
    STB: 'Sacombank',
    SAC: 'Sacombank',
    VPB: 'VPBank',
    VPBANK: 'VPBank',
    TPB: 'TPBank',
    TPBANK: 'TPBank',
    VIB: 'VIB',
    HDB: 'HDBank',
    HDBANK: 'HDBank',
    SHB: 'SHB',
    MSB: 'MSB',
    LPB: 'LPBank',
    LPBANK: 'LPBank',
    ABB: 'ABBank',
    ABBANK: 'ABBank',
    OCB: 'OCB',
    SCB: 'SCB',
    SEAB: 'SeABank',
    SEABANK: 'SeABank',
    EIB: 'Eximbank',
    EXIMBANK: 'Eximbank',
    NVB: 'NCB',
    NCB: 'NCB',
    BVB: 'BaoViet Bank',
    BAOVIET: 'BaoViet Bank',
    BAB: 'BacABank',
    BACA: 'BacABank',
    VAB: 'VietABank',
    VIETABANK: 'VietABank',
    KLB: 'KienlongBank',
    KIENLONG: 'KienlongBank',
    PGB: 'PGBank',
    PGBANK: 'PGBank',
    PVB: 'PVcomBank',
    PVCOMBANK: 'PVcomBank',
    NAB: 'Nam A Bank',
    NAMABANK: 'Nam A Bank',
    VIETBANK: 'VietBank',
    OJB: 'OceanBank',
    OCEANBANK: 'OceanBank',
    GPB: 'GPBank',
    CBB: 'CBBank',
    VBSP: 'NHCSXH',
    IVB: 'IndovinaBank',
    HSBC: 'HSBC',
    STANDARD: 'Standard Chartered',
    CITI: 'Citibank',
    ANZ: 'ANZ',
    SHINHAN: 'Shinhan Bank',
    WOORI: 'Woori Bank',
    KBANK: 'KBank',
    UOB: 'UOB',
    CIMB: 'CIMB',
    HLBANK: 'Hong Leong Bank',
    PBVN: 'PublicBank VN',
    IBK: 'IBK',
    CAKE: 'Cake by VPBank',
    TIMO: 'Timo',
    UBANK: 'Ubank by VPBank',
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
    ZLP: 'ZaloPay',
    VIETTELMONEY: 'Viettel Money',
    VTM: 'Viettel Money',
    VNPAY: 'VNPay',
    SHOPEEPAY: 'ShopeePay',
    SPP: 'ShopeePay',
    PAYOO: 'Payoo',
    MOCA: 'Moca (Grab)',
};
function resolveBankName(prefix) {
    if (BANK_MAP[prefix])
        return BANK_MAP[prefix];
    if (prefix.startsWith('MB') && prefix.length > 2) {
        const stripped = prefix.slice(2);
        if (BANK_MAP[stripped])
            return BANK_MAP[stripped];
    }
    return prefix;
}
const VN_PHONE_RE = /^(0[3-9]\d{8})$/;
function parseTransferContent(content) {
    if (!content)
        return null;
    if (content.includes('.')) {
        const dotParts = content.split('.');
        const bankPrefix = dotParts[0]?.toUpperCase() ?? '';
        const bankName = resolveBankName(bankPrefix);
        const description = dotParts[3] ?? '';
        const transfer = dotParts.slice(4).join('.').trim();
        const match = transfer.match(/CT\s+tu\s+(\S+)\s+(.+?)\s+toi\s+(\S+)\s+(.+?)\s+tai\s+\S+/i);
        return {
            bankPrefix,
            bankName,
            description,
            fromAccount: match?.[1] ?? '',
            fromName: match?.[2] ?? '',
            toAccount: match?.[3] ?? '',
            toName: match?.[4] ?? '',
        };
    }
    const spaceParts = content.trim().split(/\s+/);
    if (spaceParts.length >= 2 && /^\d{6,}$/.test(spaceParts[0])) {
        const maybePhone = spaceParts[1];
        const isPhone = VN_PHONE_RE.test(maybePhone);
        const description = spaceParts.slice(2).join(' ');
        return {
            bankPrefix: 'MOMO',
            bankName: isPhone ? 'MoMo' : 'Ví điện tử',
            description,
            fromAccount: isPhone ? maybePhone : spaceParts[0],
            fromName: '',
            toAccount: '',
            toName: '',
        };
    }
    return {
        bankPrefix: '',
        bankName: '',
        description: content,
        fromAccount: '',
        fromName: '',
        toAccount: '',
        toName: '',
    };
}
//# sourceMappingURL=content-parser.util.js.map