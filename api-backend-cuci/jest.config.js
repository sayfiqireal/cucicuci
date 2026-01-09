/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true
};
