import type { ParsedArgs } from "./ParsedArgs.js";

export interface CliCommand {
  name: string;
  description: string;
  execute(args: ParsedArgs): void;
}
