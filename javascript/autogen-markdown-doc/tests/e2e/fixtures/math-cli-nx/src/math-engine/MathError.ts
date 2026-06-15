import type { Operation } from "./Operation.js";

export class MathError extends Error {
  readonly operation: Operation;

  constructor(operation: Operation, message: string) {
    super(message);
    this.name = "MathError";
    this.operation = operation;
  }
}
