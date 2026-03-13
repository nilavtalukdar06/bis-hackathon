import { betterAuth } from "better-auth";
import prisma from "@/lib/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
