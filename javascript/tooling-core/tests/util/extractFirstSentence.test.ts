import { describe, test, expect } from "vitest";
import { extractFirstSentence } from "../../src/util/extractFirstSentence.js";

describe("extractFirstSentence()", () => {
  test("returns text up to and including the first period", () => {
    expect(extractFirstSentence("Foo bar. More text.")).toBe("Foo bar.");
  });

  test("returns text up to (not including) the first newline when it precedes the period", () => {
    expect(extractFirstSentence("First line\nSecond line.")).toBe("First line");
  });

  test("period wins over newline when period comes first", () => {
    expect(extractFirstSentence("Short sentence. Next\nline")).toBe(
      "Short sentence."
    );
  });

  test("returns full string when neither period nor newline is present", () => {
    expect(extractFirstSentence("No punctuation here")).toBe(
      "No punctuation here"
    );
  });

  test("returns full string for an empty input", () => {
    expect(extractFirstSentence("")).toBe("");
  });

  test("period at position 0 returns just the period", () => {
    expect(extractFirstSentence(". rest of text")).toBe(".");
  });

  test("newline at position 0 returns empty string", () => {
    expect(extractFirstSentence("\nrest of text")).toBe("");
  });
});
