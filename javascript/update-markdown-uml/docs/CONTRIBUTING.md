# Contributing to @datalackey/update-markdown-uml

For workspace-level setup, build pipeline, and release workflow see:
[javascript/docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md)

---


## Code Structure Diagrams


### Component Diagram


<!-- UML:components:START -->
```mermaid
flowchart TB
  subgraph analysis["analysis"]
  end
  subgraph cli["cli"]
  end
  subgraph discovery["discovery"]
  end
  subgraph generators["generators"]
  end
  subgraph markdown["markdown"]
  end
  subgraph processor["processor"]
  end

  generators --> analysis
  processor --> analysis
  processor --> cli
  processor --> discovery
  processor --> generators
  processor --> markdown
```
<!-- UML:components:END -->

### Components Table

<!-- UML:components-table:START -->
| Package | Description |
|---------|-------------|
| [analysis](#analysis) | TypeScript import analysis: uses `ts-morph` to walk source files across leaf directories and collect directed cross-leaf import edges, which become the dependency arrows in generated component diagrams |
| [cli](#cli) | Plugin wiring for `update-markdown-uml`: declares the `PluginDescriptor` with `--source` and `--exclude-packages` flags, `UmlRunConfig` type, option parsing, and config validation |
| [discovery](#discovery) | Leaf component discovery: locates subdirectories under a source root that contain qualifying `.ts` files, and reads their `_COMPONENT_INFO.md` descriptions for use in diagram table rows |
| [generators](#generators) | Diagram and table generators: builds the Mermaid flowchart (component overview with dependency arrows), per-component Mermaid class diagrams, and the Markdown summary table from discovered components and import edges |
| [markdown](#markdown) | UML section injection: locates and replaces the three managed UML marker blocks (`UML:components`, `UML:components-table`, `UML:component-details`) within a target Markdown file |
| [processor](#processor) | Top-level `UmlFileProcessor`: orchestrates the full UML update pipeline — source root resolution, leaf discovery, import analysis, diagram generation, and Markdown injection — for a single target file |
<!-- UML:components-table:END -->

### Component Details

<!-- UML:component-details:START -->
#### analysis
```mermaid
classDiagram
  direction TB
  class ImportEdge {
    <<interface>>
    +from string
    +to string
  }
```

#### cli
```mermaid
classDiagram
  direction TB
  class UmlRunConfig {
    <<interface>>
    +excludePackages string[]
    +sourceRoot string | undefined
    +skipTestPatterns string[]
  }

  UmlRunConfig ..|> RunConfig
```

#### discovery
```mermaid
classDiagram
  direction TB
```

#### generators
```mermaid
classDiagram
  direction TB
```

#### markdown
```mermaid
classDiagram
  direction TB
  class UmlSections {
    <<interface>>
    +components string
    +componentsTable string
    +componentDetails string
  }
```

#### processor
```mermaid
classDiagram
  direction TB
  class UmlFileProcessor {
    +process(filePath, config) ProcessingStatus
  }

  UmlFileProcessor ..|> FileProcessor
```
<!-- UML:component-details:END -->


