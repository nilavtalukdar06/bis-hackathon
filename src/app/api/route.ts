import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/utils/config/rate-limit";
import { handleApiError } from "@/utils/error/api-error";
import { AppError } from "@/utils/error/errors";

export async function GET(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
      ",",
    )[0];
    const { remaining } = await ratelimit.limit(ip);
    if (remaining === 0) {
      throw new AppError("Too many requests", 429);
    }
    return NextResponse.json({
      success: true,
      status: 200,
      message: "serverless functions are working",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
