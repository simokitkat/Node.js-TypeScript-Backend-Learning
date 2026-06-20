import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { getRequestInfo, InvalidJsonError, parseBody, sendResponse } from "./helpers";
import { parseRoute } from "./route";
import { Todo, TodoInput, TodoUpdateInput } from "./types";
import { validateTodoInput } from "./validation";

export class TodoServer {
  private readonly server: Server;
  private readonly todos: Todo[] = [
    {
      id: 1,
      title: "Learn Node.js http module",
      description: "Build a CRUD todo API with built-in modules",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: "Practice TypeScript",
      description: "Keep the implementation strictly typed",
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 3;

  constructor(private readonly port: number) {
    this.server = createServer((req, res) => {
      void this.handleRequest(req, res);
    });
  }

  start(): void {
    this.server.listen(this.port, () => {
      console.log("=== Todo Server Started ===");
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const request = getRequestInfo(req);

    if (request.method === "OPTIONS") {
      this.logRequest(request.method, request.pathname, 204, "CORS preflight");
      sendResponse(res, 204, {});
      return;
    }

    const parsedRoute = parseRoute(request.pathname);

    if (!parsedRoute) {
      this.logRequest(request.method, request.pathname, 404, "route not found");
      sendResponse(res, 404, { success: false, error: "Route not found" });
      return;
    }

    try {
      if (parsedRoute.pathname === "todos") {
        await this.handleTodosCollection(req, res, request);
        return;
      }

      await this.handleTodoById(req, res, request, parsedRoute.params);
    } catch (error) {
      if (error instanceof InvalidJsonError) {
        this.logRequest(request.method, request.pathname, 400, "invalid JSON");
        sendResponse(res, 400, { success: false, error: "Invalid JSON" });
        return;
      }

      this.logRequest(request.method, request.pathname, 500, "internal server error");
      sendResponse(res, 500, { success: false, error: "Internal server error" });
    }
  }

  private async handleTodosCollection(
    req: IncomingMessage,
    res: ServerResponse,
    request: { method: string; pathname: string; query: Record<string, string | string[] | undefined> },
  ): Promise<void> {
    if (request.method === "GET") {
      const completed = this.parseCompletedQuery(request.query.completed);

      if (completed === null) {
        this.logRequest(request.method, request.pathname, 400, "invalid completed query parameter");
        sendResponse(res, 400, { success: false, error: "Invalid completed query parameter" });
        return;
      }

      const todos = completed === undefined ? this.todos : this.todos.filter((todo) => todo.completed === completed);
      this.logRequest(request.method, request.pathname, 200, `${todos.length} todos`);
      sendResponse(res, 200, { success: true, data: todos, count: todos.length });
      return;
    }

    if (request.method === "POST") {
      const validation = validateTodoInput(await parseBody(req), false);

      if (!validation.ok) {
        this.logRequest(request.method, request.pathname, 400, validation.error);
        sendResponse(res, 400, { success: false, error: validation.error });
        return;
      }

      const todoInput: TodoInput = {
        title: validation.data.title || "",
        description: validation.data.description || "",
        completed: validation.data.completed ?? false,
      };
      const todo = this.createTodo(todoInput);
      this.todos.push(todo);

      this.logRequest(request.method, request.pathname, 201, `new todo: id=${todo.id}`);
      sendResponse(res, 201, { success: true, data: todo });
      return;
    }

    this.logRequest(request.method, request.pathname, 405, "method not allowed");
    sendResponse(res, 405, { success: false, error: "Method not allowed" });
  }

  private async handleTodoById(
    req: IncomingMessage,
    res: ServerResponse,
    request: { method: string; pathname: string; query: Record<string, string | string[] | undefined> },
    params: Record<string, string>,
  ): Promise<void> {
    const id = this.parseTodoId(params.id);
    const requestPath = `/todos/${params.id}`;

    if (id === null) {
      this.logRequest(request.method, requestPath, 400, "invalid todo id");
      sendResponse(res, 400, { success: false, error: "Invalid todo id" });
      return;
    }

    const todoIndex = this.todos.findIndex((todo) => todo.id === id);

    if (todoIndex === -1) {
      this.logRequest(request.method, `/todos/${id}`, 404, "todo not found");
      sendResponse(res, 404, { success: false, error: "Todo not found" });
      return;
    }

    if (request.method === "GET") {
      this.logRequest(request.method, `/todos/${id}`, 200, `todo: id=${id}`);
      sendResponse(res, 200, { success: true, data: this.todos[todoIndex] });
      return;
    }

    if (request.method === "PUT") {
      const validation = validateTodoInput(await parseBody(req), true);

      if (!validation.ok) {
        this.logRequest(request.method, `/todos/${id}`, 400, validation.error);
        sendResponse(res, 400, { success: false, error: validation.error });
        return;
      }

      const updatedTodo = this.updateTodo(todoIndex, validation.data);
      this.logRequest(request.method, `/todos/${id}`, 200, `updated todo: id=${id}`);
      sendResponse(res, 200, { success: true, data: updatedTodo });
      return;
    }

    if (request.method === "DELETE") {
      this.todos.splice(todoIndex, 1);
      this.logRequest(request.method, `/todos/${id}`, 200, `deleted todo: id=${id}`);
      sendResponse(res, 200, { success: true, message: "Todo deleted successfully" });
      return;
    }

    this.logRequest(request.method, `/todos/${id}`, 405, "method not allowed");
    sendResponse(res, 405, { success: false, error: "Method not allowed" });
  }

  private createTodo(input: TodoInput): Todo {
    const todo: Todo = {
      id: this.nextId,
      title: input.title,
      description: input.description,
      completed: input.completed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.nextId += 1;
    return todo;
  }

  private updateTodo(index: number, input: TodoUpdateInput): Todo {
    const updatedTodo: Todo = {
      ...this.todos[index],
      ...input,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    return updatedTodo;
  }

  private parseCompletedQuery(completedQuery: unknown): boolean | undefined | null {
    if (completedQuery === undefined) {
      return undefined;
    }

    const value = Array.isArray(completedQuery) ? completedQuery[0] : completedQuery;

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return null;
  }

  private parseTodoId(value: string | undefined): number | null {
    if (!value) {
      return null;
    }

    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return id;
  }

  private logRequest(method: string, pathname: string, statusCode: number, detail: string): void {
    const statusText = this.getStatusText(statusCode);
    console.log(`${method} ${pathname} -> ${statusCode} ${statusText} (${detail})`);
  }

  private getStatusText(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return "OK";
      case 201:
        return "Created";
      case 204:
        return "No Content";
      case 400:
        return "Bad Request";
      case 404:
        return "Not Found";
      case 405:
        return "Method Not Allowed";
      case 500:
        return "Internal Server Error";
      default:
        return "";
    }
  }
}
