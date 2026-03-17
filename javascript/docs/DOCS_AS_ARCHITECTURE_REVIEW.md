# Auto-Generated Documentation as an Architectural Smell Detector

This document describes how the output of the documentation tools in this
repository can be read as architectural feedback — not just as documentation.

The signals described here emerge naturally from normal tool usage. No
additional configuration is required to benefit from them.

---

## The Core Idea

Documentation generators work by analysing source structure and reflecting
it back in a readable form. That reflection is inherently honest — it shows
what is actually there, not what was intended. When the output is hard to
read, that difficulty is usually a property of the source, not the tool.

This means every documentation run is also an implicit architectural review.

---

## Signal 1 — The Busy UML Diagram

**Tool:** `update-markdown-uml`

When a package diagram is too busy to read — too many boxes, too many
relationships, labels overlapping — the instinct is to reach for exclusion
lists or layout tweaks. That instinct should be resisted.

A diagram that cannot be rendered readably is telling you that the subsystem
has too many concerns. The correct response is decomposition, not
configuration.

This is why `autogen-markdown-doc` exposes UML generation without exclusion
lists. The unfiltered picture is intentional — hiding types from the diagram
hides the signal.

---

## Signal 2 — The Verbose Package Summary

**Tool:** `update-markdown-uml` with `--verbose`

The per-package type count output:
```
  markdown     — 14 types
  cli          — 5 types
  repository   — 4 types
  policy       — 3 types
  logging      — 2 types
  util         — 1 type
```

Output is sorted by type count descending, which makes the heaviest package
immediately visible. A package that grows noticeably from run to run is a
passive signal that the subsystem may be accumulating too many concerns.

Developers who glance at this output regularly during normal workflow will
notice subsystem growth before it becomes a structural problem — without any
dedicated architectural review process.

---

## Signal 3 — The Deep TOC

**Tool:** `update-markdown-toc`

A document whose generated TOC is very long and deeply nested is exhibiting
the same symptom as a busy class diagram — too many concerns in one place.
A README with 40 entries spanning 6 levels of nesting is telling you the
document needs decomposition, or that the subsystem it describes does.

The TOC generator surfaces this by making the structure impossible to ignore.
A deep TOC is visually uncomfortable in a way that a long source file is not.

---

## Signal 4 — The Complex Build Graph

**Tool:** `nx-graph-to-mermaid`

A build graph with many nodes and complex dependency chains reflects the
same problem at the pipeline level. A task graph that is difficult to follow
visually is a signal that the build pipeline has too many responsibilities
or unclear separation between stages.

The generated Mermaid diagram makes this structure concrete and reviewable
in a way that reading `project.json` directly does not.

---

## The Common Thread

Each of these signals shares the same structure:

1. The tool generates output mechanically from source structure
2. The output is difficult to read or visually uncomfortable
3. That discomfort is a property of the source, not the tool
4. The correct response is to address the source, not to suppress the output

This is the documentation-as-mirror principle: the tools are not just
keeping documentation up to date, they are reflecting the architecture back
at the people who built it.