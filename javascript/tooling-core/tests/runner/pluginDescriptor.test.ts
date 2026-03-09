import { validatePassthrough } from "../../src/cli/validatePassthrough.js"
import type { PluginDescriptor } from "../../src/cli/PluginDescriptor.js"

const descriptor: PluginDescriptor = {
    name: "test-plugin",
    description: "A test plugin",
    options: [
        { flag: "--output", description: "Output path", requiresValue: true }
    ]
}

test("accepts declared plugin option with required value", () => {
    expect(() =>
        validatePassthrough(descriptor, ["--output", "some/path"])
    ).not.toThrow()
})

test("throws when required value is missing", () => {
    expect(() =>
        validatePassthrough(descriptor, ["--output"])
    ).toThrow("Option --output requires a value")
})

test("throws when required value is another flag", () => {
    expect(() =>
        validatePassthrough(descriptor, ["--output", "--other"])
    ).toThrow("Option --output requires a value")
})

test("throws on unknown option", () => {
    expect(() =>
        validatePassthrough(descriptor, ["--not-a-real-flag"])
    ).toThrow("Unknown option: --not-a-real-flag")
})

test("throws on first unknown when mixed with known", () => {
    expect(() =>
        validatePassthrough(descriptor, ["--output", "some/path", "--garbage"])
    ).toThrow("Unknown option: --garbage")
})

test("accepts empty passthrough", () => {
    expect(() =>
        validatePassthrough(descriptor, [])
    ).not.toThrow()
})