import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Use ts-jest preset so TypeScript tests run under Jest
  preset: 'ts-jest',
  // Node environment for backend tests
  testEnvironment: 'node',
  // Discover tests under tests/*.test.ts
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  // Some CI environments are slower; keep a reasonable timeout
  testTimeout: 20000,
};

export default config;
