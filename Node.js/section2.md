# Node.js Fundamentals — Section 2: The Module System

> 🎯 **Focus**: Local modules, CommonJS vs ES Modules, scope, caching, export patterns, and developer tooling.

## Table of Contents

1. [Module Fundamentals & Isolation](#module-fundamentals--isolation)
2. [Loading & Execution with `require()`](#loading--execution-with-require)
3. [The Module Wrapper & Private Scope](#the-module-wrapper--private-scope)
4. [The 5 Injected Parameters](#the-5-injected-parameters)
5. [Exporting & Public APIs](#exporting--public-apis)
6. [The `exports` vs `module.exports` Trap](#the-exports-vs-moduleexports-trap)
7. [Module Caching & Reference Behavior](#module-caching--reference-behavior)
8. [ES Modules (ESM) vs CommonJS](#es-modules-esm-vs-commonjs)
9. [JSON Imports & Watch Mode](#json-imports--watch-mode)
10. [Interview Prep Cheat Sheet](#interview-prep-cheat-sheet)
11. [Quick Reference & Debugging](#quick-reference--debugging)

## Module Fundamentals & Isolation

### Mental Model: The Sealed Container

Every `.js` file is a **private sandbox**. Code inside runs in its own lexical scope. Nothing leaks out unless explicitly exposed. Nothing comes in unless explicitly requested. This prevents global namespace collisions and enables scalable architecture.

### The 3 Module Types in Node.js

| Type                | Origin            | Location          | Example                                  |
| ------------------- | ----------------- | ----------------- | ---------------------------------------- |
| **Local / Custom**  | Written by you    | Project directory | `./utils/math.js`, `./models/user.js`    |
| **Built-in / Core** | Shipped with Node | Runtime internals | `fs`, `path`, `http`, `events`, `crypto` |
| **Third-Party**     | Community / npm   | `node_modules/`   | `express`, `lodash`, `dotenv`, `axios`   |

> ⚠️ **Node.js Rule**: `1 file = 1 module`. Each file automatically receives module-level scope.

## Loading & Execution with `require()`

### Core Behavior

- `require()` is a **synchronous function** that reads, parses, executes, and returns a module.
- Path resolution is relative to the calling file.
- Omitting `.js` triggers Node's fallback resolver: `.js` → `.json` → `.node`

### Minimal Working Example

```js
// add.js
const add = (a, b) => a + b;
module.exports = add;

// index.js
const add = require("./add"); // .js extension is optional
console.log(add(2, 3)); // 5
```

### Execution Flow

```
1. Node hits require('./add')
2. ⏸ Pauses index.js → loads add.js
3. ▶ Executes add.js top-to-bottom synchronously
4. ✅ Captures module.exports, caches it
5. ▶ Returns control to index.js with the exported value
6. ▶ Continues executing remaining lines
```

> 🔑 **Rule**: Always use relative paths (`./` or `../`) for local modules. Omitting them makes Node search `node_modules` or built-in modules instead.

## The Module Wrapper & Private Scope

### How Node Enforces Isolation

Before execution, Node wraps every file in an **Immediately Invoked Function Expression (IIFE)**:

```js
(function (exports, require, module, __filename, __dirname) {
  // YOUR CODE RUNS HERE
  const secret = "hidden";
})(exports, require, module, __filename, __dirname);
```

### Why It Matters

- Creates a **function-level lexical scope** per file
- Prevents `var`/`let`/`const` from polluting the global object
- Enables safe reuse of identical variable names across files
- Encapsulates implementation details; only `module.exports` is exposed

### Verification

```js
// batman.js
const hero = "Batman";
console.log(hero);

// superman.js
const hero = "Superman";
console.log(hero);

// index.js
require("./batman"); // Batman
require("./superman"); // Superman
// ✅ No naming collision. Each runs in isolated scope.
```

## The 5 Injected Parameters

Node injects these 5 identifiers into every module's wrapper function:

| Parameter    | Type     | Purpose                                                |
| ------------ | -------- | ------------------------------------------------------ |
| `exports`    | Object   | Convenience alias for `module.exports`                 |
| `require`    | Function | Synchronous module loader                              |
| `module`     | Object   | Current module metadata & export container             |
| `__filename` | String   | Absolute path to the **current file**                  |
| `__dirname`  | String   | Absolute path to the **directory** of the current file |

> ⚠️ These are **NOT globals**. They are module-scoped parameters. `__dirname` changes per file.

## Exporting & Public APIs

### The 5 CommonJS Export Patterns

| Pattern                    | Syntax                                    | Use Case                              |
| -------------------------- | ----------------------------------------- | ------------------------------------- |
| **1. Single Named Export** | `module.exports = addFn;`                 | Primary function, class, or singleton |
| **2. Inline Export**       | `module.exports = (a,b) => a+b;`          | Tiny, single-purpose utilities        |
| **3. Object Export**       | `module.exports = { add, sub };`          | Grouping related functions            |
| **4. Destructured Import** | `const { add, sub } = require('./math');` | Clean, modern consumption             |
| **5. Property Assignment** | `module.exports.add = ...;`               | Conditional/dynamic exports           |

### Best Practice Recommendation

```js
// ✅ Consistent, readable, test-friendly
module.exports = { validate, parse, format };
// Consumer
const { validate, parse } = require("./utils");
```

## The `exports` vs `module.exports` Trap

### The Reference Chain

At module initialization:

```js
module.exports = {};
exports = module.exports; // Alias pointing to the SAME object in memory
```

| Action                         | What Happens                           | Safe?                |
| ------------------------------ | -------------------------------------- | -------------------- |
| `exports.fn = ...`             | Mutates shared object                  | ✅ Yes               |
| `module.exports.fn = ...`      | Mutates shared object                  | ✅ Yes               |
| `exports = { fn: ... }`        | Reassigns local variable, breaks alias | ❌ **Breaks export** |
| `module.exports = { fn: ... }` | Replaces entire export object          | ✅ Yes               |

### Why It Fails

Node.js **only returns `module.exports`**. Reassigning `exports` creates a new object in a new memory location. `module.exports` remains `{}`. The consumer receives an empty object, causing `TypeError`.

> 🛑 **Rule**: Always use `module.exports`. Avoid bare `exports` to prevent silent reference breaks.

## Module Caching & Reference Behavior

### How Caching Works

- On first `require()`, Node executes the module and stores `module.exports` in `require.cache`.
- Subsequent `require()` calls for the same path **skip execution** and return the cached reference.
- Objects are passed by reference. Mutating a cached object affects all importers.

### The Instance Trap

```js
// ⚠️ Dangerous: Exports a single shared instance
module.exports = new Config();

// file1.js
const config = require("./config");
config.apiKey = "test-key";

// file2.js
const config = require("./config");
console.log(config.apiKey); // 'test-key' (same cached object)
```

### Safe Patterns for Multiple Instances

```js
// ✅ Export the class/factory, not an instance
class Superhero {
  constructor(name) {
    this.name = name;
  }
}
module.exports = Superhero;

// Consumers create independent instances
const Hero = require("./hero");
const batman = new Hero("Batman");
const superman = new Hero("Superman");
// ✅ Independent state. No cache bleed.
```

> 🔑 **Design Rule**: Export instances for singletons (DB pools, loggers, app config). Export classes/factories when consumers need independent state.

## ES Modules (ESM) vs CommonJS

### Core Differences

| Feature             | CommonJS (`require`)          | ES Modules (`import`)            |
| ------------------- | ----------------------------- | -------------------------------- |
| **Evaluation**      | Runtime, synchronous          | Static, hoisted before execution |
| **Syntax**          | `require()`, `module.exports` | `import`, `export`               |
| **Dynamic Loading** | Built-in (`require()`)        | Requires `await import()`        |
| **Bindings**        | Mutable object reference      | Live read-only bindings          |
| **File Resolution** | `.js` (default)               | `.mjs` or `"type":"module"`      |
| **Tree-Shaking**    | Limited                       | Full static analysis support     |

### ESM Syntax Patterns

```js
// Named Exports (Preferred)
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
import { add, sub } from "./math.mjs";

// Default Export
export default class AuthService {}
import Auth from "./auth.mjs"; // Name can be anything

// Namespace Import
import * as math from "./math.mjs";
console.log(math.add(2, 2));

// Dynamic Import (Async)
const { add } = await import("./math.mjs");
```

### Enabling ESM in Node.js

```json
// Option 1: File extension
// Use .mjs instead of .js

// Option 2: Package config (all .js become ESM)
{
  "type": "module"
}
```

> ⚠️ ESM cannot use `require()`. Use dynamic `import()` to load CommonJS from ESM.

## JSON Imports & Watch Mode

### JSON Module Behavior

```js
// data.json
{ "name": "Bruce Wayne", "role": "admin" }

// index.js
const data = require('./data.json');
console.log(data.name); // Bruce Wayne
```

- **Auto-Parsed**: Node reads, parses, caches, and returns a JS object.
- **Cached Singleton**: Mutations persist across imports.
- **Extension Collision**: `require('./data')` checks `.js` → `.json`. If `data.js` exists, JSON is ignored. **Always specify `.json`.**

### Watch Mode (v18+)

```bash
# Auto-restarts process on file change
node --watch index.js
```

- **Dev-only**: Restarts entire process → drops connections, loses memory.
- **Not hot reloading**: Full restart, not in-place module swapping.
- **Use in production**: Process managers (PM2, systemd, Docker restart policies).

## Interview Prep Cheat Sheet

> **Q: "How does Node.js prevent variable naming collisions between modules?"**  
> **A**: "Node wraps each file in a function wrapper before execution. This creates a private lexical scope via an IIFE, isolating variables and preventing global namespace pollution."

> **Q: "What happens under the hood when `require()` is called?"**  
> **A**: "Node resolves the path, checks `require.cache`. If cached, returns `module.exports` immediately. If not, reads the file, wraps it in an IIFE with 5 injected parameters, executes it synchronously, caches the result, and returns it."

> **Q: "Why does `exports = { fn }` break the module export?"**  
> **A**: "`exports` is just a local alias referencing `module.exports`. Reassigning it points the alias to a new object, but Node still returns the original `module.exports` (which remains `{}`). Mutation (`exports.fn =`) works; reassignment breaks the chain."

> **Q: "When should you export a class vs. an instance?"**  
> **A**: "Export a class when consumers need multiple independent stateful instances. Export an instance (singleton) for shared resources like DB pools, loggers, or app config where global state consistency is required."

> **Q: "What's the fundamental difference between `require()` and `import`?"**  
> **A**: "`require()` is a runtime function call evaluated synchronously. `import` is a static declaration hoisted and analyzed before execution. ESM enables tree-shaking and strict bindings; CommonJS allows dynamic, conditional loading."

> **Q: "How does Node resolve `require('./module')` when no extension is provided?"**  
> **A**: "Node tries extensions in order: `.js` → `.json` → `.node`. It returns the first match. Omitting extensions for JSON can cause accidental JS file resolution if names collide."

> **Q: "Why are ESM imports 'live read-only bindings'?"**  
> **A**: "ESM doesn't copy values. It creates a reference to the original binding. If the exporter mutates it, the importer sees the change. Reassigning the import binding throws a `TypeError`, preserving encapsulation."

## Quick Reference & Debugging

### Cache Inspection

```js
// View all loaded modules
console.log(require.cache);

// Clear cache (dev/testing only)
delete require.cache[require.resolve("./module.js")];
require("./module.js"); // Re-executes
```

### Environment Checks

```js
// Current module metadata
console.log(module.id); // '.' for entry, resolved path for others
console.log(module.loaded); // true after execution
console.log(module.parent); // Module that required this one

// Path resolution
console.log(__filename); // Absolute file path
console.log(__dirname); // Absolute directory path
```

### JSON Import Safety

```js
// Prevent accidental mutations
const config = Object.freeze(require("./config.json"));

// Explicit extension to avoid .js collision
const data = require("./data.json"); // ✅ Always explicit
```

.
