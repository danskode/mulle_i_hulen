// Centralized server configuration

export const config = {
    port: Number(process.env.PORT) || 8081,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

    // Database
    dbPath: './database/users.db',

    // Email
    resendApiKey: process.env.RESEND_API_KEY,
    resendAllowedEmail: process.env.RESEND_ALLOWED_EMAIL,

    // Bcrypt
    saltRounds: 10,

    // Password reset
    resetTokenExpiryHours: 1
};
