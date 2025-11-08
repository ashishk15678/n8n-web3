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
      raw: body,
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: { googleForm: formData },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Google form webhook api error", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process google form submission",
      },
      { status: 500 },
    );
  }
}
