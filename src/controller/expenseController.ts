import { Request, Response } from "express";
import { success, error } from "../utils/responseWrapper";
import { Type } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { wss } from "../index";
import WebSocket from "ws";
import { WSEventType } from "../utils/wsEvents";

const prisma = new PrismaClient();

interface addExpenceRequest {
  description: string;
  amount: number;
  expenseType: string;
  playerId: string;
  sessionId: string
}

const addExpence = async (
  req: Request<{}, {}, addExpenceRequest>,
  res: Response
) => {
  try {
    const playerId = req.userId as string;
    const { description, amount, expenseType, sessionId } = req.body;
    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        expenseType: expenseType as Type,
        playerId, 
        sessionId
      },
    });

    const updatedFund = await prisma.availableFund.update({
      where: {
        type: expenseType as Type,
      },
      data: {
        amount: { decrement: amount },
      },
    });
    const balance = updatedFund.amount;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "CASH_UPDATED",
            expenseType: expenseType,
             amount: balance,
          }),
          (er) => {
            console.log(er);
          }
        );
      }
    });
    res.send(success(201, { msg: "Expense added!!" }));
  } catch (err) {
    console.log(err);

    res.send(error(500, "Error occured!!"));
  }
};

export { addExpence };
