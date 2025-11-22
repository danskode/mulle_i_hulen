import 'dotenv/config';
import { validateEnv } from './utils/validateEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './database/db.js';
import { config } from './config/config.js';

//==== Environment variables ====//

validateEnv();

//==== Express app setup ====//

const app = express();
app.use(express.json());

//==== Security headers & Cors ====//

app.use(helmet());

// CORS config

const corsOptions = {
    origin: config.clientUrl,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

//===== Routers =====//

import authRouter from './routers/authRouter.js';
app.use('/api', authRouter);

import membersRouter from './routers/membersRouter.js';
app.use('/api', membersRouter);

//===== Error Handler =====//

import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

//===== Start Server =====//

app.listen(config.port, (error) => {
    if (error) {
        console.log("Server is not starting, due to:", error);
    }
    console.log("Server is up and running on port", config.port);
});