import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import db from '../database/db.js';
import emailService from '../services/emailService.js';
import { JWT_SECRET, JWT_EXPIRY } from '../config/auth.js';
import { config } from '../config/config.js';
import { validatePassword, validateEmail, sanitizeString } from '../utils/validators.js';

const router = Router();

// Rate limiters for brute force protection
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

router.post('/login', loginLimiter, async (req, res) => {
    let { username, password } = req.body;

    // Sanitize inputs
    username = sanitizeString(username);

    // Valider input
    if (!username || !password) {
        return res.status(400).send({
            message: "Brugernavn og password er påkrævet"
        });
    }

    // Find bruger i database
    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send({
                    message: "Server fejl"
                });
            }

            if (!user) {
                return res.status(401).send({
                    message: "Forkert brugernavn eller password"
                });
            }

            // Verificer password med bcrypt
            try {
                const isValidPassword = await bcrypt.compare(password, user.password);

                if (!isValidPassword) {
                    return res.status(401).send({
                        message: "Forkert brugernavn eller password"
                    });
                }

                // Generer JWT token
                const token = jwt.sign(
                    { username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRY }
                );

                // Send velkommen email ved første login
                if (user.first_login === 1 && user.email) {
                    emailService.sendWelcomeEmail(user.username, user.email)
                        .catch(err => console.error('Email send error:', err));

                    // Opdater first_login til 0
                    db.run(
                        'UPDATE users SET first_login = 0 WHERE id = ?',
                        [user.id],
                        (err) => {
                            if (err) console.error('Error updating first_login:', err);
                        }
                    );
                }

                // Login success - send token og brugerinfo tilbage
                res.send({
                    message: "Login succesfuldt",
                    data: {
                        username: user.username,
                        role: user.role,
                        token: token
                    }
                });
            } catch (error) {
                console.error('Bcrypt error:', error);
                return res.status(500).send({
                    message: "Server fejl"
                });
            }
        }
    );
});

// Forgot password - generer reset token
router.post('/forgot-password', forgotPasswordLimiter, (req, res) => {
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

    // Find bruger med email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: "Server fejl" });
        }

        // Returner altid success (security: undgå at afsløre om email eksisterer)
        if (!user) {
            return res.send({
                message: "Hvis emailen findes, er et reset link sendt"
            });
        }

        // Generer reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + config.resetTokenExpiryHours * 60 * 60 * 1000);

        // Gem token i database
        db.run(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, resetTokenExpires.toISOString(), user.id],
            (err) => {
                if (err) {
                    console.error('Error saving reset token:', err);
                    return res.status(500).send({ message: "Server fejl" });
                }

                // Send email med reset link
                const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

                emailService.sendEmail({
                    to: user.email,
                    subject: 'Password Reset - Zappa Club',
                    text: `
Hej ${user.username}!

Du har anmodet om at nulstille dit password.

Klik på linket nedenfor for at nulstille dit password:
${resetLink}

Linket udløber om 1 time.

Hvis du ikke har anmodet om dette, kan du ignorere denne email.

Med venlig hilsen,
Zappa Klubben
                    `.trim()
                }).catch(err => console.error('Email send error:', err));

                res.send({
                    message: "Hvis emailen findes, er et reset link sendt"
                });
            }
        );
    });
});

// Reset password med token
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

    // Find bruger med token
    db.get(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
        [token, new Date().toISOString()],
        async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send({ message: "Server fejl" });
            }

            if (!user) {
                return res.status(400).send({
                    message: "Ugyldig eller udløbet reset token"
                });
            }

            try {
                // Hash nyt password
                const hashedPassword = await bcrypt.hash(newPassword, config.saltRounds);

                // Opdater password og clear reset token
                db.run(
                    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                    [hashedPassword, user.id],
                    (err) => {
                        if (err) {
                            console.error('Error updating password:', err);
                            return res.status(500).send({ message: "Server fejl" });
                        }

                        res.send({
                            message: "Password er blevet nulstillet succesfuldt"
                        });
                    }
                );
            } catch (error) {
                console.error('Bcrypt error:', error);
                return res.status(500).send({ message: "Server fejl" });
            }
        }
    );
});

export default router;
