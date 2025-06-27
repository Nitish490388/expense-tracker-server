/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `availableFund` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "availableFund_type_key" ON "availableFund"("type");
