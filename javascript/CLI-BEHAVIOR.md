<!-- TOC:START -->
<!-- TOC:END -->

# Common CLI Behavior

This document describes the shared command-line behavior used by repository-processing tools in this workspace.

For example, the following commands use:

```
npx @datalackey/update-markdown-toc
```

Other tools follow the same behavior patterns. The one exception is 
[`autogen-markdown-doc`](./autogen-markdown-doc/README.md), which bundles
capabilities of all the more focused use plugins, and provides a simplified CLI and options to accomodate 
the most common use cases.



---

# 1. Processing Modes

Tools operate in one of two modes.

## Single-File Mode

A single file is specified.

Example:

```
npx @datalackey/update-markdown-toc README.md
```

In this mode:

- Only that file is processed.
- Errors stop execution immediately.
- No summary line is printed.


## Recursive Mode

A directory is specified using `--recursive`.

Example:

```
npx @datalackey/update-markdown-toc --recursive docs/
```

In this mode:

- All matching files under the directory are processed.
- Files are processed in deterministic (path-sorted) order.
- Files that do not contain required markers are skipped.
- Structural errors stop the run immediately.


---

# 2. Status Types

Each processed file falls into one of four categories.

### Updated

The file was modified.

Example output:

```
Updated: docs/guide.md
```

### Up-to-date

The file already contained the correct content.

Example output:

```
Up-to-date: docs/api.md
```

### Stale

The file would be modified, but the tool is running in `--check` mode.

Example output:

```
Stale: docs/guide.md
```

### Skipped

The file does not contain required markers and is ignored (recursive mode only).

Example output:

```
Skipped (no markers): docs/notes.md
```


---

# 3. Default Output Behavior

Without any flags:

- Only `Updated:` lines are printed.
- Files that are already correct are not printed.
- Skipped files are not printed.
- No summary is printed.


---

# 4. Verbose Mode (`--verbose`)

When `--verbose` is used:

- All file statuses are printed:
    - Updated
    - Up-to-date
    - Stale
    - Skipped

In recursive mode, a summary line is printed at the end:

```
Summary: 3 updated, 1 stale, 2 unchanged, 4 skipped
```

The summary appears only in recursive mode and only when `--verbose` is enabled.

Single-file mode does not print a summary.


---

# 5. Quiet Mode (`--quiet`)

When `--quiet` is used:

- No output is printed.
- Exit codes still reflect success or failure.


---

# 6. Check Mode (`--check`)

When `--check` is specified:

- Files are not modified.
- Files that would change are reported as `Stale`.
- The tool exits with a non-zero status if any file is stale.

Examples:

```
npx @datalackey/update-markdown-toc --check README.md
```

```
npx @datalackey/update-markdown-toc --recursive docs/ --check --verbose
```

Exit behavior:

- Exit code `0` → no changes required.
- Exit code `1` → at least one file is stale.
- Non-zero exit codes also occur for structural errors.


---

# 7. Exit Codes

Exit codes are consistent across tools:

- `0` → success, no issues
- `1` → stale files detected in `--check` mode
- Non-zero → structural or fatal error


---

# 8. Error Behavior

Structural errors stop execution immediately.

Examples include:

- unreadable files
- malformed marker regions
- mismatched delimiters
- invalid structure

Errors are printed in the format:

```
ERROR: <description>
```

In recursive mode, skipped files do not cause failure.


---

# 9. Deterministic Processing

Recursive traversal is deterministic:

- Files are processed in path-sorted order.
- `node_modules` directories are ignored by default.
- Only supported file extensions are processed.

