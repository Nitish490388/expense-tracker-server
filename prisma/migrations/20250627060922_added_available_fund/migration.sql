-- CreateTable
CREATE TABLE "availableFund" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "availableFund_pkey" PRIMARY KEY ("id")
);
