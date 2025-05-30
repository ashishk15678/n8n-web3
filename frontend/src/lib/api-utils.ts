import { NextResponse } from "next/server";

export function tryCatch<T, P extends any[]>(
  fn: (...args: P) => Promise<T>,
  errorMessage: string = "An error occurred"
) {
  return async (...args: P) => {
    try {
      const result = await fn(...args);
      return NextResponse.json(result);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      if (error instanceof Error && error.message.includes("required")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  };
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function validateRequired(data: any, fields: string[]) {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}
