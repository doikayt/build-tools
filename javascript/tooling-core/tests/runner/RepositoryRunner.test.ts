import { RepositoryRunner } from "../../src/repository/RepositoryRunner.js"

test("runner continues when policy returns continue", () => {

  const processor = {
    process() {
      throw new Error("boom")
    }
  }

  const policy = {
    onProcessorError: () => "continue",
    shouldPrintFileStatus: () => false,
    shouldPrintSummary: () => false
  }

  const runner = new RepositoryRunner({
    processor,
    config: { quiet: true },
    policy
  })

  const stats = runner.runFiles(["a.md", "b.md"])

  expect(stats.updated).toBe(0)
})
