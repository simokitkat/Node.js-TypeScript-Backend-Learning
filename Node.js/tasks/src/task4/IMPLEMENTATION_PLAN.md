# Task 04 Implementation Plan

This file explains how the Todo API was built from a beginner-friendly perspective. The goal is not only to show the final code, but to explain the design decisions behind the file structure and architecture.

## 1. Start with the shape of the data

The first thing to decide is what a Todo looks like.

In a React app, this is similar to defining a TypeScript interface for component props or API data.

```ts
export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

Why this comes first:

- Every API response returns Todo data.
- Validation needs to know what fields are allowed.
- The server storage needs a consistent object shape.
- TypeScript can catch mistakes while building.

The implementation uses `src/task4/types.ts` for shared types so every module agrees on the same data shape.

## 2. Separate concerns into small modules

The app is split into modules instead of putting everything in one file.

This is the same idea as separating React code into components, hooks, utilities, and services.

Current structure:

```txt
src/task4/
  index.ts
  types.ts
  helpers.ts
  route.ts
  validation.ts
  todo-server.ts
```

### `index.ts`

This is the entry point.

```ts
import { TodoServer } from "./todo-server";

const server = new TodoServer(3000);
server.start();
```

Why this is separate:

- It only starts the application.
- It does not contain routing, validation, or CRUD logic.
- In a real app, this file would usually be small and focused.

### `types.ts`

Stores shared TypeScript interfaces and unions.

Why this is useful:

- Prevents duplicated type definitions.
- Makes modules easier to understand.
- Helps TypeScript validate the code.

### `helpers.ts`

Contains reusable low-level HTTP helpers:

- `parseBody(req)`
- `parsePathParams(pattern, path)`
- `sendResponse(res, statusCode, data)`
- `getRequestInfo(req)`

Why helpers are separate:

- They are not specific to todos.
- They deal with HTTP mechanics.
- They keep the server class focused on application logic.

### `route.ts`

Contains route matching logic.

```ts
parseRoute(pathname)
```

Why routing is separate:

- It answers one question: "Which endpoint is this request for?"
- The server should not need to know the low-level details of path matching.
- Real apps often use a router library, but this task teaches manual routing.

### `validation.ts`

Contains request validation.

```ts
validateTodoInput(body, allowPartial)
```

Why validation is separate:

- Validation rules can become complex.
- Keeping them separate makes CRUD handlers easier to read.
- In real apps, validation is often its own layer.

### `todo-server.ts`

Contains the main `TodoServer` class.

This module owns:

- In-memory Todo storage.
- HTTP server creation.
- Request dispatching.
- CRUD operations.
- Request logging.

This is the application layer.

## 3. Understand the request lifecycle

Every HTTP request follows the same path.

```txt
Incoming request
  -> index.ts starts TodoServer
  -> todo-server.ts receives request
  -> helpers.ts parses method, path, query, and body
  -> route.ts identifies the route
  -> todo-server.ts chooses the correct handler
  -> validation.ts validates request body
  -> helpers.ts sends JSON response
  -> todo-server.ts logs the result
```

Example:

```txt
PUT /todos/1
```

Lifecycle:

1. `getRequestInfo(req)` reads:
   - method: `PUT`
   - pathname: `/todos/1`
2. `parseRoute("/todos/1")` returns:
   - pathname: `todos/:id`
   - params: `{ id: "1" }`
3. `handleTodoById()` finds Todo `1`.
4. `validateTodoInput(body, true)` validates partial update data.
5. The Todo is updated.
6. `sendResponse()` sends JSON.
7. `logRequest()` prints the request result.

## 4. Why use a class for the server?

A React developer may be more comfortable with functions, and that is fine.

A class is useful here because the server has state.

The `TodoServer` instance owns:

```ts
private readonly todos: Todo[] = [];
private nextId = 1;
private readonly server: Server;
private readonly port: number;
```

This state needs to live as long as the server is running.

A class groups that state with the methods that use it:

```ts
class TodoServer {
  private todos: Todo[] = [];
  private nextId = 1;

  createTodo(input: TodoInput): Todo {}
  updateTodo(index: number, input: TodoUpdateInput): Todo {}
  deleteTodo(index: number): void {}
}
```

The architectural reason:

- The server is a long-running object.
- It receives many requests over time.
- Each request may read or change the same in-memory data.
- A class keeps that state and behavior together.

## 5. Function-based mental model

If you think like a React developer, you can map the class to React concepts.

| React concept | Backend equivalent |
| --- | --- |
| Component state | `TodoServer.todos` |
| Component props | `TodoServer.port` |
| Event handlers | `handleRequest()`, `handleTodoById()` |
| Utility functions | `parseBody()`, `sendResponse()` |
| Validation logic | `validateTodoInput()` |
| Routing | `parseRoute()` |
| Render output | `sendResponse()` |

The main difference is that a backend server does not render UI. It receives HTTP requests and sends HTTP responses.

## 6. Why validation is split from CRUD

CRUD handlers should focus on application behavior.

For example, creating a Todo should mean:

1. Validate input.
2. Create Todo object.
3. Add it to storage.
4. Send response.

Without separate validation, the create handler would become harder to read:

```ts
if (!body.title) return error;
if (typeof body.title !== "string") return error;
if (body.title.trim().length > 100) return error;
if (body.description && typeof body.description !== "string") return error;
```

By moving that logic into `validation.ts`, the create handler becomes clearer:

```ts
const validation = validateTodoInput(await parseBody(req), false);

