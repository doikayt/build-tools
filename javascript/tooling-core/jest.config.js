export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.test.json"
    }
  },
  extensionsToTreatAsEsm: [".ts"]
};
