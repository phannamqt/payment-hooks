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

// SĐT Việt Nam: 10 số bắt đầu 03x|05x|07x|08x|09x
const VN_PHONE_RE = /^(0[3-9]\d{8})$/;

export function parseTransferContent(content: string): ParsedContent | null {
  if (!content) return null;

  // ── Format 1: dot-separated bank transfer ────────────────────
  // MBVCB.txId.ref.description.CT tu {fromAcc} {fromName} toi {toAcc} {toName} tai {bank}
  if (content.includes('.')) {
    const dotParts = content.split('.');
    const bankPrefix = dotParts[0]?.toUpperCase() ?? '';
    const bankName = resolveBankName(bankPrefix);
    const description = dotParts[3] ?? '';
    const transfer = dotParts.slice(4).join('.').trim();

    const match = transfer.match(
      /CT\s+tu\s+(\S+)\s+(.+?)\s+toi\s+(\S+)\s+(.+?)\s+tai\s+\S+/i,
    );

    return {
      bankPrefix,
      bankName,
      description,
      fromAccount: match?.[1] ?? '',
      fromName:    match?.[2] ?? '',
      toAccount:   match?.[3] ?? '',
      toName:      match?.[4] ?? '',
    };
  }

  // ── Format 2: ZaloPay ────────────────────────────────────────
  // ZP{txId}, {description}
  // VD: "ZP7COI8QELCJ, UNG HO NGUOI NGHEO"
  if (/^ZP[A-Z0-9]+/i.test(content)) {
    const commaIdx = content.indexOf(',');
    const txId        = commaIdx > -1 ? content.slice(0, commaIdx).trim() : content.trim();
    const description = commaIdx > -1 ? content.slice(commaIdx + 1).trim() : '';
    return {
      bankPrefix:  'ZALOPAY',
      bankName:    'ZaloPay',
      description,
      fromAccount: txId,
      fromName:    '',
      toAccount:   '',
      toName:      '',
    };
  }

  // ── Format 3: MoMo / ví điện tử số ──────────────────────────
  // {txId_số} {phone|account} {description...}
  // VD: "122998552821 0977496798 TESTCHUYENTIEN"
  const spaceParts = content.trim().split(/\s+/);
  if (spaceParts.length >= 2 && /^\d{6,}$/.test(spaceParts[0])) {
    const maybePhone = spaceParts[1];
    const isPhone    = VN_PHONE_RE.test(maybePhone);
    const description = spaceParts.slice(2).join(' ');
    return {
      bankPrefix:  'MOMO',
      bankName:    isPhone ? 'MoMo' : 'Vi dien tu',
      description,
      fromAccount: isPhone ? maybePhone : spaceParts[0],
      fromName:    '',
      toAccount:   '',
      toName:      '',
    };
  }

  // ── Fallback ─────────────────────────────────────────────────
  return {
    bankPrefix:  '',
    bankName:    '',
    description: content,
    fromAccount: '',
    fromName:    '',
    toAccount:   '',
    toName:      '',
  };
}
