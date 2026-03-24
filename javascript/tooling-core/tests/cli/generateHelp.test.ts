// tooling-core/tests/cli/generateHelp.test.ts

import { generateHelp } from "../../src";
import type { PluginDescriptor } from "../../src";

const descriptor: PluginDescriptor = {
    name: "my-plugin",
    description: "Does useful things",
    options: [
        { flag: "--output", description: "Output path", requiresValue: true },
        { flag: "--dry-run", description: "Do not write files" },
    ],
};

test("includes plugin name", () => {
    expect(generateHelp(descriptor)).toContain("my-plugin");
});

test("includes plugin description", () => {
    expect(generateHelp(descriptor)).toContain("Does useful things");
});

test("includes declared option flags", () => {
    const help = generateHelp(descriptor);
    expect(help).toContain("--output");
    expect(help).toContain("--dry-run");
});

test("includes option descriptions", () => {
    const help = generateHelp(descriptor);
    expect(help).toContain("Output path");
    expect(help).toContain("Do not write files");
});

test("includes standard options", () => {
    const help = generateHelp(descriptor);
    expect(help).toContain("--recursive");
    expect(help).toContain("--check");
    expect(help).toContain("--verbose");
    expect(help).toContain("--quiet");
});

test("returns a string", () => {
    expect(typeof generateHelp(descriptor)).toBe("string");
});

test("uses valueName in flag column when requiresValue is true", () => {
    const d: PluginDescriptor = {
        name: "my-plugin",
        description: "Does useful things",
        options: [
            {
                flag: "--output",
                description: "Output path",
                requiresValue: true,
                valueName: "path",
            },
        ],
    };

    expect(generateHelp(d)).toContain("--output <path>");
});

test("falls back to <value> when requiresValue is true but valueName not specified", () => {
    const d: PluginDescriptor = {
        name: "my-plugin",
        description: "Does useful things",
        options: [{ flag: "--output", description: "Output path", requiresValue: true }],
    };

    expect(generateHelp(d)).toContain("--output <value>");
});
