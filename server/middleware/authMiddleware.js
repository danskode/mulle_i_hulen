import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).send({
            message: "Adgang nægtet. Ingen token fundet."
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Tilføj brugerdata til request object
        next();
    } catch (err) {
        return res.status(403).send({
            message: "Ugyldig eller udløbet token"
        });
    }
};
