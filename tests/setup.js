require('@testing-library/jest-dom');

// Mock jQuery for testing
global.$ = global.jQuery = require('jquery');

// Don't mock console.error so we can see JavaScript errors
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(), // Keep error logging to see JS errors
};