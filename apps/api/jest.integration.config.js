/** Integration tests: require PostgreSQL and Redis (`docker compose up -d`). */
/** @type {import('jest').Config} */
module.exports = {
  ...require('./jest.config'),
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.int-spec.ts'],
  testTimeout: 30000,
};
