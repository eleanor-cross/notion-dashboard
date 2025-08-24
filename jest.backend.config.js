// ABOUTME: Jest configuration for backend Node.js testing
// ABOUTME: Configures test environment, mocks, and coverage for Express API

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: [
    '<rootDir>/backend/**/__tests__/**/*.test.js',
    '<rootDir>/backend/**/*.test.js',
    '<rootDir>/backend/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/coverage/**',
    '!backend/**/*.config.js'
  ],
  coverageDirectory: '<rootDir>/coverage/backend',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/backend/__tests__/setup.helper.js'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};