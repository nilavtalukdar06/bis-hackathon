import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { findBatchByNumber } from "@/features/medicine/services/medicine.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchNumber } = body;
    if (!batchNumber || typeof batchNumber !== "string") {
      return NextResponse.json(
        { error: "batchNumber required" },
        { status: 400 },
      );
    }
    const batch = await findBatchByNumber(batchNumber);
    return NextResponse.json({ batch });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
