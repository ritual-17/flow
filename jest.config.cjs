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
      testMatch: ['**/test/unit/**/*.test.ts'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
      transform: transform,
    },
    {
      displayName: 'react',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/react/**/*.test.tsx'],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
      transform: transform,
    },
  ],
};
