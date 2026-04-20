/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle CSS module imports
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle static file imports
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle path aliases
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@hooks/(.*)$': '<rootDir>/src/lib/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/lib/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
};

module.exports = config;
