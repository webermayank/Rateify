import {Request, Response, NextFunction} from 'express';
import { FixedWindowLuaLimiter } from '@rate-limiter/core';

export interface RateLimitOptions {
    limit: number;
    windowSeconds: number;
    keyGenerator?: (req: Request) => string;
}


export function rateLimit(options: RateLimitOptions) {
    const limiter = new FixedWindowLuaLimiter(
        options.limit,
        options.windowSeconds
    );

    const getKey =
        options.keyGenerator ||
        ((req: Request) => req.ip || "unknown");

    return async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const key = getKey(req);
            const result = await limiter.consume(key);

            res.setHeader("X-RateLimit-Limit", options.limit);
            res.setHeader("X-RateLimit-Remaining", result.remaining);
            res.setHeader("X-RateLimit-Reset", result.resetAt);

            if (!result.allowed) {
                return res.status(429).json({
                    error: "Too Many Requests",
                });
            }

            next();
        } catch (err) {
            // FAIL OPEN: infra should not take prod down
            next();
        }
    };
}