import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "database url is not valid" }),
  UPSTASH_REDIS_REST_URL: z.string().url({ message: "redis url is not valid" }),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, { message: "redis token is required" }),
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, { message: "google client id is required" }),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, { message: "google client secret is required" }),
  BETTER_AUTH_SECRET: z.string().min(1, { message: "auth secret is required" }),
  BETTER_AUTH_URL: z.string().url({ message: "auth url is not valid" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
