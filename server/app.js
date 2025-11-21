import express from 'express';
import { Router } from 'express';

const app = express();


const PORT = Number(process.env.PORT) || 8081;

app.listen(PORT, (error) => {

    if (error) {
        console.log("Server is not starting, due to:", error);
    }
    console.log("Server is up and running on port", PORT)
});