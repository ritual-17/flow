/* eslint-disable @typescript-eslint/no-require-imports */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.web.json');

const transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: './tsconfig.web.json', // Tell jest to use tsconfig.web.json
    },
  ],
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/unit/**/*.spec.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
      transform: transform,
    },
    {
      displayName: 'ui',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/ui/**/*.spec.tsx'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
      setupFilesAfterEnv: ['<rootDir>/test/ui/setup.ts'],
      transform: transform,
    },
  ],
};
