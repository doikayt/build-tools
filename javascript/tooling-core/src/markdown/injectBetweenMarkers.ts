import { findMarker } from "./findMarker.js";

export function injectBetweenMarkers(
    markdown: string,
    content: string,
    startTag: string,
    endTag: string
): string {
  const location = findMarker(markdown, startTag, endTag);

  if (location === null) {
    throw new Error(`Markers not found or invalid: ${startTag}`);
  }

  const before = markdown.substring(0, location.startIndex);
  const after = markdown.substring(location.endIndex);

  return `${before}\n${content}\n${after}`;
}