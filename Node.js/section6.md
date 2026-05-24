# Node.js Fundamentals — Section 6: CLI Tools — Build Terminal Utilities with Node

> 🎯 **Focus**: Building command-line interfaces with Node.js and npm: basic CLI setup, passing options with `yargs`, adding interactivity with `inquirer`, and packaging for distribution.  
> 📌 **Rule**: Every concept, example, command, and inference is derived directly from course transcriptions (Lessons 58-60). No external assumptions added.

## Table of Contents

1. [Section Overview & Learning Objectives](#1-section-overview--learning-objectives)
2. [Lesson 58: Building a Basic CLI Tool](#2-lesson-58-building-a-basic-cli-tool)
3. [Lesson 59: Passing Options & Arguments to CLI Tools](#3-lesson-59-passing-options--arguments-to-cli-tools)
4. [Lesson 60: Adding Interactivity to CLI Tools](#4-lesson-60-adding-interactivity-to-cli-tools)
5. [Complete CLI Development Reference: Commands, Patterns & Workflows](#5-complete-cli-development-reference-commands-patterns--workflows)
6. [Comprehensive Interview Prep Cheat Sheet](#6-comprehensive-interview-prep-cheat-sheet)
7. [Quick Reference Tables & Debugging Guide](#7-quick-reference-tables--debugging-guide)
8. [Production Best Practices](#8-production-best-practices)
9. [Section 6 Recap & Knowledge Checklist](#9-section-6-recap--knowledge-checklist)

## 1. Section Overview & Learning Objectives

### What This Section Covers

- **CLI fundamentals**: What a Command Line Interface is, and why it matters
- **Basic CLI setup**: Converting a Node.js package into an executable terminal command
- **Option parsing**: Accepting user arguments via `--option=value` syntax using `yargs`
- **Interactive prompts**: Guiding users with questions using `inquirer`
- **Global installation & testing**: Installing CLIs locally for development without publishing
- **Packaging for distribution**: Preparing CLI tools for npm registry publication

### Learning Outcomes

✅ Create a Node.js project that runs as a terminal command from any directory  
✅ Add a shebang and `bin` field to make scripts executable  
✅ Parse CLI arguments manually via `process.argv` or with `yargs`  
✅ Build interactive, prompt-driven CLIs using `inquirer`  
✅ Test CLI tools locally via `npm install -g .` without publishing  
✅ Understand version compatibility considerations for CommonJS vs ES modules  
✅ Design user-friendly terminal experiences that reduce memorization burden

## 2. Lesson 58: Building a Basic CLI Tool

### Core Concept: The Terminal Shortcut & Interpreter Label

Think of a Node.js CLI as a **terminal shortcut** linked to a script:

| Analogy                     | Technical Meaning                                                          |
| --------------------------- | -------------------------------------------------------------------------- |
| **Shortcut registration**   | `bin` field in `package.json` maps command name → script path              |
| **Interpreter label**       | Shebang (`#!/usr/bin/env node`) tells OS which program executes the script |
| **System PATH integration** | Global installation (`npm install -g .`) makes command available anywhere  |

> ✅ A CLI is just a Node.js package with two extra configurations that make it executable from the terminal.

### What Is a CLI?

- **CLI** = Command Line Interface
- A program you run directly from the terminal
- Examples you already use: `npm`, `git`
- **Goal of this section**: Create a simple CLI using Node.js and npm

### Three-Step Implementation

#### Step 1: Initialize a New npm Project

```bash
mkdir my-custom-cli
cd my-custom-cli
npm init --yes
```

- Generates `package.json` with default values
- Change `name` to your CLI name (e.g., `code-evolution-pokedex`)
- ⚠️ **Must be unique** across the npm registry to publish later

#### Step 2: Write the CLI Code

Create `index.js` in the project folder:

```js
console.log("code Evolution Pokedex");
```

#### Step 3: Convert Package to Executable CLI

Two additions are required:

##### A. Add Shebang to `index.js`

```js
#!/usr/bin/env node

console.log("code Evolution Pokedex");
```

- **Shebang/Hashbang** (`#!/usr/bin/env node`) tells the operating system which interpreter to use
- Specifies `node` as the interpreter and uses `env` to locate Node.js in the system PATH
- Must be the **very first line** of the file

##### B. Add `bin` Field to `package.json`

```json
{
  "name": "code-evolution-pokedex",
  "version": "1.0.0",
  "bin": {
    "code-evolution-pokedex": "index.js"
  }
}
```

- `bin` field allows npm to treat the package as an **executable file**
- Maps your custom CLI command name (`code-evolution-pokedex`) to the entry point script (`index.js`)
- During global installation, npm registers this command in your system's PATH variable

### Testing Your CLI Locally

#### Install Globally from Current Directory

```bash
sudo npm install -g .
# sudo not required on Windows
# The dot (.) tells npm to install the current project directory globally
```

#### Run the CLI Command

```bash
code-evolution-pokedex
# Output: code Evolution Pokedex
```

> ✅ npm reads the `bin` field during installation, creates a system executable link, and allows you to run your CLI from any terminal location.

### Key Insights

| Concept                             | Purpose                                    | Why It Matters                                                          |
| ----------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| **Shebang (`#!/usr/bin/env node`)** | Tells OS which interpreter runs the script | Without it, the OS won't know to use Node.js to execute your file       |
| **`bin` field**                     | Maps CLI command name to script path       | Makes your package executable and registers it in the system PATH       |
| **`npm install -g .`**              | Installs current directory globally        | Tests CLI locally without publishing to registry                        |
| **Unique package name**             | Required for npm registry                  | Prevents naming collisions; ensures your package can be published later |
| **No re-install for code changes**  | Global install symlinks to source          | Edit `index.js` → run command → see changes immediately                 |

## 3. Lesson 59: Passing Options & Arguments to CLI Tools

### Core Concept: The Command-Line Form Fields

Think of CLI options like **form fields in a terminal**:

| Form Analogy        | CLI Equivalent                                                                  |
| ------------------- | ------------------------------------------------------------------------------- |
| **Form label**      | Option name (`--pokemon`)                                                       |
| **Input value**     | User-provided argument (`Charmander`)                                           |
| **Form submission** | Pressing Enter to execute the command                                           |
| **Form parser**     | `yargs` package converting `--pokemon=Charmander` → `{ pokemon: 'Charmander' }` |

> ✅ CLI options let users customize behavior at runtime, turning a static script into a flexible, reusable tool.

### Part 1: Adding Business Logic (PokeAPI Integration)

#### Goal: Display the first five moves for a given Pokémon

```js
const print5Moves = async (pokemonName) => {
  // 1. Fetch data from PokeAPI
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
  );

  // 2. Parse JSON response
  const pokemon = await response.json();

  // 3. Extract move names from moves array
  const moves = pokemon.moves.map((move) => move.move.name);

  // 4. Log first five moves only
  console.log(moves.slice(0, 5));
};

// Initial test with hardcoded value
print5Moves("Charmander");
```

#### Terminal Output

```bash
code-evolution-pokedex
# Output: [ 'mega-punch', 'fire-punch', 'thunder-punch', 'scratch', 'swords-dance' ]
```

> ✅ The CLI executes the logic in `index.js` automatically because it's linked via the `bin` field. No re-installation needed after code changes.

### Part 2: Making the CLI Dynamic with Options

#### The Problem: Hardcoded Values

```js
// ❌ Static: Always fetches Charmander
print5Moves("Charmander");
```

#### The Solution: Accept User Input via CLI Options

Users should be able to run:

```bash
code-evolution-pokedex --pokemon=Charmander
code-evolution-pokedex --pokemon=Mew
```

### Accessing CLI Arguments: Two Approaches

#### Approach 1: Raw `process.argv` (Educational)

```js
// Add to index.js to inspect arguments
console.log(process.argv);
```

##### Running with Options

```bash
code-evolution-pokedex --pokemon=Charmander
```

##### Output Structure

```js
[
  "/usr/local/bin/node", // [0] Path to Node.js interpreter
  "/path/to/index.js", // [1] Path to your CLI script
  "--pokemon=Charmander", // [2+] User-provided options
];
```

> ⚠️ **Limitation**: You must manually parse the array to extract key-value pairs—error-prone and verbose.

#### Approach 2: Using `yargs` Package (Practical)

**`yargs`** converts CLI options into easy-to-access key-value pairs.

##### Step 1: Install `yargs`

```bash
npm install yargs
# → Added to package.json dependencies
```

##### Step 2: Import and Parse Arguments

```js
// index.js
const yargs = require("yargs");

// Parse process.argv into key-value object
const args = yargs(process.argv).argv;

// Access the pokemon option directly
const pokemonName = args.pokemon;

// Use dynamic value instead of hardcoded
print5Moves(pokemonName);
```

##### Step 3: Run with Different Options

```bash
# Fetch Charmander moves
code-evolution-pokedex --pokemon=Charmander
# Output: [ 'mega-punch', 'fire-punch', 'thunder-punch', 'scratch', 'swords-dance' ]

# Fetch Mew moves
code-evolution-pokedex --pokemon=Mew
# Output: [ 'pound', 'mega-punch', 'fire-punch', 'thunder-punch', 'scratch' ]
```

> ✅ `yargs` handles parsing, validation, and help text generation—making your CLI professional and user-friendly.

### Minimal Working Example: Complete `index.js`

```js
#!/usr/bin/env node

const yargs = require("yargs");

// Async function to fetch and print first 5 Pokemon moves
const print5Moves = async (pokemonName) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
    );
    const pokemon = await response.json();
    const moves = pokemon.moves.map((move) => move.move.name);
    console.log(moves.slice(0, 5));
  } catch (error) {
    console.error(`Error fetching ${pokemonName}:`, error.message);
  }
};

// Parse CLI arguments
const args = yargs(process.argv).argv;

// Execute with user-provided pokemon name
if (args.pokemon) {
  print5Moves(args.pokemon);
} else {
  console.log("Usage: code-evolution-pokedex --pokemon=<name>");
}
```

### Key Insights

| Insight                                   | Explanation                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| **`process.argv` structure**              | Array where `[0]` = Node path, `[1]` = script path, `[2+]` = user options                     |
| **Manual parsing is fragile**             | Splitting `--pokemon=Charmander` requires string manipulation; easy to break                  |
| **`yargs` simplifies argument parsing**   | Converts `--pokemon=Charmander` → `{ pokemon: 'Charmander' }` automatically                   |
| **No re-install needed for code changes** | Globally installed CLI executes the current `index.js`; edit code → run command → see changes |
| **Async/await works in CLI scripts**      | Node.js supports top-level async operations in CLI entry points                               |

## 4. Lesson 60: Adding Interactivity to CLI Tools

### Core Concept: The Conversational Terminal

Think of an interactive CLI like **a friendly chatbot in your terminal**:

| Chatbot Analogy               | CLI Equivalent                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| **Bot asks a question**       | Prompt displays: "Enter a Pokemon name to view its first five moves" |
| **You type a reply**          | User inputs: `Dragonite` + presses Enter                             |
| **Bot processes your answer** | Inquirer captures input → passes to your logic                       |
| **Bot responds with results** | CLI fetches API data → displays first five moves                     |

> ✅ Interactive CLIs guide users step-by-step, eliminating the need to memorize command syntax or consult documentation.

### The Evolution of CLI UX

```
Static CLI: code-evolution-pokedex --pokemon=Charmander
           ↓
Interactive CLI: code-evolution-pokedex
                 → "Enter a Pokemon name: " [user types: Dragonite]
                 → Displays moves for Dragonite
```

**Why Interactivity Matters**:

- Users don't need to remember option names or syntax
- Built-in guidance reduces errors and improves discoverability
- Feels more approachable for non-technical users

### Three-Step Implementation with Inquirer

#### Step 1: Prepare the Code

- Comment out `yargs`-related code (no longer passing CLI options)
- Keep the `print5Moves` async function from the previous lesson

#### Step 2: Install Inquirer Package

```bash
npm install inquirer@8.2.5
```

> ⚠️ **Version Note**: Version 9+ only supports ES modules. Use version 8.x for CommonJS (`require()`) projects.

#### Step 3: Import and Configure Interactive Prompts

##### Import Inquirer

```js
const inquirer = require("inquirer");
```

##### Create Prompt Module & Define Questions

```js
// Create reusable prompt module
const prompt = inquirer.createPromptModule();

// Define questions array (each question is an object)
const questions = [
  {
    type: "input", // Input type: text field
    name: "pokemon", // Key to access answer in results
    message: "Enter a Pokemon name to view its first five moves:", // User-facing prompt
  },
];
```

##### Execute Prompt & Handle Response

```js
// Invoke prompt with questions array (returns a Promise)
prompt(questions)
  .then((answers) => {
    // Extract the pokemon answer by its 'name' property
    const pokemonName = answers.pokemon;

    // Call existing logic with user input
    print5Moves(pokemonName);
  })
  .catch((error) => {
    console.error("Error prompting user:", error);
  });
```

### Minimal Working Example: Complete `index.js`

```js
#!/usr/bin/env node

const inquirer = require("inquirer");

// Async function to fetch and print first 5 Pokemon moves
const print5Moves = async (pokemonName) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
    );
    const pokemon = await response.json();
    const moves = pokemon.moves.map((move) => move.move.name);
    console.log(moves.slice(0, 5));
  } catch (error) {
    console.error(`Error fetching ${pokemonName}:`, error.message);
  }
};

// Create prompt module for interactivity
const prompt = inquirer.createPromptModule();

// Define user questions
const questions = [
  {
    type: "input",
    name: "pokemon",
    message: "Enter a Pokemon name to view its first five moves:",
  },
];

// Execute interactive prompt
prompt(questions)
  .then((answers) => {
    print5Moves(answers.pokemon);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Testing the Interactive CLI

#### Run the Command

```bash
code-evolution-pokedex
```

#### Terminal Interaction

```
? Enter a Pokemon name to view its first five moves: Dragonite
[ 'wing-attack', 'whirlwind', 'fly', 'bind', 'slam' ]
```

> ✅ No options needed—just run the command and follow the prompt.

### Key Insights

| Insight                         | Explanation                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Inquirer version matters**    | Version 9+ requires ES modules; use 8.x for CommonJS (`require()`) projects                    |
| **Question object structure**   | Each question needs `type` (input style), `name` (answer key), and `message` (user prompt)     |
| **Prompts return Promises**     | Use `.then()` or `async/await` to handle user responses asynchronously                         |
| **Answers are keyed by `name`** | Access user input via `answers.pokemon` where `pokemon` matches the question's `name` property |
| **No CLI options needed**       | Interactive mode eliminates the need for `--pokemon=value` syntax, improving UX                |

### Common Inquirer Question Types (Beyond `input`)

| Type                          | Purpose                       | Example Use                           |
| ----------------------------- | ----------------------------- | ------------------------------------- |
| `input`                       | Single-line text input        | Pokemon name, username                |
| `number`                      | Numeric input with validation | Age, quantity                         |
| `confirm`                     | Yes/No toggle                 | "Continue with installation?"         |
| `list` / `rawlist` / `expand` | Menu selection from options   | Choose environment (dev/staging/prod) |
| `checkbox`                    | Multi-select from options     | Select features to enable             |
| `password`                    | Masked text input             | API keys, credentials                 |

> 💡 Refer to [Inquirer.js documentation](https://github.com/SBoudrias/Inquirer.js) for full API details and advanced patterns.

## 5. Complete CLI Development Reference: Commands, Patterns & Workflows

### Essential CLI Commands

```bash
# PROJECT SETUP
mkdir my-cli && cd my-cli
npm init --yes                          # Quick package.json with defaults

# CONVERT TO CLI
# 1. Add to index.js: #!/usr/bin/env node (MUST be first line)
# 2. Add to package.json:
{
  "bin": {
    "my-cli-command": "index.js"       # Maps command → script
  }
}

# TEST LOCALLY (NO PUBLISHING)
sudo npm install -g .                  # Linux/macOS (sudo may be required)
npm install -g .                       # Windows (no sudo)
# The dot (.) installs current directory globally

# RUN YOUR CLI (from any directory)
my-cli-command

# ADD OPTION PARSING
npm install yargs
# index.js:
const yargs = require('yargs');
const args = yargs(process.argv).argv;
console.log(args.myOption);            # Access via args.optionName

# ADD INTERACTIVITY
npm install inquirer@8.2.5             # v8.x for CommonJS projects
# index.js:
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
prompt([{ type: 'input', name: 'answer', message: 'Question?' }])
  .then(answers => console.log(answers.answer));

# PUBLISH TO NPM (OPTIONAL)
npm adduser                            # Authenticate with registry
npm publish                            # Publish globally
# Users install with: npm install -g your-package-name
```

### package.json CLI Configuration Reference

```json
{
  "name": "code-evolution-pokedex", // REQUIRED: unique, lowercase, hyphens allowed
  "version": "1.0.0", // REQUIRED: semantic versioning (x.y.z)
  "description": "CLI tool to view Pokemon moves",
  "main": "index.js", // Entry point for require()
  "bin": {
    // REQUIRED for CLI: maps command → script
    "code-evolution-pokedex": "index.js"
  },
  "scripts": {
    "start": "node index.js", // Optional: run locally without global install
    "test": "echo \"No tests specified\" && exit 1"
  },
  "dependencies": {
    "yargs": "^17.7.2", // For option parsing
    "inquirer": "^8.2.5" // For interactive prompts (v8 for CommonJS)
  },
  "engines": {
    "node": ">=18.0.0" // Optional: specify required Node version
  },
  "keywords": ["cli", "pokemon", "pokedex"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Shebang & Execution Flow

```
User runs: code-evolution-pokedex --pokemon=Charmander
           ↓
OS reads shebang: #!/usr/bin/env node
           ↓
env locates Node.js in PATH
           ↓
Node executes: /path/to/index.js
           ↓
Script runs: parses args, fetches API, logs output
```

> ✅ The shebang ensures the correct interpreter runs your script regardless of how it's invoked.

### Option Parsing Comparison: `process.argv` vs `yargs`

```js
// ❌ Manual parsing with process.argv (fragile)
const args = process.argv.slice(2); // ['--pokemon=Charmander']
const pokemon = args.find((arg) => arg.startsWith("--pokemon="))?.split("=")[1]; // 'Charmander'

// ✅ Robust parsing with yargs
const yargs = require("yargs");
const args = yargs(process.argv).argv;
const pokemon = args.pokemon; // 'Charmander' - clean, validated, documented
```

### Interactive Prompt Patterns with Inquirer

```js
// Basic input prompt
const questions = [
  {
    type: "input",
    name: "pokemon",
    message: "Enter a Pokemon name:",
  },
];

// With validation
const questions = [
  {
    type: "input",
    name: "pokemon",
    message: "Enter a Pokemon name:",
    validate: (input) => {
      return input.trim().length > 0 || "Pokemon name cannot be empty";
    },
  },
];

// With default value
const questions = [
  {
    type: "input",
    name: "pokemon",
    message: "Enter a Pokemon name:",
    default: "pikachu",
  },
];

// Multiple questions
const questions = [
  {
    type: "input",
    name: "pokemon",
    message: "Enter a Pokemon name:",
  },
  {
    type: "number",
    name: "count",
    message: "How many moves to show?",
    default: 5,
    validate: (val) => (val > 0 && val <= 20) || "Enter 1-20",
  },
];

// Handling answers
prompt(questions).then((answers) => {
  printMoves(answers.pokemon, answers.count);
});
```

## 6. Comprehensive Interview Prep Cheat Sheet

### CLI Fundamentals

> **Q: "What is a CLI, and how does Node.js enable building them?"**  
> **A**: "A CLI (Command Line Interface) is a program run from the terminal. Node.js enables CLI development by allowing JavaScript to execute system commands, parse arguments, and interact with users. With a shebang, `bin` field, and global installation, any Node script becomes a terminal command."

> **Q: "What does the shebang `#!/usr/bin/env node` do?"**  
> **A**: "It tells the operating system to use the Node.js interpreter to execute the script. `env` dynamically locates Node.js in the system PATH, making the script portable across machines with Node installed in different locations."

> **Q: "What is the `bin` field in `package.json` used for?"**  
> **A**: "It maps CLI command names to executable script paths. When the package is installed globally, npm creates symlinks in the global bin directory so users can run the command from anywhere in the terminal."

### Option Parsing & Argument Handling

> **Q: "How do you access command-line arguments in a Node.js CLI?"**  
> **A**: "Use `process.argv`, which is an array containing the Node.js executable path, script path, and user-provided arguments. For easier parsing, use a library like `yargs` to convert arguments into key-value pairs."

> **Q: "What's the difference between `process.argv` and `yargs` for handling CLI arguments?"**  
> **A**: "`process.argv` is a raw array of strings requiring manual parsing. `yargs` is a library that parses arguments into a structured object, supports flags, options, defaults, validation, and help text—making it far more robust for production CLIs."

> **Q: "How do you make a CLI option required or provide a default value with `yargs`?"**  
> **A**: "Chain configuration methods: `.option('pokemon', { demandOption: true, describe: 'Pokemon name to fetch' })` makes it required; `.default('pokemon', 'pikachu')` sets a default value."

### Interactive Prompts & User Experience

> **Q: "How do you add interactive prompts to a Node.js CLI?"**  
> **A**: "Install the `inquirer` package, create a prompt module with `inquirer.createPromptModule()`, define an array of question objects (with `type`, `name`, `message`), and invoke the prompt. Handle the returned Promise to access user answers and pass them to your application logic."

> **Q: "What is the structure of an Inquirer question object?"**  
> **A**: "Each question is an object with at least three properties: `type` (input style like 'input', 'confirm', 'list'), `name` (key to access the answer in results), and `message` (text displayed to the user). Additional properties like `choices`, `default`, or `validate` add advanced behavior."

> **Q: "When would you choose interactive prompts over CLI options?"**  
> **A**: "Use prompts for guided, user-facing workflows (setup wizards, onboarding). Use CLI options for scriptable, automatable commands (CI/CD pipelines, batch operations). Many CLIs support both for flexibility."

### Installation, Testing & Distribution

> **Q: "How do you test a CLI locally before publishing to npm?"**  
> **A**: "Run `npm install -g .` from the project root. This installs the current directory globally, registers the `bin` command, and allows you to test the CLI exactly as an end-user would, without needing to publish first."

> **Q: "What happens when you edit a globally installed CLI's source code?"**  
> **A**: "Global installation creates a symlink to your project's entry script. Editing the source file updates the symlink target, so running the command executes the latest code immediately—no reinstallation needed. This enables rapid local development and testing."

> **Q: "What are the steps to publish a CLI tool to the npm registry?"**  
> **A**: "1) Ensure `package.json` has unique `name`, valid `version`, and correct `bin` field. 2) Authenticate with `npm adduser`. 3) Run `npm publish`. 4) Verify at npmjs.com/package/<name>. Users install with `npm install -g <package-name>`."

### Async Operations & Error Handling

> **Q: "How do you handle async operations (like API calls) in a CLI?"**  
> **A**: "Node.js supports top-level `await` in modules or async IIFE patterns. Wrap logic in `async` functions and use `await` for Promises. For Inquirer, chain `.then()` or use `async/await` to handle user input before proceeding to async operations."

> **Q: "What should you do if a user provides invalid input in an interactive CLI?"**  
> **A**: "Add validation to the question object using the `validate` property, which accepts a function that returns `true` for valid input or an error string for invalid input. Inquirer will re-prompt until valid input is received."

> **Q: "How do you handle errors when fetching data from an API in a CLI?"**  
> **A**: "Wrap async operations in `try/catch` blocks and log user-friendly error messages. For example: `catch (error) { console.error('Failed to fetch Pokemon:', error.message); process.exit(1); }` to exit with a non-zero status code."

### Advanced Patterns & Best Practices

> **Q: "Why use `inquirer.createPromptModule()` instead of calling `inquirer.prompt()` directly?"**  
> **A**: "`createPromptModule()` returns a reusable prompt instance with isolated configuration, useful for testing or multiple prompt contexts. For simple CLIs, `inquirer.prompt()` works fine. The video demonstrates `createPromptModule()` for modularity."

> **Q: "What version considerations exist for `inquirer` and CommonJS vs ES modules?"**  
> **A**: "Inquirer version 9+ only supports ES modules (`import` syntax). For CommonJS projects using `require()`, install version 8.x (e.g., `npm install inquirer@8.2.5`) to avoid compatibility issues."

> **Q: "How do you support both interactive and option-based modes in a CLI?"**  
> **A**: "Check if required options are provided via `yargs`. If present, execute logic directly. If missing, fall back to interactive prompts with `inquirer`. This provides flexibility for both scriptable automation and guided user workflows."

## 7. Quick Reference Tables & Debugging Guide

### CLI Development Command Cheat Sheet

```bash
# SETUP & INIT
mkdir my-cli && cd my-cli
npm init --yes                          # Quick package.json

# CONVERT TO EXECUTABLE CLI
# 1. Add shebang to index.js: #!/usr/bin/env node
# 2. Add bin field to package.json:
{
  "bin": { "my-command": "index.js" }
}

# TEST LOCALLY
sudo npm install -g .                  # Linux/macOS
npm install -g .                       # Windows
my-command                             # Run from any directory

# ADD OPTION PARSING
npm install yargs
# Usage in index.js:
const yargs = require('yargs');
const args = yargs(process.argv).argv;
console.log(args.optionName);

# ADD INTERACTIVITY
npm install inquirer@8.2.5             # v8 for CommonJS
# Usage in index.js:
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
prompt([{ type: 'input', name: 'ans', message: 'Q?' }])
  .then(answers => console.log(answers.ans));

# PUBLISH TO NPM
npm adduser                            # Authenticate
npm publish                            # Publish globally
# Users install: npm install -g your-package

# DEBUGGING & INSPECTION
node index.js                          # Run locally without global install
console.log(process.argv)              # Inspect raw arguments
npm ls -g --depth=0                    # List globally installed packages
which my-command                       # Show path to CLI executable (Unix)
where my-command                       # Show path to CLI executable (Windows)
```

### Common CLI Issues & Solutions

| Symptom                                  | Likely Cause                                        | Solution                                                                        |
| ---------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| "command not found" after global install | PATH not updated or install failed                  | Restart terminal; verify `npm config get prefix`; ensure `bin` field is correct |
| Shebang not working on Windows           | Windows doesn't use shebangs natively               | Use `.cmd` wrapper or rely on npm's global bin linking (works automatically)    |
| `yargs` not parsing options correctly    | Missing `process.argv` argument or version mismatch | Ensure `yargs(process.argv).argv`; check yargs version compatibility            |
| `inquirer` throws module error           | Using v9+ with CommonJS (`require()`)               | Install `inquirer@8.2.5` for CommonJS projects                                  |
| CLI doesn't reflect code changes         | Installed from npm registry, not local source       | Use `npm install -g .` for local testing; symlinks update automatically         |
| Async function doesn't wait for API      | Missing `await` or Promise handling                 | Wrap logic in `async` function; use `await fetch()` or `.then()` chains         |
| User input not captured                  | Question `name` doesn't match access key            | Ensure `answers.pokemon` matches question `name: 'pokemon'`                     |

### Debugging Workflow for CLI Development

```bash
# 1. Verify package.json bin configuration
cat package.json | jq .bin  # Requires jq; or inspect manually

# 2. Check shebang is first line of index.js
head -n 1 index.js  # Should output: #!/usr/bin/env node

# 3. Test local execution without global install
node index.js --pokemon=Charmander  # Bypasses bin linking for debugging

# 4. Inspect argument parsing
node -e "console.log(require('yargs')(process.argv).argv)" -- --test=value

# 5. Verify global installation path
npm config get prefix  # Shows global bin directory
ls $(npm config get prefix)/bin | grep my-command  # Confirm symlink exists

# 6. Test interactive prompts in isolation
node -e "
  const inquirer = require('inquirer');
  inquirer.prompt([{type:'input',name:'q',message:'Ask:'}])
    .then(a => console.log('Answer:', a.q));
"

# 7. Clean reinstall if symlinks break
npm uninstall -g my-package
npm install -g .
```

## 8. Production Best Practices

### CLI Project Structure

```
my-cli/
├── package.json          # With name, version, bin, dependencies
├── index.js              # Entry script with shebang
├── src/                  # Optional: modularize logic
│   ├── fetchPokemon.js   # API logic
│   ├── printMoves.js     # Output formatting
│   └── prompts.js        # Inquirer question definitions
├── README.md             # Usage instructions, examples
├── .gitignore            # Exclude node_modules, logs, env files
└── tests/                # Optional: unit tests for CLI logic
```

### package.json Best Practices for CLIs

```json
{
  "name": "code-evolution-pokedex",
  "version": "1.0.0",
  "description": "CLI tool to view Pokemon moves from PokeAPI",
  "main": "index.js",
  "bin": {
    "code-evolution-pokedex": "index.js"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node test.js",
    "prepublishOnly": "npm test"
  },
  "dependencies": {
    "yargs": "^17.7.2",
    "inquirer": "^8.2.5"
  },
  "devDependencies": {
    "eslint": "^8.40.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["cli", "pokemon", "pokedex", "terminal"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/code-evolution-pokedex.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/code-evolution-pokedex/issues"
  },
  "homepage": "https://github.com/yourusername/code-evolution-pokedex#readme"
}
```

### User Experience Guidelines

```js
// ✅ Provide helpful usage messages
if (!args.pokemon && !interactiveMode) {
  console.log(`
Usage: code-evolution-pokedex [options]

Options:
  --pokemon=<name>   Pokemon name to fetch moves for
  --interactive, -i  Run in interactive prompt mode

Examples:
  code-evolution-pokedex --pokemon=charmander
  code-evolution-pokedex -i
  `);
  process.exit(1);
}

// ✅ Validate user input early
const validatePokemon = (name) => {
  if (!name || name.trim() === "") {
    return "Pokemon name cannot be empty";
  }
  if (!/^[a-z0-9-]+$/i.test(name)) {
    return "Use letters, numbers, or hyphens only";
  }
  return true;
};

// ✅ Handle API errors gracefully
const print5Moves = async (pokemonName) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
    );
    if (!response.ok) {
      throw new Error(
        `Pokemon "${pokemonName}" not found (HTTP ${response.status})`,
      );
    }
    const pokemon = await response.json();
    const moves = pokemon.moves.map((move) => move.move.name);
    console.log(`\nFirst 5 moves for ${pokemonName.toUpperCase()}:`);
    console.log(
      moves
        .slice(0, 5)
        .map((m, i) => `  ${i + 1}. ${m}`)
        .join("\n"),
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log("💡 Tip: Check spelling or try a different Pokemon name");
    process.exit(1); // Non-zero exit indicates failure
  }
};
```

### Publishing Checklist

```markdown
## Before `npm publish`:

- [ ] `name` is unique and follows naming rules (lowercase, hyphens/underscores)
- [ ] `version` follows semver and hasn't been published before
- [ ] `bin` field correctly maps command → entry script
- [ ] Shebang (`#!/usr/bin/env node`) is first line of entry script
- [ ] `README.md` exists with usage instructions and examples
- [ ] `LICENSE` file is present
- [ ] `.gitignore` excludes `node_modules`, logs, env files
- [ ] Code is tested locally with `npm install -g .`
- [ ] Authentication verified: `npm whoami` returns your username
- [ ] Dependencies are pinned or use safe semver ranges (`^`, `~`)

## After `npm publish`:

- [ ] Verify at npmjs.com/package/<your-package>
- [ ] Test installation in fresh directory: `npm install -g <pkg>` + run command
- [ ] Document version changes in changelog/README
- [ ] Communicate breaking changes via Major version bump
- [ ] Monitor npm downloads and issues for user feedback
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

# Use lockfile for reproducibility (if publishing a library)
# For CLI tools, focus on testing across Node versions instead

# Test CLI across environments
# Use GitHub Actions or similar to test on Linux, macOS, Windows
```

## 9. Section 6 Recap & Knowledge Checklist

### ✅ Core Concepts Mastered

```
✅ CLI Fundamentals
   ├─ CLI = Command Line Interface: program run from terminal
   ├─ Examples: npm, git
   └─ Goal: Build simple, then interactive CLIs with Node.js + npm

✅ Building a Basic CLI (Lesson 58)
   ├─ Step 1: Initialize npm project (`npm init --yes`)
   ├─ Step 2: Write entry script (`index.js`) with desired logic
   ├─ Step 3: Convert to executable:
   │  ├─ Add shebang: `#!/usr/bin/env node` (tells OS to use Node interpreter)
   │  └─ Add `bin` field to package.json: maps command name → script path
   ├─ Test locally: `sudo npm install -g .` (installs current dir globally)
   └─ Run command: `<command-name>` executes linked script from any directory

✅ Passing Options to CLI (Lesson 59)
   ├─ Raw approach: `process.argv` array
   │  ├─ [0] = Node path, [1] = script path, [2+] = user options
   │  └─ Manual parsing required (fragile, verbose)
   ├─ Practical approach: `yargs` package
   │  ├─ Install: `npm install yargs`
   │  ├─ Parse: `const args = yargs(process.argv).argv`
   │  └─ Access: `args.pokemon` → `{ pokemon: 'Charmander' }`
   ├─ Dynamic behavior: CLI accepts `--pokemon=Name` at runtime
   └─ No re-install needed: Globally installed CLI symlinks to source; edits take effect immediately

✅ Adding Interactivity (Lesson 60)
   ├─ Goal: Prompt users instead of requiring CLI options
   ├─ Package: `inquirer` (version 8.x for CommonJS)
   ├─ Setup:
   │  ├─ Import: `const inquirer = require('inquirer')`
   │  ├─ Create module: `const prompt = inquirer.createPromptModule()`
   │  └─ Define questions: array of objects with `type`, `name`, `message`
   ├─ Execution:
   │  ├─ `prompt(questions)` returns Promise
   │  ├─ `.then(answers => { answers.pokemon })` accesses user input
   │  └─ Pass to application logic (e.g., `print5Moves(answers.pokemon)`)
   ├─ UX benefit: Guided, discoverable, no memorization required
   └─ Extensible: Supports `input`, `confirm`, `list`, `checkbox`, `password`, etc.

✅ Section 6 Key Patterns
   ├─ CLI = Node package + shebang + bin field + global install
   ├─ Options: Use `yargs` for robust argument parsing
   ├─ Prompts: Use `inquirer` for interactive, user-guided workflows
   ├─ Async/await works natively in CLI entry scripts
   └─ Global installation symlinks to source → code changes reflect immediately
```

### 🎯 Self-Assessment Checklist

```markdown
## I can confidently:

- [ ] Explain what a CLI is and how Node.js enables building them
- [ ] Add a shebang and `bin` field to make a Node script executable
- [ ] Install and test a CLI locally with `npm install -g .`
- [ ] Parse CLI arguments using `process.argv` and `yargs`
- [ ] Build interactive prompts with `inquirer` and handle user responses
- [ ] Choose between option-based and interactive CLI modes appropriately
- [ ] Handle async operations (API calls) and errors gracefully in CLIs
- [ ] Prepare a CLI package for publication to the npm registry
- [ ] Debug common CLI issues (PATH, shebang, argument parsing, version conflicts)
- [ ] Apply production best practices for CLI structure, UX, and maintenance
```

### 🔗 Further Learning Resources (From Course)

- Official npm CLI documentation: [docs.npmjs.com/cli](https://docs.npmjs.com/cli)
- `yargs` documentation: [yargs.js.org](https://yargs.js.org)
- `inquirer.js` documentation: [github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
- PokeAPI documentation: [pokeapi.co/docs](https://pokeapi.co/docs)
- Node.js modules documentation: [nodejs.org/api/modules.html](https://nodejs.org/api/modules.html)

> 🎯 **You now master CLI development in Node.js**: You can build executable terminal tools, parse options with `yargs`, add interactive prompts with `inquirer`, and distribute packages via npm. This skillset enables you to automate workflows, build developer tools, and create user-friendly command-line experiences.

> ➡️ **Next**: Section 7 — [Final Section: Course Wrap-Up, Advanced Patterns, or Capstone Project]
