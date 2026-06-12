import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type Payload = {
    id: string,
    email: string,
    name: string,
    role?: "USER" | "ADMIN"
}

// Global authentication middleware
// Reads the JWT from the Authorization header and attaches the decoded payload to req.user.
// It DOES NOT block requests without a token, allowing public routes to function.
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const tokenHeader = req.get('Authorization');

    if(!tokenHeader) return next();

    if(!tokenHeader.startsWith('Bearer ')) return next();

    const token = tokenHeader.split(' ')[1]!;

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET!) as Payload
        req.user = decode;
    } catch(err) {
        // Silently ignore invalid/expired tokens. req.user remains undefined.
        // The requireAuth middleware will handle blocking the request if needed.
    }

    return next()
}

// Authorization middleware for protected routes
// Blocks the request with a 401 Unauthorized if req.user is not set by the authenticate middleware.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
}

