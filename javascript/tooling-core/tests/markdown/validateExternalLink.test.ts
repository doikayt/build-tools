import { describe, test, expect, vi, afterEach } from "vitest";
import { validateExternalLink } from "../../src/markdown/validateExternalLink.js";
import type {
  LinkRecord,
  LinkValidationOptions,
} from "../../src/markdown/types.js";

function makeLink(href: string, line = 1): LinkRecord {
  return { href: href, line: line, kind: "external" };
}

function makeOptions(
  overrides: Partial<LinkValidationOptions> = {}
): LinkValidationOptions {
  return { timeoutMs: 3000, ...overrides };
}

function mockFetch(status: number): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: status }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("validateExternalLink()", () => {
  test("returns null for 200", async () => {
    mockFetch(200);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).toBeNull();
  });

  test("returns error for 404", async () => {
    mockFetch(404);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toBe("HTTP 404");
  });

  test("returns warning for 301", async () => {
    mockFetch(301);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toContain("permanent redirect");
  });

  test("returns null for 302", async () => {
    mockFetch(302);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).toBeNull();
  });

  test("returns null for 307", async () => {
    mockFetch(307);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).toBeNull();
  });

  test("returns null for 308", async () => {
    mockFetch(308);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).toBeNull();
  });

  test("returns warning for 403", async () => {
    mockFetch(403);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toContain("forbidden");
  });

  test("returns warning for 500", async () => {
    mockFetch(500);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toContain("server error");
  });

  test("falls back to GET on 405", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 405 })
      .mockResolvedValueOnce({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("returns error on timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("aborted"), { name: "AbortError" })
        )
    );
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toBe("timeout");
  });

  test("returns error on unreachable host", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network failure"))
    );
    const result = await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toBe("unreachable");
  });

  test("sends User-Agent header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions()
    );
    expect(fetchMock.mock.calls[0][1].headers["User-Agent"]).toContain(
      "link-checker"
    );
  });

  test("calls onVerbose for request", async () => {
    mockFetch(200);
    const messages: string[] = [];
    await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions({ onVerbose: (m) => messages.push(m) })
    );
    expect(messages.some((m) => m.includes("https://example.com"))).toBe(true);
  });

  test("calls onVerbose for success", async () => {
    mockFetch(200);
    const messages: string[] = [];
    await validateExternalLink(
      "README.md",
      makeLink("https://example.com"),
      makeOptions({ onVerbose: (m) => messages.push(m) })
    );
    expect(messages.some((m) => m.includes("✓"))).toBe(true);
  });

  test("file and line reported correctly", async () => {
    mockFetch(404);
    const result = await validateExternalLink(
      "docs/api.md",
      makeLink("https://example.com", 42),
      makeOptions()
    );
    expect(result!.file).toBe("docs/api.md");
    expect(result!.line).toBe(42);
  });
});
