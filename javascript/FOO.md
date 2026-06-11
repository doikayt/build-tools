# Math CLI

A simple two-package TypeScript project demonstrating UML generation.

## Package Diagram

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

<!-- UML:components-table:START -->
| Package | Description |
|---------|-------------|
| [cli](#cli) | TBD |
| [math-engine](#math-engine) | Code for System Backend -- which enables CLI front-end access to a suite of sophisticated math functions |
<!-- UML:components-table:END -->

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
