// Input validation utilities

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
    minLength: PASSWORD_MIN_LENGTH,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return {
            valid: false,
            message: 'Password er påkrævet'
        };
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        return {
            valid: false,
            message: `Password skal være mindst ${PASSWORD_MIN_LENGTH} tegn`
        };
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: 'Password skal indeholde mindst ét stort bogstav'
        };
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        return {
            valid: false,
            message: 'Password skal indeholde mindst ét lille bogstav'
        };
    }

    if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
        return {
            valid: false,
            message: 'Password skal indeholde mindst ét tal'
        };
    }

    return { valid: true, message: 'Password er gyldigt' };
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return {
            valid: false,
            message: 'Email er påkrævet'
        };
    }

    // Basic email regex - checks for basic email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: 'Ugyldig email format'
        };
    }

    return { valid: true, message: 'Email er gyldig' };
}

/**
 * Validate username
 * @param {string} username - The username to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return {
            valid: false,
            message: 'Brugernavn er påkrævet'
        };
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
        return {
            valid: false,
            message: 'Brugernavn skal være mindst 3 tegn'
        };
    }

    if (trimmed.length > 30) {
        return {
            valid: false,
            message: 'Brugernavn må højst være 30 tegn'
        };
    }

    // Only allow alphanumeric characters, underscore, and hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return {
            valid: false,
            message: 'Brugernavn må kun indeholde bogstaver, tal, _ og -'
        };
    }

    return { valid: true, message: 'Brugernavn er gyldigt' };
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
        .substring(0, 1000); // Limit length to prevent DOS
}
