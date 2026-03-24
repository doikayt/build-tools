import { buildMermaid } from "../src/core/buildMermaid.js";

describe("project.json structural validation", () => {
    test("throws if targets key is missing", () => {
        expect(() => buildMermaid({} as any)).toThrow(
            'project.json must contain a "targets" object'
        );
    });

    test("throws if targets is not an object", () => {
        expect(() =>
            buildMermaid({
                targets: "not-an-object",
            } as any)
        ).toThrow('project.json must contain a "targets" object');
    });
});

test("throws if dependsOn is not an array", () => {
    expect(() =>
        buildMermaid({
            targets: {
                build: {
                    dependsOn: "lint" as any,
                },
            },
        })
    ).toThrow('dependsOn for "build" must be an array');
});

test("throws if dependsOn contains non-string values", () => {
    expect(() =>
        buildMermaid({
            targets: {
                build: {
                    dependsOn: ["lint", 123 as any],
                },
            },
        })
    ).toThrow('dependsOn for "build" must contain only strings');
});

test("throws if description is not a string", () => {
    expect(() =>
        buildMermaid({
            targets: {
                build: {
                    description: 42 as any,
                },
            },
        })
    ).toThrow('description for "build" must be a string');
});

test("throws if target value is null", () => {
    expect(() =>
        buildMermaid({
            targets: {
                build: null as any,
            },
        })
    ).toThrow('Target "build" must be an object');
});
