/**
 * Writes a debug message to stderr when config.debug is true.
 * Output is prefixed with [debug] to distinguish it from normal stdout output.
 */
export function debugLog(config: { debug?: boolean }, message: string): void {
  if (config.debug) {
    process.stderr.write(`[debug] ${message}\n`);
  }
}
