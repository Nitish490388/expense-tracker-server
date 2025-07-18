import cron from "node-cron";

import dayjs from "dayjs";
import { PrismaClient, Type, Status } from "@prisma/client";

const prisma = new PrismaClient();

cron.schedule("59 23 * * *", async () => {
  try {
    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs().add(1, "day").startOf("day").toDate();

    const sessions = await prisma.expenseSession.findMany({
      where: {
        type: "MATCHDAY",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        players: true,
        expenses: true,
      },
    });
    

     for (const session of sessions) {
      const totalSpent = session.expenses.reduce((sum, e) => sum + e.amount, 0);
      const perPerson = session.players.length > 0 ? Math.round(totalSpent / session.players.length) : 0;

      const contributionData = session.players.map((player) => ({
        amount: perPerson,
        type: Type.MATCHDAY,
        playerId: player.id,
        sessionId: session.id,
        status: Status.PENDING,
        date: new Date(),
      }));

      await prisma.contribution.createMany({
        data: contributionData,
        skipDuplicates: true, 
      });

      console.log(`[${new Date().toISOString()}] Contributions created for session ${session.title}`);
    }
  } catch (error) {
    console.log(error);
    
  }
});
