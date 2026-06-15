<!-- TOC:START -->
- [Math CLI](#math-cli)
  - [Build Pipeline](#build-pipeline)
  - [Component Diagram](#component-diagram)
  - [Components Table](#components-table)
  - [Component Details](#component-details)
  - [Usage](#usage)
<!-- TOC:END -->

# Math CLI

A simple two-component TypeScript project demonstrating all three autogen-markdown-doc
content-generation features: table of contents, NX build-pipeline diagram, and UML
class diagrams.

## Build Pipeline

<!-- NX_GRAPH:START -->
```mermaid
graph TD

  build["build<br/>Compile TypeScript source to JavaScript"]
  e2e["e2e<br/>Run end-to-end integration tests"]
  install["install<br/>Install npm dependencies"]
  lint["lint<br/>Run ESLint on TypeScript source files"]
  test["test<br/>Run unit tests with vitest"]
  type_check["type-check<br/>Type-check source without emitting"]

  build --> install
  e2e --> lint
  e2e --> test
  lint --> install
  test --> build
  type_check --> build
```
<!-- NX_GRAPH:END -->

## Component Diagram

<!-- UML:components:START -->
```mermaid
flowchart TB
  subgraph cli["cli"]
  end
  subgraph math-engine["math-engine"]
  end

  cli --> math-engine
```
<!-- UML:components:END -->

## Components Table

<!-- UML:components-table:START -->
| Package | Description |
|---------|-------------|
| [cli](#cli) | Command-line interface layer that parses arguments and dispatches math operations to the math-engine component |
| [math-engine](#math-engine) | Code for System Backend -- which enables CLI front-end access to a suite of sophisticated math functions |
<!-- UML:components-table:END -->

## Component Details

<!-- UML:component-details:START -->
#### cli
```mermaid
classDiagram
  direction TB
  class AddCommand {
    +name unknown
    +description unknown
    -engine MathEngine
    +execute(args) void
  }
  class ArgParser {
    +parse(argv) ParsedArgs
  }
  class CliCommand {
    <<interface>>
    +name string
    +description string
    +execute(args) void
  }
  class CliRunner {
    -registry CommandRegistry
    -parser ArgParser
    +run(argv) void
  }
  class CommandRegistry {
    -commands Map<string, CliCommand>
    +register(command) void
    +get(name) CliCommand | undefined
    +listAll() CliCommand[]
  }
  class ParsedArgs {
    <<interface>>
    +command "add" | "subtract"
    +a number
    +b number
  }
  class SubtractCommand {
    +name unknown
    +description unknown
    -engine MathEngine
    +execute(args) void
  }

  AddCommand ..|> CliCommand
  SubtractCommand ..|> CliCommand
```

#### math-engine
```mermaid
classDiagram
  direction TB
  class MathEngine {
    +add(a, b) MathResult
    +subtract(a, b) MathResult
    -validate(op, a, b) void
  }
  class MathError {
    +operation Operation
  }
  class MathResult {
    <<interface>>
    +value number
    +operation Operation
    +operands [number, number]
  }
  class Operation {
    <<type>>
  }
```
<!-- UML:component-details:END -->

## Usage

```bash
node dist/cli/CliRunner.js add 3 4
```

