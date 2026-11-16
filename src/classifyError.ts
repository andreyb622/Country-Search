import { HttpError } from "./HttpError.ts";

export type ErrorKind = "abort" | "timeout" | "http" | "network";

function isDomExceptionNamed(error: unknown, name: string): boolean {
  return error instanceof DOMException && error.name === name;
}

export function classifyError(error: unknown): ErrorKind {
  if (isDomExceptionNamed(error, "AbortError")) {
    return "abort";
  }

  if (isDomExceptionNamed(error, "TimeoutError")) {
    return "timeout";
  }

  if (error instanceof HttpError) {
    return "http";
  }

  return "network";
}
