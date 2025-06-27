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

export { getDataController };
