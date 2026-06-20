import { TodoUpdateInput, ValidationResult } from "./types";

export function validateTodoInput(body: Record<string, unknown>, allowPartial: boolean): ValidationResult {
  if (!allowPartial && body.title === undefined) {
    return {
      ok: false,
      error: "Title is required",
    };
  }

  const result: TodoUpdateInput = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      return {
        ok: false,
        error: "Title must be a string",
      };
    }

    const title = body.title.trim();

    if (title.length < 1 || title.length > 100) {
      return {
        ok: false,
        error: "Title must be between 1 and 100 characters",
      };
    }

    result.title = title;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return {
        ok: false,
        error: "Description must be a string",
      };
    }

    if (body.description.length > 500) {
      return {
        ok: false,
        error: "Description must be 500 characters or less",
      };
    }

    result.description = body.description;
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return {
        ok: false,
        error: "Completed must be a boolean",
      };
    }

    result.completed = body.completed;
  }

  return {
    ok: true,
    data: result,
  };
}
