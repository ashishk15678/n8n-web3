import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { serve } from "inngest/next";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
});
