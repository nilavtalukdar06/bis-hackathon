import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/dal/init";
import { appRouter } from "@/dal/routers/_app";
import { ratelimit } from "@/utils/config/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
  const { remaining } = await ratelimit.limit(ip);
  if (remaining === 0) {
    return NextResponse.json(
      { error: { message: "Too many requests" } },
      { status: 429 },
    );
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
