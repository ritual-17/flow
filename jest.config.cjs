/* eslint-disable @typescript-eslint/no-require-imports */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.web.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // default for unit tests
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/test/unit/**/*.test.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    },
    {
      displayName: 'react',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/react/**/*.test.tsx'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    },
  ],
};
