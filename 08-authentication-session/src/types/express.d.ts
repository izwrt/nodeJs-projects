import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sessionId: string;
        id: string;
        name: string;
        createdAt: Date;
      };
    }
  }
}

export {};

