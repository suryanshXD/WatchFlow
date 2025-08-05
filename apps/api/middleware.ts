import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_VERIFY = "Hii";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ eror: "Unathorized" });
  }

  const decoded = jwt.verify(token, JWT_VERIFY);
  console.log(decoded);
  if (!decoded) {
    return res.status(401).json({ error: "Unathorized" });
  }
  req.userId = decoded.sub as string;
  next();
}
