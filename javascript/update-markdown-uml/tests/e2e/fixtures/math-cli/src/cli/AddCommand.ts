import { MathEngine } from "../math-engine/MathEngine.js";
import type { CliCommand } from "./CliCommand.js";
import type { ParsedArgs } from "./ParsedArgs.js";

export class AddCommand implements CliCommand {
  readonly name = "add";
  readonly description = "Add two numbers";
  private readonly engine: MathEngine;

  constructor() {
    this.engine = new MathEngine();
  }

  execute(args: ParsedArgs): void {
    const result = this.engine.add(args.a, args.b);
    console.log(result.value);
  }
}
