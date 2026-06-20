export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoInput {
  title: string;
  description: string;
  completed: boolean;
}

export type TodoUpdateInput = Partial<TodoInput>;

export type ValidationResult =
  | {
      ok: true;
      data: TodoUpdateInput;
    }
  | {
      ok: false;
      error: string;
    };

export interface ParsedRoute {
  params: Record<string, string>;
  pathname: "todos" | "todos/:id";
}
