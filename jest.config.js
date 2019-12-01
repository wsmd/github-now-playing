module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/lib/**/*.ts',
    '!**/node_modules/**',
    '!<rootDir>/lib/**/index.ts',
  ],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  roots: ['<rootDir>/lib/', '<rootDir>/test/'],
  moduleNameMapper: {
    '^lib/(.*)': '<rootDir>/lib/$1',
  },
};
