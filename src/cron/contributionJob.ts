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
        settles: false,
      },
      include: {
        players: true,
        expenses: {
          include: { paidBy: true },
        },
      },
    });

    for (const session of sessions) {
      const totalSpent = session.expenses.reduce((sum, e) => sum + e.amount, 0);
      if (totalSpent === 0) continue;

      const perPerson = session.players.length > 0
        ? Math.round(totalSpent / session.players.length)
        : 0;

      if (perPerson === 0) continue;

      // Generate Contributions
      const contributionData = session.players
        .map((player) => ({
          amount: perPerson,
          type: Type.MATCHDAY,
          playerId: player.id,
          sessionId: session.id,
          status: Status.PENDING,
          date: new Date(),
        }))
        .filter((c) => c.amount > 0);

      await prisma.contribution.createMany({
        data: contributionData,
        skipDuplicates: true,
      });

     // Generate Refunds
const playerSpending: Record<string, number> = {};
for (const expense of session.expenses) {
  playerSpending[expense.playerId] = (playerSpending[expense.playerId] || 0) + expense.amount;
}

const refundData = Object.entries(playerSpending)
  .map(([playerId, amountSpent]) => {
    const refundAmount = amountSpent - perPerson;
    return refundAmount > 0
      ? {
          amount: refundAmount,
          type: Type.MATCHDAY,
          playerId,
          sessionId: session.id, // <-- REQUIRED based on schema
          status: Status.PENDING,
          date: new Date(),
        }
      : null;
  })
  .filter(Boolean) as {
    amount: number;
    type: Type;
    playerId: string;
    sessionId: string;
    status: Status;
    date: Date;
  }[];

if (refundData.length > 0) {
  await prisma.refunds.createMany({
    data: refundData,
    skipDuplicates: true,
  });
}


      // Mark session as settled
      await prisma.expenseSession.update({
        where: { id: session.id },
        data: { settles: true },
      });

      console.log(`[${new Date().toISOString()}] ✅ Contributions & refunds created for session: ${session.title}`);
    }
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
});
