module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/helpers/setupEnv.js'],
  collectCoverageFrom: [
    'app.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: { global: { statements: 80, branches: 70, functions: 80, lines: 80 } },
};
