// nx-graph-to-mermaid/jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],

  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
  }
};