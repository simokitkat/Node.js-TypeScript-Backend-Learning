import { IncomingMessage, ServerResponse } from "node:http";
import { parse as parseUrl } from "node:url";

type QueryValue = string | string[] | undefined;

export class InvalidJsonError extends Error {
  constructor() {
    super("Invalid JSON");
  }
}

export async function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) {
    return {};
  }

  try {
    const body = JSON.parse(rawBody) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid JSON");
    }

    return body as Record<string, unknown>;
  } catch {
    throw new InvalidJsonError();
  }
}

export function parsePathParams(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      try {
        params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      } catch {
        return null;
      }
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

export function sendResponse(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (statusCode === 204) {
    res.end();
    return;
  }

  res.end(JSON.stringify(data));
}

export function getRequestInfo(req: IncomingMessage): {
  method: string;
  pathname: string;
  query: Record<string, QueryValue>;
} {
  const parsedUrl = parseUrl(req.url || "/", true);
  const pathname = parsedUrl.pathname || "/";

  return {
    method: req.method || "GET",
    pathname,
    query: parsedUrl.query as Record<string, QueryValue>,
  };
}
