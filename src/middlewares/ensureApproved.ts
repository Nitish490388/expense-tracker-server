import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const prisma = new PrismaClient();
export const ensureApproved = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const playerId = req.user?.id;

  if (!playerId) {
    return res.status(401).json({ error: "Unauthorized: No user ID found." });
  }

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player?.isApproved) {
      return res
        .status(403)
        .json({ error: "Access denied. Waiting for admin approval." });
    }

    next();
  } catch (error) {
    console.error("Error in ensureApproved middleware:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
