// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

process.env.BABEL_ENV = process.env.BABEL_ENV || 'test';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PUBLIC_URL = process.env.PUBLIC_URL ||'';

// Ensure environment variables are read.
require('../config/env');
