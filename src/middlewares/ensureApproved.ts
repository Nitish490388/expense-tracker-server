import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { error } from "../utils/responseWrapper";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();
export const ensureApproved = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const playerId = req.userId;

  if (!playerId) {
    res.send(error(401, "Unauthorized: No user ID found."));
    return ;
  }

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player?.isApproved) {
      res.send(error(402, "Access denied. Waiting for admin approval."));
      return;
    }

    next();
  } catch (err) {
    console.error("Error in ensureApproved middleware:", err);
    res.send(error(401, "Internal server error."));
    return;
  }
};
