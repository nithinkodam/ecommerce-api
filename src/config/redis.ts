import IORedis from "ioredis";

const redis = new IORedis({
  host:
    process.env.UPSTASH_REDIS_HOST,

  port: Number(
    process.env.UPSTASH_REDIS_PORT
  ),

  password:
    process.env.UPSTASH_REDIS_PASSWORD,

  maxRetriesPerRequest: null
});

export default redis;