const base = require('./jest.config.cjs');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/src/__tests__/smoke/**/*.test.{ts,tsx}'],
  globals: {
    ...(base.globals || {}),
    'ts-jest': {
      ...(base.globals && base.globals['ts-jest'] ? base.globals['ts-jest'] : {}),
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    // Specific mocks FIRST so they are matched before the generic alias
    '^@/integrations/supabase/client$': '<rootDir>/src/test/mocks/supabaseClientMock.ts',
    '^@/services/messageService$': '<rootDir>/src/test/mocks/messageServiceMock.ts',
    // Generic alias mapping
    '^@/(.*)$': '<rootDir>/src/$1',
    ...((() => {
      const mm = base.moduleNameMapper || {}; // remove any conflicting earlier generic alias
      delete mm['^@/(.*)$'];
      delete mm['^@/services/messageService$'];
      return mm;
    })()),
  },
};
