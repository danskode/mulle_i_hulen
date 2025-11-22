import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../database/db.js';
import emailService from './emailService.js';
import { JWT_SECRET, JWT_EXPIRY } from '../config/auth.js';
import { config } from '../config/config.js';

class AuthService {
    /**
     * Login user and generate JWT token
     */
    async login(username, password) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                async (err, user) => {
                    if (err) {
                        return reject({ status: 500, message: "Server fejl" });
                    }

                    if (!user) {
                        return reject({ status: 401, message: "Forkert brugernavn eller password" });
                    }

                    try {
                        const isValidPassword = await bcrypt.compare(password, user.password);

                        if (!isValidPassword) {
                            return reject({ status: 401, message: "Forkert brugernavn eller password" });
                        }

                        // Generate JWT token
                        const token = jwt.sign(
                            { username: user.username, role: user.role },
                            JWT_SECRET,
                            { expiresIn: JWT_EXPIRY }
                        );

                        resolve({
                            username: user.username,
                            role: user.role,
                            token: token
                        });
                    } catch (error) {
                        reject({ status: 500, message: "Server fejl" });
                    }
                }
            );
        });
    }

    /**
     * Request password reset - generate and save token
     */
    async requestPasswordReset(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
                if (err) {
                    return reject({ status: 500, message: "Server fejl" });
                }

                // Always return success for security (don't reveal if email exists)
                if (!user) {
                    return resolve({ message: "Hvis emailen findes, er et reset link sendt" });
                }

                // Generate reset token
                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetTokenExpires = new Date(Date.now() + config.resetTokenExpiryHours * 60 * 60 * 1000);

                // Save token to database
                db.run(
                    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                    [resetToken, resetTokenExpires.toISOString(), user.id],
                    (err) => {
                        if (err) {
                            return reject({ status: 500, message: "Server fejl" });
                        }

                        // Send password reset email
                        emailService.sendPasswordResetEmail(user.username, user.email, resetToken)
                            .catch(err => console.error('Email send error:', err));

                        resolve({ message: "Hvis emailen findes, er et reset link sendt" });
                    }
                );
            });
        });
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
                [token, new Date().toISOString()],
                async (err, user) => {
                    if (err) {
                        return reject({ status: 500, message: "Server fejl" });
                    }

                    if (!user) {
                        return reject({ status: 400, message: "Ugyldig eller udløbet reset token" });
                    }

                    try {
                        // Hash new password
                        const hashedPassword = await bcrypt.hash(newPassword, config.saltRounds);

                        // Update password and clear reset token
                        db.run(
                            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                            [hashedPassword, user.id],
                            (err) => {
                                if (err) {
                                    return reject({ status: 500, message: "Server fejl" });
                                }

                                resolve({ message: "Password er blevet nulstillet succesfuldt" });
                            }
                        );
                    } catch (error) {
                        reject({ status: 500, message: "Server fejl" });
                    }
                }
            );
        });
    }
}

export default new AuthService();
