import { Payment } from './payments.service';
export declare class NotificationService {
    private readonly logger;
    private fmt;
    private buildMessage;
    notifyAll(payment: Payment): Promise<void>;
    private sendDiscord;
    private sendViber;
}
