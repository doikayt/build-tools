export function stableSortStrings(values: string[]): string[] {
  return values.slice().sort((a, b) => a.localeCompare(b));
}
export { walkFiles } from './fs/walkFiles';
