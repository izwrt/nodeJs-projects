import "dotenv/config";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { Router } from "express";
import { createHmac, randomBytes } from "node:crypto";
import db from "../db/index.js";
import { userSessions, usersTable } from "../db/schema.js";
import jwt from "jsonwebtoken"

type User = {
    name: string;
    email: string;
    password: string;
    salt: string;
    role?: "USER" | "ADMIN";
  };

export const router: Router = Router();


//Signup router
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, role } = (req.body ?? {}) as User;

  console.log("content-type:", req.headers["content-type"]);
  console.log("body:", req.body);

  if(!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const normalizedEmail: string = email.trim().toLowerCase();

  const normalizedRole = role?.toUpperCase();

    if (normalizedRole !== "USER" && normalizedRole !== "ADMIN") {
    return res.status(400).json({ error: "Invalid role. Must be USER or ADMIN." });
  }

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

    const insertData: User = {
    name,
    email: normalizedEmail,
    password: passwordHash,
    salt: salt
  };

  // Only add the role to the insert object if it is valid
  if (normalizedRole) {
    insertData.role = normalizedRole as "USER" | "ADMIN";
  }

  const [user] = await db.insert(usersTable).values(insertData).returning({id: usersTable.id});


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

  // Create the JWT Payload containing non-sensitive user data.
  // This data will be encoded (not encrypted) inside the token.
  const payload = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role
  }

  // Cryptographically sign the token using our server's secret key.
  // This makes the authentication "stateless" because we don't save the token to the database.
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
  console.log(user)
  if(user.role === "USER") return res.json({status: true})

  return res.json({
    status: true,
    data: {
      user: user
    }
  });
});
