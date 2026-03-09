import { RepositoryRunner } from "../../src/repository/RepositoryRunner.js"
import type { RunnerDecision } from "../../src/policy/RunnerPolicy.js"

test("runner continues when policy returns continue", () => {

  const processor = {
    process() {
      throw new Error("boom")
    }
  }

  const policy = {
    handleProcessorError: (): RunnerDecision => "continue",
    shouldPrint: () => false,
    shouldPrintSummary: () => false
  }

  const runner = new RepositoryRunner({
    processor,
    config: {
      runMode: "update",
      mode: "single" as const,
      verbose: false,
      debug: false,
      quiet: true,
      exclude: []
    },
    policy
  })

  const stats = runner.runFiles(["a.md", "b.md"])

  expect(stats.updated).toBe(0)
  expect(stats.unchanged).toBe(0)
  expect(stats.stale).toBe(0)
  expect(stats.skipped).toBe(0)

})
