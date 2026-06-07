import { MathError } from "./MathError.js";
import type { MathResult } from "./MathResult.js";
import type { Operation } from "./Operation.js";

export class MathEngine {
  add(a: number, b: number): MathResult {
    this.validate("add", a, b);
    return { value: a + b, operation: "add", operands: [a, b] };
  }

  subtract(a: number, b: number): MathResult {
    this.validate("subtract", a, b);
    return { value: a - b, operation: "subtract", operands: [a, b] };
  }

  private validate(op: Operation, a: number, b: number): void {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new MathError(op, "Operands must be finite numbers");
    }
  }
}
