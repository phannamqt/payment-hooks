import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

const REDIS_KEY = 'payments';
const MAX_PAYMENTS = 500;

export interface Payment {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
  id: number;
  receivedAt: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly redisService: RedisService) {}

  async savePayment(data: any): Promise<Payment> {
    const payment: Payment = {
      gateway: data.gateway || '',
      transactionDate: data.transactionDate || '',
      accountNumber: data.accountNumber || '',
      subAccount: data.subAccount || '',
      code: data.code || null,
      content: data.content || '',
      transferType: data.transferType || '',
      description: data.description || '',
      transferAmount: Number(data.transferAmount) || 0,
      referenceCode: data.referenceCode || '',
      accumulated: Number(data.accumulated) || 0,
      id: Number(data.id) || 0,
      receivedAt: new Date().toISOString(),
    };

    const redis = this.redisService.getClient();
    await redis.lpush(REDIS_KEY, JSON.stringify(payment));
    await redis.ltrim(REDIS_KEY, 0, MAX_PAYMENTS - 1);

    this.logger.log(
      `Saved payment id=${payment.id} amount=${payment.transferAmount} from ${payment.gateway}`,
    );
    return payment;
  }

  async getPayments(limit = 50, offset = 0): Promise<{ payments: Payment[]; total: number }> {
    const redis = this.redisService.getClient();
    const total = await redis.llen(REDIS_KEY);
    const raw = await redis.lrange(REDIS_KEY, offset, offset + limit - 1);
    const payments = raw.map((item) => JSON.parse(item) as Payment);
    return { payments, total };
  }

  async clearPayments(): Promise<void> {
    const redis = this.redisService.getClient();
    await redis.del(REDIS_KEY);
  }
}
