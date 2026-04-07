import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    return NextResponse.json({
      success: true,
      mode: "mock",
      transactionId: `ACT-${Date.now()}`,
      provider: "Actify Demo Escrow",
      amount: body.amount ?? null,
      title: body.title ?? "Marketplace purchase",
      note: "Escrow.com integration is mocked in local development until real credentials are configured.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize escrow transaction";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
