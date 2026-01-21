export interface ConsumeResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

export interface Limiter {
    consume(key: string): Promise<ConsumeResult>;
}
