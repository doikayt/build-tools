import type { ParsedArgs } from "./ParsedArgs.js";

export class ArgParser {
  parse(argv: string[]): ParsedArgs {
    const [command, aStr, bStr] = argv;
    if (command !== "add" && command !== "subtract") {
      throw new Error(`Unknown command: ${command}`);
    }
    const a = parseFloat(aStr ?? "");
    const b = parseFloat(bStr ?? "");
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error("Both operands must be finite numbers");
    }
    return { command, a, b };
  }
}
