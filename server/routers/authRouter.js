import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../database/db.js';
import emailService from '../services/emailService.js';

const router = Router();

// JWT Secret (i produktion: brug environment variable!)
const JWT_SECRET = "din_super_hemmelige_jwt_nøgle_2024";

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

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
                const expiryMinutes = process.env.JWT_EXPIRY_MINUTES || 1440; // Default: 24 timer
                const token = jwt.sign(
                    { username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: `${expiryMinutes}m` }
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
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({
            message: "Email er påkrævet"
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
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 time

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
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send({
            message: "Token og nyt password er påkrævet"
        });
    }

    if (newPassword.length < 4) {
        return res.status(400).send({
            message: "Password skal være mindst 4 tegn"
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
                const hashedPassword = await bcrypt.hash(newPassword, 10);

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
export { JWT_SECRET };
