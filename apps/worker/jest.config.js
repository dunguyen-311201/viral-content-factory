/** Unit tests: no external services required. */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@vcf/shared$': '<rootDir>/../../packages/shared/src',
    '^@vcf/ai$': '<rootDir>/../../packages/ai/src',
  },
};
