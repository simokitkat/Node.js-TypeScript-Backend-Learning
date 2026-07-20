# [Express.js Tutorial](https://youtu.be/nH9E25nkk3I?si=YqMi-IZSlNktoXoO)

## Chapter 1: Intro & Setup

### 📖 Express.js Overview

- The most popular server-side web framework in the Node.js ecosystem (20M+ projects, 27M+ weekly npm downloads).
- **Unopinionated**: Minimal overhead with no mandatory configuration. You simply install the package, instantiate the app, listen on a port, and handle requests.
- Remains the dominant framework for building web APIs due to its simplicity and flexibility.

### 🌐 How Client-Server Architecture Works

- **Client**: End-users interacting via browsers, mobile devices, or desktop apps.
- **Server**: Where your Express application lives. It receives requests, runs logic, and returns data.
- **HTTP (HyperText Transfer Protocol)**: The standard protocol for exchanging data between clients and servers.
- **Request/Response Flow**:
  1. Client sends an HTTP request (e.g., visiting an e-commerce homepage).
  2. Server executes business logic (e.g., retrieving a product list).
  3. Server returns the requested data as an HTTP response.
- **Restaurant Analogy**: You (client) place an order. The waiter delivers it to the kitchen (server). The kitchen prepares the meal behind closed doors, and the waiter returns with the response (your food/data). You never see the backend process.

### 🛠️ Project Initialization

```bash
mkdir expressjs-tutorial
cd expressjs-tutorial
npm init -y
```

### 📦 Dependency Installation

```bash
# Core framework
npm i express

# TypeScript runtime and type checking
npm i -D typescript tsx @types/node
```

### ⚙️ Configuration (`package.json`)

Update your `package.json` with:

```json
{
  "type": "module",
  "scripts": {
    "start:dev": "tsx --watch src/index.ts",
    "start": "tsx src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

- `"type": "module"` enables ES Modules (`import`/`export`) instead of CommonJS (`require`/`module.exports`).
- `start:dev`: Uses `tsx --watch` to run TypeScript directly and auto-restart during development.
- `start`: Uses `tsx` to run TypeScript directly for production.
- `typecheck`: Runs TypeScript type checking without emitting files (useful for CI).

### 💻 Server Entry Point (`src/index.ts`)

```typescript
import express, { Request, Response } from "express";

// Initialize Express application
const app = express();

// Use environment variable or fallback to 3000
const port = process.env.PORT || 3000;

// Start listening for incoming HTTP requests
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
```

- `express` is a top-level function. Calling it creates the app instance.
- `Request` and `Response` are Express types for type-safe route handlers.
- `process` is a global Node.js object. `process.env.PORT` accesses runtime environment variables.
- The `||` operator provides a fallback value (`3000`) if `PORT` is undefined.
- The `app.listen()` callback runs after the server successfully starts (useful for logging or startup hooks).

### ▶️ Running & Verification

1. Start the development server:
   ```bash
   npm run start:dev
   ```
2. Terminal output: `Running on port 3000`
3. Visit `http://localhost:3000` in your browser.
4. **Expected Result**: `Cannot GET /`
   - This confirms the server is running correctly. The message appears because no routes have been registered yet to handle the root path.

## Chapter 2: Get Requests

### What is a Route?

- A route is a path in your Express application that determines which output to return.
- Example paths: `/` (base route), `/users`, `/products`.
- Clients access routes by appending them to the hostname and port: `http://localhost:3000/api/users`.
- Without a registered route handler, accessing a path returns `Cannot GET /path`.

### HTTP Verbs Overview

- HTTP requests use verbs to tell the server what operation to perform.
- Common verbs: `GET` (retrieve data), `POST` (create data), `PUT`/`PATCH` (update data), `DELETE` (remove data).
- This chapter focuses on `GET` requests for retrieving data.

### Setting Up a GET Route

```javascript
app.get("/", (request, response) => {
  // request handler logic here
});
```

- `app.get()` registers a route handler for `GET` requests.
- First argument: the route path as a string (e.g., `'/'`, `'/api/users'`).
- Second argument: the request handler callback function.

### The Request and Response Objects

- **Request object (`req`)**: Contains all incoming HTTP request data.
  - `req.headers`: HTTP headers sent from the client.
  - `req.body`: Data sent in the request body (for POST/PUT).
  - `req.cookies`, `req.ip`, etc.: Other request metadata.
- **Response object (`res`)**: Used to modify and send the response back to the client.
  - `res.send()`: Sends a response (text, JSON, HTML, arrays, objects).
  - `res.status(code)`: Sets the HTTP status code (e.g., `200`, `201`, `404`).
  - Methods can be chained: `res.status(201).send({ message: 'Created' })`.

### Sending Responses

```javascript
// Send plain text
res.send("hello world");

// Send a JSON object
res.send({ hello: "world" });

// Send an array of data
res.send([
  { id: 1, username: "ansen", displayName: "Anson" },
  { id: 2, username: "jack", displayName: "Jack" },
  { id: 3, username: "adam", displayName: "Adam" },
]);

// Set custom status code before sending
res.status(201).send({ message: "Resource created" });
```

- Default successful status code is `200`.
- `201` is conventionally used for successful resource creation (POST requests).

### Route Best Practices

- Prefix all API endpoints with `/api` for clarity and industry standard compliance.
  - Example: `/api/users`, `/api/products` instead of `/users`, `/products`.
- Keep route paths descriptive and RESTful.

### Complete Code Examples (`src/index.ts`)

```typescript
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

// Base route
app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

// Users endpoint
app.get("/api/users", (req: Request, res: Response) => {
  res.send([
    { id: 1, username: "ansen", displayName: "Anson" },
    { id: 2, username: "jack", displayName: "Jack" },
    { id: 3, username: "adam", displayName: "Adam" },
  ]);
});

// Products endpoint
app.get("/api/products", (req: Request, res: Response) => {
  res.send([
    { id: 1, name: "chicken breast", price: "$12.99" },
    { id: 2, name: "chicken breast", price: "$12.99" },
    { id: 3, name: "chicken breast", price: "$12.99" },
  ]);
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
```

### Testing Your Routes

1. Start the server: `npm run start:dev`
2. Visit in browser or use curl/Postman:
   - `http://localhost:3000/` → Returns `"hello world"`
   - `http://localhost:3000/api/users` → Returns array of user objects
   - `http://localhost:3000/api/products` → Returns array of product objects
3. Open browser DevTools → Network tab to inspect:
   - Status codes (e.g., `200`, `201`)
   - Response headers and body
   - Request method and URL

### Key Takeaways

- Routes map HTTP requests to specific handler functions.
- `app.get(path, handler)` registers GET request handlers.
- The handler receives `req` (incoming data) and `res` (outgoing response) objects.
- Use `res.send()` to return data; chain with `res.status()` for custom status codes.
- Prefix API routes with `/api` as a best practice.
- Test routes by visiting the full URL in a browser or HTTP client.
