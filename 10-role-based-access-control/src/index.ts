import 'dotenv/config';
import db from './db/index.js';
import express from "express";
import { router } from './routes/user.routes.js';
import type { Request, Response, NextFunction } from 'express';
import { userSessions, usersTable } from './db/schema.js';
import { eq } from "drizzle-orm";
import adminRouter from './routes/admin.routes.js';
import { authenticate } from './middleware/auth.middleware.js';


const app = express();
const PORT= process.env.PORT ?? 8000

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Global JWT Validation Middleware
// This runs on EVERY request. It checks for an Authorization header, verifies the JWT signature,
// and attaches the decoded payload to the request object if the token is valid.
// Notice there are NO database queries here! This is the magic of stateless auth.
app.use(authenticate);

app.use('/',router);
app.use('/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})