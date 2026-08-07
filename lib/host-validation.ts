const DEFAULT_PORT = "3000";

export function configuredPort(
  environment: Record<string, string | undefined> = process.env,
): string {
  return environment.PORT ?? DEFAULT_PORT;
}

export function isAllowedHost(
  rawHost: string | null,
  port = configuredPort(),
): boolean {
  return rawHost === `127.0.0.1:${port}` || rawHost === `localhost:${port}`;
}

export function isAllowedRequestHost(
  headers: Pick<Headers, "get" | "has">,
  port = configuredPort(),
): boolean {
  const rawHost = headers.get("host");

  if (!isAllowedHost(rawHost, port) || headers.has("forwarded")) {
    return false;
  }

  // `next start` adds X-Forwarded-Host even for direct requests. It is safe only
  // when it exactly repeats the already validated raw Host value.
  const forwardedHost = headers.get("x-forwarded-host");
  return forwardedHost === null || forwardedHost === rawHost;
}
