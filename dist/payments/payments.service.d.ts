import { RedisService } from './redis.service';
import { ParsedContent } from './content-parser.util';
import { PaymentsGateway } from './payments.gateway';
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
    parsed: ParsedContent | null;
}
export declare class PaymentsService {
    private readonly redisService;
    private readonly gateway;
    private readonly logger;
    constructor(redisService: RedisService, gateway: PaymentsGateway);
    savePayment(data: any): Promise<Payment>;
    getPayments(limit?: number, offset?: number): Promise<{
        payments: Payment[];
        total: number;
    }>;
    clearPayments(): Promise<void>;
}
