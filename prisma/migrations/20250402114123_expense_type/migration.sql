/*
  Warnings:

  - Changed the type of `type` on the `Contribution` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Refunds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('MATCHDAY', 'EQUIPMENT');

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "Refunds" DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL;

-- DropEnum
DROP TYPE "ExpenseType";
