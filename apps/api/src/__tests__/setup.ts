import { vi } from 'vitest'

// Set required env vars before any module loads
process.env.JWT_SECRET = 'test-secret-for-vitest'
process.env.JWT_EXPIRES_IN = '1h'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.CLIENT_URL = 'http://localhost:3000'

// Suppress console.error noise in test output
vi.spyOn(console, 'error').mockImplementation(() => {})
