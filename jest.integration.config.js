// ABOUTME: Jest configuration for integration testing
// ABOUTME: Tests full workflows between frontend and backend components

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.integration.test.js',
    '<rootDir>/tests/**/*.e2e.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/integration-setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};