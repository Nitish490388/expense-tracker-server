/*
  Warnings:

  - Added the required column `title` to the `ExpenseSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExpenseSession" ADD COLUMN     "title" TEXT NOT NULL;
