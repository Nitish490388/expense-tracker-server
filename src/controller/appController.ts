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
      equipmentBalance: data1?.amount,
      matchdayBalance: data2?.amount
    }

    res.send(success(201, data));
  } catch (err) {
    console.log(err);
    res.send(error(500, "Internal error occured!!"));
  }
} 

const getProfileData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if(!userId) {
      res.send(error(400, "Unauthorized access"));
      return;
    }

    const player = await prisma.player.findUnique({
      where: {
        id: userId
      }, 
      select: {
        id: true,
        name: true,
        profilePic: true,
        email: true
      }
    });

    if(!player) {
      res.send(error(404, "Player not found"))
    }
      
    res.send(success(201, {player}));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

export {
    getAvailableFund,
    getProfileData
}