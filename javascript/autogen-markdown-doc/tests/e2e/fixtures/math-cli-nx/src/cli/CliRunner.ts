import { ArgParser } from "./ArgParser.js";
import { CommandRegistry } from "./CommandRegistry.js";
import type { CliCommand } from "./CliCommand.js";

export class CliRunner {
  private readonly registry: CommandRegistry;
  private readonly parser: ArgParser;

  constructor(commands: CliCommand[]) {
    this.registry = new CommandRegistry();
    this.parser = new ArgParser();
    for (const cmd of commands) {
      this.registry.register(cmd);
    }
  }

  run(argv: string[]): void {
    const args = this.parser.parse(argv);
    const command = this.registry.get(args.command);
    if (command === undefined) {
      throw new Error(`Command not registered: ${args.command}`);
    }
    command.execute(args);
  }
}
