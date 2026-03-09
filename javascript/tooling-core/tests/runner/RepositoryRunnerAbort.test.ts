import { RepositoryRunner } from "../../src/repository/RepositoryRunner.js"
import type { RunnerDecision } from "../../src"

test("runner aborts when policy returns abort", () => {

  const processor = {
    process() {
      throw new Error("boom")
    }
  }

  const policy = {
    handleProcessorError: (): RunnerDecision => "abort",
    shouldPrint: () => false,
    shouldPrintSummary: () => false
  }

  const runner = new RepositoryRunner({
    processor,
    config: {
      runMode: "update",
      mode: "single" as const,
      verbose: false,
      quiet: true,
      exclude: [],
      debug: false
    },
    policy
  })

  expect(() => runner.run(["a.md"]))
      .toThrow("boom")

})
