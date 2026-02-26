# update-markdown-toc

<p align="center">
  <img
    src="doc/demo.gif"
    width="720"
    alt="update-markdown-toc demo">
</p>



<!-- TOC:START -->
- [update-markdown-toc](#update-markdown-toc)
  - [Introduction](#introduction)
  - [Why not Some Other Markdown TOC Generator ?](#why-not-some-other-markdown-toc-generator-)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using npx (recommended)](#using-npx-recommended)
    - [Using npm scripts](#using-npm-scripts)
    - [Using a direct path (advanced)](#using-a-direct-path-advanced)
  - [Options](#options)
    - [Configurable Exclusion List for Recursive Traversal](#configurable-exclusion-list-for-recursive-traversal)
      - [Examples:](#examples)
  - [TOC Markers](#toc-markers)
  - [Usage Scenarios](#usage-scenarios)
    - [As Part of code/test/debug Work Flow](#as-part-of-codetestdebug-work-flow)
    - [Continuous Integration](#continuous-integration)
    - [Recursively Traversing a Folder Hierarchy to Process all files vs. Single File Processing](#recursively-traversing-a-folder-hierarchy-to-process-all-files-vs-single-file-processing)
      - [Single-File Processing (Strict Mode)](#single-file-processing-strict-mode)
      - [Recursive Folder Traversal (Lenient Mode)](#recursive-folder-traversal-lenient-mode)
  - [Design Goals and Philosophy](#design-goals-and-philosophy)
  - [Guidelines For Project Contributors](#guidelines-for-project-contributors)
<!-- TOC:END -->

## Introduction

A Node.js command-line **documentation helper** which automatically:

- generates Table of Contents (TOC) blocks for Markdown files
- operates on either a single file, or recursively finds all `*.md` files from a root path
- regenerates TOCs from headings, targeting only regions explicitly marked with [TOC markers](#toc-markers)
- avoids gratuitous reformatting or changes of any kind outside of regions marked by the aforementioned [TOC markers](#toc-markers)
- avoids updating files when the generated TOC is already correct
- provides a `--check` mode which flags Markdown files with stale TOCs (intended for CI)
- generates TOC links with GitHub’s Markdown renderer.



## Why not Some Other Markdown TOC Generator ?

Most Markdown TOC tools  (e.g., [markdown-toc](https://github.com/jonschlinkert/markdown-toc), 
[md-toc-cli](https://github.com/eugene-khyst/md-toc-cli))
operate on a single file at a time, a mode which we also support.
The primary distinguishing feature of our tool is its ability to recursively search for, check, and update all Markdown documents within an entire folder hierarchy, making it suitable for CI and 
large repositories.



## Installation

Install as a development dependency (recommended):


```bash
npm install --save-dev @datalackey/update-markdown-toc
```

This installs the update-markdown-toc command into your project’s
node_modules/.bin/ directory.



## Usage


After installation, the `update-markdown-toc` command can be invoked in any
of the following ways from the project root (or a subdirectory) where the package was installed.
All examples below invoke the tool with the default README.md file as the TOC update target.


### Using npx (recommended)

```bash
npx update-markdown-toc 
````


### Using npm scripts

You may also add a script entry to your package.json:

```json
{
  "scripts": {
    "docs:toc": "update-markdown-toc"
  }
}
```
Then run:

```bash
npm run docs:toc
```

### Using a direct path (advanced)

```bash
./node_modules/.bin/update-markdown-toc 
```



## Options

This section assumes the command is invoked using `npx`, an npm script,
or another method that resolves the local `update-markdown-toc` binary.


```text
update-markdown-toc [options] [file]

Options:
  -c, --check     <path-to-file-or-folder>  Do not write files; exit non-zero if TOC is stale
  -r, --recursive <path-to-folder>          Recursively process all .md files under the given folder
  -e, --exclude   <dir1,dir2,...>           Comma-separated list of directory names to exclude during recursive traversal (overrides default exclusion list)
  -v, --verbose                             Print status for every file processed
  -q, --quiet                               Suppress all non-error output
  -d, --debug                               Print debug diagnostics to stderr
  -h, --help                                Show this help message and exit
```

When using --check, a target file or a recursive folder must be specified
explicitly. Unlike normal operation, --check does not default to README.md.

### Configurable Exclusion List for Recursive Traversal

The `--exclude` option only applies when `--recursive` is specified.
It accepts a comma-separated list of directory names (exact match, not glob patterns), and 
when provided, it replaces the default exclusion list.

By default, the recursive traversal excludes only: `node_modules`.

#### Examples:

Exclude node_modules and dist:

```bash 
npx update-markdown-toc --recursive . --exclude node_modules,dist
```

Exclude only dist (this allows traversal into node_modules):

```bash 
npx update-markdown-toc --recursive . --exclude dist
```

Disable exclusions entirely:

```bash 
npx update-markdown-toc --recursive . --exclude ""
```





## TOC Markers

The tool operates only on files containing **both** start and end markers,
as shown below:  


&nbsp;&nbsp;&nbsp;   &lt;!-- TOC:START --&gt;<br/>
&nbsp;&nbsp;&nbsp;   &lt;!-- TOC:END --&gt;



Any existing content between the region start and end markers is lost. The new content will be the generated TOC that
reflects the section headers marked with '#'s in the Markdown document.

Content outside the markers is preserved verbatim.
If either marker is missing, the tool prints an error message and exits with a non-zero status code.


## Usage Scenarios 



### As Part of code/test/debug Work Flow  

To ensure that your code is built afresh, passes tests, and that your documentation TOCs are up to date, you could 
invoke the tool via something akin to the package.json below. 
Before commit and push, you would type:  'npm run build' 


Your `package.json` might look like this:
```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "compile": "tsc -p tsconfig.json",
    "pretest": "npm run compile",
    "test": "jest",
    "docs:toc": "update-markdown-toc --recursive docs/",
    "bundle": "esbuild src/index.ts --bundle --platform=node --outdir=dist",
    "package": "npm run clean && npm run compile && npm run bundle",
    "build": "npm run docs:toc && npm run test && npm run package"
  }
}
```

### Continuous Integration  

The --check flag is designed primarily for continuous integration (CI).

In this mode, the tool:

- never writes files
- compares the existing TOC block against the generated TOC
- exits with a non-zero status if any TOC is stale


Example: 

```bash
npx update-markdown-toc --check --recursive docs/
```


If a pull request modifies documentation headings but forgets to update TOCs, this command will fail the build, forcing the contributor to regenerate and commit the correct TOC.

### Recursively Traversing a Folder Hierarchy to Process all files vs. Single File Processing

The tool supports two distinct operating modes with intentionally different error-handling semantics:

- Single-file mode (--recursive not specified)
- Recursive folder traversal mode (--recursive specified)

These modes are designed to support both strict validation and incremental adoption across real-world repositories.
In the case of the latter mode, we assume some files may not yet have TOC markers, and that this is acceptable.

#### Single-File Processing (Strict Mode)


When a single Markdown file is explicitly specified (or when the default README.md is used and --check not specified), 
the tool operates in strict mode.
In this mode, any of the following conditions cause an immediate error and a non-zero exit code:

- file does not exist, or cannot be read (e.g. due to permissions).
- file does not contain both TOC delimiters (&lt;!-- TOC:START --&gt;  and &nbsp; &lt;!-- TOC:END --&gt;).
- file is stale (i.e. the existing TOC differs from the generated TOC). 
- file contains TOC delimiters but no Markdown headings are found from which a TOC can be generated.


If either marker is missing, the tool prints an error message and exits with a non-zero status code.


#### Recursive Folder Traversal (Lenient Mode)

When operating in recursive mode, the tool traverses a directory tree and processes all *.md files it finds.
In this mode, files without TOC markers are silently skipped, and files with TOC markers are processed normally.
(Rational: for larger repos, it may not be feasible to add TOC markers to every Markdown file at once.)
Stale files are reported (unless --quiet is specified) and will 
result in a non-zero return value at the end of processing, but the 
script will not immediately bail with an error -- processing continues for all files found.

When combined with --verbose, skipped files (Markdown files without start/end region markers) 
are reported explicitly in this mode. For example: 

```bash
update-markdown-toc --recursive docs/ --verbose
```

yields example output:

```
Skipped (no markers): docs/legacy-notes.md
Updated: docs/guide.md
Up-to-date: docs/api.md
```

## Design Goals and Philosophy

This tool was designed in accordance with the top-level
[Build Philosophy](../../README.md#build-philosophy) of this repository.


- **update mode** (writes files: this should be run locally by developers, and should never run in CI. It is the default if `--check` not specified)
- **check mode** (validates and exits non-zero if stale:  mainly intended to be run in CI -- optional for local use) 

The intended workflow is:

1. Developers run the command locally  in default mode (update mode, a.k.a. non `--check` mode) in their workspace
2. Generated TOC content is reviewed and committed.
3. CI runs in `--check` mode to ensure no drift exists.


## Guidelines For Project Contributors

Contributors to the project should consult [this document](GUIDELINES-FOR-PROJECT-CONTRIBUTORS.md)


