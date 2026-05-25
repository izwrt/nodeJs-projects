import { Router } from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import db from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { randomBytes, createHmac } from "node:crypto";

type User = {
    name?: string,
    email?: string,
    password?: string
  };

const UserRouter: Router = Router();

UserRouter.post("/signup", async (req: Request, res: Response) => {
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

  const salt = randomBytes(16).toString('hex');
  const passwordHash = createHmac('sha256',salt)
  .update(password)
  .digest('hex')

  const [user] = await db.insert(usersTable).values({
    name,
    email: normalizedEmail,
    password: passwordHash,
  }).returning({id: usersTable.id});

  return res.status(201).json({ ok: true, data: user });
});

export default UserRouter;