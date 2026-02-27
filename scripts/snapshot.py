#!/usr/bin/env python3

"""
Repository Snapshot Combiner
============================

Purpose
-------
This script generates a flattened textual snapshot of a repository or
directory tree for upload to ChatGPT (or other LLM systems).

A key feature is the ability to exclude certain directories. This feature enables 
us to provide a code base snapshot to your LLM of choice.  These LLM's typically
have size limits on what you can upload so being able to 'prune' your source base
and upload it in chunks can sometimes be useful. 



The script recursively scans a directory, concatenates selected source files into a
single text file, and:

- Excludes noisy or irrelevant directories (e.g., node_modules, .git, dist)
- Excludes specific files (e.g., package-lock.json)
- Allows additional exclusions at runtime
- Optionally forces inclusion of specific files
- Copies the final combined snapshot to the clipboard (for pasting to LLM)
- Saves a persistent copy to /tmp/combined.txt

The primary goal is to control context size when uploading code for analysis,
while preserving meaningful source structure.


Core Features
-------------

1) Recursive Repository Flattening
   All readable text files under the specified root folder are appended to
   a single combined output file.

   Each file is prefixed with a header of the form:

       ===== FILE: /absolute/path/to/file =====

   This preserves traceability when reviewing the combined snapshot.


2) Noise Reduction (Default Exclusions)

   Directories skipped by default:

       .idea
       node_modules
       .git
       .cache
       dist
       coverage
       tmp
       logs
       .nx
       static
       samples
       update-markdown-toc

   These are typically:
       - Build artifacts
       - Dependency trees
       - Generated files
       - IDE configuration
       - Large non-source folders

   Files skipped by default:

       package-lock.json
       combined_upload.txt
       filter_icon.html

   These are typically:
       - Lock files
       - Generated outputs
       - Non-source artifacts


3) Runtime Directory Exclusion

   Additional directories can be excluded via:

       -e dir1,dir2,dir3

   Example:

       ./combine.py . -e build,docs

   This allows trimming entire sections of a repository to control token size.


4) Forced Inclusion Mechanism

   The script defines an ALWAYS_INCLUDE path intended to guarantee inclusion
   of critical instruction files even if they reside in excluded paths.

   This mechanism can be enabled or disabled via command-line flags.
   (Currently disabled in the script implementation.)


5) Clipboard Integration

   After generating the combined snapshot:

       - On Linux/macOS: uses xclip
       - On Windows: uses clip

   This allows immediate paste into ChatGPT without manually opening the file.


6) Output Location

   Final snapshot is written to:

       /tmp/combined.txt

   A temporary working file is created during processing and removed
   automatically after completion.


How It Works
------------

Directory Traversal
   Uses os.walk() to recursively traverse the directory tree.

   - Skipped directories are pruned before descent.
   - Individual files are checked against skip rules.
   - Binary files are ignored (UnicodeDecodeError handled).
   - Permission errors are handled gracefully.


Skip Logic
   A file or directory is skipped if:

       - Its basename matches an entry in SKIP_FILES.
       - Any segment of its path matches SKIP_DIRS.
       - It matches any runtime --exclude entries.

   The skip check is centralized in:

       should_skip(path, extra_skip_dirs)


Usage
-----

Basic usage:

    ./snapshot.py /path/to/repo

Exclude additional directories:

    ./snapshot.py . -e build,docs,tmp

Disable forced include:

    ./snapshot.py . -s


Design Philosophy
-----------------

This tool is designed specifically for:

    - AI-assisted development
    - Context window management
    - Snapshotting only meaningful source code
    - Avoiding dependency bloat in LLM uploads
    - Producing traceable file concatenation

It is not intended as a backup tool or archival system.


Limitations
-----------

    - Assumes UTF-8 readable text files.
    - File ordering depends on OS traversal order (not fully deterministic).
    - Requires xclip on Linux for clipboard support.
    - No file size cap enforcement.
    - No token counting.

"""


import os
import shutil
import subprocess
import tempfile
import argparse



# Configuration
SKIP_FILES = {"package-lock.json", "combined_upload.txt", "filter_icon.html"}
SKIP_DIRS = {".idea", "node_modules", ".git", ".cache", "dist", "coverage", "tmp", "logs", ".nx", "static", "samples"}
FINAL_OUTPUT = "/tmp/combined.txt"
ALWAYS_INCLUDE = "/home/chris/grassroots_campaign_tools/.github/copilot-instructions.md"

