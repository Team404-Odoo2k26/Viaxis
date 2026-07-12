import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Only look for tests in the test/ directory to ensure 100% isolation from src/
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    // Handle module aliases (this matches the tsconfig paths for Next.js)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Use ts-jest to transform typescript files
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json' // We will use a separate tsconfig for absolute isolation
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
