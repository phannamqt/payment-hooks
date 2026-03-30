"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const content_parser_util_1 = require("./content-parser.util");
const payments_gateway_1 = require("./payments.gateway");
const notification_service_1 = require("./notification.service");
const REDIS_KEY = 'payments';
const MAX_PAYMENTS = 500;
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(redisService, gateway, notification) {
        this.redisService = redisService;
        this.gateway = gateway;
        this.notification = notification;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async savePayment(data) {
        const content = data.content || '';
        const payment = {
            gateway: data.gateway || '',
            transactionDate: data.transactionDate || '',
            accountNumber: data.accountNumber || '',
            subAccount: data.subAccount || '',
            code: data.code || null,
            content,
            transferType: data.transferType || '',
            description: data.description || '',
            transferAmount: Number(data.transferAmount) || 0,
            referenceCode: data.referenceCode || '',
            accumulated: Number(data.accumulated) || 0,
            id: Number(data.id) || 0,
            receivedAt: new Date().toISOString(),
            parsed: (0, content_parser_util_1.parseTransferContent)(content),
        };
        const redis = this.redisService.getClient();
        await redis.lpush(REDIS_KEY, JSON.stringify(payment));
        await redis.ltrim(REDIS_KEY, 0, MAX_PAYMENTS - 1);
        this.logger.log(`Saved payment id=${payment.id} amount=${payment.transferAmount} ` +
            `from ${payment.parsed?.bankName || payment.gateway} ` +
            `acc=${payment.parsed?.fromAccount || '?'}`);
        this.gateway.emitNewPayment(payment);
        this.notification.notifyAll(payment);
        return payment;
    }
    async getPayments(limit = 50, offset = 0) {
        const redis = this.redisService.getClient();
        const total = await redis.llen(REDIS_KEY);
        const raw = await redis.lrange(REDIS_KEY, offset, offset + limit - 1);
        const payments = raw.map((item) => JSON.parse(item));
        return { payments, total };
    }
    async clearPayments() {
        const redis = this.redisService.getClient();
        await redis.del(REDIS_KEY);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        payments_gateway_1.PaymentsGateway,
        notification_service_1.NotificationService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map