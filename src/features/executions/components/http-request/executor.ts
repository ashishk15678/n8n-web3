import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

handlebars.registerHelper(
  "json",
  (context) => new handlebars.SafeString(JSON.stringify(context, null, 2)),
);

type HttpRequestTriggerData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  body?: string;
};

export const HttpRequestTriggerExecutor: NodeExecutor<
  HttpRequestTriggerData
> = async ({ nodeId, context, step, data, publish }) => {
  await publish(httpRequestChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("No variable name configured");
  }
  if (!data.endpoint) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("No endpoint configured");
  }
  if (!data.method) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("No method configured");
  }

  const result = await step.run("http-request", async () => {
    try {
      const method = data.method;
      const endpoint = handlebars.compile(data.endpoint)(context);
      const options: KyOptions = { method };
      if (["POST", "PATCH", "PUT"].includes(method)) {
        if (data.body) {
          const resolved = handlebars.compile(data.body || "{}")(context);
          JSON.parse(resolved);
          options.body = resolved;
          options.headers = { "Content-Type": "application/json" };
        }
      }
      const response = await ky(endpoint, options);
      const responseType = response.headers.get("content-type");
      const responseData = responseType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          responseType,
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
      return {
        ...context,

        [data.variableName]: responsePayload,
      };
    } catch (Err) {
      await publish(httpRequestChannel().status({ nodeId, status: "error" }));
      throw Err;
    }
  });

  await publish(httpRequestChannel().status({ nodeId, status: "success" }));

  return result;
};
