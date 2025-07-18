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
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
    });

    if (!contribution) {
      res.status(404).json(error(404, "Contribution not found."));
      return;
    }

    if (contribution.playerId !== playerId) {
      res
        .status(403)
        .json(
          error(403, "You are not authorized to update this contribution.")
        );
      return;
    }

    if (contribution.type !== Type.MATCHDAY) {
      res
        .status(400)
        .json(
          error(400, "Only MATCHDAY contributions can be marked this way.")
        );
      return;
    }

    if (contribution.status === Status.PAID) {
      res
        .status(400)
        .json(error(400, "This contribution is already marked as PAID."));
      return;
    }

    const updated = await prisma.contribution.update({
      where: { id: contributionId },
      data: { status: Status.PAID },
    });

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
