import { Request, Response } from "express";
import { PrismaClient, Status, Type } from "@prisma/client";
import { success, error } from "../utils/responseWrapper";

const prisma = new PrismaClient();

export const markContributionAsPaid = async (req: Request, res: Response) => {
  const { contributionId, playerId } = req.body;

  if (!contributionId || !playerId) {
    res
      .status(400)
      .json(error(400, "contributionId and playerId are required."));
    return;
  }

  try {

    const updated = await prisma.contribution.update({
      where: { id: contributionId },
      data: { status: Status.PAID },
    });

    const unpaid = await prisma.contribution.findMany({
      where: {
        sessionId: updated.sessionId,
        status: { not: "PAID" },
      }
    })

    if (unpaid.length === 0) {
       await prisma.expenseSession.update({
        where: { id: updated.sessionId },
        data: { settles: true },
      });
    }

    res
      .status(200)
      .json(
        success(200, {
          message: "Contribution marked as PAID",
          contribution: updated,
        })
      );
  } catch (err) {
    console.error("Error updating contribution status:", err);
    res.status(500).json(error(500, "Internal server error."));
  }
};
