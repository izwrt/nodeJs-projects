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

const router: Router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as User;

  if(!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: `User already exists with ${email}` });
  }

  const salt = randomBytes(16).toString('hex');
  const passwordHash = createHmac('sha256',salt)
  .update(password)
  .digest('hex')

  await db.insert(usersTable).values({
    name,
    email,
    password: passwordHash,
  });

  return res.status(201).json({ ok: true });
});

export default router;