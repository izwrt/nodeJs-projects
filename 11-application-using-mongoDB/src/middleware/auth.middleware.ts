import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type Payload = {
    id: string,
    email: string,
    name: string,
    role?: "USER" | "ADMIN"
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const tokenHeader = req.get('Authorization');

    if(!tokenHeader) return next();

    if(!tokenHeader.startsWith('Bearer ')) return next();

    const token = tokenHeader.split(' ')[1]!;

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET!) as Payload
        req.user = decode;
    } catch(err) {
        console.error(err, 'Invalid token during the get me')
    }

    return next()
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
}

