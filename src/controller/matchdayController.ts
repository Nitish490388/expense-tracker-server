import { success, error } from "../utils/responseWrapper";
import { Request, Response } from "express";
import { PrismaClient, Type, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const getDataController = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;

    const dateFilter: Prisma.ExpenseSessionWhereInput = {
      type: Type.MATCHDAY,
    };

    if (fromDate && toDate) {
      dateFilter.createdAt = {
        gte: new Date(fromDate as string),
        lte: new Date(toDate as string),
      };
    } else if (fromDate) {
      dateFilter.createdAt = {
        gte: new Date(fromDate as string),
      };
    } else if (toDate) {
      dateFilter.createdAt = {
        lte: new Date(toDate as string),
      };
    }

    // Fetch all matchday sessions in range
    const sessions = await prisma.expenseSession.findMany({
      where: dateFilter,
      include: {
        contributions: { include: { player: true } },
        expenses: { include: { paidBy: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total available fund
    let totalContributions = 0;
    let totalExpenses = 0;

    const sessionsWithFund = sessions.map((session) => {
      const contributionSum = session.contributions.reduce(
        (sum, c) => sum + (c.status === "PAID" ? c.amount : 0),
        0
      );
      const expenseSum = session.expenses.reduce((sum, e) => sum + e.amount, 0);

      totalContributions += contributionSum;
      totalExpenses += expenseSum;

      return {
        ...session,
        availableFund: contributionSum - expenseSum,
      };
    });

    const availableFund = totalContributions - totalExpenses;

     res.send(
      success(201, {
        availableFund,
        sessions: sessionsWithFund,
      })
      
    );
    return;
  } catch (err) {
    console.error(err);
    res.send(error(500, "An error occurred while fetching matchday data."));
    return;
  }
};


const createMatchdaySessionController = async (req: Request, res: Response) => {
  try {
    const {selectedPlayers, title} = req.body;
    // console.log(title);

    const session = await prisma.expenseSession.create({
      data: {
        title,
         players: {
           connect: selectedPlayers.map((id: string) => ({ id }))
          },
        type: "MATCHDAY"
      }
    });

    console.log(session);  
    res.send(success(201, {msg: "Success in creating a session!!"}));
    
  } catch (err) {
    console.log(err);
    res.send(error(500, "Internal Error Occured!!"));
  }
}

const getSessionDataById = async (req: Request, res: Response) => {
  try {
    const sessionData = await prisma.expenseSession.findUnique({
    where: { id: req.params.id },
    include: {
      players: true,
      expenses: {
        include: {
          paidBy: true
        }
      },
      contributions: {
        include: {
          player: true
        }
      },
      refunds: {
        include: {
          player: true
        }
      }
    },
  });

  res.send(success(201, {sessionData}));

  } catch (err) {
    console.log(err);
    res.send(error(500, "Internal Error Occured!!"));
  }
}


const getSessions = async (req: Request, res: Response) => {
  try {
    
    const sessions = await prisma.expenseSession.findMany({
      where: {
        type: "MATCHDAY"
      },
      include: {
        players: true
      }
    });
  res.send(success(201, {sessions}));

  } catch (err) {
    console.log(err);
    res.send(error(500, "Internal Error Occured!!"));
  }
}



export { 
  getDataController,
  createMatchdaySessionController,
  getSessionDataById,
  getSessions
 };
