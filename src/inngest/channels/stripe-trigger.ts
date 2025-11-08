import { channel, topic } from "@inngest/realtime";
export const STRIPE_TRIGGER_EXECUTION_NAME = "google-form-trigger-execution";
export const stripeTriggerChannel = channel(
  STRIPE_TRIGGER_EXECUTION_NAME,
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
