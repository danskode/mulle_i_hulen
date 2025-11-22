// JWT Configuration
// All authentication-related configuration should be centralized here

// JWT_SECRET is set in .env file
if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET must be set in .env file');
}

export const JWT_SECRET = process.env.JWT_SECRET;

// JWT token expiry time in minutes
export const JWT_EXPIRY_MINUTES = process.env.JWT_EXPIRY_MINUTES || 1440;

// jsonwebtoken wants minutes:
export const JWT_EXPIRY = `${JWT_EXPIRY_MINUTES}m`;