if (!validation.ok) {
  sendResponse(res, 400, { success: false, error: validation.error });
  return;
}

const todo = this.createTodo(validation.data);
```

This is similar to moving form validation out of a React component into a validation helper.

## 7. Why routing is manual

The task asks to use Node's built-in modules, so the implementation does not use Express.

Manual routing means checking the URL path yourself.

The implementation supports two route patterns:

```txt
/todos
/todos/:id
```

The `:id` part is a path parameter.

For this request:

```txt
/todos/123
```

The route matcher returns:

```ts
{
  params: { id: "123" },
  pathname: "todos/:id"
}
```

This is the same idea as React Router dynamic routes:

```tsx
<Route path="/todos/:id" element={<TodoDetails />} />
```

The backend version just extracts the parameter manually.

## 8. Why responses are consistent

Every response uses the same helper:

```ts
sendResponse(res, statusCode, data);
```

This helper sets:

- HTTP status code
- `Content-Type: application/json`
- CORS headers
- JSON body

Success example:

```json
{
  "success": true,
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "error": "Todo not found"
}
```

Why this matters:

- Frontend code can handle responses predictably.
- Errors have a consistent shape.
- The server does not accidentally send different formats from different routes.

## 9. Why in-memory storage is used

The Todo list is stored in a private class field:

```ts
private readonly todos: Todo[] = [];
```

This means:

- Data exists while the server is running.
- Data is lost when the server restarts.
- No database is needed for this task.

In a real app, this would usually be replaced with:

- A database
- A repository/service layer
- An ORM or query builder

But for learning HTTP, in-memory storage keeps the focus on request/response handling.

## 10. Step-by-step build plan

If building this again from scratch, follow this order.

### Step 1: Define data types

Create `types.ts`.

Include:

- `Todo`
- `TodoInput`
- `TodoUpdateInput`
- `ValidationResult`
- `ParsedRoute`

Reason:

Types define the contract before behavior is written.

### Step 2: Create HTTP helpers

Create `helpers.ts`.

Add:

- `parseBody(req)`
- `parsePathParams(pattern, path)`
- `sendResponse(res, statusCode, data)`
- `getRequestInfo(req)`

Reason:

These are reusable HTTP building blocks.

### Step 3: Create route matching

Create `route.ts`.

Add:

- `parseRoute(pathname)`

Reason:

Routing should be isolated from business logic.

### Step 4: Create validation

Create `validation.ts`.

Add:

- `validateTodoInput(body, allowPartial)`

Reason:

Validation rules are easier to test and maintain when separated.

### Step 5: Create the server class

Create `todo-server.ts`.

Add:

- `TodoServer`
- `start()`
- `handleRequest()`
- `handleTodosCollection()`
- `handleTodoById()`
- `createTodo()`
- `updateTodo()`
- `parseCompletedQuery()`
- `parseTodoId()`
- `logRequest()`

Reason:

The server class coordinates all pieces.

### Step 6: Create the entry point

Create `index.ts`.

Add:

```ts
import { TodoServer } from "./todo-server";

const server = new TodoServer(3000);
server.start();
```

Reason:

The entry point should only bootstrap the app.

## 11. How this design scales to a real app

This small app already follows a layered design.

Current layers:

```txt
Entry point
  -> Server class
    -> Route matching
    -> Validation
    -> HTTP helpers
```

A larger app might become:

```txt
index.ts
  -> app.ts
    -> routes/todoRoutes.ts
      -> controllers/todoController.ts
        -> services/todoService.ts
          -> repositories/todoRepository.ts
            -> database
```

What each layer would do:

| Layer | Responsibility |
| --- | --- |
| Entry point | Start the server |
| App/router | Register routes |
| Controller | Handle HTTP request/response |
| Service | Business logic |
| Repository | Database access |
| Validation | Validate input |
| Types | Shared data contracts |

This task combines controller, service, and repository behavior into `TodoServer` because the storage is only an in-memory array.

## 12. Key takeaway

The main design pattern is separation of concerns.

Do not put everything in one function or one file.

Instead:

1. Define data.
2. Create low-level HTTP helpers.
3. Create routing.
4. Create validation.
5. Create the main server logic.
6. Start the app from a small entry point.

This makes the app easier to read, easier to debug, and easier to expand.
