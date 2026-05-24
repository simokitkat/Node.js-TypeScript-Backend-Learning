# Node.js Fundamentals — Section 5: npm — Package Management, Scripts, Dependencies

> 🎯 **Focus**: npm registry, package.json configuration, installing/using packages, dependency management, semantic versioning, global packages, npm scripts, and publishing packages.  
> 📌 **Rule**: Every concept, example, command, and inference is derived directly from course transcriptions (Lessons 49-57). No external assumptions added.

## Table of Contents

1. [Section Overview & Learning Objectives](#1-section-overview--learning-objectives)
2. [Lesson 49: What Is npm?](#2-lesson-49-what-is-npm)
3. [Lesson 50: package.json — npm's Configuration File](#3-lesson-50-packagejson--npms-configuration-file)
4. [Lesson 51: Installing Packages from the npm Registry](#4-lesson-51-installing-packages-from-the-npm-registry)
5. [Lesson 52: Using Installed Packages — Importing Third-Party Modules](#5-lesson-52-using-installed-packages--importing-third-party-modules)
6. [Lesson 53: The `dependencies` Field — Managing Project Requirements](#6-lesson-53-the-dependencies-field--managing-project-requirements)
7. [Lesson 54: Versioning & Semantic Versioning (SemVer)](#7-lesson-54-versioning--semantic-versioning-semver)
8. [Lesson 55: Global Packages — CLI Tools & System-Wide Installation](#8-lesson-55-global-packages--cli-tools--system-wide-installation)
9. [Lesson 56: npm Scripts — Standardizing Project Commands](#9-lesson-56-npm-scripts--standardizing-project-commands)
10. [Lesson 57: Publishing an npm Package](#10-lesson-57-publishing-an-npm-package)
11. [Complete npm Reference: Commands, Fields & Workflows](#11-complete-npm-reference-commands-fields--workflows)
12. [Comprehensive Interview Prep Cheat Sheet](#12-comprehensive-interview-prep-cheat-sheet)
13. [Quick Reference Tables & Debugging Guide](#13-quick-reference-tables--debugging-guide)
14. [Production Best Practices](#14-production-best-practices)
15. [Section 5 Recap & Knowledge Checklist](#15-section-5-recap--knowledge-checklist)

## 1. Section Overview & Learning Objectives

### What This Section Covers

- **npm fundamentals**: What npm is, why it exists, and its dual role as registry + package manager
- **package.json**: Structure, mandatory fields, creation methods, and configuration purpose
- **Package installation**: Searching npmjs.com, assessing package quality, installing via CLI
- **Using packages**: Importing third-party modules with `require()`, CommonJS vs ES module syntax
- **Dependency management**: The `dependencies` field, `node_modules`, `package-lock.json`, team collaboration
- **Semantic Versioning**: `X.Y.Z` format, increment rules, version lifecycle, `@version` syntax
- **Global packages**: `-g` flag, CLI tools, system PATH, use cases vs local dependencies
- **npm scripts**: `scripts` field, `npm run`, `npm start`, team command standardization
- **Publishing packages**: Account setup, authentication, `npm publish`, testing installation

### Learning Outcomes

✅ Search, assess, and install npm packages with confidence  
✅ Configure and manage `package.json` for project metadata and dependencies  
✅ Import and use third-party modules in Node.js code  
✅ Understand semantic versioning and make informed update decisions  
✅ Differentiate local vs global package installation and use cases  
✅ Create and execute npm scripts for team workflow consistency  
✅ Publish your own packages to the npm registry  
✅ Collaborate effectively using `dependencies` + `package-lock.json` patterns

## 2. Lesson 49: What Is npm?

### Core Concept: npm Is Two Things in One

| Role                 | Analogy                                                         | Technical Meaning                                                                       |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Software Library** | A public library with books from authors worldwide              | A registry containing code packages written by developers globally                      |
| **Package Manager**  | The librarian who helps you check out, return, and manage books | A CLI tool that handles installing, updating, and managing dependencies in your project |

> ✅ npm is both the **place** where code lives (registry) AND the **tool** that manages it (CLI).

### npm as the World's Largest Software Library

- A **public registry** of JavaScript code packages written by developers worldwide
- Developers can **publish** their code packages for others to use
- Developers can **consume/borrow** packages to solve problems without reinventing the wheel
- Search and explore packages at [npmjs.com](https://npmjs.com)

### npm as a Software Package Manager

A package manager handles the complexity of sharing code:

| Question                                       | npm as Package Manager Provides                  |
| ---------------------------------------------- | ------------------------------------------------ |
| How do I publish a package?                    | CLI commands to publish to the registry          |
| How do I consume a package?                    | CLI commands to install packages locally         |
| What if a package author changes a function?   | Versioning system to control updates             |
| How do I update an installed package?          | Commands to upgrade packages safely              |
| What if my package depends on another package? | Automatic dependency resolution and installation |

> ✅ npm abstracts the complexity of package management so you can focus on building.

### Installation & Verification

- npm comes **bundled with Node.js** — no separate installation required
- Verify installation:
  ```bash
  npm -v
  # Output: e.g., 10.2.4 (your version may vary)
  ```
- If you see a version number, npm is ready to use.

### Other Package Managers

| Package Manager | Notes                                        |
| --------------- | -------------------------------------------- |
| **npm**         | Default for Node.js; installed with Node.js  |
| **pnpm**        | Alternative with efficient disk usage        |
| **yarn**        | Alternative with focus on speed and security |

> ✅ While alternatives exist, npm is the default and most widely used. This course focuses on npm.

### Naming Note: What Does "npm" Stand For?

| Era            | Meaning                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Originally** | "Node Package Manager"                                                                           |
| **Now**        | Just "npm" (all lowercase) — a package manager for the **JavaScript language**, not just Node.js |

> ✅ npm has evolved beyond Node.js-specific packages to support the broader JavaScript ecosystem.

### Why Learn npm?

> "When building enterprise-scale applications, we often need to rely on code written by other developers. npm helps with that."

| Use Case             | Why npm Is Essential                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| **Side projects**    | Quickly add functionality without writing everything from scratch       |
| **Company projects** | Standardize dependencies, manage versions, collaborate with teams       |
| **Learning Node.js** | Fundamental tooling for installing frameworks, libraries, and dev tools |

> ✅ npm is not optional—it's fundamental to modern JavaScript development.

## 3. Lesson 50: package.json — npm's Configuration File

### Core Concept: The Package Passport & Instruction Manual

Think of `package.json` as your project's **passport + instruction manual** rolled into one:

| Analogy                | Technical Meaning                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------- |
| **Passport**           | Identifies your package (name, version, author) for the npm registry               |
| **Instruction Manual** | Tells npm and other developers how to install, run, and interact with your package |

> ✅ `package.json` is the single source of truth for your project's metadata, dependencies, scripts, and configuration.

### What Is `package.json`?

| Property             | Description                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Type**             | JSON configuration file                                                                                      |
| **Location**         | Typically lives in the **root directory** of your package/project                                            |
| **Purpose**          | Holds metadata relevant to the package; central place to configure how to interact with and run your package |
| **Primary Consumer** | Used by the **npm CLI** to manage your project                                                               |

### Creating `package.json`: Two Methods

#### Method 1: Manual Creation (Educational)

```json
{
  "name": "greet-code-evolution",
  "version": "1.0.0",
  "description": "Code Evolution greeting package",
  "keywords": ["code evolution", "greet"],
  "main": "index.js"
}
```

##### Mandatory Fields

| Field         | Rules                                                   | Example                  |
| ------------- | ------------------------------------------------------- | ------------------------ |
| **`name`**    | Lowercase, one word, may contain hyphens or underscores | `"greet-code-evolution"` |
| **`version`** | Must follow `x.x.x` format (semantic versioning)        | `"1.0.0"`                |

##### Optional Fields Covered

| Field             | Purpose                                                       | Example                             |
| ----------------- | ------------------------------------------------------------- | ----------------------------------- |
| **`description`** | Used to search and describe packages in the npm registry      | `"Code Evolution greeting package"` |
| **`keywords`**    | Array of strings indexed by npm registry for search discovery | `["code evolution", "greet"]`       |
| **`main`**        | Defines the entry point of your project                       | `"index.js"`                        |

> ⚠️ **Note**: Many more fields exist (scripts, dependencies, engines, etc.) — covered in later videos.

#### Method 2: CLI Initialization (Practical)

##### Interactive Mode: `npm init`

```bash
# Navigate to project folder, then run:
npm init
```

- Launches an interactive wizard that prompts for standard fields
- Shows sensible defaults (e.g., package name from folder name, version `1.0.0`, license `ISC`)
- Press `Enter` to accept defaults or type custom values
- Confirms before writing to `package.json`

##### Quick Mode: `npm init --yes`

```bash
# Skip all prompts, generate with defaults:
npm init --yes
```

- Creates `package.json` instantly with default values
- Edit any field manually afterward
- Ideal for rapid prototyping or when defaults are acceptable

### Minimal Working Example: Project Setup

```bash
# Step 1: Create project structure
mkdir my-custom-package
cd my-custom-package
touch index.js

# Step 2: Add basic code (index.js)
# const greet = (name) => { console.log(`Hello ${name}, welcome to code evolution`); };
# module.exports = greet;

# Step 3: Initialize package.json
npm init --yes

# Result: Generated package.json
{
  "name": "my-custom-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

> ✅ You now have a valid npm package ready for dependency management, scripting, and potential publishing.

### Key Insights

| Insight                   | Explanation                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **Two mandatory fields**  | `name` and `version` are required for npm to recognize your package                      |
| **Name formatting rules** | Must be lowercase, one word, hyphens/underscores allowed — ensures registry consistency  |
| **Semantic versioning**   | Version format `x.x.x` (e.g., `1.0.0`) follows semver guidelines for predictable updates |
| **`main` field purpose**  | Tells consumers which file to load when they `require()` your package                    |
| **CLI > manual**          | `npm init` is faster, less error-prone, and ensures all standard fields are included     |
| **`--yes` flag**          | Skips prompts for rapid setup; edit values afterward if needed                           |

## 4. Lesson 51: Installing Packages from the npm Registry

### Core Concept: The Package Shopping Experience

Think of installing an npm package like **shopping at a global code supermarket**:

| Shopping Step              | npm Equivalent                                                |
| -------------------------- | ------------------------------------------------------------- |
| **Search the catalog**     | Browse [npmjs.com](https://npmjs.com) for packages by keyword |
| **Check product reviews**  | Assess package quality: publish date, downloads, size, docs   |
| **Add to cart & checkout** | Run `npm install <package-name>` to download and configure    |
| **Receive delivery**       | Package appears in `node_modules`, config files updated       |

> ✅ npm makes borrowing code from other developers as simple as a three-step process: search → assess → install.

### Three-Step Installation Process

#### Step 1: Identify a Package

- Visit [npmjs.com](https://npmjs.com)
- Use the search input to find packages by keyword
- Example: Search `"upper"` → find `upper-case` package for converting strings to uppercase

#### Step 2: Assess Package Quality

There's no strict rule, but follow these guidelines to judge whether a package is suitable:

| Criteria             | What to Look For                                                                          | Why It Matters                                                         |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Published date**   | Prefer <1 year old; context matters for simple utilities                                  | Recent packages are more likely to have bug fixes and security patches |
| **Weekly downloads** | Millions = excellent; hundred thousands = good; hundreds/low thousands = keep searching   | High download counts indicate community trust and real-world usage     |
| **Package size**     | A few kilobytes is fine for crucial packages; avoid large packages that bloat your bundle | Smaller packages = faster installs, smaller deployments                |
| **Documentation**    | Clear README, usage examples, API reference                                               | Good docs reduce integration time and debugging                        |
| **Open issues**      | Fewer unresolved issues = more stable package                                             | Active maintenance signals reliability                                 |

> ✅ The `upper-case` package in the example checks all boxes: simple purpose, acceptable age, high downloads, small size.

#### Step 3: Install via CLI

```bash
# Navigate to your project folder, then run:
npm install upper-case
```

##### Important Notes

- **`--save` flag is outdated**: Not required anymore; dependencies are added to `package.json` by default
- **Progress bar**: Shows download/install progress
- **Result**: Package is fetched from registry and installed locally

### What Happens After Installation

#### File System Changes

| File/Folder             | Change                                                        | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| **`node_modules/`**     | Created (if first dependency); package files installed here   | Local storage for all installed dependencies                 |
| **`package.json`**      | `dependencies` field added/updated: `"upper-case": "^2.0.2"`  | Declares which packages your project needs                   |
| **`package-lock.json`** | Created (if first dependency); updated on subsequent installs | Locks exact versions for consistent installs across machines |

#### Example `package.json` After Install

```json
{
  "name": "my-custom-package",
  "version": "1.0.0",
  "dependencies": {
    "upper-case": "^2.0.2"
  }
}
```

#### Example `package-lock.json` Purpose

> "This file simply keeps track of the packages and versions installed in a project, ensuring there is no inconsistency when someone else installs the same packages."

### Minimal Working Example: Full Workflow

```bash
# Step 1: Search & Assess (on npmjs.com)
# Search query: "upper"
# → Select: upper-case
# → Verify:
#    - Published: 2 years ago (acceptable for simple utility)
#    - Weekly downloads: 500k+ (good adoption)
#    - Size: ~2KB (minimal bundle impact)
#    - Docs: Clear examples ✓
#    - Issues: Few open issues ✓

# Step 2: Install via CLI
npm install upper-case

# Step 3: Verify Installation
cat package.json
# → See "dependencies": { "upper-case": "^2.0.2" }

ls node_modules/upper-case
# → See package files installed

cat package-lock.json
# → See exact version locked for reproducible installs
```

### Uninstall Command

```bash
# Remove package and update config files:
npm uninstall upper-case
```

> ✅ Exercise: Run uninstall and observe changes in `package.json`, `package-lock.json`, and `node_modules`.

### Key Insights

| Insight                                     | Explanation                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **`--save` is deprecated**                  | Dependencies are added to `package.json` by default; no flag needed                          |
| **`node_modules` is local**                 | Packages install in your project folder, not globally (unless `-g` flag used)                |
| **`package-lock.json` ensures consistency** | Locks exact versions + dependency tree so teammates/CI get identical installs                |
| **Assessment is critical**                  | Don't install blindly—evaluate quality metrics to avoid bloated or unmaintained dependencies |
| **Uninstall is symmetric**                  | `npm uninstall <package-name>` removes package and updates config files                      |

## 5. Lesson 52: Using Installed Packages — Importing Third-Party Modules

### Core Concept: The Plug-and-Play Component

Think of an installed npm package as a **pre-built appliance** you plug into your project:

| Appliance Analogy  | npm Equivalent                      |
| ------------------ | ----------------------------------- |
| **Power outlet**   | Node.js module system (`require()`) |
| **Appliance plug** | Package name (`'upper-case'`)       |
| **Control panel**  | Exported functions (`upperCase()`)  |
| **User manual**    | Package documentation on npmjs.com  |

> ✅ Once installed, third-party packages are imported exactly like local or built-in modules—just use the package name instead of a file path.

### Import Patterns Recap

| Module Type            | Import Syntax                | Example                                       |
| ---------------------- | ---------------------------- | --------------------------------------------- |
| **Local module**       | `require('./relative/path')` | `const greet = require('./greet')`            |
| **Built-in module**    | `require('node:moduleName')` | `const fs = require('node:fs')`               |
| **Third-party module** | `require('package-name')`    | `const { upperCase } = require('upper-case')` |

> ✅ The only difference is the **identifier**: local uses `./`, built-in uses `node:`, third-party uses the exact package name from npm.

### Minimal Working Example: Using `upper-case`

```js
// Step 1: Install the package (from previous lesson)
// npm install upper-case

// Step 2: Import and use in code (index.js)
const { upperCase } = require("upper-case");

// Your existing greet function
const greet = (name) => {
  console.log(upperCase(`Hello ${name}, welcome to code evolution`));
};

// Invoke
greet("vishwas");

// Step 3: Run and verify
// node index.js
// Terminal Output: HELLO VISHWAS, WELCOME TO CODE EVOLUTION
```

> ✅ The `upper-case` package transforms the string to uppercase—no custom code needed.

### Real-World Example: lodash for Complex Utilities

#### Scenario: Deep Clone an Object

Instead of writing and testing your own deep clone function:

```js
// ❌ Reinventing the wheel
function deepClone(obj) {
  // ... complex recursive logic, edge cases, testing ...
}
```

#### Solution: Use a Trusted Package

```js
// ✅ Leverage community-tested code
const cloneDeep = require("lodash/cloneDeep");

const original = { user: { name: "Vishwas", settings: { theme: "dark" } } };
const cloned = cloneDeep(original);

cloned.user.name = "Modified";
console.log(original.user.name); // 'Vishwas' (unchanged)
```

> ✅ Packages like `lodash` provide battle-tested utilities so you can focus on business logic, not low-level implementation.

### Key Insights

| Insight                                  | Explanation                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Packages are modules**                 | Every installed npm package is a Node.js module that can be imported via `require()`                              |
| **Import by package name**               | Use the exact name from npmjs.com (e.g., `'upper-case'`), not a file path                                         |
| **Destructure exports**                  | Use `require('pkg').functionName` or destructuring `{ functionName } = require('pkg')` to access specific exports |
| **Check package usage docs**             | npmjs.com shows usage examples; convert ES module syntax to CommonJS if needed (`import` → `require`)             |
| **Focus on requirements, not utilities** | Leverage packages for common tasks (string manipulation, deep cloning, etc.) to save time and reduce bugs         |

## 6. Lesson 53: The `dependencies` Field — Managing Project Requirements

### Core Concept: The Recipe Ingredients List

Think of `package.json`'s `dependencies` field as a **recipe's ingredients list**:

| Recipe Analogy               | npm Equivalent                             |
| ---------------------------- | ------------------------------------------ |
| **Recipe card**              | `package.json` file                        |
| **Ingredients list**         | `dependencies` field                       |
| **Pantry (node_modules)**    | Local folder where installed packages live |
| **Shopping trip**            | `npm install` command                      |
| **Missing ingredient error** | "Cannot find module" runtime error         |

> ✅ Just as a chef can recreate a dish from a recipe + ingredients list, any developer can recreate your project's environment from `package.json` + `npm install`.

### What Is the `dependencies` Field?

| Property       | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| **Location**   | Field inside `package.json`                                        |
| **Purpose**    | Tracks packages required for your code to function                 |
| **Population** | Automatically created/updated when you run `npm install <package>` |
| **Format**     | JSON object: `{ "package-name": "^version" }`                      |

#### Example After Installing `upper-case`

```json
{
  "name": "my-custom-package",
  "version": "1.0.0",
  "dependencies": {
    "upper-case": "^2.0.2"
  }
}
```

> ✅ The `dependencies` field is npm's way of documenting: "This project needs these packages to run."

### Why `dependencies` Matters for Version Control

#### The Problem: `node_modules` Is Large

- Contains all installed package code
- Can be **megabytes in size** (or gigabytes for large projects)
- Should **NOT be committed to source control** (added to `.gitignore`)

#### The Scenario: New Developer Clones Your Repo

```bash
# Developer clones repo (node_modules is ignored)
git clone https://github.com/your-org/project.git
cd project

# Try to run the app
node index.js
# ❌ Error: Cannot find module 'upper-case'
```

#### The Solution: `dependencies` Field Guides Installation

```bash
# Developer reads package.json → sees dependencies
# Run single command to install ALL required packages:
npm install

# ✅ node_modules regenerated with all dependencies
node index.js  # ✅ Works as expected
```

> ✅ The `dependencies` field + `npm install` enables reproducible environments across machines and teams.

### Minimal Working Example: Reproducing Dependencies

```bash
# Step 1: Simulate missing node_modules
rm -rf node_modules

# Try to run the app
node index.js
# ❌ Error: Cannot find module 'upper-case'

# Step 2: Install dependencies via package.json
npm install

# Verify node_modules is regenerated
ls node_modules/upper-case  # ✅ Package files present

# Step 3: Run and verify
node index.js
# ✅ Output: HELLO VISHWAS, WELCOME TO CODE EVOLUTION
```

### Key Commands Reference

| Command                   | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `npm install <package>`   | Install a specific package + update `dependencies` |
| `npm install` (no args)   | Install ALL packages listed in `dependencies`      |
| `npm uninstall <package>` | Remove package + update `dependencies`             |

### Critical Workflow Pattern

```
1. Developer A: npm install upper-case → package.json updated
2. Developer A: git add package.json package-lock.json → commit
3. Developer B: git clone → npm install → gets exact same dependencies
4. ✅ Both developers have identical environments
```

### Key Insights

| Insight                                | Explanation                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| **`dependencies` = required packages** | Lists packages your code needs to run in production                          |
| **Auto-populated by npm**              | You rarely edit this field manually; `npm install` handles it                |
| **Enables team collaboration**         | New developers run `npm install` once to get all dependencies                |
| **Supports CI/CD pipelines**           | Automated systems use `npm install` to set up build environments             |
| **Version ranges matter**              | `^2.0.2` allows compatible updates; `package-lock.json` locks exact versions |

## 7. Lesson 54: Versioning & Semantic Versioning (SemVer)

### Core Concept: The Book Edition System

Think of package versioning like **publishing book editions**:

| Version Component | Analogy                                | Impact on Your Project                          |
| ----------------- | -------------------------------------- | ----------------------------------------------- |
| **Patch (`.Z`)**  | Typo corrections, binding fixes        | Safe to update; story unchanged                 |
| **Minor (`.Y`)**  | New chapters added, old story intact   | Safe to update; new features available          |
| **Major (`.X`)**  | Completely rewritten plot & characters | Requires reading/adapting; may break your notes |

The `@version` syntax lets you pick exactly which "edition" to install, avoiding known bugs or breaking changes.

### Installing Specific Versions

#### Default Behavior

```bash
# Always installs the latest stable version
npm install upper-case
# package.json → "upper-case": "^2.0.2"
```

#### Targeting a Specific Version

```bash
# Install exact version using @<version> syntax
npm install upper-case@2.0.0
# package.json → "upper-case": "2.0.0"
```

#### Use Case for Specific Versions

- **Scenario**: Latest version contains an overlooked bug
- **Solution**: Install a known stable older version → use it in your project → update to latest once maintainers release a fix
- **Revert to Latest**: Simply run `npm install upper-case` again; npm overwrites `package.json` with the newest stable version

### Semantic Versioning (SemVer)

#### What Is SemVer?

- Widely adopted versioning system that dictates how version numbers are assigned and incremented
- Version numbers convey **meaning about the underlying code** and **what has been modified** between releases
- Enables clear communication of intentions to package users

#### Format: `X.Y.Z`

| Position | Name          | Example in `2.0.2` |
| -------- | ------------- | ------------------ |
| `X`      | Major version | `2`                |
| `Y`      | Minor version | `0`                |
| `Z`      | Patch version | `2`                |

#### Increment Rules (Core of SemVer)

| Change Type           | Backward Compatible? | What to Increment | Reset Rule                 | Example           |
| --------------------- | -------------------- | ----------------- | -------------------------- | ----------------- |
| **Bug fix**           | ✅ Yes               | Patch (`Z`)       | None                       | `1.1.1` → `1.1.2` |
| **New functionality** | ✅ Yes               | Minor (`Y`)       | Reset Patch to `0`         | `1.1.1` → `1.2.0` |
| **Breaking changes**  | ❌ No                | Major (`X`)       | Reset Minor & Patch to `0` | `1.1.1` → `2.0.0` |

#### Version Lifecycle Rules

| Phase                   | Version Format | Meaning                                                    |
| ----------------------- | -------------- | ---------------------------------------------------------- |
| **Initial development** | `0.Y.Z`        | API is unstable; subject to change                         |
| **First release**       | `0.1.0`        | Starting point (never start with a patch)                  |
| **Production-ready**    | `1.0.0`        | Public API is stable; safe for production use              |
| **Ongoing development** | `X.Y.Z`        | Every change (no matter how small) requires a version bump |

#### Shared Responsibility

| Role                | Duty                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Package Creator** | Must update the appropriate version number based on changes made                         |
| **Package User**    | Must track version changes and make necessary corrections in their project when updating |

### Minimal Working Example: Version Control Workflow

```bash
# 1. Install latest (default)
npm install upper-case

# 2. Latest has a bug → downgrade to specific stable version
npm install upper-case@2.0.0

# 3. Verify package.json updated
cat package.json
# "dependencies": { "upper-case": "2.0.0" }

# 4. Bug fixed in newer release → upgrade back to latest
npm install upper-case
```

### Key Insights

| Insight                                  | Explanation                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| **`@version` syntax**                    | Overrides default "latest stable" behavior; pins exact version                   |
| **Backward compatibility is the anchor** | Patch/Minor updates won't break existing code; Major updates might               |
| **Zero means "in progress"**             | `0.Y.Z` signals unstable API; `1.0.0` signals production readiness               |
| **No change without a bump**             | Even the simplest modification requires incrementing the appropriate segment     |
| **Versioning is a contract**             | Creators promise stability within ranges; consumers must verify before upgrading |

## 8. Lesson 55: Global Packages — CLI Tools & System-Wide Installation

### Core Concept: Project Toolbox vs. System Utility Belt

| Concept            | Analogy                                                  | Technical Meaning                                                                 |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Local Package**  | A specialized tool kept in one workshop (`node_modules`) | Installed per-project, imported in code, tracked in `package.json`                |
| **Global Package** | A universal tool mounted on your system's PATH           | Installed once, run directly from terminal anywhere, not tied to a single project |

> ✅ Global packages are standalone command-line applications meant for terminal execution, not code import.

### Core Concept: Local vs. Global Installation

| Aspect                      | Local (`npm install <pkg>`)                  | Global (`npm install -g <pkg>`)                       |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| **Install Location**        | `./node_modules` inside project              | System-wide path                                      |
| **Usage**                   | Imported via `require()` or `import` in code | Executed directly from terminal as a CLI command      |
| **`package.json` Tracking** | Added to `dependencies`                      | **Not listed** in any project config                  |
| **Team Setup**              | Auto-installed via `npm install`             | Must be manually installed by each developer          |
| **Primary Use Case**        | Libraries, frameworks, runtime dependencies  | Development utilities, scaffolders, watchers, linters |

### CLI Commands & Workflow: Example `nodemon`

- **Purpose**: Automatically restarts a Node.js application when file changes are detected in the directory
- **Alternative**: Similar to Node's built-in `--watch` mode, but has served developers for years as a third-party utility

#### Installation & Execution

```bash
# Install globally (Linux/macOS may require sudo; Windows does not)
sudo npm install -g nodemon
# → npm installs to system path

# Run from ANY terminal location (no require() needed)
nodemon index.js
# → Starts app, watches files, auto-restarts on save
```

#### Uninstallation

```bash
# Remove global package
npm uninstall -g nodemon
```

### Key Insights

| Insight                    | Explanation                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`-g` flag**              | Instructs npm to install the package globally to your system path                                              |
| **CLI-only execution**     | Global packages are standalone terminal applications, not imported in code                                     |
| **No dependency tracking** | Global packages are **not** listed in `package.json`; `npm install` will never install them                    |
| **Manual team setup**      | Every developer on a team must install global packages individually on their machine                           |
| **Dev utility focus**      | Primarily used for cross-project development tools (e.g., `nodemon`, `create-react-app`, linters, scaffolders) |

## 9. Lesson 56: npm Scripts — Standardizing Project Commands

### Core Concept: The Command Shortcut Menu

Think of npm scripts as **pre-programmed shortcut buttons** in your project's configuration:

| Button Label    | Behind the Scenes                                    | Developer Experience                   |
| --------------- | ---------------------------------------------------- | -------------------------------------- |
| `npm run start` | Executes `node index.js` (or a chain of 5+ commands) | One consistent command to remember     |
| `npm run test`  | Runs testing framework with specific flags           | No need to memorize complex CLI syntax |
| `npm run build` | Compiles, minifies, and bundles assets               | Standardized across the entire team    |

> ✅ npm scripts turn complex, error-prone terminal commands into simple, team-shared shortcuts stored in `package.json`.

### What Are npm Scripts?

| Property             | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| **Purpose**          | Bundle common CLI commands for convenient project use                            |
| **Location**         | Stored in the `scripts` field of `package.json`                                  |
| **Team Benefit**     | Gives everyone codebase access to the exact same commands with identical options |
| **Execution Syntax** | `npm run <script-name>`                                                          |

#### Common Use Cases

- Building the project
- Starting a development server
- Compiling CSS
- Linting code
- Minifying assets
- Running tests

### Minimal Working Example

```json
// Step 1: Default scripts field (from npm init)
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}

// Step 2: Add a custom start script
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  }
}

// Step 3: Execute the script
npm run start
# OR (special case for 'start')
npm start

# Terminal Output: Hello vishwas, welcome to code evolution
```

### Key Insights

| Insight                         | Explanation                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`start` is a special script** | Can be run as `npm start` instead of `npm run start`. Other scripts require the `run` keyword                                   |
| **Team consistency**            | Scripts ensure every developer uses identical commands and options, eliminating "works on my machine" issues                    |
| **Enterprise scaling**          | In large applications, `start` often chains multiple commands, but developers only need to remember `npm run start`             |
| **Beginner-friendly**           | For learning Node.js, starting with a simple `start` script is a practical foundation before exploring advanced script chaining |
| **Shared accessibility**        | Anyone with access to the codebase can view and execute standardized project commands directly from `package.json`              |

## 10. Lesson 57: Publishing an npm Package

### Core Concept: The Public Library Submission

Think of publishing to npm like **submitting a book to a global library**:

| Library Step                | npm Equivalent                                                    |
| --------------------------- | ----------------------------------------------------------------- |
| **Get a library card**      | Create an account on npmjs.com                                    |
| **Prepare your manuscript** | Ensure `package.json` has required fields (`name`, `version`)     |
| **Submit for cataloging**   | Run `npm publish` from your project folder                        |
| **Book appears in catalog** | Package becomes publicly searchable at `npmjs.com/package/<name>` |
| **Patrons can borrow it**   | Anyone can `npm install <your-package>`                           |

> ✅ Publishing is a one-command process (`npm publish`), but requires authentication and a properly configured `package.json`.

### Prerequisites for Publishing

#### 1. Create an npm Account

- Visit [npmjs.com](https://npmjs.com) → Click **Sign Up**
- Enter: username, email address, password
- Verify via one-time password (OTP) sent to your email

#### 2. Authenticate in Terminal (VS Code)

```bash
# Log in to npm from your terminal
npm adduser
# → Prompts for: username, password, email
# → Success: "Logged in as <username> on https://registry.npmjs.org/."
```

#### 3. Validate `package.json`

Ensure these **mandatory fields** are present and correctly formatted:

```json
{
  "name": "greet-code-evolution", // lowercase, one word, hyphens/underscores allowed
  "version": "1.0.0" // semantic versioning format (x.y.z)
}
```

> ⚠️ Package names must be **unique** across the entire npm registry. If someone else published `greet-code-evolution`, you'll need to choose a different name.

### Publishing Workflow

#### Step 1: Publish the Package

```bash
# From your project root directory:
npm publish
```

#### Step 2: Verify Publication

- Visit: `https://npmjs.com/package/<your-package-name>`
- Example: `https://npmjs.com/package/greet-code-evolution`
- You should see:
  - Package name, version, description
  - Installation command: `npm install greet-code-evolution`
  - README, keywords, license, and other metadata

#### Step 3: Test Installation in a New Project

```bash
# Create and enter a new test folder
mkdir new-package && cd new-package

# Initialize package.json with defaults
npm init --yes

# Install your published package
npm install greet-code-evolution
# → Short form: npm i greet-code-evolution

# Create index.js to use the package
# index.js
const greet = require('greet-code-evolution');
greet('Batman');  // Output: Hello Batman, welcome to code evolution

# Run and verify
node index.js
```

### Key Insights

| Insight                       | Explanation                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **One-command publish**       | `npm publish` handles upload, registry update, and metadata indexing                                            |
| **Authentication required**   | Must run `npm adduser` (or `npm login`) before publishing                                                       |
| **Name uniqueness**           | Package names are global; collisions cause publish failures                                                     |
| **Version immutability**      | Once published, a specific version (`1.0.0`) cannot be overwritten; bump version to republish                   |
| **Public by default**         | Packages publish to the public registry; use `--access restricted` for private packages (requires paid npm org) |
| **Installation is universal** | Anyone can install your package via `npm install <package-name>` after publication                              |

## 11. Complete npm Reference: Commands, Fields & Workflows

### Essential npm Commands

```bash
# Verification & Setup
npm -v                          # Check npm version
npm init                        # Interactive package.json creation
npm init --yes                  # Quick package.json with defaults

# Package Management
npm install <pkg>               # Install package + add to dependencies
npm install <pkg>@<version>     # Install specific version
npm install                     # Install ALL dependencies from package.json
npm uninstall <pkg>             # Remove package + update config files
npm install -g <pkg>            # Install global CLI tool

# Scripts & Execution
npm run <script>                # Execute custom script from package.json
npm start                       # Special: runs 'start' script (no 'run' needed)

# Publishing
npm adduser                     # Authenticate terminal with npm registry
npm publish                     # Publish package to public registry
npm publish --access restricted # Publish private package (paid org required)

# Dependency Inspection
cat package.json                # View project config + dependencies
cat package-lock.json           # View exact locked versions + dependency tree
ls node_modules                 # List installed local packages
```

### package.json Field Reference

```json
{
  "name": "my-enterprise-app", // REQUIRED: lowercase, one word, hyphens/underscores
  "version": "2.1.0", // REQUIRED: semantic versioning (x.y.z)
  "description": "Production-ready Node.js service",
  "main": "src/index.js", // Entry point for require()
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "build": "tsc && npm run lint"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "eslint": "^8.40.0"
  },
  "keywords": ["nodejs", "api", "enterprise"],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Semantic Versioning Quick Reference

```
Version Format: X.Y.Z = Major.Minor.Patch

Increment Rules:
├─ Patch (Z): backward-compatible bug fixes → 1.1.1 → 1.1.2
├─ Minor (Y): backward-compatible new features → 1.1.1 → 1.2.0 (reset Z)
└─ Major (X): breaking changes → 1.1.1 → 2.0.0 (reset Y & Z)

Lifecycle:
├─ 0.Y.Z: initial development (API unstable)
├─ 0.1.0: first release (never start with patch)
├─ 1.0.0: production-ready (API stable)
└─ X.Y.Z: ongoing development (every change requires bump)

Install Specific Version:
├─ npm install pkg@2.0.0    # Exact version
├─ npm install pkg@^2.0.0   # Compatible with 2.x.x (allows minor/patch updates)
└─ npm install pkg@~2.0.0   # Approximately equivalent to 2.0.x (allows patch updates only)
```

### Local vs. Global Package Comparison

```
Local Package (npm install <pkg>):
├─ Location: ./node_modules/<pkg>
├─ Usage: const pkg = require('<pkg>')
├─ Tracked in: package.json dependencies
├─ Installed by: npm install (auto for teammates)
└─ Use case: Runtime/build dependencies

Global Package (npm install -g <pkg>):
├─ Location: System PATH (e.g., /usr/local/lib/node_modules)
├─ Usage: <pkg-command> in terminal
├─ Tracked in: NOT in package.json
├─ Installed by: Manual per-developer setup
└─ Use case: Cross-project CLI tools (nodemon, create-react-app)
```

## 12. Comprehensive Interview Prep Cheat Sheet

### npm Fundamentals

> **Q: "What is npm, and what are its two primary roles?"**  
> **A**: "npm is both the world's largest software library—a public registry of JavaScript code packages—and a software package manager—a CLI tool that handles installing, updating, and managing dependencies in a project."

> **Q: "How do you verify npm is installed on your machine?"**  
> **A**: "Run `npm -v` in the terminal. If npm is installed, it will output the version number. npm comes bundled with Node.js, so no separate installation is needed."

> **Q: "What does 'npm' stand for?"**  
> **A**: "Originally, it stood for 'Node Package Manager'. Today, it's just 'npm' (all lowercase) because it has evolved to be a package manager for the JavaScript language broadly, not just Node.js."

### package.json & Configuration

> **Q: "What is `package.json`, and why is it essential in npm projects?"**  
> **A**: "`package.json` is npm's configuration file—a JSON file in the project root that holds metadata like name, version, dependencies, and scripts. It's the central place npm uses to configure, describe, and manage how to interact with and run your package."

> **Q: "What are the two mandatory fields in `package.json`?"**  
> **A**: "`name` and `version`. The `name` must be lowercase, one word, and may contain hyphens or underscores. The `version` must follow semantic versioning format (`x.x.x`, e.g., `1.0.0`)."

> **Q: "What's the difference between `npm init` and `npm init --yes`?"**  
> **A**: "`npm init` launches an interactive wizard that prompts for field values with sensible defaults. `npm init --yes` skips all prompts and generates `package.json` with default values immediately, which you can edit afterward."

### Package Installation & Management

> **Q: "What happens when you run `npm install <package-name>`?"**  
> **A**: "npm fetches the package from the registry, downloads it to the `node_modules` folder, and updates `package.json` with the package name and version in the `dependencies` field. If it's the first dependency, `package-lock.json` is created to lock exact versions for consistent future installs."

> **Q: "Why is `package-lock.json` important?"**  
> **A**: "It tracks the exact versions of all installed packages and their dependency trees, ensuring that when someone else installs dependencies (e.g., a teammate or CI server), they get the exact same versions—preventing 'works on my machine' inconsistencies."

> **Q: "What criteria should you use to assess an npm package before installing?"**  
> **A**: "Check the published date (prefer recent), weekly downloads (higher = more trusted), package size (smaller = less bloat), documentation quality, and number of open issues. These metrics help avoid unmaintained or problematic dependencies."

> **Q: "Is the `--save` flag still required when installing packages?"**  
> **A**: "No. As of npm 5+, dependencies are added to `package.json` by default. The `--save` flag is outdated and no longer needed."

### Using Packages & Import Patterns

> **Q: "How do you import a third-party npm package in Node.js?"**  
> **A**: "Use `require('package-name')`, where `package-name` is the exact name from npmjs.com. For example: `const { upperCase } = require('upper-case')`. This is identical to importing local or built-in modules—only the identifier changes."

> **Q: "What's the difference between importing a local module vs. a third-party package?"**  
> **A**: "Local modules use relative paths (`./module`), while third-party packages use the registered package name (`'package-name'`). Node.js resolves third-party names by searching `node_modules` folders up the directory tree."

> **Q: "What should you do if a package's usage example uses ES module syntax but your project uses CommonJS?"**  
> **A**: "Convert the syntax: change `import { fn } from 'pkg'` to `const { fn } = require('pkg')`, and `import pkg from 'pkg'` to `const pkg = require('pkg')`. Most packages support both module systems."

### Dependencies & Team Collaboration

> **Q: "What is the purpose of the `dependencies` field in `package.json`?"**  
> **A**: "It tracks the packages required for your code to function. When another developer clones your repo or a CI system builds your project, running `npm install` reads this field and automatically installs all listed packages."

> **Q: "Why don't we commit `node_modules` to version control?"**  
> **A**: "Because `node_modules` can be megabytes or gigabytes in size, slowing down clones and bloating repositories. Instead, we commit `package.json` and `package-lock.json`, then regenerate `node_modules` via `npm install`."

> **Q: "What's the difference between `npm install` and `npm install <package-name>`?"**  
> **A**: "`npm install <package-name>` installs a specific package and adds it to `dependencies`. `npm install` with no arguments reads `package.json` and installs ALL packages listed in `dependencies`."

> **Q: "A teammate clones your repo and gets 'Cannot find module' errors. What do you tell them to do?"**  
> **A**: "Run `npm install` in the project root. This reads the `dependencies` field in `package.json` and installs all required packages into `node_modules`."

### Semantic Versioning

> **Q: "How do you install a specific version of an npm package?"**  
> **A**: "Append `@<version>` to the package name: `npm install package-name@1.2.3`. This is useful when the latest version contains a bug or breaking change."

> **Q: "What do the three numbers in a semantic version represent, and when do you increment each?"**  
> **A**: "`X.Y.Z` = Major.Minor.Patch. Increment Patch (`Z`) for backward-compatible bug fixes. Increment Minor (`Y`) and reset `Z` to 0 for backward-compatible new features. Increment Major (`X`) and reset `Y` & `Z` to 0 for breaking changes."

> **Q: "What does version `0.Y.Z` signify, and when should you release `1.0.0`?"**  
> **A**: "`0.Y.Z` indicates initial development where the API is unstable and may change. You release `1.0.0` when the package is production-ready and the public API is considered stable."

> **Q: "Why is semantic versioning important for package consumers?"**  
> **A**: "It communicates the impact of an update before you install it. Consumers can safely automate patch/minor updates while manually reviewing major updates to avoid breaking changes in their projects."

### Global Packages & CLI Tools

> **Q: "What's the difference between local and global npm packages?"**  
> **A**: "Local packages install to `node_modules`, are imported in code, tracked in `package.json`, and are project-specific. Global packages install to the system path, run as CLI commands from any terminal location, aren't tracked in `package.json`, and must be manually installed by each developer."

> **Q: "How do you install and use a global package like `nodemon`?"**  
> **A**: "Run `npm install -g nodemon` (`sudo` on Unix-like systems if needed). Execute it directly from the terminal with `nodemon index.js`. It monitors directory files and auto-restarts the Node app when changes are detected."

> **Q: "Will `npm install` install global dependencies for a project?"**  
> **A**: "No. Global packages are not listed in `package.json` dependencies. They exist outside the project scope and must be installed manually on each machine using `npm install -g <package>`."

> **Q: "When should you choose global over local installation?"**  
> **A**: "Use global installation for CLI tools and development utilities that span multiple projects (e.g., `nodemon`, `create-react-app`). Use local installation for libraries your application's code actually depends on at runtime or build time."

### npm Scripts

> **Q: "What are npm scripts, and why are they useful?"**  
> **A**: "npm scripts are commands defined in the `scripts` field of `package.json`. They bundle common CLI tasks (like building, testing, or starting a server) into simple, standardized shortcuts, ensuring every team member runs identical commands with the same options."

> **Q: "How do you execute an npm script, and are there any exceptions?"**  
> **A**: "Scripts are run using `npm run <script-name>`. The exception is the `start` script, which can be executed directly with `npm start` without the `run` keyword."

> **Q: "Why would an enterprise application use a `start` script instead of just running `node index.js` directly?"**  
> **A**: "In production or large-scale apps, `start` often chains multiple commands (e.g., environment setup, database migrations, server startup). Developers only need to remember `npm run start`, abstracting away complexity and ensuring consistent initialization across environments."

### Publishing Packages

> **Q: "What are the steps to publish a package to the npm registry?"**  
> **A**: "1) Create an account on npmjs.com and verify email. 2) Authenticate in your terminal with `npm adduser`. 3) Ensure `package.json` has valid `name` (unique, lowercase) and `version` (semver) fields. 4) Run `npm publish` from the project root. 5) Verify at npmjs.com/package/<name>."

> **Q: "What happens if you try to publish a package with a name that already exists?"**  
> **A**: "npm will reject the publish with an error stating the name is already taken. Package names are globally unique across the entire registry."

> **Q: "Can you overwrite a published version of a package?"**  
> **A**: "No. Once a version (e.g., `1.0.0`) is published, it is immutable. To publish changes, you must increment the version number (e.g., to `1.0.1` or `1.1.0`) following semantic versioning rules, then run `npm publish` again."

> **Q: "How do you test your package after publishing?"**  
> **A**: "Create a new test project, run `npm init --yes`, install your package with `npm install <package-name>`, then import and use it in code to verify functionality matches expectations."

> **Q: "Are npm packages public by default?"**  
> **A**: "Yes. Packages publish to the public registry unless you specify `--access restricted` and have a paid npm organization account for private packages."

### Advanced Dependency Management

> **Q: "What is the difference between `dependencies` and `devDependencies`?"**  
> **A**: "`dependencies` are packages required for your application to run in production. `devDependencies` are only needed during development (testing, linting, building). Install dev deps with `npm install --save-dev <pkg>`."

> **Q: "Why do we commit `package-lock.json` but ignore `node_modules`?"**  
> **A**: "`package-lock.json` locks exact versions of all dependencies + their dependency trees, ensuring reproducible installs across machines. `node_modules` is large, regenerated via `npm install`, and shouldn't bloat version control."

> **Q: "How does semantic versioning help with dependency management?"**  
> **A**: "SemVer communicates change impact: Patch = safe bug fixes, Minor = safe new features, Major = breaking changes. Tools can auto-update within ranges (`^1.2.3` allows `1.x.x` updates) while avoiding breaking changes."

> **Q: "What happens if two packages depend on different versions of the same library?"**  
> **A**: "npm installs both versions in nested `node_modules` folders (deduplication when possible). `package-lock.json` tracks the exact resolution. This avoids conflicts but can increase bundle size."

> **Q: "How do you update a dependency to its latest compatible version?"**  
> **A**: "Run `npm update <pkg>` to install the latest version within the semver range specified in `package.json`. Use `npm install <pkg>@latest` to bypass the range and install the absolute latest (may require manual package.json update)."

> **Q: "What's the purpose of the `engines` field in `package.json`?"**  
> **A**: "It specifies required Node.js/npm versions for your project (e.g., `"engines": { "node": ">=18.0.0" }`). npm warns or errors during install if the user's environment doesn't match, preventing compatibility issues."

## 13. Quick Reference Tables & Debugging Guide

### npm Command Cheat Sheet

```bash
# PROJECT SETUP
npm init                        # Interactive package.json creation
npm init --yes                  # Quick defaults, no prompts
npm -v                          # Check npm version

# PACKAGE INSTALLATION
npm install <pkg>               # Install + add to dependencies
npm install <pkg>@<version>     # Install specific version
npm install                     # Install ALL dependencies from package.json
npm install -g <pkg>            # Install global CLI tool
npm uninstall <pkg>             # Remove package + update config

# SCRIPT EXECUTION
npm run <script>                # Execute custom script
npm start                       # Special: runs 'start' script
npm test                        # Special: runs 'test' script

# PUBLISHING
npm adduser                     # Authenticate with npm registry
npm publish                     # Publish package to public registry
npm publish --access restricted # Publish private package (paid org)

# INSPECTION & DEBUGGING
cat package.json                # View project config
cat package-lock.json           # View locked dependency tree
ls node_modules                 # List installed packages
npm ls                          # List dependency tree with versions
npm outdated                    # Check for outdated dependencies
npm audit                       # Scan for security vulnerabilities
```

### package.json Field Quick Reference

| Field             | Required | Purpose                                  | Example                             |
| ----------------- | -------- | ---------------------------------------- | ----------------------------------- |
| `name`            | ✅ Yes   | Package identifier (lowercase, one word) | `"my-awesome-lib"`                  |
| `version`         | ✅ Yes   | Current version (semver format)          | `"1.2.3"`                           |
| `description`     | ❌ No    | Short summary for registry search        | `"Utility for string manipulation"` |
| `keywords`        | ❌ No    | Array of search terms                    | `["string", "utils", "helper"]`     |
| `main`            | ❌ No    | Entry point for `require()`              | `"src/index.js"`                    |
| `scripts`         | ❌ No    | Custom CLI command shortcuts             | `{ "start": "node app.js" }`        |
| `dependencies`    | ❌ No    | Runtime packages required                | `{ "express": "^4.18.0" }`          |
| `devDependencies` | ❌ No    | Development-only packages                | `{ "jest": "^29.0.0" }`             |
| `engines`         | ❌ No    | Required Node/npm versions               | `{ "node": ">=18.0.0" }`            |
| `author`          | ❌ No    | Package creator info                     | `"Your Name <email@example.com>"`   |
| `license`         | ❌ No    | Usage rights specification               | `"MIT"`                             |

### Common Issues & Solutions

| Symptom                                 | Likely Cause                                                        | Solution                                                                            |
| --------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| "Cannot find module 'pkg'"              | `node_modules` missing or package not installed                     | Run `npm install` to restore dependencies                                           |
| Version conflicts between packages      | Different packages require incompatible versions of same dependency | Check `package-lock.json`; consider `npm dedupe` or updating packages               |
| `npm install` takes too long            | Large dependency tree or slow network                               | Use `npm ci` for clean installs; check network; consider pnpm for faster installs   |
| Global command not found                | Package installed locally, not globally                             | Use `npm install -g <pkg>` for CLI tools; ensure PATH includes global bin directory |
| Publish fails: "name already taken"     | Package name collision in registry                                  | Choose a unique name; consider scoped packages (`@yourname/pkg`)                    |
| Script not found: "missing script: xyz" | Script not defined in `package.json`                                | Add script to `scripts` field: `"xyz": "command-to-run"`                            |
| Dependency not updating                 | Version range in `package.json` restricts update                    | Check semver range (`^`, `~`); use `npm install <pkg>@latest` to bypass             |

### Debugging Workflow

```bash
# 1. Verify npm and Node versions
node -v && npm -v

# 2. Check package.json validity
cat package.json | jq .  # Requires jq; or use JSON validator online

# 3. Inspect dependency tree
npm ls                    # Full tree
npm ls --depth=0          # Top-level dependencies only

# 4. Check for outdated packages
npm outdated

# 5. Audit for security issues
npm audit
npm audit fix             # Auto-fix compatible vulnerabilities

# 6. Clean reinstall (if node_modules corrupted)
rm -rf node_modules package-lock.json
npm install

# 7. Verify global packages
npm list -g --depth=0

# 8. Test script execution
npm run <script-name> -- --help  # Pass flags to underlying command
```

## 14. Production Best Practices

### Dependency Management

```json
// Use precise version ranges for production stability
{
  "dependencies": {
    "express": "4.18.2", // Exact version for critical deps
    "lodash": "^4.17.21", // Allow patch/minor updates for non-breaking changes
    "axios": "~1.4.0" // Allow patch updates only
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "eslint": "^8.40.0"
  }
}
```

### Security & Maintenance

```bash
# Regularly audit dependencies
npm audit
npm audit fix --dry-run    # Preview fixes before applying

# Update dependencies safely
npm outdated               # See what's outdated
npm update                 # Update within semver ranges
npm install <pkg>@latest   # Force latest (review changelog first)

# Use lockfile for reproducibility
# ALWAYS commit package-lock.json
# NEVER commit node_modules
```

### Script Standardization

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage --watchAll=false",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --fix",
    "build": "tsc && npm run lint",
    "prepublishOnly": "npm run build && npm run test",
    "postinstall": "node scripts/postinstall.js"
  }
}
```

### Publishing Checklist

```markdown
## Before `npm publish`:

- [ ] `name` is unique and follows naming rules (lowercase, hyphens/underscores)
- [ ] `version` follows semver and hasn't been published before
- [ ] `package.json` has required fields (`name`, `version`)
- [ ] `README.md` exists with usage instructions
- [ ] `LICENSE` file is present
- [ ] `.npmignore` or `files` field excludes unnecessary files (tests, docs, config)
- [ ] Code is tested and working locally
- [ ] Authentication verified: `npm whoami` returns your username

## After `npm publish`:

- [ ] Verify at npmjs.com/package/<your-package>
- [ ] Test installation in a fresh project: `npm install <pkg>` + `require('<pkg>')`
- [ ] Document version changes in changelog/README
- [ ] Communicate breaking changes via Major version bump
```

### Team Collaboration Patterns

```bash
# Onboarding new developers:
git clone <repo>
cd <project>
npm install          # Installs exact versions from package-lock.json
npm run start        # Uses standardized script

# CI/CD pipeline example:
- checkout code
- npm ci             # Clean install from lockfile (faster, more reliable than npm install)
- npm run lint
- npm run test
- npm run build
- deploy artifacts

# Dependency updates workflow:
1. Run `npm outdated` to see available updates
2. Review changelogs for breaking changes
3. Update package.json version ranges if needed
4. Run `npm install` to update lockfile
5. Test thoroughly
6. Commit package.json + package-lock.json
7. Notify team of updates via PR/commit message
```

## 15. Section 5 Recap & Knowledge Checklist

### ✅ Core Concepts Mastered

```
✅ npm Fundamentals
   ├─ Dual role: registry (library) + CLI tool (package manager)
   ├─ Bundled with Node.js; verify with `npm -v`
   ├─ Alternatives exist (pnpm, yarn); npm is default
   └─ Fundamental for enterprise JavaScript development

✅ package.json Configuration
   ├─ JSON file in project root; npm's central config
   ├─ Mandatory: name (lowercase, hyphens), version (x.y.z semver)
   ├─ Optional: description, keywords, main, scripts, dependencies
   ├─ Create via `npm init` (interactive) or `npm init --yes` (defaults)
   └─ Single source of truth for project metadata and dependencies

✅ Package Installation Workflow
   ├─ Three steps: search npmjs.com → assess quality → `npm install <pkg>`
   ├─ Assessment: publish date, downloads, size, docs, open issues
   ├─ `--save` deprecated; dependencies added to package.json by default
   ├─ Creates/updates: node_modules/, package.json, package-lock.json
   └─ Uninstall: `npm uninstall <pkg>` removes + updates config files

✅ Using Third-Party Modules
   ├─ Installed packages are Node.js modules: `require('package-name')`
   ├─ Import by exact package name (not file path); destructure exports
   ├─ Convert ES module examples to CommonJS if project uses require()
   ├─ Leverage trusted packages (lodash, upper-case) to avoid reinventing utilities
   └─ Focus on business logic, not foundational code implementation

✅ Dependency Management & Team Collaboration
   ├─ `dependencies` field tracks packages required for project to function
   ├─ Auto-populated by `npm install <pkg>`; rarely edited manually
   ├─ Enables reproducible environments: commit package.json + package-lock.json
   ├─ New developers/CI: `npm install` reads dependencies and installs all packages
   └─ Critical for team collaboration and deployment consistency

✅ Semantic Versioning (SemVer)
   ├─ Format: X.Y.Z = Major.Minor.Patch
   ├─ Increment rules:
   │  ├─ Patch (Z): backward-compatible bug fixes → 1.1.1 → 1.1.2
   │  ├─ Minor (Y): backward-compatible new features → 1.1.1 → 1.2.0 (reset Z)
   │  └─ Major (X): breaking changes → 1.1.1 → 2.0.0 (reset Y & Z)
   ├─ Lifecycle: 0.Y.Z (dev/unstable) → 1.0.0 (production-ready)
   ├─ Install specific version: `npm install pkg@2.0.0`
   └─ Shared responsibility: creators bump correctly; consumers verify before updating

✅ Global Packages for CLI Tools
   ├─ Install with `-g` flag: `npm install -g <pkg>`
   ├─ System-wide CLI tools (nodemon, create-react-app), not imported in code
   ├─ Not tracked in package.json; `npm install` won't install them
   ├─ Must be manually installed by each developer on their machine
   └─ Use for cross-project development utilities, not runtime dependencies

✅ npm Scripts for Workflow Standardization
   ├─ Bundle common CLI commands in package.json's scripts field
   ├─ Execute via `npm run <script-name>`; `npm start` is special (omits `run`)
   ├─ Ensures team consistency: same commands, same options, version-controlled
   ├─ Common use cases: start, test, build, lint, compile, minify
   └─ Abstracts complex command chains into simple, memorable shortcuts

✅ Publishing Packages to npm Registry
   ├─ Prerequisites: npmjs.com account + terminal auth via `npm adduser`
   ├─ Validate package.json: unique name (lowercase), valid semver version
   ├─ Publish: `npm publish` from project root
   ├─ Verify: visit npmjs.com/package/<name>; test install in new project
   ├─ Versions are immutable; bump version to republish changes
   └─ Public by default; use `--access restricted` + paid org for private packages
```

### 🎯 Self-Assessment Checklist

```markdown
## I can confidently:

- [ ] Explain npm's dual role as registry and package manager
- [ ] Create and configure package.json with mandatory and optional fields
- [ ] Search npmjs.com and assess package quality before installation
- [ ] Install, use, and uninstall npm packages via CLI commands
- [ ] Import third-party modules using require() with correct syntax
- [ ] Explain the purpose of dependencies, node_modules, and package-lock.json
- [ ] Interpret semantic version numbers and make informed update decisions
- [ ] Differentiate local vs global package installation and use cases
- [ ] Create and execute npm scripts for team workflow consistency
- [ ] Publish a package to the npm registry following proper steps
- [ ] Troubleshoot common npm issues (missing modules, version conflicts)
- [ ] Apply production best practices for dependency management and security
```

### 🔗 Further Learning Resources (From Course)

- Official npm documentation: [docs.npmjs.com](https://docs.npmjs.com)
- npm registry search: [npmjs.com](https://npmjs.com)
- Semantic Versioning specification: [semver.org](https://semver.org)
- Node.js modules documentation: [nodejs.org/api/modules.html](https://nodejs.org/api/modules.html)

> 🎯 **You now master npm**: You can install, manage, script, and publish packages; understand semantic versioning; configure projects for team collaboration; and leverage the registry to accelerate development. This foundation is essential for professional Node.js work and modern JavaScript tooling.

> ➡️ **Next**: Section 6 — [Upcoming Topic: Express.js Fundamentals or Advanced Node.js Patterns]
