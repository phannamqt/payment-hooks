import { Injectable, Logger } from '@nestjs/common';
import { Payment } from './payments.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private fmt(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  }

  private buildMessage(payment: Payment): string {
    const parsed = payment.parsed;
    const isIn   = payment.transferType === 'in';
    const lines  = [
      isIn ? '💰 TIỀN VÀO' : '💸 TIỀN RA',
      `━━━━━━━━━━━━━━━━━━━`,
      `💵 Số tiền    : ${this.fmt(payment.transferAmount)}`,
      ``,
      `👤 Người chuyển: ${parsed?.fromName    || '—'}`,
      `🏦 Ngân hàng   : ${parsed?.bankName    || '—'}`,
      `💳 Số TK       : ${parsed?.fromAccount || '—'}`,
      ``,
      `🏛  Tài khoản nhận: ${payment.subAccount || payment.accountNumber || '—'}`,
      `🏦 NH nhận        : ${payment.gateway || '—'}`,
      ``,
      `📝 Nội dung: ${parsed?.description || payment.content || '—'}`,
      `🕐 Thời gian: ${payment.transactionDate || new Date(payment.receivedAt).toLocaleString('vi-VN')}`,
    ];
    return lines.join('\n');
  }

  async notifyAll(payment: Payment): Promise<void> {
    await Promise.allSettled([
      this.sendDiscord(payment),
      this.sendViber(payment),
    ]);
  }

  // ── Discord Webhook ──────────────────────────────────────────
  private async sendDiscord(payment: Payment): Promise<void> {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;

    const parsed = payment.parsed;
    const isIn   = payment.transferType === 'in';

    const body = {
      embeds: [{
        title:       isIn ? '💰 Tiền vào' : '💸 Tiền ra',
        color:       isIn ? 0x10b981 : 0xef4444,
        fields: [
          { name: 'Số tiền',      value: this.fmt(payment.transferAmount), inline: true },
          { name: 'NH nhận',      value: payment.gateway || '—',           inline: true },
          ...(parsed?.bankName    ? [{ name: 'Ngân hàng chuyển', value: parsed.bankName,    inline: true }] : []),
          ...(parsed?.fromAccount ? [{ name: 'TK chuyển',        value: parsed.fromAccount, inline: true }] : []),
          ...(parsed?.fromName    ? [{ name: 'Tên người chuyển', value: parsed.fromName,    inline: true }] : []),
          { name: 'Nội dung', value: parsed?.description || payment.content || '—', inline: false },
        ],
        footer: { text: `NAM Pay • ${payment.transactionDate || payment.receivedAt}` },
      }],
    };

    try {
      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.logger.log('Discord notified');
    } catch (e) {
      this.logger.error(`Discord error: ${e.message}`);
    }
  }

  // ── Viber Bot ────────────────────────────────────────────────
  private async sendViber(payment: Payment): Promise<void> {
    const token      = process.env.VIBER_BOT_TOKEN;
    const receiverId = process.env.VIBER_RECEIVER_ID;
    if (!token || !receiverId) return;

    const body = {
      receiver: receiverId,
      min_api_version: 1,
      sender:  { name: 'NAM Pay' },
      type:    'text',
      text:    this.buildMessage(payment),
    };

    try {
      const res = await fetch('https://chatapi.viber.com/pa/send_message', {
        method:  'POST',
        headers: {
          'Content-Type':       'application/json',
          'X-Viber-Auth-Token': token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status !== 0) throw new Error(data.status_message);
      this.logger.log('Viber notified');
    } catch (e) {
      this.logger.error(`Viber error: ${e.message}`);
    }
  }
}
