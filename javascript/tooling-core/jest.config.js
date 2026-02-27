module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  }
};