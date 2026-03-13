import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, success: false },
      { status: error.statusCode },
    );
  }
  console.error("internal server error", error);
  return NextResponse.json(
    { error: "Something went wrong", success: false },
    { status: 500 },
  );
}
