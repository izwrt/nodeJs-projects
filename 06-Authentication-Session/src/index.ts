import 'dotenv/config';
import db from './db/index.js';
import express from "express";
import { router } from './routes/user.routes.js';

const app = express();
const PORT= process.env.PORT ?? 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',router);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})