import { FixedWindowLuaLimiter } from "./fixedWindowLua";
// export type { ConsumeResult, Limiter } from "./types";
import {connectRedis} from "./redis";

async function test() {
    await connectRedis();
    const limiter = new FixedWindowLuaLimiter(3, 10);

    for (let i = 1; i <= 5; i++) {
        const res = await limiter.consume("user-1");
        console.log(i, res);
    }
}

test();