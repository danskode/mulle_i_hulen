// Rate limiters for brute force protection
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: "For mange login forsøg. Prøv igen om 15 minutter." },
    standardHeaders: true,
    legacyHeaders: false
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per window
    message: { message: "For mange password reset forsøg. Prøv igen om 1 time." },
    standardHeaders: true,
    legacyHeaders: false
});

const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per window
    message: { message: "For mange password reset forsøg. Prøv igen om 1 time." },
    standardHeaders: true,
    legacyHeaders: false
});

export { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter };
