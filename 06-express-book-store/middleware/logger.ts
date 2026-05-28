import type { Request, Response, NextFunction } from "express";
import fs from "fs";

export function loggerMiddlerware(req: Request, res: Response, next: NextFunction) {
  const time = new Date();
  const log = `[${time.toLocaleString()}] - ${req.method} - ${req.path}\n`
  fs.appendFileSync('log.txt', log);
  next();
}