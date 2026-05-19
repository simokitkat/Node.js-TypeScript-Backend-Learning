# Node.js Fundamentals — Section 4: Node.js Internals & Event Loop Mastery

> 🎯 **Focus**: Deep dive into Node.js runtime architecture, libuv, thread pool, asynchronous execution model, and the complete Event Loop protocol with all 6 queues, priority rules, and polling behavior.  
> 📌 **Rule**: Every concept, example, experiment, and inference is derived directly from course transcriptions (Lessons 37-48). No external assumptions added.

## Table of Contents

1. [Section Overview & Learning Objectives](#1-section-overview--learning-objectives)
2. [Lesson 37: Node Runtime Recap](#2-lesson-37-node-runtime-recap)
3. [Lesson 38: What Is libuv?](#3-lesson-38-what-is-libuv)
4. [Lesson 39: The Thread Pool](#4-lesson-39-the-thread-pool)
5. [Lesson 40: Thread Pool Size & CPU Core Limits](#5-lesson-40-thread-pool-size--cpu-core-limits)
6. [Lesson 41: Network I/O — Native Async vs. Thread Pool](#6-lesson-41-network-i-o--native-async-vs-thread-pool)
7. [Lesson 42: The Event Loop — Visual Model & 9-Step Protocol](#7-lesson-42-the-event-loop--visual-model--9-step-protocol)
8. [Lesson 43: Microtask Queues — `process.nextTick` vs Promises](#8-lesson-43-microtask-queues--processnexttick-vs-promises)
9. [Lesson 44: Timer Queue — `setTimeout` & FIFO Execution](#9-lesson-44-timer-queue--settimeout--fifo-execution)
10. [Lesson 45: I/O Queue — File System Callbacks & Polling Timing](#10-lesson-45-io-queue--file-system-callbacks--polling-timing)
11. [Lesson 46: I/O Polling & Check Queue Introduction](#11-lesson-46-io-polling--check-queue-introduction)
12. [Lesson 47: Check Queue Deep Dive — `setImmediate` & Microtask Interleaving](#12-lesson-47-check-queue-deep-dive--setimmediate--microtask-interleaving)
13. [Lesson 48: Close Queue — Final Phase & Section Recap](#13-lesson-48-close-queue--final-phase--section-recap)
14. [Complete Event Loop Reference: Queues, Priorities & Rules](#14-complete-event-loop-reference-queues-priorities--rules)
15. [Comprehensive Interview Prep Cheat Sheet](#15-comprehensive-interview-prep-cheat-sheet)
16. [Quick Reference Tables & Debugging Guide](#16-quick-reference-tables--debugging-guide)
17. [Production Best Practices](#17-production-best-practices)

## 1. Section Overview & Learning Objectives

### What This Section Covers

- Node.js runtime architecture: V8, C++ bindings, JavaScript library, external dependencies
- libuv: The C library enabling asynchronous, non-blocking operations
- Thread pool: How Node.js handles blocking operations without freezing the main thread
- Network I/O: Why network operations bypass the thread pool
- The Event Loop: Complete visual model with 6 queues and 9-step execution protocol
- Microtask queues: `process.nextTick` vs Promises priority and starvation risks
- Timer Queue: `setTimeout`/`setInterval` behavior and 0ms→1ms override
- I/O Queue: File system and network callback execution with polling mechanics
- Check Queue: `setImmediate` use cases and microtask interleaving
- Close Queue: Resource cleanup and final Event Loop phase

### Learning Outcomes

✅ Predict execution order of any combination of async methods  
✅ Understand why `setTimeout(fn, 0)` is not "immediate"  
✅ Diagnose Event Loop starvation and timing bugs  
✅ Tune thread pool size for CPU-bound workloads  
✅ Design non-blocking, scalable Node.js applications  
✅ Ace system design and Node.js internals interview questions

## 2. Lesson 37: Node Runtime Recap

### Core Concept: The Three-Layer Runtime Stack

```
Your JavaScript Code
        ↓
JavaScript Library (lib/) → Exposes C++ features to JS (fs.js, http.js, path.js)
        ↓
C++ Bindings (src/) → File system, networking, OS access
        ↓
External Dependencies → V8 (executes JS) + libuv (async I/O, event loop)
        ↓
Operating System
```

| Layer                     | Purpose                                                                   | Examples                                                  |
| ------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| **External Dependencies** | Libraries Node.js requires for functioning                                | `V8` (JavaScript engine), `libuv` (async I/O, event loop) |
| **C++ Features**          | Low-level OS functionality not available in JavaScript                    | File system access, networking, process control           |
| **JavaScript Library**    | Functions/utilities written in JS to tap into C++ features from your code | `fs.js`, `http.js`, `path.js` in the `lib/` folder        |

> 💡 The JavaScript library uses the V8 engine behind the scenes to execute your code, while C++ bindings and libuv handle operations JavaScript cannot perform natively.

### Recap: JavaScript's Default Execution Model

JavaScript, in its most basic form, is **synchronous, blocking, single-threaded**.

| Property            | Meaning                                                                                                    | Consequence                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Synchronous**     | Code executes top-down; only one line executes at any given time                                           | `console.log('A')` always runs before `console.log('B')`            |
| **Blocking**        | Subsequent code waits for the current operation to complete, regardless of duration                        | An intensive 10-second operation freezes all following code         |
| **Single-threaded** | JavaScript uses one thread (the main thread) to execute tasks. Each thread can only do one task at a time. | Cannot run multiple tasks in parallel like multi-threaded languages |

### Browser Impact of Blocking

When a web application executes an intensive chunk of code without returning control to the browser:

- The browser appears **frozen**
- It cannot handle user input or perform other tasks until the code returns control to the processor

### The Core Question

If JavaScript is synchronous, blocking, and single-threaded, **how do we explain the asynchronous behavior** of methods like:

- `fs.readFile()`
- `http.createServer()`

### The Answer: External Pieces Beyond JavaScript

> Just JavaScript is **not sufficient** to explain async behavior.

We need external pieces **outside of JavaScript** to enable asynchronous code.

### In Node.js, that piece is: **libuv**

- An external dependency (C library)
- Provides asynchronous I/O, event loop, and thread pool functionality
- Enables Node.js to delegate blocking operations without freezing the main thread

## 3. Lesson 38: What Is libuv?

### Definition & Attributes

| Attribute           | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| **Type**            | Cross-platform, open-source library                                |
| **Language**        | Written in C                                                       |
| **Role in Node.js** | Handles asynchronous, non-blocking operations                      |
| **Primary Benefit** | Abstracts away the complexity of dealing with the operating system |

### Why Do We Need libuv?

JavaScript is synchronous, blocking, and single-threaded by default. Yet Node.js methods like `fs.readFile()` and `http.createServer()` behave asynchronously.

> **libuv is what enables this asynchronous, non-blocking behavior in Node.js.**

It allows Node.js to:

- Delegate blocking operations (file I/O, DNS lookups, network requests) without freezing the main thread
- Provide a consistent API across Windows, macOS, and Linux
- Manage concurrency efficiently using system-level primitives

### How libuv Works: Two Core Features for Beginners

| Feature         | Purpose                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thread Pool** | Handles operations that cannot be performed asynchronously by the OS (e.g., file system I/O on some platforms) by offloading them to a pool of background threads |
| **Event Loop**  | Coordinates the execution of asynchronous callbacks, ensuring they run in the correct order after their associated operations complete                            |

> 💡 There is more to libuv than just these two features, but thread pool and event loop are the foundational concepts for understanding Node.js's asynchronous architecture.

## 4. Lesson 39: The Thread Pool

### Mental Model: The Single Cashier & Kitchen Crew

Think of the JavaScript main thread as a **single cashier** taking orders. The cashier cannot cook complex meals without freezing the checkout line. Instead, complex orders are handed to a **kitchen crew** (libuv thread pool). The cashier immediately takes the next order. When the kitchen finishes, they ring a bell (callback), and the cashier serves the result. This keeps the checkout line moving without delays.

### Core Concept: libuv Thread Pool

- libuv maintains a **pool of background threads** specifically for offloading time-consuming tasks.
- When the JavaScript main thread encounters a blocking operation, it delegates the work to libuv.
- libuv assigns the task to an available thread in the pool.
- Once the task completes and the callback is ready, the result is passed back to the main thread for execution.
- This architecture ensures the main thread remains **non-blocking** from a developer's perspective.

### 🔬 Experiment 1: Synchronous Execution (`*Sync`)

**Method:** `crypto.pbkdf2Sync()` (CPU-intensive password hashing)
**Setup:** Run the method 1, 2, and 3 times sequentially.
**Observation:**

- 1 call → `~261ms`
- 2 calls → `~520ms` (nearly 2x)
- 3 calls → `~780ms` (nearly 3x)
  **Inference:** Execution time scales linearly (`T × N`). Methods with the `*Sync` suffix **always run on the main thread** and are strictly blocking.

### 🔬 Experiment 2: Asynchronous Execution (`pbkdf2` with callback)

**Method:** `crypto.pbkdf2()` (callback-based version)
**Setup:** Wrap the async call in a loop running 1, 2, and 3 times.
**Observation:**

- 1 call → `~261ms`
- 2 calls → `~260ms` (not 2x)
- 3 calls → `~270ms` (not 3x)
  **Inference:** Execution time remains roughly constant. Each call runs in a **separate thread** within libuv's thread pool. Tasks execute in parallel, so the main thread does not wait.

### Key Inferences & Rules

| Rule                        | Explanation                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **`*Sync` methods**         | Run directly on the JavaScript main thread → blocking execution                                                      |
| **Async I/O & CPU methods** | Offloaded to libuv's thread pool → non-blocking to the main thread                                                   |
| **Thread-level execution**  | Offloaded tasks run **synchronously within their own thread**, but appear asynchronous to the main JavaScript thread |
| **Main thread role**        | Only handles JavaScript execution, callback invocation, and event loop coordination                                  |

### Minimal Working Example (from video experiments)

```js
const crypto = require("crypto");

// Experiment 2: Async pbkdf2 in a loop
const maxCalls = 3;

for (let i = 0; i < maxCalls; i++) {
  const startTime = new Date().getTime();

  crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, key) => {
    if (err) throw err;
    const endTime = new Date().getTime();
    console.log(`Call ${i + 1} completed in: ${endTime - startTime} ms`);
  });
}

console.log("Main thread continues immediately...");
```

## 5. Lesson 40: Thread Pool Size & CPU Core Limits

### Default Size & Detection

- **Default thread pool size:** `4` threads
- **Proof via Experiment 3:**
  - `maxCalls = 4` → All 4 calls complete in ~300ms (parallel execution)
  - `maxCalls = 5` → First 4 finish in ~300ms, 5th call takes ~2x time
  - **Why?** The 5th call must wait for one of the 4 threads to become free.
  - **Inference:** libuv's thread pool contains exactly 4 threads by default.

### Configuring Pool Size

You can increase the number of threads by setting the `UV_THREADPOOL_SIZE` environment variable:

```js
// Must be set BEFORE requiring modules that use the pool
process.env.UV_THREADPOOL_SIZE = 5;
```

### Experiment 4 Results:

- `UV_THREADPOOL_SIZE = 5`, `maxCalls = 5` → All finish in ~300ms
- `maxCalls = 6` → 6th call takes ~2x time
- `UV_THREADPOOL_SIZE = 6`, `maxCalls = 6` → All finish in ~300ms
- **Inference:** Increasing the pool size allows more parallel tasks, improving total completion time for CPU/I/O-heavy operations.

### Performance vs. CPU Cores

Increasing the pool size **only improves performance up to the number of physical CPU cores**.

### Experiment 5 (8-Core Machine):

| Pool Size | Calls | Execution Time | Behavior                                                              |
| --------- | ----- | -------------- | --------------------------------------------------------------------- |
| 8         | 8     | ~270ms         | 1 thread per core → optimal parallel execution                        |
| 16        | 16    | ~550–600ms     | 16 threads share 8 cores → OS context switching → **double the time** |

### Why Performance Degrades:

- When threads > CPU cores, the OS scheduler must **juggle** threads across available cores
- Constant context switching consumes overhead
- Each thread gets only a fraction of core time, doubling execution duration

### Key Rules & Inferences

| Rule                          | Explanation                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- |
| **Default size**              | 4 threads                                                                    |
| **Scaling limit**             | Performance gains cap at the number of physical CPU cores                    |
| **Over-provisioning penalty** | Exceeding core count forces OS thread juggling → increased latency           |
| **Configuration timing**      | `UV_THREADPOOL_SIZE` must be set before modules that use the pool are loaded |

### Experimental Code Pattern (from video)

```js
// Set pool size FIRST
process.env.UV_THREADPOOL_SIZE = 8;

const crypto = require("crypto");
const maxCalls = 8;

for (let i = 0; i < maxCalls; i++) {
  const start = new Date().getTime();

  crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, key) => {
    const end = new Date().getTime();
    console.log(`Call ${i + 1} took: ${end - start}ms`);
  });
}
```

## 6. Lesson 41: Network I/O — Native Async vs. Thread Pool

### Mental Model: The Specialized Delivery Services

Think of async operations in Node.js as two different delivery services:

- **Thread Pool Crew**: A small team of 4 workers who handle heavy packages (file I/O, CPU tasks). If you give them 5 packages, one waits in line.
- **Kernel Express**: The operating system's built-in high-speed network. It doesn't use Node's workers at all—it hands packages directly to the OS, which handles millions of deliveries simultaneously using native, optimized pathways.

> ✅ Network I/O bypasses libuv's thread pool entirely and delegates to the OS kernel's native async mechanisms.

### 🔬 Experiment 6: Network I/O with `https.request`

#### Setup

```js
// Comment out crypto module and thread pool config
// const crypto = require('crypto');
// process.env.UV_THREADPOOL_SIZE = ...;

// Import https module
const https = require("https");

const maxCalls = 12; // Try 1, 2, 4, 6, 12

for (let i = 0; i < maxCalls; i++) {
  const startTime = new Date().getTime();

  https
    .request("https://google.com", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const endTime = new Date().getTime();
        console.log(`Request ${i + 1} completed in: ${endTime - startTime}ms`);
      });
    })
    .end();
}
```

#### Observations

| `maxCalls` | Average Time per Request | Behavior                                    |
| ---------- | ------------------------ | ------------------------------------------- |
| 1          | ~200ms                   | Baseline                                    |
| 2          | ~200–300ms               | No significant increase                     |
| 4          | ~200–300ms               | Still parallel                              |
| 6          | ~200–300ms               | Exceeds default pool size (4) → no slowdown |
| 12         | ~200–300ms               | Triple the pool size → still no slowdown    |

#### Key Inferences

1. **`https.request` does NOT use the thread pool**  
   If it did, requests beyond 4 would queue and show increased latency (as seen with `crypto.pbkdf2`). They don't.

2. **Network I/O is not limited by CPU core count**  
   Even 12 concurrent requests complete in the same time as 1. The OS kernel handles them natively.

### How libuv Handles Async Methods: Two Paths

```
Async Method Called
        ↓
┌─────────────────────────────┐
│ Does the OS have native     │
│ async support for this task?│
└─────────────────────────────┘
        ↓
   ┌────┴────┐
   │         │
  YES        NO
   │         │
   ↓         ↓
Native    Thread Pool
Async     (4 threads default)
Mechanism
   │         │
   ↓         ↓
Delegates to  Offloads to background
OS kernel:    thread; main thread
• epoll (Linux)  continues
• kqueue (macOS)
• IOCP (Windows)
```

#### Path 1: Native Async Mechanisms (Network I/O)

| Feature                | Details                                                     |
| ---------------------- | ----------------------------------------------------------- |
| **Used for**           | Network I/O (`http`, `https`, `net`, `dgram`)               |
| **Mechanism**          | Delegates to OS kernel's native async APIs                  |
| **OS-Specific**        | `epoll` (Linux), `kqueue` (macOS/BSD), `IOCP` (Windows)     |
| **Scalability**        | Limited only by OS kernel capacity, not Node.js thread pool |
| **Thread Pool Impact** | None — bypasses pool entirely                               |

#### Path 2: Thread Pool (File I/O, CPU-Intensive)

| Feature               | Details                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| **Used for**          | File system (`fs`), DNS (`dns.lookup`), compression (`zlib`), crypto (`crypto.pbkdf2`) |
| **Mechanism**         | Offloads to libuv's background thread pool                                             |
| **Default Size**      | 4 threads (`UV_THREADPOOL_SIZE`)                                                       |
| **Scalability Limit** | Number of physical CPU cores; exceeding causes context-switching overhead              |
| **Bottleneck Risk**   | Yes — if all threads are busy, new tasks queue                                         |

### Key Rules & Takeaways

| Rule                                          | Explanation                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Not all async methods use the thread pool** | Network I/O uses native OS async mechanisms; file I/O and CPU-bound tasks use the thread pool |
| **Native async is more scalable**             | Limited by OS kernel, not Node.js internals — can handle far more concurrent connections      |
| **Thread pool is a fallback**                 | Used when the OS lacks native async support for a specific operation                          |
| **Performance tuning differs**                | Increase `UV_THREADPOOL_SIZE` for file/CPU tasks; no tuning needed for network I/O            |

## 7. Lesson 42: The Event Loop — Visual Model & 9-Step Protocol

### Mental Model: The Traffic Controller

Think of the Event Loop as an **airport traffic controller**. Planes (callbacks) arrive from different runways (queues): international flights (timers), cargo (I/O), emergency (microtasks). The controller doesn't let planes land randomly. It follows a strict priority protocol: clear the runway (call stack), then let planes land in a specific order. Only when the runway is empty does the next plane touch down.

### Core Architecture Recap: The Two Engines of Node.js Runtime

```
┌─────────────────┐     ┌─────────────────┐
│   V8 Engine     │     │     libuv       │
│  (JavaScript)   │     │  (C Library)    │
├─────────────────┤     ├─────────────────┤
│ • Memory Heap   │     │ • Native Async  │
│   (variables)   │     │   Mechanisms    │
│ • Call Stack    │     │ • Thread Pool   │
│   (LIFO exec)   │     │ • Event Loop    │
└─────────────────┘     └─────────────────┘
```

| Component       | Purpose                                      | Key Behavior                                                       |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| **Call Stack**  | Tracks function execution in V8              | Last-In-First-Out (LIFO); synchronous code only                    |
| **Memory Heap** | Stores variables, objects, functions         | Allocated when declared; freed by garbage collector                |
| **libuv**       | Handles async operations off the main thread | Uses OS native async APIs or thread pool; never blocks main thread |

### Synchronous Execution Walkthrough

#### Code Example

```js
console.log("first"); // Line 1
console.log("second"); // Line 2
console.log("third"); // Line 3
```

#### Call Stack Timeline

```
Time (ms) | Call Stack State          | Output
----------|---------------------------|--------
0         | [global]                  |
1         | [global, console.log]     | 'first'
1.1       | [global]                  |
2         | [global, console.log]     | 'second'
2.1       | [global]                  |
3         | [global, console.log]     | 'third'
3.1       | [global]                  |
3.2       | [] (empty)                | → Program exits
```

> ✅ Synchronous code: Each function pushes onto stack, executes, pops off. Strict top-down order.

### Asynchronous Execution Walkthrough (`fs.readFile`)

#### Code Example

```js
const fs = require("fs");

console.log("first"); // Line 1
fs.readFile("file.txt", () => {
  // Line 2
  console.log("second"); // Line 3 (callback)
});
console.log("third"); // Line 4
```

#### Execution Timeline

```
Time (ms) | Call Stack State              | libuv Activity        | Output
----------|-------------------------------|-----------------------|--------
0         | [global]                      |                       |
1         | [global, console.log]         |                       | 'first'
1.1       | [global]                      |                       |
2         | [global, fs.readFile]         | Task offloaded        |
2.1       | [global]                      | Reading file (bg)     |
3         | [global, console.log]         |                       | 'third'
3.1       | [global]                      |                       |
3.2       | [] (empty)                    | File read complete    |
4         | [global, callback, console.log]| Callback queued      | 'second'
4.1       | [global, callback]            |                       |
4.2       | [global]                      |                       |
4.3       | []                            |                       | → Program exits
```

**Terminal Output:**

```
first
third
second
```

> 💡 The callback (`console.log('second')`) does NOT execute when the file read completes. It waits until the call stack is empty, then the Event Loop schedules it.

### The Critical Questions (Answered by Event Loop)

| Question                                                         | Answer (via Event Loop)                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| When does Node run a completed async callback?                   | Only when the call stack is empty — never interrupts synchronous flow       |
| Do `setTimeout` and `fs.readFile` callbacks have equal priority? | No — timer callbacks (Timer Queue) execute before I/O callbacks (I/O Queue) |
| What if multiple callbacks are ready simultaneously?             | Execution order follows the Event Loop's queue priority protocol            |

### The Event Loop: Definition & Visual Model

#### What Is the Event Loop?

> Technically a C program within libuv, but conceptually a **design pattern** that orchestrates the execution of synchronous and asynchronous code in Node.js.

#### The 6 Queues (Visual Representation)

```
                    ┌───────────────────────┐
                    │   Microtask Queues    │
                    │  (NOT part of libuv)  │
                    │  • Next Tick Queue    │
                    │  • Promise Queue      │
                    └──────────▲────────────┘
                               │
    ┌─────────────┐            │            ┌─────────────┐
    │ Timer Queue │───────────┼───────────▶│  I/O Queue  │
    │(setTimeout, │  (libuv)  │  (libuv)   │(fs, http,   │
    │ setInterval)│           │            │  net, etc.) │
    └─────────────┘           │            └─────────────┘
                              │
    ┌─────────────┐           │           ┌─────────────┐
    │Check Queue  │◀──────────┼───────────│ Close Queue │
    │(setImmediate│  (libuv)  │  (libuv)  │(socket.close│
    │ Node-only)  │           │           │  events)    │
    └─────────────┘           │           └─────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Call Stack      │
                    │   (V8 Engine)     │
                    │   Sync code only  │
                    └───────────────────┘
```

#### Queue Breakdown

| Queue               | Source                      | Callback Types                             | Notes                                          |
| ------------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------- |
| **Timer Queue**     | libuv                       | `setTimeout`, `setInterval` callbacks      | Executes first among libuv queues              |
| **I/O Queue**       | libuv                       | `fs`, `http`, `net`, `dns` async callbacks | Excludes `close` events and `process.nextTick` |
| **Check Queue**     | libuv                       | `setImmediate` callbacks                   | Node.js-specific; executes after I/O           |
| **Close Queue**     | libuv                       | `socket.on('close')`, stream close events  | Final libuv queue in cycle                     |
| **Next Tick Queue** | Node runtime (NOT libuv)    | `process.nextTick` callbacks               | Highest microtask priority                     |
| **Promise Queue**   | V8/Node runtime (NOT libuv) | `.then()`, `.catch()` from native Promises | Executes after Next Tick                       |

> ⚠️ **Critical distinction**: Microtask queues (Next Tick, Promise) are **not part of libuv** but are integral to Node.js runtime execution order.

### Execution Priority Rules (9-Step Cycle)

**Fundamental Rule**: All synchronous user code executes first. The Event Loop only begins processing queues when the call stack is empty.

```
┌─────────────────────────────────────────┐
│ EVENT LOOP ITERATION (one full cycle)   │
└─────────────────────────────────────────┘

Step 1: Execute ALL callbacks in Microtask Queues
        → Next Tick Queue FIRST
        → Promise Queue SECOND

Step 2: Execute ALL callbacks in Timer Queue
        (setTimeout, setInterval)

Step 3: Execute ALL callbacks in Microtask Queues again
        (Next Tick → Promise)

Step 4: Execute ALL callbacks in I/O Queue
        (fs.readFile, http.request, etc.)

Step 5: Execute ALL callbacks in Microtask Queues again
        (Next Tick → Promise)

Step 6: Execute ALL callbacks in Check Queue
        (setImmediate)

Step 7: Execute ALL callbacks in Microtask Queues again
        (Next Tick → Promise)

Step 8: Execute ALL callbacks in Close Queue
        (socket.close, stream.end events)

Step 9: Execute ALL callbacks in Microtask Queues FINAL TIME
        (Next Tick → Promise)

┌─────────────────────────────────────────┐
│ LOOP DECISION:                          │
│ • More callbacks pending? → Repeat cycle│
│ • All queues empty + stack empty? → Exit│
└─────────────────────────────────────────┘
```

### Key Patterns to Memorize

1. **Microtasks run after EVERY libuv queue** (Steps 1, 3, 5, 7, 9)
2. **Next Tick always beats Promises** within microtasks
3. **Timer Queue executes before I/O Queue** — even if both ready simultaneously
4. **Check Queue (`setImmediate`) runs after I/O** — useful for deferring work until after I/O completes
5. **Close Queue is last** among libuv queues

### Minimal Working Example: Queue Order Verification

```js
const fs = require("fs");

console.log("1. Global start");

// Timer Queue
setTimeout(() => console.log("2. setTimeout"), 0);

// I/O Queue
fs.readFile("test.txt", () => console.log("3. fs.readFile callback"));

// Check Queue
setImmediate(() => console.log("4. setImmediate"));

// Microtask: Next Tick
process.nextTick(() => console.log("5. process.nextTick"));

// Microtask: Promise
Promise.resolve().then(() => console.log("6. Promise.then"));

console.log("7. Global end");
```

**Expected Output** (call stack clears first, then Event Loop cycles):

```
1. Global start
7. Global end
5. process.nextTick     ← Step 1: Next Tick (microtask)
6. Promise.then         ← Step 1: Promise (microtask)
2. setTimeout           ← Step 2: Timer Queue
3. fs.readFile callback ← Step 4: I/O Queue
4. setImmediate         ← Step 6: Check Queue
```

> ✅ This demonstrates: sync code first → microtasks → timers → I/O → check. Close queue omitted (no close events in example).

## 8. Lesson 43: Microtask Queues — `process.nextTick` vs Promises

### Mental Model: The VIP Lane & The Regular Lane

Think of the Event Loop's microtask queues as two airport security lanes:

- **Next Tick Queue (VIP Lane)**: Highest priority. Processes all passengers first, even if new VIPs arrive mid-process.
- **Promise Queue (Regular Lane)**: Processes only after the VIP lane is completely empty.

Both lanes run **before** any other Event Loop queues (Timers, I/O, Check, Close). But VIP always beats Regular, and both beat everything else.

### Core Concept: The Two Microtask Queues

| Queue               | How to Queue a Callback            | Priority                    | Source                                  |
| ------------------- | ---------------------------------- | --------------------------- | --------------------------------------- |
| **Next Tick Queue** | `process.nextTick(callback)`       | Highest (runs first)        | Node.js runtime (NOT libuv)             |
| **Promise Queue**   | `Promise.resolve().then(callback)` | High (runs after Next Tick) | V8 engine + Node.js runtime (NOT libuv) |

> ⚠️ **Critical**: Microtask queues are **NOT part of libuv**. They are part of the Node.js runtime and V8 engine, but they integrate with libuv's Event Loop protocol.

### 🔬 Experiment 1: Synchronous Code vs. Microtasks

#### Code

```js
console.log("1");

process.nextTick(() => {
  console.log("this is process.nextTick one");
});

console.log("2");
```

#### Terminal Output

```
1
2
this is process.nextTick one
```

#### ✅ Inference #1

> **All user-written synchronous JavaScript code takes priority over asynchronous code that the runtime would like to eventually execute.**

The `process.nextTick` callback waits until the call stack is completely empty before running.

### 🔬 Experiment 2: Next Tick Queue vs. Promise Queue Priority

#### Code

```js
Promise.resolve().then(() => {
  console.log("this is promise.resolve one");
});

process.nextTick(() => {
  console.log("this is process.nextTick one");
});
```

#### Terminal Output

```
this is process.nextTick one
this is promise.resolve one
```

#### ✅ Inference #2

> **All callbacks in the Next Tick Queue are executed before callbacks in the Promise Queue.**

Even though the Promise was queued first in code, `process.nextTick` has higher priority within the microtask phase.

### 🔬 Experiment 2.1: Nested Microtasks & Queue Dynamics

#### Code

```js
// 3 Next Tick callbacks
process.nextTick(() => console.log("this is process.nextTick one"));

process.nextTick(() => {
  console.log("this is process.nextTick two");
  // Nested: queues another Next Tick callback
  process.nextTick(() => {
    console.log("this is the inner nextTick inside nextTick");
  });
});

process.nextTick(() => console.log("this is process.nextTick three"));

// 3 Promise callbacks
Promise.resolve().then(() => console.log("this is promise.resolve one"));

Promise.resolve().then(() => {
  console.log("this is promise.resolve two");
  // Nested: queues a Next Tick callback (not a Promise!)
  process.nextTick(() => {
    console.log("this is the inner nextTick inside promise");
  });
});

Promise.resolve().then(() => console.log("this is promise.resolve three"));
```

#### Terminal Output

```
this is process.nextTick one
this is process.nextTick two
this is process.nextTick three
this is the inner nextTick inside nextTick
this is promise.resolve one
this is promise.resolve two
this is promise.resolve three
this is the inner nextTick inside promise
```

#### Step-by-Step Execution

```
Phase 1: Call Stack Executes All Sync Code
├─ Queues 3 callbacks in Next Tick Queue
├─ Queues 3 callbacks in Promise Queue
└─ Call stack empty → Event Loop starts

Phase 2: Event Loop — Step 1 (Microtasks: Next Tick FIRST)
├─ Execute Next Tick #1 → logs 'one'
├─ Execute Next Tick #2 → logs 'two'
│  └─ Nested process.nextTick → queues 'inner nextTick inside nextTick' at END of Next Tick Queue
├─ Execute Next Tick #3 → logs 'three'
├─ Execute newly queued 'inner nextTick inside nextTick' → logs it
└─ Next Tick Queue now EMPTY

Phase 3: Event Loop — Step 1 continued (Microtasks: Promise SECOND)
├─ Execute Promise #1 → logs 'one'
├─ Execute Promise #2 → logs 'two'
│  └─ Nested process.nextTick → queues 'inner nextTick inside promise' in Next Tick Queue
├─ Execute Promise #3 → logs 'three'
└─ Promise Queue now EMPTY

Phase 4: Event Loop — Microtask Re-check (Step 3/5/7/9 pattern)
├─ Next Tick Queue has 1 new callback ('inner nextTick inside promise')
├─ Execute it → logs 'this is the inner nextTick inside promise'
└─ All queues empty → Event Loop exits
```

#### ✅ Inference #2 (Reinforced)

> **Next Tick Queue always drains completely before Promise Queue begins. If new Next Tick callbacks are queued during Promise execution, they wait until the current microtask cycle completes, then run in the next microtask pass.**

### ⚠️ Critical Warning: `process.nextTick` Can Starve the Event Loop

#### The Danger

```js
// ❌ DANGEROUS: Infinite recursion starves I/O, timers, everything else
function starve() {
  process.nextTick(starve);
}
starve();
// Event Loop never progresses past microtasks → app freezes
```

#### Why It Happens

- Microtasks run after **every** libuv queue (Steps 1, 3, 5, 7, 9 in the Event Loop cycle)
- If `process.nextTick` keeps adding new callbacks, the Next Tick Queue never empties
- The Event Loop never reaches Timer, I/O, Check, or Close queues

#### Valid Use Cases (From Node.js Docs)

1. **Error handling / cleanup before Event Loop continues**

   ```js
   function handleError(err, callback) {
     if (err) {
       process.nextTick(() => callback(err)); // Defer error to microtask
       return;
     }
     // ... continue normal flow
   }
   ```

2. **Run callback after call stack unwinds but before Event Loop continues**
   ```js
   function asyncOperation(callback) {
     // Do sync setup...
     process.nextTick(() => {
       // This runs after current sync code, but before any I/O/timers
       callback(null, result);
     });
   }
   ```

> ✅ **Rule of Thumb**: Use `Promise.resolve().then()` for standard async flow. Reserve `process.nextTick` for critical pre-I/O setup or error deferral where timing is essential.

## 9. Lesson 44: Timer Queue — `setTimeout` & FIFO Execution

### Mental Model: The Scheduled Appointment Book

Think of the Timer Queue as a **digital calendar** that sorts appointments by scheduled time. When you call `setTimeout(fn, 500)`, you're not scheduling "run in 500ms" — you're scheduling "become eligible to run after 500ms". The Event Loop checks this calendar at a specific phase (Step 2) and executes all _eligible_ callbacks in FIFO order. Microtasks (VIP lane) always interrupt between timer executions.

### Core Concept: Queueing Timer Callbacks

#### Syntax

```js
// setTimeout: queue callback after minimum delay
setTimeout(() => {
  console.log("callback");
}, delayInMilliseconds);

// setInterval: queue callback repeatedly at interval
setInterval(() => {
  console.log("repeating");
}, intervalInMilliseconds);
```

| Parameter  | Purpose                                                                          |
| ---------- | -------------------------------------------------------------------------------- |
| `callback` | Function to execute when timer expires                                           |
| `delay`    | Minimum milliseconds before callback becomes eligible (0 = eligible immediately) |

> ⚠️ **Critical**: `setTimeout(fn, 0)` does NOT mean "run immediately". It means "queue in Timer Queue as soon as possible". The callback still waits for: (1) call stack to empty, (2) microtasks to drain, (3) Event Loop to reach Timer Queue phase.

### 🔬 Experiment 3: Microtasks vs. Timer Queue Priority

#### Code Setup

```js
// Microtasks: Next Tick Queue (3 callbacks)
process.nextTick(() => console.log("this is process.nextTick one"));
process.nextTick(() => {
  console.log("this is process.nextTick two");
  process.nextTick(() =>
    console.log("this is the inner nextTick inside nextTick"),
  );
});
process.nextTick(() => console.log("this is process.nextTick three"));

// Microtasks: Promise Queue (3 callbacks)
Promise.resolve().then(() => console.log("this is promise.resolve one"));
Promise.resolve().then(() => {
  console.log("this is promise.resolve two");
  process.nextTick(() =>
    console.log("this is the inner nextTick inside promise"),
  );
});
Promise.resolve().then(() => console.log("this is promise.resolve three"));

// Timer Queue: 3 setTimeout callbacks (delay = 0)
setTimeout(() => console.log("set timeout 1"), 0);
setTimeout(() => console.log("set timeout 2"), 0);
setTimeout(() => console.log("set timeout 3"), 0);
```

#### Terminal Output

```
this is process.nextTick one
this is process.nextTick two
this is process.nextTick three
this is the inner nextTick inside nextTick
this is promise.resolve one
this is promise.resolve two
this is promise.resolve three
this is the inner nextTick inside promise
set timeout 1
set timeout 2
set timeout 3
```

#### ✅ Inference #3

> **Callbacks in microtask queues (Next Tick, Promise) are executed before callbacks in the Timer Queue.**

Even with `setTimeout(fn, 0)`, timer callbacks wait until all microtasks complete.

### 🔬 Experiment 4: Microtasks Run BETWEEN Timer Callbacks

#### Code Change (Nested `process.nextTick` inside `setTimeout`)

```js
// ... previous microtask code ...

setTimeout(() => {
  console.log("set timeout 1");
}, 0);

setTimeout(() => {
  console.log("set timeout 2");
  // Nested: queues a Next Tick callback DURING timer execution
  process.nextTick(() => {
    console.log("this is the inner nextTick inside set timeout");
  });
}, 0);

setTimeout(() => {
  console.log("set timeout 3");
}, 0);
```

#### Terminal Output

```
[... all microtasks from Experiment 3 ...]
set timeout 1
set timeout 2
this is the inner nextTick inside set timeout   ← Runs BEFORE set timeout 3
set timeout 3
```

#### ✅ Inference #4

> **Callbacks in microtask queues are executed in between the execution of callbacks in the Timer Queue.**

After **every** Timer Queue callback executes, the Event Loop re-checks microtask queues. If new microtasks were queued (like the nested `process.nextTick`), they run immediately before the next timer callback.

### 🔬 Experiment 5: Timer Queue FIFO Order (Min Heap Behavior)

#### Code

```js
setTimeout(() => console.log("set timeout 1"), 1000); // 1 second
setTimeout(() => console.log("set timeout 2"), 500); // 500ms
setTimeout(() => console.log("set timeout 3"), 0); // 0ms
```

#### Terminal Output

```
set timeout 3
set timeout 2
set timeout 1
```

#### ✅ Inference #5

> **Timer Queue callbacks are executed in FIFO order based on eligibility time (delay), not registration order.**

The callback with the shortest delay (`0ms`) becomes eligible first and executes first, regardless of when it was registered in code.

#### Technical Note: Min Heap, Not Simple Queue

> ⚠️ **Important**: The Timer Queue is technically implemented as a **Min Heap** data structure, not a simple FIFO queue. This allows efficient sorting by expiration time. For learning purposes, thinking of it as a "queue sorted by delay" is sufficient.

```
Registration Order:     [1000ms, 500ms, 0ms]
Min Heap Internal Order: [0ms, 500ms, 1000ms]  ← sorted by expiration time
Execution Order:        [0ms, 500ms, 1000ms]  ← FIFO by eligibility
```

## 10. Lesson 45: I/O Queue — File System Callbacks & Polling Timing

### Mental Model: The Waiting Room for System Tasks

Think of the I/O Queue as a **hospital triage waiting room**. Patients (callbacks) arrive when their tests (file reads, network requests, database queries) finish. They don't jump the line based on VIP status or scheduled appointments. They wait their turn in the I/O Queue, which only gets called after higher-priority queues (Microtasks, Timers) have been fully processed. However, because test completion times depend on external systems, exactly when they arrive relative to short timers can be unpredictable.

### Core Concept: Queueing I/O Callbacks

#### How Callbacks Enter the I/O Queue

Most asynchronous methods from Node.js built-in modules automatically queue their callbacks in the I/O Queue:

```js
const fs = require("fs");

// Callback queues into I/O Queue when file read completes
fs.readFile("index.js", (err, data) => {
  console.log("this is read file 1");
});
```

> ✅ **Rule**: Async built-in methods (`fs`, `http`, `net`, `dns`, etc.) place their completion callbacks in the I/O Queue.

### 🔬 Experiment 6: Microtasks vs. I/O Queue Priority

#### Code

```js
const fs = require("fs");

fs.readFile("index.js", () => {
  console.log("this is read file 1");
});

process.nextTick(() => console.log("this is process.nextTick one"));
Promise.resolve().then(() => console.log("this is promise.resolve one"));
```

#### Terminal Output

```
this is process.nextTick one
this is promise.resolve one
this is read file 1
```

#### ✅ Inference #6

> **Callbacks in microtask queues are executed before callbacks in the I/O Queue.**

Even if the file read completes instantly, its callback waits until both `process.nextTick` and `Promise` queues fully drain.

### 🔬 Experiment 7: Timer Queue (0ms) vs. I/O Queue — The Inconsistency

#### Code

```js
const fs = require("fs");

fs.readFile("index.js", () => {
  console.log("read file 1");
});

setTimeout(() => {
  console.log("set timeout 1");
}, 0);
```

#### Terminal Output (Inconsistent Across Runs)

**Run 1:**

```
read file 1
set timeout 1
```

**Run 2:**

```
set timeout 1
read file 1
```

_(Order varies each time you execute the script)_

#### ✅ Inference #7

> **When running `setTimeout` with a delay of 0 milliseconds alongside an I/O async method, the order of execution can never be guaranteed.**

#### Why the Order Is Unpredictable

1. **0ms → 1ms Override**: Node.js (following Chromium/Timer spec) overrides `0ms` delay to a minimum of `1ms`.
2. **CPU Busy-ness Timing**: The Event Loop must check if the 1ms timer has elapsed when it reaches the Timer Queue phase.
   - If the loop reaches Timer Queue at **<1ms** (CPU is idle/fast) → timer not yet eligible → loop skips to I/O Queue → runs `readFile` → runs `setTimeout` in next loop iteration.
   - If the loop reaches Timer Queue at **>1ms** (CPU was busy) → timer already elapsed → runs `setTimeout` first → then proceeds to I/O Queue.
3. **Result**: Execution order depends on exact CPU timing, making it non-deterministic.

### 🔬 Experiment 8: Combined Priority (Guaranteed Order)

#### Code (With Busy Wait to Force Timer Elapse)

```js
const fs = require("fs");

fs.readFile("index.js", () => {
  console.log("read file 1");
});

process.nextTick(() => console.log("next tick callback"));
Promise.resolve().then(() => console.log("promise callback"));
setTimeout(() => console.log("timer callback"), 0);

// Busy loop to force CPU time to pass
for (let i = 0; i < 1e8; i++) {}
```

#### Terminal Output (Consistent)

```
next tick callback
promise callback
timer callback
read file 1
```

#### ✅ Inference #8

> **I/O Queue callbacks are executed after microtask queue callbacks and timer queue callbacks.**

The busy `for` loop ensures enough CPU time passes so the 1ms timer definitely elapses before the Event Loop reaches the Timer Queue phase, eliminating the timing uncertainty seen in Experiment 7.

## 11. Lesson 46: I/O Polling & Check Queue Introduction

### Mental Model: The Mail Sorter's Schedule

Think of the Event Loop as a mail sorter checking different bins in a strict order. The I/O bin is checked at a specific time slot. If a package (file read) arrives at the post office but hasn't been processed yet, the sorter visits the I/O bin, finds it empty, and moves to the next bin (Check). Meanwhile, the package finishes processing and gets dropped into the I/O bin _after_ the sorter already left. It must wait for the next round. The Check bin, visited later in the same round, gets processed first.

### Core Concepts: I/O Polling & Check Queue

| Concept          | Explanation                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Check Queue**  | Queued via `setImmediate(callback)`. Executes after the I/O Queue phase in the Event Loop cycle      |
| **I/O Polling**  | The Event Loop must actively poll to check if pending I/O operations have completed                  |
| **Queue Timing** | I/O callbacks are **only added** to the I/O Queue _after_ polling confirms the operation is complete |

> ⚠️ **Critical**: Calling an async I/O method does NOT immediately place its callback in the I/O Queue. The callback only enters the queue when the Event Loop polls and confirms the operation has finished.

### 🔬 Experiment 9: `setImmediate` vs. `fs.readFile`

#### Code Setup

```js
const fs = require("fs");

fs.readFile("index.js", () => console.log("read file 1"));
process.nextTick(() => console.log("next tick 1"));
Promise.resolve().then(() => console.log("promise 1"));
setTimeout(() => console.log("set timeout 1"), 0);

// Busy loop to force CPU time to pass (from previous experiment)
for (let i = 0; i < 1e8; i++) {}

// Queue callback in Check Queue
setImmediate(() => console.log("set immediate 1"));
```

#### Terminal Output

```
next tick 1
promise 1
set timeout 1
set immediate 1
read file 1
```

> ⚠️ **Surprising Result**: `set immediate 1` logs **before** `read file 1`, even though the Check Queue comes _after_ the I/O Queue in the Event Loop visualization.

### Step-by-Step Execution Walkthrough

```
Phase 1: Synchronous Code Executes
├─ fs.readFile() starts (callback NOT yet in I/O Queue)
├─ process.nextTick() → queues in Next Tick Queue
├─ Promise.resolve() → queues in Promise Queue
├─ setTimeout() → queues in Timer Queue
├─ setImmediate() → queues in Check Queue
└─ Busy loop runs → CPU time passes

Phase 2: Event Loop Iteration 1
├─ Microtasks drain: Next Tick → Promise
├─ Timer Queue runs: 'set timeout 1'
├─ Reaches I/O Queue phase → POLLING BEGINS
│  ├─ Asks: "Has readFile completed?"
│  └─ Answer: YES → Callback queued in I/O Queue
│  ⚠️ But I/O Queue phase is ALREADY PASSED for this iteration
├─ Moves to Check Queue → finds callback → runs 'set immediate 1'
└─ Iteration 1 ends

Phase 3: Event Loop Iteration 2
├─ Microtasks/Timer queues empty
├─ Reaches I/O Queue phase → polls → finds queued readFile callback
└─ Executes callback → logs 'read file 1'
```

#### ✅ Inference #9

> **I/O events are polled. Callback functions are added to the I/O Queue only after the I/O operation is complete.**

Because polling happens when the Event Loop reaches the I/O Queue phase, callbacks that complete during or after this phase must wait for the _next_ iteration. This allows the Check Queue (which runs later in the _current_ iteration) to execute before the I/O callback.

## 12. Lesson 47: Check Queue Deep Dive — `setImmediate` & Microtask Interleaving

### Mental Model: The Post-Processing Station

Think of the Check Queue as a **quality control station** at the end of an assembly line. Products (I/O operations) finish their main processing, then visit this station for final checks (`setImmediate`). However, if a product needs urgent rework (microtasks like `process.nextTick` or `Promise.then`), that rework happens immediately—before the product even reaches the quality control station. And if rework is requested _during_ quality control, it still interrupts before the next product is checked.

### Core Concept: The Check Queue (`setImmediate`)

#### Syntax & Purpose

```js
// Queue callback in Check Queue (executes after I/O Queue phase)
setImmediate(() => {
  console.log("This runs in Check Queue");
});
```

| Property             | Details                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| **Queue Position**   | Executes after I/O Queue, before Close Queue in Event Loop cycle                |
| **Use Case**         | Deferring work until after I/O polling completes but before next loop iteration |
| **Node.js Specific** | Not available in browsers; part of Node.js runtime                              |

> ⚠️ **Critical**: `setImmediate` callbacks are queued immediately when called, but they only execute when the Event Loop reaches the Check Queue phase—which may be in the current or next iteration depending on I/O polling timing.

### 🔬 Experiment 10: `setImmediate` Inside I/O Callback

#### Code

```js
const fs = require("fs");

fs.readFile("index.js", () => {
  console.log("read file 1");
  // Queue Check Queue callback AFTER I/O polling completes
  setImmediate(() => {
    console.log("this is inner setImmediate inside read file");
  });
});

process.nextTick(() => console.log("next tick 1"));
Promise.resolve().then(() => console.log("promise 1"));
setTimeout(() => console.log("set timeout 1"), 0);

// Busy loop to ensure timer elapsed
for (let i = 0; i < 1e8; i++) {}
```

#### Terminal Output

```
next tick 1
promise 1
set timeout 1
read file 1
this is inner setImmediate inside read file
```

#### ✅ Inference #10

> **Check Queue callbacks are executed after microtask queue callbacks, timer queue callbacks, and I/O Queue callbacks.**

When `setImmediate` is called inside an I/O callback, it's queued after I/O polling has already added the I/O callback to the queue. Thus, the I/O callback runs first, then the Check Queue callback runs later in the same or next iteration.

### 🔬 Experiment 11: Microtasks Inside I/O Callback (Before `setImmediate`)

#### Code

```js
const fs = require("fs");

fs.readFile("index.js", () => {
  console.log("read file 1");

  // Queue microtasks AND Check Queue callback inside I/O callback
  process.nextTick(() => {
    console.log("this is inner process.nextTick inside read file");
  });

  Promise.resolve().then(() => {
    console.log("this is inner promise.resolve inside read file");
  });

  setImmediate(() => {
    console.log("this is inner setImmediate inside read file");
  });
});

// ... same microtasks/timer setup as before ...
```

#### Terminal Output

```
next tick 1
promise 1
set timeout 1
read file 1
this is inner process.nextTick inside read file
this is inner promise.resolve inside read file
this is inner setImmediate inside read file
```

#### ✅ Inference #11

> **Microtask queue callbacks are executed after I/O callbacks and before Check Queue callbacks.**

Even though all three (`nextTick`, `Promise`, `setImmediate`) are queued inside the same I/O callback, microtasks have higher priority and run before the Check Queue callback.

### 🔬 Experiment 12: Microtasks Inside Check Queue Callback

#### Code

```js
// Queue three Check Queue callbacks
setImmediate(() => console.log("set immediate 1"));

setImmediate(() => {
  console.log("set immediate 2");
  // Queue microtasks INSIDE Check Queue callback
  process.nextTick(() => console.log("next tick 1"));
  Promise.resolve().then(() => console.log("promise.resolve 1"));
});

setImmediate(() => console.log("set immediate 3"));
```

#### Terminal Output

```
set immediate 1
set immediate 2
next tick 1
promise.resolve 1
set immediate 3
```

#### ✅ Inference #12

> **Microtask queue callbacks are executed in between Check Queue callbacks.**

When a `setImmediate` callback queues new microtasks, those microtasks run immediately after that callback finishes—before the next `setImmediate` callback executes.

### 🔬 Experiment 13: Timer Anomaly with `setImmediate`

#### Code

```js
setTimeout(() => console.log("set timeout 1"), 0);
setImmediate(() => console.log("set immediate 1"));
```

#### Terminal Output (Inconsistent Across Runs)

**Run 1:**

```
set timeout 1
set immediate 1
```

**Run 2:**

```
set immediate 1
set timeout 1
```

#### ✅ Inference #13

> **When running `setTimeout` with 0ms delay alongside `setImmediate`, the order of execution can never be guaranteed.**

Same root cause as Experiment 7: Node overrides `0ms` to minimum `1ms`, and CPU timing determines whether the timer is eligible when the Event Loop reaches the Timer Queue phase.

## 13. Lesson 48: Close Queue — Final Phase & Section Recap

### Mental Model: The Cleanup Crew

Think of the Close Queue as the **janitorial crew** that arrives after everyone else has left the office. All the main work is done: meetings (I/O), scheduled appointments (Timers), quality checks (Check Queue). Only when the building is empty does the cleanup crew arrive to handle shutdown tasks: closing file handles, releasing sockets, emitting 'close' events. They always run last in each Event Loop iteration.

### Core Concept: The Close Queue

#### How to Queue a Callback

```js
const fs = require("fs");

// Create a readable stream
const readable = fs.createReadStream("file.txt");

// Close the stream
readable.close();

// Attach listener to 'close' event → queues callback in Close Queue
readable.on("close", () => {
  console.log("this is from readable stream close event callback");
});
```

| Property           | Details                                                                               |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Queue Position** | Executes LAST in the Event Loop cycle, after Check Queue                              |
| **Trigger**        | Attaching listeners to `'close'` events on streams, sockets, or other async resources |
| **Use Case**       | Cleanup tasks: releasing resources, logging shutdown, finalizing state                |

> ✅ **Rule**: Close Queue callbacks execute after all other queues (Next Tick, Promise, Timer, I/O, Check) have been processed in the current iteration.

### 🔬 Experiment 14: Complete Event Loop Priority Verification

#### Code Setup

```js
const fs = require("fs");

// Close Queue: stream 'close' event listener
const readable = fs.createReadStream("file.txt");
readable.close();
readable.on("close", () => {
  console.log("this is from readable stream close event callback");
});

// Check Queue
setImmediate(() => console.log("set immediate 1"));

// Timer Queue
setTimeout(() => console.log("set timeout 1"), 0);

// Microtask: Promise Queue
Promise.resolve().then(() => console.log("promise.resolve 1"));

// Microtask: Next Tick Queue
process.nextTick(() => console.log("next tick 1"));

// Busy loop to ensure timer elapsed
for (let i = 0; i < 1e8; i++) {}
```

#### Terminal Output

```
next tick 1
promise.resolve 1
set timeout 1
set immediate 1
this is from readable stream close event callback
```

#### ✅ Inference #14

> **Close Queue callbacks are executed after all other queues' callbacks in a given iteration of the Event Loop.**

The execution order confirms the complete priority hierarchy:

1. Next Tick Queue
2. Promise Queue
3. Timer Queue
4. Check Queue
5. Close Queue

_(I/O Queue omitted in this experiment since no async I/O method was called)_

### Visual Walkthrough: Full Event Loop Cycle

```
Phase 1: Synchronous Code Executes
├─ fs.createReadStream() + .close() → stream closing initiated
├─ .on('close', cb) → callback queued in Close Queue
├─ setImmediate() → queued in Check Queue
├─ setTimeout() → queued in Timer Queue
├─ Promise.resolve().then() → queued in Promise Queue
├─ process.nextTick() → queued in Next Tick Queue
├─ Busy loop runs → CPU time passes
└─ Call stack empty → Event Loop starts

Phase 2: Event Loop Iteration 1
├─ Step 1: Microtasks
│  ├─ Next Tick Queue → executes → logs 'next tick 1'
│  └─ Promise Queue → executes → logs 'promise.resolve 1'
├─ Step 2: Timer Queue → executes → logs 'set timeout 1'
├─ Step 4: I/O Queue → empty (no async I/O called) → skip
├─ Step 6: Check Queue → executes → logs 'set immediate 1'
├─ Step 8: Close Queue → executes → logs 'close event callback'
└─ All queues empty → Loop exits
```

> 💡 **Key Pattern**: The Close Queue is always the final phase. If no work remains after it executes, the Event Loop terminates and the Node.js process exits.

## 14. Complete Event Loop Reference: Queues, Priorities & Rules

### Final Verified Execution Order

```
┌─────────────────────────────────────────┐
│ EVENT LOOP ITERATION (one full cycle)   │
└─────────────────────────────────────────┘

Step 1: Execute ALL callbacks in Microtask Queues
        → Next Tick Queue (process.nextTick) FIRST
        → Promise Queue (Promise.then) SECOND

Step 2: Execute ALL callbacks in Timer Queue
        (setTimeout, setInterval) → FIFO by elapsed time

Step 3: Execute ALL callbacks in Microtask Queues AGAIN
        (Next Tick → Promise)

Step 4: Execute ALL callbacks in I/O Queue
        (fs.readFile, http.request, net, dns, etc.)

Step 5: Execute ALL callbacks in Microtask Queues AGAIN
        (Next Tick → Promise)

Step 6: Execute ALL callbacks in Check Queue
        (setImmediate)

Step 7: Execute ALL callbacks in Microtask Queues AGAIN
        (Next Tick → Promise)

Step 8: Execute ALL callbacks in Close Queue
        (stream.on('close'), socket.on('close'))

Step 9: Execute ALL callbacks in Microtask Queues FINAL TIME
        (Next Tick → Promise)

┌─────────────────────────────────────────┐
│ LOOP DECISION:                          │
│ • More callbacks pending? → Repeat cycle│
│ • All queues empty + stack empty? → Exit│
└─────────────────────────────────────────┘
```

### How to Queue Callbacks in Each Queue

| Queue         | Method to Queue Callback                         | Example                                                |
| ------------- | ------------------------------------------------ | ------------------------------------------------------ |
| **Next Tick** | `process.nextTick(callback)`                     | `process.nextTick(() => console.log('next'))`          |
| **Promise**   | `Promise.resolve().then(callback)`               | `Promise.resolve().then(() => console.log('promise'))` |
| **Timer**     | `setTimeout(callback, delay)` or `setInterval()` | `setTimeout(() => console.log('timer'), 0)`            |
| **I/O**       | Execute async built-in method                    | `fs.readFile('file.txt', cb)`                          |
| **Check**     | `setImmediate(callback)`                         | `setImmediate(() => console.log('check'))`             |
| **Close**     | Attach listener to `'close'` event               | `stream.on('close', cb)`                               |

### Universal Rules (Memorize These)

1. **Synchronous code ALWAYS executes before any async callback** — call stack must be empty first
2. **Microtasks run after EVERY libuv queue callback** — Steps 1, 3, 5, 7, 9 in the cycle
3. **Next Tick Queue has absolute priority over Promise Queue** — within microtasks
4. **Timer Queue executes before I/O Queue** — even if both ready simultaneously
5. **I/O callbacks are queued only AFTER polling confirms completion** — timing can cause apparent reordering
6. **`setTimeout(fn, 0)` → minimum 1ms delay** — ordering with I/O/Check is non-deterministic
7. **Close Queue is ALWAYS last** — cleanup runs after all other work completes
8. **Loop exits only when call stack + ALL queues are empty** — open handles/timers keep it alive

## 15. Comprehensive Interview Prep Cheat Sheet

### Runtime Architecture

> **Q: "What are the three major components of the Node.js runtime?"**  
> **A**: "External dependencies (V8 for JS execution, libuv for async I/O), C++ features for OS-level operations (file system, networking), and the JavaScript library (lib/) that exposes those C++ features to JavaScript code."

> **Q: "What is libuv and why does Node.js need it?"**  
> **A**: "libuv is a cross-platform, open-source C library that handles asynchronous, non-blocking operations in Node.js. It abstracts away OS complexity and provides the thread pool and event loop mechanisms that enable Node.js to perform I/O without blocking the single JavaScript thread."

### Thread Pool

> **Q: "What is the default size of libuv's thread pool, and how do you change it?"**  
> **A**: "The default size is 4 threads. You can change it by setting the `UV_THREADPOOL_SIZE` environment variable before loading Node.js modules that utilize the pool (e.g., `process.env.UV_THREADPOOL_SIZE = 8`)."

> **Q: "Does increasing the thread pool size always improve performance?"**  
> **A**: "No. Performance improves only up to the number of available CPU cores. Beyond that, the OS must schedule more threads than physical cores, causing context switching overhead that actually increases execution time."

> **Q: "Why doesn't `https.request` use libuv's thread pool?"**  
> **A**: "Network I/O operations have native asynchronous support in all major operating systems (epoll, kqueue, IOCP). libuv delegates these directly to the OS kernel, bypassing the thread pool entirely. This allows Node.js to handle thousands of concurrent network connections without thread pool limitations."

### Event Loop Fundamentals

> **Q: "What is the Event Loop in Node.js?"**  
> **A**: "The Event Loop is a mechanism within libuv that orchestrates the execution of asynchronous callbacks. It processes six queues in a strict priority order (Timers → I/O → Check → Close), with microtasks (Next Tick, Promises) executing after each queue. It only runs when the call stack is empty, ensuring synchronous code always completes first."

> **Q: "What's the execution order of `setTimeout`, `fs.readFile`, `setImmediate`, `process.nextTick`, and `Promise.resolve().then()`?"**  
> **A**: "1) `process.nextTick` (microtask, highest priority), 2) `Promise.then` (microtask), 3) `setTimeout` (Timer Queue), 4) `fs.readFile` (I/O Queue), 5) `setImmediate` (Check Queue). Microtasks run after each libuv queue, and Next Tick always precedes Promises within microtasks."

> **Q: "Why does `setTimeout(fn, 0)` not execute immediately?"**  
> **A**: "Because the Event Loop only processes the Timer Queue after the call stack is empty AND after microtasks from the current cycle. Even with 0ms delay, the callback waits for synchronous code and microtasks to complete first."

> **Q: "Are microtask queues part of libuv?"**  
> **A**: "No. The Next Tick Queue (`process.nextTick`) and Promise Queue are part of the Node.js runtime and V8 engine, respectively. However, they integrate with libuv's Event Loop and follow its execution protocol."

> **Q: "When does the Event Loop exit?"**  
> **A**: "When the call stack is empty AND all six queues (Timer, I/O, Check, Close, Next Tick, Promise) contain no pending callbacks. If any queue has work, the loop continues for another iteration."

### Microtask Priority & Starvation

> **Q: "What's the execution order of `console.log('A')`, `process.nextTick(() => console.log('B'))`, and `Promise.resolve().then(() => console.log('C'))`?"**  
> **A**: "A, B, C. Synchronous code (`console.log('A')`) runs first. Then microtasks execute: Next Tick Queue (`B`) has priority over Promise Queue (`C`)."

> **Q: "If I queue a `process.nextTick` callback inside a `.then()` handler, when does it run?"**  
> **A**: "It gets queued in the Next Tick Queue during Promise Queue execution. Since Next Tick has higher priority, it won't run immediately. Instead, it waits until the current microtask cycle (all Promises) completes, then runs in the next microtask pass before any libuv queues."

> **Q: "Why is `process.nextTick` discouraged for general async flow?"**  
> **A**: "Because it has the highest priority in the Event Loop. Endless `nextTick` recursion can starve I/O, timers, and other critical queues, freezing the application. Promises provide sufficient priority for most use cases without starvation risk."

### Timer & I/O Timing Nuances

> **Q: "Why is the execution order of `setTimeout(fn, 0)` and `fs.readFile()` non-deterministic?"**  
> **A**: "Node.js overrides `0ms` to a minimum `1ms` delay. Whether the timer callback runs before or after the I/O callback depends on exact CPU timing when the Event Loop reaches the Timer Queue phase. If <1ms has elapsed, I/O runs first. If >1ms has elapsed, the timer runs first."

> **Q: "Why does `setImmediate` sometimes execute before an `fs.readFile` callback, even though the Check Queue comes after the I/O Queue?"**  
> **A**: "Because the Event Loop polls for I/O completion when it reaches the I/O Queue phase. If the I/O operation completes after the I/O phase has already been visited in the current loop iteration, its callback is queued for the next iteration. `setImmediate` runs in the current iteration's Check Queue phase, so it executes first."

> **Q: "What is I/O polling in the context of the Node.js Event Loop?"**  
> **A**: "I/O polling is the process where the Event Loop checks whether pending I/O operations have actually completed. Callbacks are only added to the I/O Queue after polling confirms completion. This means callbacks aren't available the moment the async method is called, but only when the operation finishes and the poll detects it."

### Close Queue & Process Lifecycle

> **Q: "What is the Close Queue in Node.js's Event Loop, and when does it execute?"**  
> **A**: "The Close Queue is the final phase in each Event Loop iteration. It executes callbacks attached to `'close'` events on streams, sockets, or other async resources. It runs after all other queues (Next Tick, Promise, Timer, I/O, Check) have been processed. If no work remains after the Close Queue, the Event Loop exits and the Node.js process terminates."

> **Q: "How do you queue a callback in the Close Queue?"**  
> **A**: "By attaching an event listener to the `'close'` event on an async resource: `stream.on('close', callback)`, `socket.on('close', callback)`, or `server.on('close', callback)`. The callback is queued when the resource emits the 'close' event."

> **Q: "Why might a Node.js process not exit even after all code appears to have finished?"**  
> **A**: "The Event Loop keeps running as long as any queue has pending callbacks or any async resource (like an open socket or timer) is still active. To force exit, ensure all resources are closed and no timers/intervals remain pending."

## 16. Quick Reference Tables & Debugging Guide

### Module Imports for Internals Experiments

```js
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const crypto = require("crypto");
const https = require("https");
const { Readable } = require("stream");
```

### Queue Priority Summary (Fast Lookup)

```
HIGHEST PRIORITY
│
├─ 1. Next Tick Queue      → process.nextTick()
├─ 2. Promise Queue        → Promise.resolve().then()
│
├─ 3. Timer Queue          → setTimeout(), setInterval() [FIFO by delay]
│
├─ 4. I/O Queue            → fs.readFile, http.request, etc. [polling-dependent]
│
├─ 5. Check Queue          → setImmediate()
│
├─ 6. Close Queue          → stream.on('close'), socket.on('close')
│
LOWEST PRIORITY / EXIT
```

### Microtask Re-Check Points (Critical!)

```
After EVERY callback in these queues, microtasks are re-checked:
├─ Timer Queue (after each setTimeout/setInterval callback)
├─ I/O Queue (after each fs/http/net callback)
├─ Check Queue (after each setImmediate callback)
├─ Close Queue (after each 'close' event callback)

Within microtasks: Next Tick ALWAYS runs before Promises
```

### Debugging Event Loop Timing Issues

```js
// 1. Log queue entry points
console.log("[Sync] Start");
process.nextTick(() => console.log("[NextTick] Queued"));
Promise.resolve().then(() => console.log("[Promise] Queued"));
setTimeout(() => console.log("[Timer] Queued"), 0);
fs.readFile("test.txt", () => console.log("[I/O] Queued"));
setImmediate(() => console.log("[Check] Queued"));

// 2. Measure execution time
const start = process.hrtime.bigint();
// ... your async operations ...
process.on("exit", () => {
  const end = process.hrtime.bigint();
  console.log(`Total runtime: ${(end - start) / 1_000_000n}ms`);
});

// 3. Check active handles (why isn't process exiting?)
console.log("Active handles:", process._getActiveHandles().length);
console.log("Active requests:", process._getActiveRequests().length);

// 4. Force exit if needed (debugging only)
// process.exit(0);
```

### Common Pitfalls & Fixes

| Symptom                           | Likely Cause                                     | Solution                                                              |
| --------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| Callbacks run in unexpected order | Relying on implicit queue ordering               | Chain operations explicitly with callbacks/Promises                   |
| Process won't exit                | Open handles/timers still active                 | Close streams, clear intervals, call `server.close()`                 |
| `setTimeout(fn, 0)` seems delayed | 0ms → 1ms override + microtask priority          | Use `process.nextTick` for true "after sync" timing                   |
| App freezes under load            | `process.nextTick` recursion starving Event Loop | Replace with `setImmediate` or Promise-based deferral                 |
| File reads slower than expected   | Thread pool exhausted (default 4 threads)        | Increase `UV_THREADPOOL_SIZE` if CPU-bound; use streams for I/O-bound |

## 17. Production Best Practices

### Thread Pool Tuning

```js
// Set BEFORE requiring modules that use the pool
process.env.UV_THREADPOOL_SIZE = Math.max(4, require("os").cpus().length);

// Only increase for CPU-bound workloads (crypto, compression)
// Network I/O doesn't use the pool — no tuning needed
```

### Avoiding Event Loop Starvation

```js
// ❌ DANGEROUS: Unbounded nextTick recursion
function processItems(items, index = 0) {
  if (index >= items.length) return;
  handle(items[index]);
  process.nextTick(() => processItems(items, index + 1)); // Can starve I/O
}

// ✅ SAFE: Use setImmediate or chunked processing
function processItems(items) {
  for (const item of items) {
    handle(item);
  }
  // Or: use async/await with batching for large arrays
}
```

### Explicit Async Chaining (Never Rely on Implicit Ordering)

```js
// ❌ UNRELIABLE: Race condition between timer and I/O
fs.readFile("./config.json", handleConfig);
setTimeout(startServer, 0); // May run before or after config loads

// ✅ RELIABLE: Chain explicitly via I/O callback or Promise
fs.readFile("./config.json", (err, data) => {
  if (err) throw err;
  const config = JSON.parse(data);
  startServer(config); // Guaranteed to run after file read
});

// ✅ MODERN: Use Promises/async-await
async function loadAndStart() {
  const data = await fs.promises.readFile("./config.json", "utf-8");
  const config = JSON.parse(data);
  startServer(config);
}
```

### Resource Cleanup with Close Queue

```js
const fs = require("fs");

function processFile(filepath, onComplete) {
  const stream = fs.createReadStream(filepath);

  stream.on("data", (chunk) => {
    // Process data chunks...
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    stream.close();
  });

  // Close Queue: guaranteed to run after all I/O completes
  stream.on("close", () => {
    console.log("Stream closed, resources released");
    onComplete(); // Signal completion to caller
  });

  // Trigger cleanup when done
  setTimeout(() => stream.close(), 1000);
}
```

### Graceful Shutdown Pattern

```js
const http = require("http");
const server = http.createServer(handler);

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

// Close Queue: handle graceful shutdown
server.on("close", () => {
  console.log("HTTP server closed");
  // Release database connections, clear caches, log metrics
  cleanupResources();
});

// Trigger shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(); // Queues 'close' event callback
});
```

## 🎓 Section 4 Complete ✅

```
✅ Node.js Runtime Architecture
   ├─ V8 Engine: Executes JavaScript (Call Stack + Memory Heap)
   ├─ C++ Bindings: OS-level features (file system, networking)
   ├─ JavaScript Library (lib/): Exposes C++ features to JS code
   └─ External Dependencies: V8 + libuv

✅ libuv: The Async Engine
   ├─ Cross-platform C library for async I/O
   ├─ Thread Pool: Handles blocking operations (file I/O, CPU-bound crypto)
   │  ├─ Default size: 4 threads
   │  ├─ Configurable via UV_THREADPOOL_SIZE
   │  └─ Limited by CPU core count for optimal performance
   └─ Native Async Mechanisms: Handles network I/O via OS kernel
      ├─ epoll (Linux), kqueue (macOS), IOCP (Windows)
      └─ Scales to OS limits, not thread pool size

✅ Asynchronous JavaScript Foundations
   ├─ JavaScript is synchronous, blocking, single-threaded by default
   ├─ Async behavior enabled by host environment (libuv in Node.js)
   ├─ Callback pattern: error-first (err, data) standard
   └─ Promises: Standardized async handling with .then()/.catch()

✅ Event Loop: The Coordination Protocol
   ├─ 6 Queues with strict priority order:
   │  1. Next Tick Queue (process.nextTick) → HIGHEST
   │  2. Promise Queue (Promise.then)
   │  3. Timer Queue (setTimeout, setInterval)
   │  4. I/O Queue (fs, http, net, dns callbacks)
   │  5. Check Queue (setImmediate)
   │  6. Close Queue (stream.on('close'))
   ├─ Microtasks run after EVERY libuv queue callback
   ├─ I/O Polling: Callbacks queued only after operation completes
   └─ Loop exits when call stack + all queues are empty

✅ Critical Rules & Patterns
   ├─ Synchronous code ALWAYS executes before any async callback
   ├─ process.nextTick has highest priority; can starve Event Loop if misused
   ├─ setTimeout(fn, 0) → minimum 1ms delay; ordering with I/O is non-deterministic
   ├─ Never rely on implicit queue ordering; chain operations explicitly
   ├─ Use Promises/async-await for readable async flow; callbacks for max performance
   └─ Close Queue ensures cleanup runs after all other work completes
```

> 🎯 **You now master Node.js internals**: You can predict callback execution order, diagnose timing bugs, tune thread pool size, and design non-blocking, scalable applications. This foundation is essential for senior Node.js roles and system design interviews.

> ➡️ **Next**: Section 5 — [Upcoming Topic: Advanced Async Patterns, Diagnostics, or Framework Integration]
