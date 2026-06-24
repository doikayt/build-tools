export type LinkKind = "relative" | "external" | "fragment";

export interface LinkRecord {
  href: string;
  line: number;
  kind: LinkKind;
}

export interface HeadingRecord {
  line: number;
  rawText: string;
  slug: string;
  /** Heading depth 1–6 (number of # characters). Used by consumers such as TOC generators to compute indentation. */
  level: number;
}

interface FileLineRef {
  file: string;
  line: number;
}

export interface LinkValidationError extends FileLineRef {
  link: string;
  reason: string;
}

export interface LinkValidationWarning extends FileLineRef {
  link: string;
  reason: string;
}

export interface LinkValidationResult {
  errors: LinkValidationError[];
  warnings: LinkValidationWarning[];
  validatedCount: number;
  skippedCount: number;
}

export interface LinkValidationOptions {
  validateExternal?: boolean;
  timeoutMs?: number;
  concurrency?: number;
  managedBlockStartMarker?: string;
  managedBlockEndMarker?: string;
  verbose?: boolean;
  onVerbose?: (message: string) => void;
  onDebug?: (message: string) => void;
}

export type ExternalLinkStatus =
  | { kind: "valid" }
  | { kind: "warning"; reason: string }
  | { kind: "error"; reason: string };
