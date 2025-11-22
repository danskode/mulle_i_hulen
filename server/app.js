import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './database/db.js'; // Initialiser database

const app = express();

app.use(cors());
app.use(express.json());


//===== Routers =====//

import authRouter from './routers/authRouter.js';
app.use('/api', authRouter);

import membersRouter from './routers/membersRouter.js';
app.use('/api', membersRouter);



//===== Start Server =====//

const PORT = Number(process.env.PORT) || 8081;

app.listen(PORT, (error) => {

    if (error) {
        console.log("Server is not starting, due to:", error);
    }
    console.log("Server is up and running on port", PORT)
});