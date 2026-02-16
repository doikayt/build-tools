import runExecutor from '../src/executors/generate/executor';

describe('generate executor - missing project.json', () => {
  it('fails when project.json does not exist', async () => {
    const result = await runExecutor(
      { projectJsonPath: 'non-existent-project.json' },
      {} as any
    );

    expect(result.success).toBe(false);
  });
});
