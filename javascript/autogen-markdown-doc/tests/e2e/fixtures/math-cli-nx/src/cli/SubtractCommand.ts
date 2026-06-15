import { MathEngine } from "../math-engine/MathEngine.js";
import type { CliCommand } from "./CliCommand.js";
import type { ParsedArgs } from "./ParsedArgs.js";

export class SubtractCommand implements CliCommand {
  readonly name = "subtract";
  readonly description = "Subtract two numbers";
  private readonly engine: MathEngine;

  constructor() {
    this.engine = new MathEngine();
  }

  execute(args: ParsedArgs): void {
    const result = this.engine.subtract(args.a, args.b);
    console.log(result.value);
  }
}
