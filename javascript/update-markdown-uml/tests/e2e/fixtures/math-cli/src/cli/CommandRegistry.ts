import type { CliCommand } from "./CliCommand.js";

export class CommandRegistry {
  private readonly commands: Map<string, CliCommand>;

  constructor() {
    this.commands = new Map();
  }

  register(command: CliCommand): void {
    this.commands.set(command.name, command);
  }

  get(name: string): CliCommand | undefined {
    return this.commands.get(name);
  }

  listAll(): CliCommand[] {
    return [...this.commands.values()];
  }
}
