# Node.js Fundamentals — Section 3: Built-in Core Modules

> 🎯 **Focus**: Core Node.js modules (`path`, `events`, `fs`, `http`), callbacks, async patterns, streams, buffers, and foundational web server architecture.  
> 📌 **Rule**: Every concept, example, and pattern is derived directly from the course transcriptions. No external assumptions added.

## Table of Contents

1. [Built-in Modules Overview](#1-built-in-modules-overview)
2. [The `path` Module](#2-the-path-module)
3. [Callback Pattern & Asynchronous JavaScript](#3-callback-pattern--asynchronous-javascript)
4. [The `events` Module & Extending `EventEmitter`](#4-the-events-module--extending-eventemitter)
5. [Character Sets, Encoding & Buffers](#5-character-sets-encoding--buffers)
6. [The `fs` Module: File System Operations](#6-the-fs-module-file-system-operations)
7. [Promise-Based File System (`fs/promises`)](#7-promise-based-file-system-fspromises)
8. [Streams & Pipes](#8-streams--pipes)
9. [The `http` Module & Web Servers](#9-the-http-module--web-servers)
10. [Server Responses: Plain Text, JSON, HTML, Templates](#10-server-responses-plain-text-json-html-templates)
11. [HTTP Routing](#11-http-routing)
12. [Web Frameworks Overview](#12-web-frameworks-overview)
13. [Comprehensive Interview Prep Cheat Sheet](#13-comprehensive-interview-prep-cheat-sheet)
14. [Quick Reference & Debugging](#14-quick-reference--debugging)

## 1. Built-in Modules Overview

- Also called **core modules**
- Shipped with Node.js by default; available immediately after installation
- Must be explicitly imported via `require()` before use
- Focus in this section: `path`, `events`, `fs`, `stream`, `http`
- `path` is straightforward; `events`, `fs`, `streams`, `http` are more complex
- Source code for built-in modules lives in the `lib/` folder of the Node.js repository

## 2. The `path` Module

Provides utilities for working with file and directory paths. Handles platform-specific separators and normalization automatically.

### Import Syntax

```js
// Standard
const path = require("path");
// Recommended (node: protocol)
const path = require("node:path");
```

**Why use `node:` prefix?**

1. Clearly indicates it's a Node.js built-in module
2. Makes the import identifier a valid absolute URL
3. Avoids conflicts with future Node.js built-in modules or third-party packages

### Core Methods & Behaviors

| Method              | Purpose                                             | Example / Behavior                                                 |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| `path.basename()`   | Returns last portion of a path                      | `path.basename('/dir/file.js')` → `'file.js'`                      |
| `path.extname()`    | Returns extension (with dot)                        | `path.extname('/dir/file.js')` → `'.js'`                           |
| `path.parse()`      | Returns object with path elements                   | Returns `{ root, dir, base, ext, name }`                           |
| `path.format()`     | Reconstructs path string from `parse()` object      | Inverse of `parse()`                                               |
| `path.isAbsolute()` | Checks if path is absolute                          | `true` for absolute paths, `false` for relative                    |
| `path.join()`       | Joins segments using platform separator, normalizes | Removes `//`, resolves `..`, uses `/` or `\` per OS                |
| `path.resolve()`    | Resolves sequence into an **absolute path**         | Prepends `cwd` if no `/`; resets root when `/` appears in sequence |

### `path.resolve()` Sequence Logic

- If no `/` provided → prepends current working directory
- If `/` is at start → returns absolute path from root
- If `/` appears mid-sequence → treats it as new root, ignores prior segments
- Example: `resolve('folder1', '/folder2', '../index.html')` → `/index.html` (resets at `/folder2`, `..` goes up)

> ✅ Use `__dirname` and `__filename` (injected by module wrapper) as reliable anchors for path resolution.

## 3. Callback Pattern & Asynchronous JavaScript

### Callback Fundamentals

- JavaScript functions are **first-class objects**: can be passed as arguments or returned
- **Callback function**: function passed as argument to another function
- **Higher-order function**: function that accepts a function as argument or returns a function

### Synchronous vs Asynchronous Callbacks

| Type             | Execution Timing                                 | Purpose                                   |
| ---------------- | ------------------------------------------------ | ----------------------------------------- |
| **Synchronous**  | Executes immediately                             | Defines logic for `map`, `filter`, `sort` |
| **Asynchronous** | Delays execution until event/operation completes | Event handlers, data fetching, file I/O   |

### Why Async JavaScript Exists

**Default JS Nature:** Synchronous, blocking, single-threaded

- **Synchronous**: Top-down execution, one line at a time
- **Blocking**: Next process won't start until current finishes. Intensive code freezes the app/browser
- **Single-threaded**: One main thread runs tasks. Cannot execute multiple tasks in parallel like multi-threaded languages

**The Problem:** Waiting for DB/file/network blocks the thread. Proceeding without waiting causes errors because data isn't ready yet.

**The Solution:** JavaScript alone can't achieve async behavior. Host environments provide the missing pieces:

- **Browser**: Web APIs (`addEventListener`, `fetch`, `setTimeout`)
- **Node.js**: Core module APIs (`fs`, `http`, `events`)

These environments let you register functions that execute later when specific events occur (time passage, user input, file read complete, network data arrival). This enables non-blocking execution: the main thread stays free while waiting for I/O.

## 4. The `events` Module & Extending `EventEmitter`

### Core Concept

An **event** is an action or occurrence in the application that you can respond to. The `events` module lets you dispatch custom events and respond to them non-blockingly.

### Import & Setup

```js
const EventEmitter = require("node:events");
const emitter = new EventEmitter();
```

> ✅ Named `EventEmitter` because the module returns this class directly.

### API: `.on()` & `.emit()`

```js
// Register listener (callback executes when event fires)
emitter.on("order pizza", (size, topping) => {
  console.log(`Order received. Baking ${size} pizza with ${topping}`);
});

// Emit event (triggers all registered listeners)
emitter.emit("order pizza", "large", "mushrooms");
```

- Arguments after the event name in `.emit()` are automatically passed to listeners
- Multiple listeners can be registered for the same event; they execute in registration order
- **Non-blocking**: Code after `.emit()` continues immediately. Execution doesn't pause for the event.

### Extending `EventEmitter`

Custom modules can inherit event capabilities using ES2015 class syntax:

```js
const EventEmitter = require("node:events");

class PizzaShop extends EventEmitter {
  constructor() {
    super(); // Required to initialize EventEmitter internals
    this.orderNumber = 0;
  }
  order(size, topping) {
    this.orderNumber++;
    this.emit("order", size, topping); // 'this' refers to the instance
  }
}
```

- External code: `const shop = new PizzaShop(); shop.on('order', callback); shop.order('large', 'pepperoni');`
- Enables **decoupling**: Different modules (`DrinkMachine`, `OrderTracker`) can react to the same event without knowing about each other.
- **Note**: Most built-in modules (`fs`, `streams`, `http`) extend `EventEmitter` under the hood.

## 5. Character Sets, Encoding & Buffers

### Binary Data & Character Sets

- Computers store/represent data in binary (zeros and ones)
- **Bit**: A single binary digit (`0` or `1`)
- Numbers convert to binary using base-2 math (e.g., `100` = `2^0×0 + 2^1×0 + 2^2×1` = 4)
- Characters must first convert to a **number** (character code), then to binary
- `'V'.charCodeAt(0)` → `86`
- **Character sets**: Predefined lists mapping characters to numbers (Unicode, ASCII)
- Unicode dictates `86` represents `'V'`

### Character Encoding

- Dictates how to represent a character set number as binary data for storage
- **UTF-8**: Encodes characters in **bytes** (1 byte = 8 bits)
- Pads shorter binary values with leading zeros to form complete bytes
- `'V'` (86) → `01010110` (8 bits)
- Same encoding principles apply to images and videos

### Buffers

- `Buffer` is a **global feature** in Node.js; no import required
- Intentionally small temporary memory area that holds stream data when arrival rate ≠ processing rate
- **Analogy**: Roller coaster line. You control when the ride starts, not when people arrive. People wait in line (buffer) until capacity/conditions are met.
- **Real-world**: Video streaming. Fast connection fills buffer instantly → smooth playback. Slow connection empties buffer → loading spinner → waits for more data → resumes.

### Working with Buffers in Code

```js
// Create buffer
const buffer = Buffer.from("vishwas", "utf-8"); // utf-8 is default, optional

// Inspect
buffer.toJSON();
// → { type: 'Buffer', data: [118, 105, 115, 104, 119, 97, 115] } (Unicode codes)

console.log(buffer);
// → <Buffer 76 69 73 68 77 61 73> (Hexadecimal/base-16 display to avoid terminal flood)

buffer.toString(); // → 'vishwas' (back to readable string)

// Write to buffer (limited memory)
const buf = Buffer.from("vishwas");
buf.write("code");
console.log(buf.toString()); // → 'codeshwas' (overwrites first 4 bytes)

buf.write("code evolution");
console.log(buf.toString()); // → 'code evol' (excess characters skipped/truncated)
```

> ⚠️ Buffers have fixed capacity. Writing beyond capacity overwrites or truncates. Node.js uses buffers internally; you rarely work with them directly, but understanding them is foundational for I/O.

## 6. The `fs` Module: File System Operations

Enables working with the file system on your computer. Internally uses buffers.

### Import

```js
const fs = require("node:fs");
```

### Synchronous Methods (Blocking)

- `fs.readFileSync(path, encoding)`: Blocks main thread until complete, returns data directly
- `fs.writeFileSync(path, content)`: Blocks thread, creates file if missing, overwrites if exists
- ✅ Acceptable only when subsequent code **depends** on the data (e.g., reading config at startup)
- ❌ Poor performance for large files or concurrent users (blocks single thread)

### Asynchronous Methods (Non-Blocking)

- `fs.readFile(path, encoding, callback)`: Starts read, continues execution, invokes callback when complete
- `fs.writeFile(path, content, callback)`: Same async pattern
- Callback follows **error-first pattern**: `(err, data) => { if (err) console.log(err); else console.log(data); }`
- Prevents app freezing under concurrent load
- Callback-based APIs are **preferable when maximal performance** is required (execution time & memory allocation)

### Append Mode Correction

```js
// Append instead of overwrite
fs.writeFile("./greet.txt", " hello vishwas", { flag: "a" }, (err) => {
  // 'a' is the valid POSIX flag for append.
  // Video mentioned 'append' conceptually, but runtime requires 'a'
});
```

## 7. Promise-Based File System (`fs/promises`)

Modern wrapper over callback-based `fs` APIs. Returns Promises.

### Import & Syntax

```js
const fs = require("node:fs/promises");

// .then()/.catch()
fs.readFile("file.txt", "utf-8")
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

// async/await
async function readFile() {
  try {
    const data = await fs.readFile("file.txt", "utf-8");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
readFile();
```

- Top-level `await` only works in `.mjs` files or when `"type": "module"` is set in `package.json`
- In standard `.js` files, wrap `await` in an `async` function
- `async/await` is syntactical sugar over Promises
- **Trade-off**: Callbacks offer slight performance/memory advantages. Promises are recommended for readability/maintainability unless performance is critical.

## 8. Streams & Pipes

### Streams

- A stream is a sequence of data moved from one point to another over time
- Node.js processes data **in chunks** instead of waiting for the entire payload
- Prevents unnecessary memory usage and enables processing as data arrives
- Streams extend `EventEmitter`
- Default buffer size: **64 KB** (small files may arrive in a single chunk)
- `highWaterMark` option controls chunk size (e.g., `highWaterMark: 2` forces 2-byte chunks)

### 4 Stream Types

| Type          | Description                     | Example                      |
| ------------- | ------------------------------- | ---------------------------- |
| **Readable**  | Source of data                  | `fs.createReadStream()`      |
| **Writable**  | Destination for data            | `fs.createWriteStream()`     |
| **Duplex**    | Both readable & writable        | Network sockets              |
| **Transform** | Modifies data during read/write | File compression, encryption |

### Creating & Using Streams Manually

```js
const fs = require("node:fs");

const readable = fs.createReadStream("./file.txt", { encoding: "utf-8" });
const writable = fs.createWriteStream("./file2.txt");

readable.on("data", (chunk) => {
  console.log(chunk); // Logs chunk as it arrives
  writable.write(chunk); // Writes chunk to destination
});
```

### Pipes

- `pipe()` replaces manual `on('data')` + `write()` with a single line
- `readable.pipe(writable)` connects readable stream to writable stream
- `pipe()` **returns the destination stream**, enabling chaining
- Chaining only works if the destination is readable, duplex, or transform

```js
const zlib = require("zlib"); // Provides compression via gzip algorithm
const gzip = zlib.createGzip(); // Transform stream

// Chain: Readable → Transform → Writable
fs.createReadStream("./file.txt")
  .pipe(gzip)
  .pipe(fs.createWriteStream("./file.txt.gz"));
```

> ✅ Pipes automate chunk transfer, prevent manual buffer management, and are the standard pattern for data pipelines.

## 9. The `http` Module & Web Servers

### Client-Server Model

- **Clients**: Internet-connected devices (computers, phones) with web-accessing software (browsers)
- **Servers**: Computers storing web pages, sites, or applications
- **HTTP (Hypertext Transfer Protocol)**: Standard format defining how clients and servers communicate
- Client sends HTTP request → Server responds with HTTP response

### Why Node.js Fits

- Direct OS-level networking access
- Asynchronous event loop handles large volumes of concurrent requests without blocking
- Must respect HTTP format → `http` module provides tools to create compliant servers

### Creating a Server

```js
const http = require("node:http");

const server = http.createServer((req, res) => {
  // req = incoming request info, res = response builder
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("server running on Port 3000");
});
```

- `http.createServer()` accepts a **request listener callback** (executed on every request)
- `res.writeHead(statusCode, headers)` sets status and response headers
- `res.end(data)` sends body and closes connection
- `server.listen(port, callback)` binds to port and starts listening
- **Port analogy**: Door number in an apartment building. Distinguishes servers on the same machine
- Program **does not exit**; waits indefinitely for requests. Terminate with `Ctrl+C`
- `localhost:3000` in browser accesses the server
- `Content-Type` is optional but **highly recommended** to prevent browser guessing
- Logging `req` reveals extensive metadata available for routing, parsing, and security

## 10. Server Responses: Plain Text, JSON, HTML, Templates

### Plain Text

```js
res.writeHead(200, { "Content-Type": "text/plain" });
res.end("Hello World");
```

### JSON Response

- Raw JS objects cannot be sent via `res.end()` → throws `TypeError: chunk must be string, Buffer, or Uint8Array`
- Must serialize to JSON format
- V8 engine provides built-in `JSON` methods

```js
const superhero = { firstName: "Bruce", lastName: "Wayne" };
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify(superhero));
```

- Creates a basic API endpoint. Any HTTP-capable client can consume the data.
- Client uses `JSON.parse()` to convert string back to object.

### HTML Response

- Inline: `res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<h1>Hello</h1>');`
- Without `text/html`, browser displays raw tags
- Better practice: Store HTML in separate file

#### Reading from File (Sync)

```js
const html = fs.readFileSync(__dirname + "/index.html", "utf-8");
res.writeHead(200, { "Content-Type": "text/html" });
res.end(html);
```

- Blocks to wait for file before responding. Loads entire file into temporary buffer.

#### Reading from File (Stream)

```js
res.writeHead(200, { "Content-Type": "text/html" });
fs.createReadStream(__dirname + "/index.html").pipe(res);
```

- More performant. Transfers in chunks without full memory buffer.

> ✅ Always use `__dirname` instead of relative paths for reliable file resolution. Use `node --watch index.js` during development to avoid manual restarts.

### HTML Templates (Dynamic Injection)

- Static HTML needs dynamic values (e.g., logged-in username)
- Basic solution: String replacement

```html
<!-- index.html -->
<h1>Hello {{name}}, welcome to node</h1>
```

```js
let html = fs.readFileSync(__dirname + "/index.html", "utf-8");
const name = "vishwas";
html = html.replace("{{name}}", name);
res.writeHead(200, { "Content-Type": "text/html" });
res.end(html);
```

- `readFileSync` required here to load full template into memory for text manipulation before responding.

## 11. HTTP Routing

### The Problem

All paths (`/`, `/about`, `/api`) currently return the same response. Real websites/APIs route differently.

### `req.url` Property

- Returns the requested path/query string
- `'/'` → root
- `'/about'` → about path
- `'/api'` → api path

### Routing Logic

```js
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Home Page");
  } else if (req.url === "/about") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("About Page");
  } else if (req.url === "/api") {
    const data = { firstName: "Bruce", lastName: "Wayne" };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Page not found");
  }
});
```

- `else` block acts as **404 fallback** for unmatched URLs
- `req.method` provides HTTP method (`GET`, `POST`, `PUT`, `DELETE`)
- Combine `req.url` + `req.method` to handle any routing scenario with raw `http` module
- Real-world enterprise apps rely on web frameworks to handle routing automatically

## 12. Web Frameworks Overview

- **Purpose**: Abstract low-level code so developers focus on application requirements rather than implementation details
- **Frontend parallel**: Angular, React, Vue abstract direct DOM API usage
- **Backend parallel**: Express, Nest, Hapi, Koa, Sails abstract direct `http` module usage
- Frameworks build on top of `http` module, simplifying:
  - Server creation
  - Request/response handling
  - Header/status management
  - Routing logic
- **Express** is highly popular and will be covered in a dedicated follow-up series
- Current series focus remains on raw Node.js to build foundational understanding

### Section 3 Recap

```
✅ Built-in modules ship with Node.js; require explicit import
✅ path → Cross-platform path manipulation & normalization
✅ Callbacks → Foundation of async Node.js programming
✅ events → Custom event-driven architecture via EventEmitter
✅ Character sets/encoding → Unicode, UTF-8, binary representation
✅ Buffers → Raw binary storage for streams & I/O
✅ Asynchronous JS → Non-blocking I/O via host environment APIs
✅ fs → Sync/async file operations, error-first pattern, append flag 'a'
✅ fs/promises → Modern async/await interface
✅ Streams → Chunked, memory-efficient data processing
✅ Pipes → Clean stream chaining (.pipe())
✅ http → Client-server model, server creation, request/response handling
✅ Routing → req.url & req.method for endpoint mapping
✅ Frameworks → Abstraction layer over raw http module
```

## 13. Comprehensive Interview Prep Cheat Sheet

> **Q: "What's the difference between `path.join()` and `path.resolve()`?"**  
> **A**: "`join()` concatenates segments using platform separators and normalizes them. `resolve()` guarantees an absolute path, using the current working directory as a fallback root and resetting to `/` when encountered in the sequence."

> **Q: "Why use the `node:` protocol when importing built-ins?"**  
> **A**: "It clearly identifies the import as a Node.js built-in, makes the identifier a valid absolute URL, and avoids future naming conflicts with third-party packages or language updates."

> **Q: "What is the error-first callback pattern, and why is it used?"**  
> **A**: "It standardizes async error handling. The first parameter is always `err` (null on success, populated on failure). Checking it first ensures failures are caught before processing data. It's standard across Node.js core modules."

> **Q: "How does extending `EventEmitter` enable decoupled architecture?"**  
> **A**: "Classes inherit `.emit()` and `.on()`, allowing them to broadcast events without knowing which modules will listen. External modules attach listeners independently, enabling loose coupling, testability, and modular feature addition."

> **Q: "What's the difference between synchronous and asynchronous callbacks?"**  
> **A**: "Synchronous callbacks execute immediately within the higher-order function (e.g., `Array.map`). Asynchronous callbacks delay execution until a future event or operation completes (e.g., I/O, network), keeping the main thread free."

> **Q: "How do character sets differ from character encoding?"**  
> **A**: "A character set (like Unicode) maps characters to numbers. Character encoding (like UTF-8) dictates how those numbers are converted into binary bits for storage. Set = mapping; Encoding = binary representation format."

> **Q: "Why does Node.js display buffer contents in hexadecimal?"**  
> **A**: "Raw 8-bit binary for every character would flood the terminal. Hexadecimal (base-16) is a compact, human-readable representation of the same binary data."

> **Q: "Why is `readFileSync` used for HTML templates instead of streams?"**  
> **A**: "String replacement requires the complete file content in memory before modification. Streams send chunks immediately, making full-document text manipulation impractical. `readFileSync` ensures the entire template is loaded and modified before responding."

> **Q: "Why can't you pass a raw JavaScript object to `res.end()`?"**  
> **A**: "HTTP transmits text or binary. `res.end()` expects strings, Buffers, or Uint8Arrays. Objects must be serialized to JSON via `JSON.stringify()` before transmission."

> **Q: "How does Node.js handle concurrency if it's single-threaded?"**  
> **A**: "The main thread delegates I/O to the OS/libuv. Node registers callbacks, continues executing other tasks, and only invokes callbacks when I/O completes. This event-driven model prevents blocking while handling many concurrent operations."

> **Q: "When should you prefer callbacks over promises in Node.js?"**  
> **A**: "Callbacks are preferable when maximal performance is required (execution time and memory allocation). Promises introduce slight overhead but are recommended for readability and maintainability unless performance is critical."

> **Q: "How do you implement basic routing in a raw Node.js server?"**  
> **A**: "Use `req.url` inside `createServer` to match paths with `if/else` or `switch`. Return different responses per route. Always include a fallback `else` block returning `404`. Combine with `req.method` for RESTful routing."

## 14. Quick Reference & Debugging

### Module Imports

```js
const path = require("node:path");
const events = require("node:events");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const http = require("node:http");
const zlib = require("zlib");
```

### Response Headers Quick Table

| Content Type | Header Value                             |
| ------------ | ---------------------------------------- |
| Plain Text   | `{ 'Content-Type': 'text/plain' }`       |
| JSON         | `{ 'Content-Type': 'application/json' }` |
| HTML         | `{ 'Content-Type': 'text/html' }`        |

### File System Patterns

```js
// Async with callback
fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});

// Async with promises
const data = await fsPromises.readFile("./data.txt", "utf-8");

// Append
fs.writeFile("./data.txt", "new text", { flag: "a" }, cb);
```

### Stream Pipeline

```js
fs.createReadStream("./input.txt")
  .pipe(zlib.createGzip()) // Transform
  .pipe(fs.createWriteStream("./output.txt.gz")); // Writable
```

### Server Lifecycle

```js
const server = http.createServer((req, res) => {
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});

server.listen(3000, () => console.log("Listening on port 3000"));
// Terminate: Ctrl + C in terminal
```

### Path Resolution Safety

```js
// ✅ Reliable across environments
const configPath = path.join(__dirname, "config", "db.json");

// ❌ Fragile (depends on execution directory)
const badPath = path.join(process.cwd(), "config", "db.json");
```
