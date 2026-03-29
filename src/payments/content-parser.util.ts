export interface ParsedContent {
  bankPrefix: string;
  bankName: string;
  description: string;
  fromAccount: string;
  fromName: string;
  toAccount: string;
  toName: string;
}

const BANK_MAP: Record<string, string> = {
  MBVCB: 'MB Bank',
  VCB:   'Vietcombank',
  BIDV:  'BIDV',
  VTB:   'Vietinbank',
  TCB:   'Techcombank',
  ACB:   'ACB',
  TPB:   'TPBank',
  VPB:   'VPBank',
  STB:   'Sacombank',
  HDB:   'HDBank',
  MSB:   'MSB',
  OCB:   'OCB',
  SHB:   'SHB',
  NAB:   'Nam A Bank',
  BAB:   'BacABank',
  SEAB:  'SeABank',
  ABBANK: 'ABBank',
  CAKE:  'CAKE',
  TIMO:  'Timo',
};

/**
 * Bóc tách nội dung chuyển khoản định dạng SePay/MBVCB:
 * MBVCB.txId.ref.description.CT tu {fromAcc} {fromName} toi {toAcc} {toName} tai {bank}
 */
export function parseTransferContent(content: string): ParsedContent | null {
  if (!content) return null;

  // Tách phần đầu: PREFIX.txId.ref.description
  const dotParts = content.split('.');
  const bankPrefix = dotParts[0]?.toUpperCase() ?? '';
  const bankName = BANK_MAP[bankPrefix] ?? bankPrefix;

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
