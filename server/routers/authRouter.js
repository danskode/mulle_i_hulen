import { Router } from 'express';
import authService from '../services/authService.js';
import { validatePassword, validateEmail, sanitizeString } from '../utils/validators.js';
import { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } from '../middleware/rateLimitersMiddleware.js';

const router = Router();


//==== Login route ====//

router.post('/login', loginLimiter, async (req, res) => {
    let { username, password } = req.body;

    // Sanitize inputs
    username = sanitizeString(username);

    // Validate input
    if (!username || !password) {
        return res.status(400).send({
            message: "Husk både brugernavn og password er påkrævet"
        });
    }

    try {
        const data = await authService.login(username, password);
        res.send({
            message: "Login succesfuldt",
            data: data
        });
    } catch (error) {
        res.status(error.status || 500).send({
            message: error.message || "Server fejl"
        });
    }
});

//==== Forgot password - generate reset token and send email - route ====//

router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
    let { email } = req.body;

    // Sanitize input
    email = sanitizeString(email);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).send({
            message: emailValidation.message
        });
    }

    try {
        const result = await authService.requestPasswordReset(email);
        res.send(result);
    } catch (error) {
        res.status(error.status || 500).send({
            message: error.message || "Server fejl"
        });
    }
});

// Then user can reset password med token at this endpoint

router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send({
            message: "Token og nyt password er påkrævet"
        });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        return res.status(400).send({
            message: passwordValidation.message
        });
    }

    try {
        const result = await authService.resetPassword(token, newPassword);
        res.send(result);
    } catch (error) {
        res.status(error.status || 500).send({
            message: error.message || "Server fejl"
        });
    }
});

export default router;
