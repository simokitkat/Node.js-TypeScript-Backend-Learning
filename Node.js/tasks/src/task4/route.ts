import { parsePathParams } from "./helpers";
import { ParsedRoute } from "./types";

export function parseRoute(pathname: string): ParsedRoute | null {
  const collectionMatch = parsePathParams("/todos", pathname);

  if (collectionMatch) {
    return {
      params: {},
      pathname: "todos",
    };
  }

  const itemMatch = parsePathParams("/todos/:id", pathname);

  if (itemMatch) {
    return {
      params: itemMatch,
      pathname: "todos/:id",
    };
  }

  return null;
}
