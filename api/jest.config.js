/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
};

export default config;
