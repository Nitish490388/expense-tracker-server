import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string; // User ID
  email: string; // User email (optional, add if needed)
}

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Optional property
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = undefined;
    }

    if (!token) {
      res.status(401).json({ message: "No token provided, unauthorized." });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Failed to authenticate token." });
    return;
  }
};

export default verifyToken;
