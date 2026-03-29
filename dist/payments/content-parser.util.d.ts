export interface ParsedContent {
    bankPrefix: string;
    bankName: string;
    description: string;
    fromAccount: string;
    fromName: string;
    toAccount: string;
    toName: string;
}
export declare function parseTransferContent(content: string): ParsedContent | null;
