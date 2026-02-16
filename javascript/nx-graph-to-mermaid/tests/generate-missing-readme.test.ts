// Import test globals explicitly to avoid depending on ambient type resolution
import fs from 'fs';
import path from 'path';
import runExecutor from '../src/executors/generate/executor';

describe('generate executor - missing README', () => {

  const tmpProjectPath = path.join(__dirname, 'tmp-project.json');

  beforeAll(() => {
    fs.writeFileSync(tmpProjectPath, JSON.stringify({ targets: {} }));
  });

  afterAll(() => {
    fs.unlinkSync(tmpProjectPath);
  });

  it('fails when injectInto file does not exist but project.json exists', async () => {

    const result = await runExecutor(
      {
        projectJsonPath: tmpProjectPath,
        injectInto: 'non-existent-readme.md'
      },
      {} as any
    );

    expect(result.success).toBe(false);
  });
});
