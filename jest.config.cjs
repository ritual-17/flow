/* eslint-disable @typescript-eslint/no-require-imports */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.web.json');

const transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: './tsconfig.web.json',
    },
  ],
};

const commonModuleNameMapper = {
  ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),

  // Maps pdfjs-dist to the mock
  '^pdfjs-dist$': '<rootDir>/test/mocks/pdfjs-mock.ts',

  // Maps the pdf.worker.min.js to the mock
  '^pdfjs-dist/build/pdf.worker.min\\?url$': '<rootDir>/test/mocks/file-mock.js',
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
      moduleNameMapper: commonModuleNameMapper,
      setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
      transform: transform,
    },
    {
      displayName: 'ui',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/test/ui/**/*.spec.tsx'],
      moduleNameMapper: commonModuleNameMapper,
      setupFilesAfterEnv: ['<rootDir>/test/ui/setup.ts'],
      transform: transform,
    },
  ],
};
