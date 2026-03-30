import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentsService: PaymentsService);
    receiveHook(body: any): Promise<{
        success: boolean;
        payment: import("./payments.service").Payment;
    }>;
    getPayments(limit?: string, offset?: string): Promise<{
        payments: import("./payments.service").Payment[];
        total: number;
    }>;
    clearPayments(password: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
