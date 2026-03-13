import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "database url is not valid" }),
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url({ message: "redis url is not valid" }),
  UPSTASH_REDIS_REST_TOKEN: z
    .string().min(1, { message: "redis token is required" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
