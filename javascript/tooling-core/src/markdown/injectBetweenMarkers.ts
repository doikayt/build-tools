export function injectBetweenMarkers(
  markdown: string,
  content: string,
  startTag: string,
  endTag: string
): string {
  const startIndex = markdown.indexOf(startTag);
  const endIndex = markdown.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`Markers not found or invalid: ${startTag}`);
  }

  const before = markdown.substring(0, startIndex + startTag.length);
  const after = markdown.substring(endIndex);

  return `${before}\n${content}\n${after}`;
}
