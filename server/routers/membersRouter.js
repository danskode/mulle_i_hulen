import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt';
import db from '../database/db.js';

const router = Router();

// GET alle medlemmer - kræver JWT token
router.get('/members', authenticateToken, (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: "Server fejl" });
        }
        res.send({ data: users });
    });
});

// POST opret nyt medlem - kun for ADMIN
router.post('/members', authenticateToken, async (req, res) => {
    // Tjek om brugeren er ADMIN
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({
            message: "Kun administratorer kan oprette nye medlemmer"
        });
    }

    const { username, email, password, role } = req.body;

    // Valider input
    if (!username || !email || !password || !role) {
        return res.status(400).send({
            message: "Brugernavn, email, password og rolle er påkrævet"
        });
    }

    if (password.length < 4) {
        return res.status(400).send({
            message: "Password skal være mindst 4 tegn"
        });
    }

    const validRoles = ['ADMIN', 'USER', 'PROSPECT'];
    if (!validRoles.includes(role)) {
        return res.status(400).send({
            message: "Ugyldig rolle. Vælg mellem: ADMIN, USER, PROSPECT"
        });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Indsæt ny bruger i database
        db.run(
            'INSERT INTO users (username, email, password, role, first_login) VALUES (?, ?, ?, ?, 1)',
            [username, email, hashedPassword, role],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).send({
                            message: "Brugernavn eller email er allerede i brug"
                        });
                    }
                    console.error('Database error:', err);
                    return res.status(500).send({ message: "Server fejl" });
                }

                // Hent den nyoprettede bruger
                db.get(
                    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
                    [this.lastID],
                    (err, user) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).send({ message: "Server fejl" });
                        }

                        res.status(201).send({
                            message: "Medlem oprettet succesfuldt",
                            data: user
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Bcrypt error:', error);
        return res.status(500).send({ message: "Server fejl" });
    }
});

export default router;