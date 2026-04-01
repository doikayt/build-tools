/**
 * Describes the location of a marker pair within a content string.
 * startIndex: index of the first character after the start tag.
 * endIndex:   index of the first character of the end tag.
 * So content.slice(startIndex, endIndex) yields the current content
 * between the markers.
 */
export interface MarkerLocation {
  startMarker: string;
  endMarker: string;
  startLine: number;
  endLine: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Locates a single marker pair within a content string.
 * Returns null if either marker is not found or if end precedes start.
 */
export function findMarker(
  content: string,
  startMarker: string,
  endMarker: string
): MarkerLocation | null {
  const startTagIndex = content.indexOf(startMarker);
  if (startTagIndex === -1) return null;

  const endTagIndex = content.indexOf(endMarker);
  if (endTagIndex === -1) return null;

  const startIndex = startTagIndex + startMarker.length;
  const endIndex = endTagIndex;

  if (endIndex <= startTagIndex) return null;

  const startLine = lineNumberAt(content, startTagIndex);
  const endLine = lineNumberAt(content, endTagIndex);

  return {
    startMarker: startMarker,
    endMarker: endMarker,
    startLine: startLine,
    endLine: endLine,
    startIndex: startIndex,
    endIndex: endIndex,
  };
}

/**
 * Locates multiple named marker pairs in a single pass over the content.
 * Returns a Map keyed by startMarker string.
 * Marker pairs not found in the content are absent from the result map.
 * Throws if any start or end marker appears more than once — duplicate
 * markers indicate a malformed document and are always a fatal error.
 */
export function findMarkers(
  content: string,
  pairs: Array<{ startMarker: string; endMarker: string }>
): Map<string, MarkerLocation> {
  // Check for duplicate markers before locating any
  for (const { startMarker, endMarker } of pairs) {
    if (countOccurrences(content, startMarker) > 1) {
      throw new Error(
        `Duplicate marker found: "${startMarker}" appears more than once`
      );
    }
    if (countOccurrences(content, endMarker) > 1) {
      throw new Error(
        `Duplicate marker found: "${endMarker}" appears more than once`
      );
    }
  }

  const result = new Map<string, MarkerLocation>();

  for (const { startMarker, endMarker } of pairs) {
    const location = findMarker(content, startMarker, endMarker);
    if (location !== null) {
      result.set(startMarker, location);
    }
  }

  return result;
}

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

function countOccurrences(content: string, marker: string): number {
  let count = 0;
  let pos = 0;
  while (true) {
    const found = content.indexOf(marker, pos);
    if (found === -1) break;
    count++;
    pos = found + marker.length;
  }
  return count;
}
