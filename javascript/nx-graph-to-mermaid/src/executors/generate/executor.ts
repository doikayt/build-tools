import { ExecutorContext } from '@nx/devkit';
import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';


interface Options {
  projectJsonPath: string;
  injectInto?: string;
  check?: boolean;
}

export default async function runExecutor(
  options: Options,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  if (!fs.existsSync(options.projectJsonPath)) {
    console.error(`project.json not found at: ${options.projectJsonPath}`);
    return { success: false };
  }

  if (options.injectInto && !fs.existsSync(options.injectInto)) {
    console.error(`Markdown file not found at: ${options.injectInto}`);
    return { success: false };
  }

  // Stub behavior for now
  return { success: true };
}
