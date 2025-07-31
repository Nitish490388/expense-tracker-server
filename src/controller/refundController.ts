import { Request, Response } from "express";
import { PrismaClient, Status } from "@prisma/client";
import { success, error } from "../utils/responseWrapper";

const prisma = new PrismaClient();


const markRefundAsPaid = async (req: Request, res: Response) => {
  const { refundId, playerId } = req.body;

  if (!refundId || !playerId) {
    res.status(400).json(error(400, "refundId and playerId are required."));
     return;
  }

  try {
    const updated = await prisma.refunds.update({
      where: { id: refundId },
      data: { status: Status.PAID },
    });

    res.send(success(201, {message: "Success in sending message"}));
  } catch (err) {
    console.error("Error updating refund status:", err);
     res.status(500).json(error(500, "Internal server error."));
     return;
  }
};

/**
 * Fetches all pending refunds for the logged-in user.
 */
const getPendingRefunds = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
       res.status(400).json(error(400, "Unauthorized access."));
       return;
    }

    const pendingRefunds = await prisma.refunds.findMany({
      where: {
        playerId: userId,
        status: Status.PENDING,
      },
      include: {
        session: true,
      },
    });
    res.send(success(201, {pendingRefunds}));
    return;
  } catch (err) {
    console.error("Error fetching pending refunds:", err);
    res.status(500).json(error(500, "Internal server error."));
    return;
  }
};

export { markRefundAsPaid, getPendingRefunds };