def should_skip(path, extra_skip_dirs=None):
    """Check if path should be skipped based on our exclusion rules"""
    if os.path.basename(path) in SKIP_FILES:
        return True
    
    # Combine default and extra skip dirs
    all_skip_dirs = set(SKIP_DIRS)
    if extra_skip_dirs:
        all_skip_dirs.update(extra_skip_dirs)
    
    if any(skip_dir in path.split(os.path.sep) for skip_dir in all_skip_dirs):
        return True
    return False

def append_file(file_path, output_file, extra_skip_dirs=None, force=False):
    """Append a single file’s name and content"""
    if not os.path.isfile(file_path):
        print(f"❓ File not found: {file_path}")
        return
    
    if not force and should_skip(file_path, extra_skip_dirs):
        print(f"⚠️ Skipping: {file_path}")
        return
    
    print(f"🔗 Adding: {file_path}")
    try:
        with open(output_file, "a") as out, open(file_path, "r") as f:
            out.write(f"\n\n===== FILE: {file_path} =====\n")
            shutil.copyfileobj(f, out)
    except UnicodeDecodeError:
        print(f"⛔ Cannot read (likely binary): {file_path}")
    except PermissionError:
        print(f"🔒 Permission denied: {file_path}")

def process_directory(root_dir, output_file, extra_skip_dirs=None):
    """Recursively process all files in directory"""
    # Combine default and extra skip dirs
    all_skip_dirs = set(SKIP_DIRS)
    if extra_skip_dirs:
        all_skip_dirs.update(extra_skip_dirs)
    
    for root, dirs, files in os.walk(root_dir):
        # Prune skipped directories from os.walk's future traversal
        dirs[:] = [d for d in dirs if d not in all_skip_dirs]
        
        for file in files:
            file_path = os.path.join(root, file)
            append_file(file_path, output_file, extra_skip_dirs)

def copy_to_clipboard(file_path):
    """Handle clipboard copy for different platforms"""
    try:
        if os.name == 'posix':  # Linux/Mac
            subprocess.run(["xclip", "-selection", "clipboard", "-i", file_path], 
                          check=True, stderr=subprocess.DEVNULL)
        elif os.name == 'nt':  # Windows
            subprocess.run(["clip"], stdin=open(file_path, "r"), 
                          check=True, stderr=subprocess.DEVNULL)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def main():
    parser = argparse.ArgumentParser(description='Combine files recursively')
    parser.add_argument('folder', nargs='?', default='.', 
                       help='Folder to start scanning from (default: current directory)')
    parser.add_argument('-s', '--skip-foo', action='store_true',
                       help='Do not include /tmp/foo.txt at the end')
    parser.add_argument('-e', '--exclude', type=str,
                       help='Comma-separated list of additional directories to skip')
    args = parser.parse_args()

    # Parse extra skip directories
    extra_skip_dirs = None
    if args.exclude:
        extra_skip_dirs = [dir_name.strip() for dir_name in args.exclude.split(',') if dir_name.strip()]
        print(f"📋 Additional directories to skip: {', '.join(extra_skip_dirs)}")

    # Validate folder exists
    if not os.path.isdir(args.folder):
        print(f"Error: '{args.folder}' is not a valid directory")
        return 1

    # Create temp file
    with tempfile.NamedTemporaryFile(mode='w+', prefix='combined_', suffix='.txt', delete=False) as tmp_file:
        temp_path = tmp_file.name
    
    try:
        print(f"📂 Scanning from: {os.path.abspath(args.folder)}")
        
        # Process specified directory recursively
        process_directory(args.folder, temp_path, extra_skip_dirs)

        # Always include /tmp/foo.txt unless skipped
        if args.skip_foo:
            print(f"🚫 Skipped forced inclusion of: {ALWAYS_INCLUDE}")
        else:
            #append_file(ALWAYS_INCLUDE, temp_path, extra_skip_dirs, force=True)
            print(f"✅ NOOOOO       -- we have disabled Forced inclusion of: {ALWAYS_INCLUDE}")

        # Secretly copy to /tmp/combined.txt
        shutil.copy2(temp_path, FINAL_OUTPUT)
        
        # Copy to clipboard
        if copy_to_clipboard(temp_path):
            print(f"\n✅ Combined content copied to clipboard and saved at: /tmp/combined.txt")
        else:
            print(f"\n⚠️ Couldn't copy to clipboard. Combined content saved at: /tmp/combined.txt")
        
    
    except KeyboardInterrupt:
        print("\n🚫 Operation cancelled by user")
    except Exception as e:
        print(f"\n💥 Error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    main()

