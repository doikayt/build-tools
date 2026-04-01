import { describe, test, expect } from "vitest";
import { findMarker, findMarkers } from "../../src/markdown/findMarker.js";

const START = "<!-- FOO:START -->";
const END = "<!-- FOO:END -->";

const START2 = "<!-- BAR:START -->";
const END2 = "<!-- BAR:END -->";

// -------------------------------------------------------
// findMarker
// -------------------------------------------------------

describe("findMarker()", () => {
  test("returns null when start marker missing", () => {
    const result = findMarker(
      `no markers here
${END}`,
      START,
      END
    );
    expect(result).toBeNull();
  });

  test("returns null when end marker missing", () => {
    const result = findMarker(
      `${START}
no end`,
      START,
      END
    );
    expect(result).toBeNull();
  });

  test("returns null when end precedes start", () => {
    const result = findMarker(
      `${END}
${START}`,
      START,
      END
    );
    expect(result).toBeNull();
  });

  test("returns location for valid marker pair", () => {
    const content = `${START}
content
${END}`;
    const result = findMarker(content, START, END);
    expect(result).not.toBeNull();
    expect(result!.startMarker).toBe(START);
    expect(result!.endMarker).toBe(END);
  });

  test("startIndex points to first char after start tag", () => {
    const content = `${START}
content
${END}`;
    const result = findMarker(content, START, END);
    expect(content[result!.startIndex]).toBe("\n");
  });

  test("endIndex points to first char of end tag", () => {
    const content = `${START}
content
${END}`;
    const result = findMarker(content, START, END);
    expect(content.slice(result!.endIndex, result!.endIndex + END.length)).toBe(
      END
    );
  });

  test("slice between startIndex and endIndex yields content between markers", () => {
    const content = `${START}
hello world
${END}`;
    const result = findMarker(content, START, END);
    expect(content.slice(result!.startIndex, result!.endIndex)).toBe(
      "\nhello world\n"
    );
  });

  test("startLine is 1-based line of start tag", () => {
    const content = `line1
line2
${START}
content
${END}`;
    const result = findMarker(content, START, END);
    expect(result!.startLine).toBe(3);
  });

  test("endLine is 1-based line of end tag", () => {
    const content = `${START}
line2
line3
${END}`;
    const result = findMarker(content, START, END);
    expect(result!.endLine).toBe(4);
  });

  test("empty content between markers", () => {
    const content = `${START}${END}`;
    const result = findMarker(content, START, END);
    expect(result).not.toBeNull();
    expect(content.slice(result!.startIndex, result!.endIndex)).toBe("");
  });
});

// -------------------------------------------------------
// findMarkers
// -------------------------------------------------------

describe("findMarkers()", () => {
  test("empty pairs returns empty map", () => {
    const result = findMarkers("some content", []);
    expect(result.size).toBe(0);
  });

  test("pair not present in content is absent from map", () => {
    const result = findMarkers("no markers", [
      { startMarker: START, endMarker: END },
    ]);
    expect(result.has(START)).toBe(false);
  });

  test("present pair is in map keyed by startMarker", () => {
    const content = `${START}
content
${END}`;
    const result = findMarkers(content, [
      { startMarker: START, endMarker: END },
    ]);
    expect(result.has(START)).toBe(true);
    expect(result.get(START)!.startMarker).toBe(START);
  });

  test("multiple pairs all located", () => {
    const content = `${START}
foo
${END}
${START2}
bar
${END2}`;
    const result = findMarkers(content, [
      { startMarker: START, endMarker: END },
      { startMarker: START2, endMarker: END2 },
    ]);
    expect(result.has(START)).toBe(true);
    expect(result.has(START2)).toBe(true);
  });

  test("only present pairs appear in map", () => {
    const content = `${START}
foo
${END}`;
    const result = findMarkers(content, [
      { startMarker: START, endMarker: END },
      { startMarker: START2, endMarker: END2 },
    ]);
    expect(result.has(START)).toBe(true);
    expect(result.has(START2)).toBe(false);
  });

  test("throws when start marker appears more than once", () => {
    const content = `${START}
foo
${END}
${START}
bar
${END}`;
    expect(() =>
      findMarkers(content, [{ startMarker: START, endMarker: END }])
    ).toThrow(`Duplicate marker found: "${START}"`);
  });

  test("throws when end marker appears more than once", () => {
    const content = `${START}
foo
${END}
some text
${END}`;
    expect(() =>
      findMarkers(content, [{ startMarker: START, endMarker: END }])
    ).toThrow(`Duplicate marker found: "${END}"`);
  });
});
