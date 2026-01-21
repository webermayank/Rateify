import { redis } from "./redis";
import { ConsumeResult, Limiter } from "./types";

export class FixedWindowLimiter implements Limiter {
    constructor(
        private limit: number,
        private windowSeconds: number
    ) { }

    async consume(key: string): Promise<ConsumeResult> {
        const now = Date.now();
        const windowId = Math.floor(now / (this.windowSeconds * 1000));
        const redisKey = `rl:${key}:${windowId}`;

        const count = await redis.incr(redisKey);

        if (count === 1) {
            await redis.expire(redisKey, this.windowSeconds);
        }

        const ttl = await redis.ttl(redisKey);

        return {
            allowed: count <= this.limit,
            remaining: Math.max(0, this.limit - count),
            resetAt: now + ttl * 1000,
        };
    }
}
