import 'dotenv/config';
import db from './db/index.js';
import express from "express";
import { router } from './routes/user.routes.js';
import type { Request, Response, NextFunction } from 'express';
import { userSessions, usersTable } from './db/schema.js';
import { eq } from "drizzle-orm";

const app = express();
const PORT= process.env.PORT ?? 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',router);

//session validation
app.use(async( req: Request, res: Response, next: NextFunction) => {
    const sessionId =  req.get('session-id');
    
    if(!sessionId) return next();

    const [data] = await db
        .select({
            sessionId: userSessions.id,
            id: usersTable.id,
            name: usersTable.name,
            createdAt: userSessions.createdAt,
        })
        .from(userSessions)
        .innerJoin(usersTable, eq(usersTable.id, userSessions.userId))
        .where(eq(userSessions.id, sessionId))
        .limit(1);

    if(!data) return next();

    req.user = data;
    return next();
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})