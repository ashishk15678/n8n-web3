"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { AnthropicChannel } from "@/inngest/channels/anthropic";

export type AnthropicToken = Realtime.Token<
  typeof AnthropicChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: AnthropicChannel(),
    topics: ["status"],
  });
  return token;
}
