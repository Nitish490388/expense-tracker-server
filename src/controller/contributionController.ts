import { Request, Response } from "express";
import { PrismaClient, Status, Type } from "@prisma/client";
import { success, error } from "../utils/responseWrapper";
import { wss } from "../index";
import WebSocket from "ws";

const prisma = new PrismaClient();

const markContributionAsPaid = async (req: Request, res: Response) => {
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

    const updatedFund = await prisma.availableFund.update({
      where: {
        type: "MATCHDAY" as Type,
      },
      data: {
        amount: { increment: updated.amount },
      },
    });

    const unpaid = await prisma.contribution.findMany({
      where: {
        sessionId: updated.sessionId,
        status: { not: "PAID" },
      },
    });

    if (unpaid.length === 0) {
      await prisma.expenseSession.update({
        where: { id: updated.sessionId },
        data: { settles: true },
      });
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "CASH_UPDATED",
            expenseType: "MATCHDAY",
            amount: updatedFund.amount,
          }),
          (er) => {
            console.log(er);
          }
        );
      }
    });

    res.status(200).json(
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

const getPendingContribution = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.send(error(400, "Un authorized access"));
    }

    const pendingContributions = await prisma.contribution.findMany({
      where: {
        playerId: userId,
        status: "PENDING",
      },
      include: {
        session: true,
      },
    });
    res.send(success(201, { pendingContributions }));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

export { getPendingContribution, markContributionAsPaid };
