import 'dotenv/config';
import { validateEnv } from './utils/validateEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './database/db.js'; // Initialiser database
import { config } from './config/config.js';

// Validate environment variables
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - only allow requests from your client
const corsOptions = {
    origin: config.clientUrl,
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());


//===== Routers =====//

// Health check endpoint
app.get('/health', (req, res) => {
    res.send({ status: 'OK', timestamp: new Date().toISOString() });
});

import authRouter from './routers/authRouter.js';
app.use('/api', authRouter);

import membersRouter from './routers/membersRouter.js';
app.use('/api', membersRouter);


//===== Error Handler =====//

import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);


//===== Start Server =====//

const server = app.listen(config.port, (error) => {
    if (error) {
        console.log("Server is not starting, due to:", error);
    }
    console.log("Server is up and running on port", config.port);
});

// Graceful shutdown
const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);