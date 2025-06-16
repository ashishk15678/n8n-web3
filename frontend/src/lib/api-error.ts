import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  // Auth errors
  AUTH_REQUIRED: "AUTH_REQUIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Resource errors
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",

  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    // For authentication errors, include redirect information
    if (error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      return NextResponse.json(
        {
          error: {
            code: error.code || ERROR_CODES.AUTH_REQUIRED,
            message: error.message,
            redirect: "/signin",
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle NextResponse errors
  if (error instanceof NextResponse) {
    return error;
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      },
    },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

// Auth middleware helper
export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    // Get the current URL for the callback
    const url = new URL(request.url);
    const callbackUrl = url.pathname + url.search;

    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Authentication required",
      ERROR_CODES.AUTH_REQUIRED
    );
  }

  return session;
}

// Admin middleware helper
export async function requireAdmin(request: Request) {
  const session = await requireAuth(request);

  // Add your admin check logic here
  // For example:
  // if (!session.user.isAdmin) {
  //   throw new ApiError(
  //     HTTP_STATUS.FORBIDDEN,
  //     'Admin access required',
  //     ERROR_CODES.INSUFFICIENT_PERMISSIONS
  //   );
  // }

  return session;
}

// Resource not found helper
export function notFound(message = "Resource not found") {
  throw new ApiError(
    HTTP_STATUS.NOT_FOUND,
    message,
    ERROR_CODES.RESOURCE_NOT_FOUND
  );
}

// Validation error helper
export function validationError(message: string) {
  throw new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    message,
    ERROR_CODES.INVALID_INPUT
  );
}

// Service unavailable helper
export function serviceUnavailable(
  message = "Service temporarily unavailable"
) {
  throw new ApiError(
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    message,
    ERROR_CODES.SERVICE_UNAVAILABLE
  );
}
