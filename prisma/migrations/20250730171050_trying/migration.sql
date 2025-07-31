/*
  Warnings:

  - Added the required column `sessionId` to the `Refunds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Refunds" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Refunds" ADD CONSTRAINT "Refunds_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpenseSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
