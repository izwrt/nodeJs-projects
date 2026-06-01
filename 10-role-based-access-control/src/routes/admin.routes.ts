import { Router } from "express";
import db from "../db/index.js";
import type { Request, Response } from "express";
import { usersTable } from "../db/schema.js";
import { ensureAuthenticated, requireAdmin } from "../middleware/auth.middleware.js";


const adminRouter = Router();

adminRouter.get("/users", ensureAuthenticated, requireAdmin, async(req: Request, res: Response) => {
    const users = await db.select({
         id: usersTable.id,
         name: usersTable.name,
         email: usersTable.email
         })
         .from(usersTable);

    res.json({
        status:"Success",
        data: users
    })
});

export default adminRouter;
