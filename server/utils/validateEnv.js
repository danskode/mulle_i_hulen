// If you do net set variables in an .env file, you will get errors from this fuctions, called in app.js line 11 before anything else starts up :)
export function validateEnv() {
    const required = ['JWT_SECRET'];
    const missing = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        console.error('CRITICAL: Missing required environment variables:');
        missing.forEach(key => console.error(`  - ${key}`));
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    // Warnings for optional but recommended variables
    const recommended = ['RESEND_API_KEY', 'CLIENT_URL'];
    const missingRecommended = [];

    for (const key of recommended) {
        if (!process.env[key]) {
            missingRecommended.push(key);
        }
    }

    if (missingRecommended.length > 0) {
        console.warn('Warning: Missing recommended environment variables:');
        missingRecommended.forEach(key => console.warn(`  - ${key}`));
    }
}