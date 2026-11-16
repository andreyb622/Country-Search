export type ErrorKind = "abort" | "timeout" | "http" | "network";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function classifyError(error: unknown): ErrorKind {
  throw new Error("Not implemented");
}
