import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestTriggerData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  body?: string;
};

export const HttpRequestTriggerExecutor: NodeExecutor<
  HttpRequestTriggerData
> = async ({ nodeId, context, step, data }) => {
  if (!data.endpoint) throw new NonRetriableError("No endpoint configured");
  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;
    const options: KyOptions = { method };
    if (["POST", "PATCH", "PUT"].includes(method)) {
      if (data.body) {
        options.body = data.body;
      }
    }
    const response = await ky(endpoint, options);
    // const response = await ky("https://codewithantonio.com");
    const responseType = response.headers.get("content-type");
    const responseData = responseType?.includes("application/json")
      ? await response.json()
      : await response.text();
    return {
      ...context,
      httpResponse: {
        responseType,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });

  return result;
};
