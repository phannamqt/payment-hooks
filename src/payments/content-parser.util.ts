export interface ParsedContent {
  bankPrefix: string;
  bankName: string;
  description: string;
  fromAccount: string;
  fromName: string;
  toAccount: string;
  toName: string;
}

// Bảng tra cứu theo mã ngân hàng gốc (không có tiền tố MB)
const BANK_MAP: Record<string, string> = {
  // ── Quốc doanh ──────────────────────────────────────────────
  VCB:         'Vietcombank',
  CTG:         'VietinBank',
  ICB:         'VietinBank',
  IPAY:        'VietinBank',
  BIDV:        'BIDV',
  BID:         'BIDV',
  VBA:         'Agribank',
  AGR:         'Agribank',

  // ── TMCP lớn ────────────────────────────────────────────────
  TCB:         'Techcombank',
  MBB:         'MB Bank',
  ACB:         'ACB',
  STB:         'Sacombank',
  SAC:         'Sacombank',
  VPB:         'VPBank',
  VPBANK:      'VPBank',
  TPB:         'TPBank',
  TPBANK:      'TPBank',
  VIB:         'VIB',
  HDB:         'HDBank',
  HDBANK:      'HDBank',
  SHB:         'SHB',
  MSB:         'MSB',
  LPB:         'LPBank',
  LPBANK:      'LPBank',
  ABB:         'ABBank',
  ABBANK:      'ABBank',
  OCB:         'OCB',
  SCB:         'SCB',
  SEAB:        'SeABank',
  SEABANK:     'SeABank',
  EIB:         'Eximbank',
  EXIMBANK:    'Eximbank',
  NVB:         'NCB',
  NCB:         'NCB',
  BVB:         'BaoViet Bank',
  BAOVIET:     'BaoViet Bank',

  // ── Ngân hàng khác ──────────────────────────────────────────
  BAB:         'BacABank',
  BACA:        'BacABank',
  VAB:         'VietABank',
  VIETABANK:   'VietABank',
  KLB:         'KienlongBank',
  KIENLONG:    'KienlongBank',
  PGB:         'PGBank',
  PGBANK:      'PGBank',
  PVB:         'PVcomBank',
  PVCOMBANK:   'PVcomBank',
  NAB:         'Nam A Bank',
  NAMABANK:    'Nam A Bank',
  VIETBANK:    'VietBank',
  OJB:         'OceanBank',
  OCEANBANK:   'OceanBank',
  GPB:         'GPBank',
  CBB:         'CBBank',
  VBSP:        'NHCSXH',
  IVB:         'IndovinaBank',
  HSBC:        'HSBC',
  STANDARD:    'Standard Chartered',
  CITI:        'Citibank',
  ANZ:         'ANZ',
  SHINHAN:     'Shinhan Bank',
  WOORI:       'Woori Bank',
  KBANK:       'KBank',
  UOB:         'UOB',
  CIMB:        'CIMB',
  HLBANK:      'Hong Leong Bank',
  PBVN:        'PublicBank VN',
  IBK:         'IBK',

  // ── Ngân hàng số ────────────────────────────────────────────
  CAKE:        'Cake by VPBank',
  TIMO:        'Timo',
  UBANK:       'Ubank by VPBank',

  // ── Ví điện tử ──────────────────────────────────────────────
  MOMO:        'MoMo',
  ZALOPAY:     'ZaloPay',
  ZLP:         'ZaloPay',
  VIETTELMONEY:'Viettel Money',
  VTM:         'Viettel Money',
  VNPAY:       'VNPay',
  SHOPEEPAY:   'ShopeePay',
  SPP:         'ShopeePay',
  PAYOO:       'Payoo',
  MOCA:        'Moca (Grab)',
};

/**
 * Tra cứu tên ngân hàng từ prefix trong nội dung chuyển khoản.
 * Xử lý cả dạng "MBVCB", "MBBIDV", "MBTCB"... (tiền tố MB = Mobile Banking)
 * và dạng thẳng "VCB", "BIDV", "TCB"...
 */
function resolveBankName(prefix: string): string {
  // 1. Tra trực tiếp
  if (BANK_MAP[prefix]) return BANK_MAP[prefix];

  // 2. Nếu bắt đầu bằng MB (>2 ký tự) → strip MB, tra phần còn lại
  //    Ví dụ: MBVCB → VCB, MBBIDV → BIDV, MBTCB → TCB
  //    Ngoại lệ: MBB = MB Bank (đã có trong map)
  if (prefix.startsWith('MB') && prefix.length > 2) {
    const stripped = prefix.slice(2); // bỏ "MB"
    if (BANK_MAP[stripped]) return BANK_MAP[stripped];
  }

  return prefix; // fallback: trả về mã gốc
}

/**
 * Bóc tách nội dung chuyển khoản định dạng SePay/MBVCB:
 * MBVCB.txId.ref.description.CT tu {fromAcc} {fromName} toi {toAcc} {toName} tai {bank}
 */
export function parseTransferContent(content: string): ParsedContent | null {
  if (!content) return null;

  // Tách phần đầu: PREFIX.txId.ref.description
  const dotParts = content.split('.');
  const bankPrefix = dotParts[0]?.toUpperCase() ?? '';
  const bankName = resolveBankName(bankPrefix);

  // Lấy description (phần thứ 4, index 3)
  const description = dotParts[3] ?? '';

  // Tìm phần "CT tu ... toi ... tai ..."
  // Ghép lại từ phần thứ 5 (sau 4 dấu chấm đầu)
  const transfer = dotParts.slice(4).join('.').trim();

  // Pattern: CT tu {account} {name} toi {account} {name} tai {bank}
  const match = transfer.match(
    /CT\s+tu\s+(\S+)\s+(.+?)\s+toi\s+(\S+)\s+(.+?)\s+tai\s+\S+/i,
  );

  if (!match) {
    // Fallback: trả về những gì parse được
    return { bankPrefix, bankName, description, fromAccount: '', fromName: '', toAccount: '', toName: '' };
  }

  return {
    bankPrefix,
    bankName,
    description,
    fromAccount: match[1],
    fromName:    match[2],
    toAccount:   match[3],
    toName:      match[4],
  };
}
