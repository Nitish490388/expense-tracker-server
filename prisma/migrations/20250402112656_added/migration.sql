/*
  Warnings:

  - Added the required column `status` to the `Contribution` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PAID', 'DECLINED');

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "status" "Status" NOT NULL;
