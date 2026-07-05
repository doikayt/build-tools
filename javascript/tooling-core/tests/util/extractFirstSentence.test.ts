import { describe, test, expect } from "vitest";
import { extractFirstSentence } from "../../src/util/extractFirstSentence.js";

describe("extractFirstSentence()", () => {
  test("single-line: returns text up to and including the first period", () => {
    expect(extractFirstSentence("Foo bar. More text.")).toBe("Foo bar.");
  });

  test("single-line: no period returns the full string", () => {
    expect(extractFirstSentence("No punctuation here")).toBe(
      "No punctuation here"
    );
  });

  test("empty string returns empty string", () => {
    expect(extractFirstSentence("")).toBe("");
  });

  test("multi-line without blank separator: joins lines and extracts to first period", () => {
    expect(
      extractFirstSentence(
        "Returns true\nwhen running inside an iframe by comparing\nthe current location."
      )
    ).toBe(
      "Returns true when running inside an iframe by comparing the current location."
    );
  });

  test("multi-line without blank separator: no period returns full joined text", () => {
    expect(extractFirstSentence("First line\nSecond line")).toBe(
      "First line Second line"
    );
  });

  test("multi-line with blank-line separator: returns only the first line", () => {
    expect(
      extractFirstSentence("Short summary.\n\nLonger description that follows.")
    ).toBe("Short summary.");
  });

  test("multi-line with blank-line separator and no period on first line: returns first line as-is", () => {
    expect(
      extractFirstSentence("A brief overview\n\nFull description follows.")
    ).toBe("A brief overview");
  });
});
