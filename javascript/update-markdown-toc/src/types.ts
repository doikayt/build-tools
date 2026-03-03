export type CliConfig = {
    help?: boolean;

    checkMode: boolean;
    verbose: boolean;
    quiet: boolean;
    debug: boolean;

    isRecursive: boolean;
    recursivePath: string | null;
    targetFile: string | null;

    // null = default behavior (use default excludes)
    // []   = user explicitly disabled exclusions via --exclude ""
    excludeList: string[] | null;
};