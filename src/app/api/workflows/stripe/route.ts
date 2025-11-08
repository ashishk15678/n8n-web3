import { sendWorkflowExecution } from "@/inngest/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId)
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field workflowId",
        },
        { status: 400 },
      );
    const body = await request.json();
    const formData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: { stripe: formData },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Stripe webhook api error", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process stripe webhook submission",
      },
      { status: 500 },
    );
  }
}
