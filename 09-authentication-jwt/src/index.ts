import 'dotenv/config';
import db from './db/index.js';
import express from "express";
import { router } from './routes/user.routes.js';
import type { Request, Response, NextFunction } from 'express';
import { userSessions, usersTable } from './db/schema.js';
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken"

type Payload = {
    id: string,
    name: string,
    email: string
}

const app = express();
const PORT= process.env.PORT ?? 8000

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Global JWT Validation Middleware
// This runs on EVERY request. It checks for an Authorization header, verifies the JWT signature,
// and attaches the decoded payload to the request object if the token is valid.
// Notice there are NO database queries here! This is the magic of stateless auth.
app.use(( req: Request, res: Response, next: NextFunction) => {
    const tokenHeader =  req.get('Authorization');
    
    if(!tokenHeader) return next();

    if(!tokenHeader.startsWith('Bearer')) return next();
    
    const token = tokenHeader.split(' ')[1]!

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET!) as Payload
        req.user = decode;
    } catch (err) {
        console.log("JWT Error:", err);
    }

    return next();
})

app.use('/',router);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})