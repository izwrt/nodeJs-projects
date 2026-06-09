import express, { Router } from 'express';
import type { Request, Response } from 'express';
import { createHmac, randomBytes } from 'node:crypto';
import User from '../models/user.model.js';

const router: Router = Router();

router.post('/signup', async (req: Request, res: Response) => {
    const { name, email, password} = req.body;
    console.log(name)
     // 1. Validate input
    if (!name || !email || !password) return res.status(400).json({ error: "All the fields are required"});

    const salt =  randomBytes(16).toString('hex');

    const hashedPassword = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    // 3. Save user AND the salt to the database
    const user = await User.create({
        name, 
        email, 
        password: hashedPassword, 
        salt
    });

    // 4. Send a success response back to the client
    return res.status(201).json({
        message: "User created successfully",
        userId: user.id
    })

});

export default router;