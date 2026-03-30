"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor() {
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    fmt(n) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    }
    buildMessage(payment) {
        const parsed = payment.parsed;
        const isIn = payment.transferType === 'in';
        const lines = [
            isIn ? '💰 TIỀN VÀO' : '💸 TIỀN RA',
            `━━━━━━━━━━━━━━━━━━━`,
            `💵 Số tiền    : ${this.fmt(payment.transferAmount)}`,
            ``,
            `👤 Người chuyển: ${parsed?.fromName || '—'}`,
            `🏦 Ngân hàng   : ${parsed?.bankName || '—'}`,
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
    async notifyAll(payment) {
        await Promise.allSettled([
            this.sendDiscord(payment),
            this.sendViber(payment),
        ]);
    }
    async sendDiscord(payment) {
        const url = process.env.DISCORD_WEBHOOK_URL;
        if (!url)
            return;
        const parsed = payment.parsed;
        const isIn = payment.transferType === 'in';
        const body = {
            embeds: [{
                    title: isIn ? '💰 Tiền vào' : '💸 Tiền ra',
                    color: isIn ? 0x10b981 : 0xef4444,
                    fields: [
                        { name: 'Số tiền', value: this.fmt(payment.transferAmount), inline: true },
                        { name: 'NH nhận', value: payment.gateway || '—', inline: true },
                        ...(parsed?.bankName ? [{ name: 'Ngân hàng chuyển', value: parsed.bankName, inline: true }] : []),
                        ...(parsed?.fromAccount ? [{ name: 'TK chuyển', value: parsed.fromAccount, inline: true }] : []),
                        ...(parsed?.fromName ? [{ name: 'Tên người chuyển', value: parsed.fromName, inline: true }] : []),
                        { name: 'Nội dung', value: parsed?.description || payment.content || '—', inline: false },
                    ],
                    footer: { text: `NAM Pay • ${payment.transactionDate || payment.receivedAt}` },
                }],
        };
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            this.logger.log('Discord notified');
        }
        catch (e) {
            this.logger.error(`Discord error: ${e.message}`);
        }
    }
    async sendViber(payment) {
        const token = process.env.VIBER_BOT_TOKEN;
        const receiverId = process.env.VIBER_RECEIVER_ID;
        if (!token || !receiverId)
            return;
        const body = {
            receiver: receiverId,
            min_api_version: 1,
            sender: { name: 'NAM Pay' },
            type: 'text',
            text: this.buildMessage(payment),
        };
        try {
            const res = await fetch('https://chatapi.viber.com/pa/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Viber-Auth-Token': token,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.status !== 0)
                throw new Error(data.status_message);
            this.logger.log('Viber notified');
        }
        catch (e) {
            this.logger.error(`Viber error: ${e.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
//# sourceMappingURL=notification.service.js.map