import type { Operation } from "./Operation.js";

export interface MathResult {
  value: number;
  operation: Operation;
  operands: [number, number];
}
