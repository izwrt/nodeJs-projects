import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Payload = {
    id: string,
    name: string,
    email: string,
    role: "USER" | "ADMIN",
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const tokenHeader =  req.get('Authorization');
    
    if(!tokenHeader) return next();

    if(!tokenHeader.startsWith('Bearer ')) return next();
    
    const token = tokenHeader.split(' ')[1]!

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET!) as Payload
        req.user = decode;
    } catch (err) {
        console.log("JWT Error:", err);
    }

    return next();
}

export const ensureAuthenticated  = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(!user) return res.status(401).json({
        error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource."
        }
    });

    next();
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if(req.user!.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
}