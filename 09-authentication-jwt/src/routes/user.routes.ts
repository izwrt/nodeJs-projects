import "dotenv/config";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { Router } from "express";
import { createHmac, randomBytes } from "node:crypto";
import db from "../db/index.js";
import { userSessions, usersTable } from "../db/schema.js";
import jwt from "jsonwebtoken"

type User = {
    name?: string,
    email?: string,
    password?: string
  };

export const router: Router = Router();


//Signup router
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = (req.body ?? {}) as User;

  console.log("content-type:", req.headers["content-type"]);
  console.log("body:", req.body);

  if(!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const normalizedEmail: string = email.trim().toLowerCase();

  const [existing] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return res.status(409).json({ error: `User already exists with ${normalizedEmail}` });
  }

  // Generate a unique salt and hash the password using HMAC-SHA256
  // This ensures that even if two users have the same password, their hashes will be different.
  const salt = randomBytes(16).toString('hex');
  const passwordHash = createHmac('sha256',salt)
  .update(password)
  .digest('hex')

  const [user] = await db.insert(usersTable).values({
    name,
    email: normalizedEmail,
    password: passwordHash,
    salt: salt
  }).returning({id: usersTable.id});

  return res.status(201).json({ ok: true, data: user });
});

//Login router
router.post("/login", async(req:Request, res:Response) => {
  const {email, password} = (req.body ?? {}) as User;
  
  if(!email || !password) return res.status(400).json({error: "Missing fields"});

  const normalizedEmail = email.trim().toLowerCase();

  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));

  // Return generic error to prevent email enumeration attacks
  if (!existingUser || !existingUser.salt) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Re-hash the provided password with the user's stored salt to verify
  const salt: string = existingUser?.salt;
  const hashedPassword = createHmac('sha256', salt).update(password).digest("hex");

  if (hashedPassword !== existingUser.password) return res.status(401).json({ error: "Invalid credentials"})

  const payload = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  
  return res.status(200).json({ 
    status: 'success',
    token: token
  });
});

//get-me
router.get('/', async(req: Request, res:Response) => {
  const user = req.user;
  if(!user) return res.status(401).json({
    error: {
    code: "UNAUTHORIZED",
    message: "You must be logged in to access this resource."
    }
  });

  return res.json({
    status: true,
    data: {
      user: user
    }
  });
});
