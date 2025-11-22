import db from './db.js';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

const users = [
    { username: 'bjorn', password: 'Skovsnegl1', email: 'bjorn@zappa.club', role: 'ADMIN' },
    { username: 'steen', password: 'Skovsnegl1', email: 'steen@zappa.club', role: 'USER' },
    { username: 'mulle', password: 'Skovsnegl1', email: 'mulle@zappa.club', role: 'PROSPECT' }
];

async function seedUsers() {
    console.log('Seeding users...');

    for (const user of users) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, config.saltRounds);

            db.run(
                'INSERT OR REPLACE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
                [user.username, hashedPassword, user.email, user.role],
                (err) => {
                    if (err) {
                        console.error(`Error inserting user ${user.username}:`, err);
                    } else {
                        console.log(`User ${user.username} seeded successfully`);
                    }
                }
            );
        } catch (err) {
            console.error(`Error hashing password for ${user.username}:`, err);
        }
    }

    // Luk database efter seed
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Seeding complete, database closed');
            }
        });
    }, 1000);
}

seedUsers();
