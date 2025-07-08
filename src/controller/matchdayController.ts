import { success, error } from "../utils/responseWrapper";
import { Request, Response } from "express";
import { PrismaClient, Type, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const getDataController = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;

    // Define base filters
    const dateFilter: Prisma.DateTimeFilter = {};

    if (fromDate) {
      dateFilter.gte = new Date(fromDate as string);
    }

    if (toDate) {
      dateFilter.lte = new Date(toDate as string);
    }

    const contributionFilter: Prisma.ContributionWhereInput = {
      type: Type.MATCHDAY,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    const expenseFilter: Prisma.ExpenseWhereInput = {
      expenseType: Type.MATCHDAY,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    // Fetch data
    const [contributions, expenses, contributionAgg, expenseAgg] =
      await Promise.all([
        prisma.contribution.findMany({
          where: contributionFilter,
          include: { player: true },
        }),
        prisma.expense.findMany({
          where: expenseFilter,
          include: { paidBy: true },
        }),
        prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            type: Type.MATCHDAY,
            status: "PAID",
          },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            expenseType: Type.MATCHDAY,
          },
        }),
      ]);

    const totalContributions = contributionAgg._sum.amount ?? 0;
    const totalExpenses = expenseAgg._sum.amount ?? 0;
    const availableFund = totalContributions - totalExpenses;

    res.send(success(201, { availableFund, contributions, expenses }));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
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
