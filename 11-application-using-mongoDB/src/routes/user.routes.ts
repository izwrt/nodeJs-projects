import express, { Router } from 'express';
import type { Request, Response } from 'express';
import { createHmac, randomBytes } from 'node:crypto';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { requireAuth } from '../middleware/auth.middleware.js';

const router: Router = Router();

router.post('/signup', async (req: Request, res: Response) => {
    const { name, email, password} = req.body;

     // 1. Validate input
    if (!name || !email || !password) return res.status(400).json({ error: "All the fields are required"});

    const existingUser = await User.findOne({email,});

    if(existingUser) return res.status(409).json({error: "User with the email id is already exists"});

    const salt =  randomBytes(16).toString('hex');

    const hashedPassword = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    // 3. Save user AND the salt to the database
    const user = await User.insertOne({
        name, 
        email, 
        password: hashedPassword, 
        salt
    });

    // 4. Send a success response back to the client
    return res.status(201).json({
        message: "User created successfully",
        userId: user._id
    })

});

router.post('/login', async(req: Request, res: Response) => {
const { email, password} = req.body;

     // 1. Validate input
    if (!email || !password) return res.status(400).json({ error: "All the fields are required"});

    const existingUser = await User.findOne({email});

    if (!existingUser || !existingUser.salt) {
    return res.status(401).json({error: "Invalid credentials"});    
    }

    const payload = {
        id: existingUser?._id,
        name: existingUser?.name,
        email: existingUser?.email
    }

    const hashedPassword = createHmac('sha256', existingUser?.salt)
        .update(password)
        .digest('hex');

    if (hashedPassword !== existingUser?.password) return res.status(401).json({error: "Invalidate credentials"});

    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    return res.json({
        message:"Success",
        token: token,
        data: payload
    });
});

router.get('/get-me', requireAuth, async (req: Request, res: Response) => {
    const userData = req.user;

    if(!userData) return res.status(401).json({error: "Unauthorized access"});

    return res.json({
        message: "Success",
        data: userData
    })
})

export default router;