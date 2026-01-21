import Redis from 'ioredis';


export const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
});

export async function connectRedis() {
    if (redis.status === "ready") return;
    await redis.connect();
}