import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt';
import db from '../database/db.js';
import { config } from '../config/config.js';
import { validatePassword, validateEmail, validateUsername, sanitizeString } from '../utils/validators.js';

const router = Router();

//==== All member's route ====//

router.get('/members', authenticateToken, (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: "Serverfejl" });
        }
        res.send({ data: users });
    });
});

//==== Only ADMIN route ====//

router.post('/members', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({
            message: "Kun administratorer kan oprette nye medlemmer"
        });
    }

    let { username, email, password, role } = req.body;

    // Sanitize inputs
    username = sanitizeString(username);
    email = sanitizeString(email);
    role = sanitizeString(role);

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
        return res.status(400).send({
            message: usernameValidation.message
        });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).send({
            message: emailValidation.message
        });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).send({
            message: passwordValidation.message
        });
    }

    // Validate role
    const validRoles = ['ADMIN', 'USER', 'PROSPECT'];
    if (!role || !validRoles.includes(role)) {
        return res.status(400).send({
            message: "Ugyldig rolle. Vælg mellem: ADMIN, USER, PROSPECT"
        });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.saltRounds);

        // Add user to database
        db.run(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).send({
                            message: "Brugernavn eller email er allerede i brug"
                        });
                    }
                    console.error('Database error:', err);
                    return res.status(500).send({ message: "Server fejl" });
                }

                // Get the new user's details
                db.get(
                    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
                    [this.lastID],
                    (err, user) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).send({ message: "Serverfejl" });
                        }

                        res.status(201).send({
                            message: "Medlem oprettet",
                            data: user
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Bcrypt error:', error);
        return res.status(500).send({ message: "Serverfejl" });
    }
});

export default router;