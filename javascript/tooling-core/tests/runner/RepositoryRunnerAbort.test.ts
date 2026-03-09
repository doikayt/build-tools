import { RepositoryRunner } from "../../src/repository/RepositoryRunner.js"
import type { RunnerDecision } from "../../src/policy/RunnerPolicy.js"

test("runner aborts when policy returns abort", () => {

  const processor = {
    process() {
      throw new Error("boom")
    }
  }

  const policy = {
    onProcessorError: (): RunnerDecision => "abort",
    shouldPrintFileStatus: () => false,
    shouldPrintSummary: () => false
  }

  const runner = new RepositoryRunner({
    processor,
    config: {
      runMode: "update",
      mode: "single" as const,
      verbose: false,
      debug: false,
      quiet: true
    },
    policy
  })

  expect(() => runner.runFiles(["a.md"]))
    .toThrow("boom")

})
