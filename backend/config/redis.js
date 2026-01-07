import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.log("Missing redis url");
    process.exit(1);
}

export const redisClient = createClient({
    url: redisUrl,
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("✅ Connected to Redis");
    } catch (error) {
        console.error("❌ Redis connection error:", error);
    }
};

export default redisClient;
