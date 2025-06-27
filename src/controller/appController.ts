import { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { error, success } from "../utils/responseWrapper";

const prisma = new PrismaClient();

const getAvailableFund = async (req: Request, res: Response) => {
  try {
    const [data1, data2] = await Promise.all([
      prisma.availableFund.findUnique({
      where: {
        type: "EQUIPMENT"
      }
    }),
    prisma.availableFund.findUnique({
      where: {
        type: "MATCHDAY"
      }
    })
    ]);

    const data = {
      matchdayBalance: data1?.amount,
      equipmentBalance: data2?.amount
    }

    res.send(success(201, data));
  } catch (err) {
    console.log(err);
    res.send(error(500, "Internal error occured!!"));
  }
} 

export {
    getAvailableFund
}