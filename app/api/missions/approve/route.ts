import { NextResponse } from "next/server";

import { executeCommerceProduct } from "@/lib/adapters/execution";
import type { ActivityEntry, Mission } from "@/lib/types";

function createActivityEntry(
  type: ActivityEntry["type"],
  title: string,
  detail: string,
  missionId?: string,
): ActivityEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    title,
    detail,
    missionId,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    mission: Mission;
    decision: "approve" | "reject";
    userId?: string;
  };

  const { mission, decision } = body;

  if (!mission.selectedProduct) {
    return NextResponse.json(
      {
        error: "No selected product exists for this mission.",
      },
      { status: 400 },
    );
  }

  if (decision === "reject") {
    const rejectedMission: Mission = {
      ...mission,
      status: "blocked",
      executionMessage: "User rejected the delegated action before execution.",
      updatedAt: Date.now(),
    };

    return NextResponse.json({
      mission: rejectedMission,
      activity: [
        createActivityEntry(
          "approval",
          "Approval denied",
          "The selected purchase was rejected and execution was halted.",
          mission.id,
        ),
      ],
    });
  }

  const execution = await executeCommerceProduct({
    userId: body.userId ?? "demo-user",
    product: mission.selectedProduct,
  });

  const completedMission: Mission = {
    ...mission,
    status: execution.success ? "completed" : "failed",
    executionMessage: execution.message,
    executionMode: (execution.data?.mode as "mock" | "shopify" | undefined) ?? "mock",
    checkoutUrl: typeof execution.data?.checkoutUrl === "string" ? execution.data.checkoutUrl : undefined,
    updatedAt: Date.now(),
  };

  return NextResponse.json({
    mission: completedMission,
    activity: [
      createActivityEntry(
        "approval",
        "Approval granted",
        "The delegated action was approved and handed to the execution adapter.",
        mission.id,
      ),
      createActivityEntry(
        execution.success ? "action" : "error",
        execution.success ? "Execution completed" : "Execution failed",
        execution.message,
        mission.id,
      ),
    ],
  });
}
