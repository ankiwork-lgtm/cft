/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Only run test files inside __tests__ directories
  testMatch: ['**/__tests__/**/*.test.ts'],

  // Map @cft/shared to its built source so Jest can resolve it
  moduleNameMapper: {
    '^@cft/shared$': '<rootDir>/../shared/src/index.ts',
  },

  // TypeScript transformation
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        // Required: Node16/NodeNext moduleResolution needs isolatedModules
        isolatedModules: true,
        // Suppress type errors in test files to focus on runtime behavior
        diagnostics: {
          ignoreCodes: ['TS2345', 'TS7006', 'TS2339', 'TS6133', 'TS151002', 'TS2307'],
        },
      },
    ],
  },

  // Clear mocks between each test file
  clearMocks: true,
  restoreMocks: true,

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/scripts/**',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Reasonable timeout for async tests
  testTimeout: 10000,
};
