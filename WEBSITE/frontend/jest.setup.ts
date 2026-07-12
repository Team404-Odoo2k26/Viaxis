// jest.setup.ts
// This file runs before all tests. We can put global mocks here.

// We globally mock the database query to ensure we NEVER accidentally hit the real database during tests.
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  // add any other exported db functions if needed
}));
