import 'dotenv/config';
import db from './db/index.js';
import express from "express";
import { UserRouter } from './routes/user.routes.js';

const app = express();
const PORT= process.env.PORT ?? 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',UserRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})