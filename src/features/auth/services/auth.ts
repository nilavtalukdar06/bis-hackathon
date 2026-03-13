import { betterAuth } from "better-auth";
import prisma from "@/lib/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "@/utils/config/env";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
