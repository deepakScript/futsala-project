import { redis } from "../config/redis";

redis.ping().then(() => {
    console.log("Connected to Redis");
}).catch((error) => {
    console.error("Error connecting to Redis", error);
});