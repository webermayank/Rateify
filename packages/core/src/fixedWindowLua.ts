import { redis } from "./redis";
import { ConsumeResult, Limiter } from "./types";

const SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return { current, ttl }
`;

export class FixedWindowLuaLimiter implements Limiter {
    constructor(
        private limit: number,
        private windowSeconds: number
    ) { }

    async consume(key: string): Promise<ConsumeResult> {
        const now = Date.now();
        const windowId = Math.floor(now / (this.windowSeconds * 1000));
        const redisKey = `rl:${key}:${windowId}`;

        const [count, ttl] = (await redis.eval(
            SCRIPT,
            1,
            redisKey,
            this.windowSeconds,
            this.limit
        )) as [number, number];

        return {
            allowed: count <= this.limit,
            remaining: Math.max(0, this.limit - count),
            resetAt: now + ttl * 1000,
        };
    }
}
