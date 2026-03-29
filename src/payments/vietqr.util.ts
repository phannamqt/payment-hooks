/**
 * VietQR Generator — chuẩn EMVCo / NAPAS
 *
 * Cấu trúc QR string:
 *   [00] Payload Format Indicator
 *   [01] Point of Initiation (11=static, 12=dynamic/có số tiền)
 *   [38] Merchant Account Info (NAPAS/VietQR)
 *       [00] GUID = A000000727
 *       [01] Beneficiary info
 *           [00] Bank BIN (6 số)
 *           [01] Account number
 *   [52] MCC
 *   [53] Currency = 704 (VND)
 *   [54] Amount (chỉ khi dynamic)
 *   [58] Country = VN
 *   [59] Merchant name
 *   [60] Merchant city
 *   [62] Additional data
 *       [08] Bill number / nội dung CK
 *   [63] CRC-16/CCITT checksum
 */

// ── Bank BIN map ─────────────────────────────────────────────────────────────
export const BANK_BIN: Record<string, string> = {
  // Quốc doanh
  BIDV:        '970418',
  VCB:         '970436',
  VIETCOMBANK: '970436',
  CTG:         '970415',
  VIETINBANK:  '970415',
  VBA:         '970405',
  AGRIBANK:    '970405',
  // TMCP lớn
  MBB:         '970422',
  MB:          '970422',
  TCB:         '970407',
  TECHCOMBANK: '970407',
  ACB:         '970416',
  STB:         '970403',
  SACOMBANK:   '970403',
  VPB:         '970432',
  VPBANK:      '970432',
  TPB:         '970423',
  TPBANK:      '970423',
  VIB:         '970441',
  HDB:         '970437',
  HDBANK:      '970437',
  SHB:         '970443',
  MSB:         '970426',
  LPB:         '970449',
  OCB:         '970448',
  ABB:         '970425',
  ABBANK:      '970425',
  SEAB:        '970440',
  EIB:         '970431',
  EXIMBANK:    '970431',
  NCB:         '970419',
  SCB:         '970429',
  // Khác
  BAB:         '970409',
  KLB:         '970452',
  NAB:         '970428',
  PVB:         '970412',
  PGB:         '970430',
  VAB:         '970427',
  BVB:         '970438',
  GPB:         '970408',
  CBB:         '970444',
  OJB:         '970414',
  IVB:         '970434',
  VBSP:        '999888',
  VIETBANK:    '970433',
  // Ngân hàng số
  CAKE:        '546034',
  UBANK:       '546035',
};

export interface VietQROptions {
  bankBin: string;          // BIN ngân hàng (6 số) hoặc tên ngân hàng (tự tra)
  accountNumber: string;    // Số tài khoản / số thẻ người nhận
  accountName: string;      // Tên người nhận (max 25 ký tự, không dấu)
  amount?: number;          // Số tiền (bỏ qua để tạo QR tĩnh)
  description?: string;     // Nội dung chuyển tiền (max 25 ký tự)
  city?: string;            // Thành phố (mặc định: HO CHI MINH)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function tlv(tag: string, value: string): string {
  return `${tag}${value.length.toString().padStart(2, '0')}${value}`;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function resolveBin(input: string): string {
  const upper = input.toUpperCase();
  // Nếu đã là BIN 6 số thì dùng luôn
  if (/^\d{6}$/.test(input)) return input;
  // Tra bảng
  return BANK_BIN[upper] ?? '';
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function generateVietQR(opts: VietQROptions): string {
  const bin = resolveBin(opts.bankBin);
  if (!bin) throw new Error(`Bank BIN not found for: ${opts.bankBin}`);

  const isDynamic = opts.amount != null && opts.amount > 0;

  // [38] Merchant Account Info
  const beneficiary = tlv('00', bin) + tlv('01', opts.accountNumber);
  const merchantAccount =
    tlv('00', 'A000000727') +
    tlv('01', beneficiary);

  // [62] Additional Data — nội dung chuyển khoản
  const desc = (opts.description ?? '').slice(0, 25);
  const additionalData = desc ? tlv('08', desc) : '';

  const parts = [
    tlv('00', '01'),                                      // Payload Format Indicator
    tlv('01', isDynamic ? '12' : '11'),                   // Point of Initiation
    tlv('38', merchantAccount),                           // Merchant Account Info
    tlv('52', '0000'),                                    // MCC
    tlv('53', '704'),                                     // Currency VND
    ...(isDynamic ? [tlv('54', String(opts.amount))] : []),
    tlv('58', 'VN'),                                      // Country
    tlv('59', opts.accountName.slice(0, 25)),             // Merchant name
    tlv('60', (opts.city ?? 'HO CHI MINH').slice(0, 15)),// City
    ...(additionalData ? [tlv('62', additionalData)] : []),
    '6304',                                               // CRC placeholder
  ];

  const raw = parts.join('');
  return raw + crc16(raw);
}

/**
 * Trả về URL ảnh QR từ VietQR CDN (không cần tự render)
 * https://img.vietqr.io/image/{bin}-{account}-{template}.png?amount=...&addInfo=...&accountName=...
 */
export function vietQRImageUrl(
  opts: VietQROptions,
  template: 'compact' | 'compact2' | 'qr_only' | 'print' = 'compact2',
): string {
  const bin = resolveBin(opts.bankBin);
  if (!bin) throw new Error(`Bank BIN not found for: ${opts.bankBin}`);

  const params = new URLSearchParams();
  if (opts.amount)      params.set('amount', String(opts.amount));
  if (opts.description) params.set('addInfo', opts.description);
  if (opts.accountName) params.set('accountName', opts.accountName);

  const qs = params.toString();
  return `https://img.vietqr.io/image/${bin}-${opts.accountNumber}-${template}.png${qs ? '?' + qs : ''}`;
}
