/*
  Warnings:

  - Added the required column `sessionId` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Refunds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Refunds" ADD COLUMN     "status" "Status" NOT NULL;

-- CreateTable
CREATE TABLE "ExpenseSession" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "settles" BOOLEAN NOT NULL,

    CONSTRAINT "ExpenseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SessionPlayers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionPlayers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SessionPlayers_B_index" ON "_SessionPlayers"("B");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpenseSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpenseSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionPlayers" ADD CONSTRAINT "_SessionPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "ExpenseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionPlayers" ADD CONSTRAINT "_SessionPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
