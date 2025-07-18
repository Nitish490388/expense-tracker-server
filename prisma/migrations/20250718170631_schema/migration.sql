/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Contribution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "ExpenseSession" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
