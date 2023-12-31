module.exports = {
  transform: {
    '^.+\\.ts?$': ['ts-jest', {
      /* Fails on mapped import syntax without this.*/
      diagnostics: {
        warnOnly: true,
      },
    }],
  },
  testEnvironment: 'node',
  testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}