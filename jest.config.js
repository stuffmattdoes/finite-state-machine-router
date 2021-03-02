
module.exports = {
    // globalSetup: './config/setup.js',
    // globalTeardown: './config/teardown.js',
    collectCoverage: true,
    coverageDirectory: '../coverage',
    // coverageReporters: [ 'lcov', 'text', 'teamcity' ],
    coverageReporters: [ 'lcov', 'text' ],
    // moduleNameMapper: { '\\.(css|scss)$': 'identity-obj-proxy' },
    rootDir: './src',
    // setupFilesAfterEnv: [ '../config/mock/test-setup.js' ],
    // transformIgnorePatterns: [ '/node_modules/(?!fsm-router).+\\.js$' ],
    // testResultsProcessor: 'jest-teamcity-reporter',
    verbose: true
    // testEnvironment: './config/puppeteer_environment.js',
}
