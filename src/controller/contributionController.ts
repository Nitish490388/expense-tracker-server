import {
    Response,
    Request
} from "express";
import { success, error } from "../utils/responseWrapper";
import { PrismaClient, Status, Type } from "@prisma/client";

interface addExpenceRequest {
    description: string;
    amount: number;
    type: Type
    playerId: string;
    status: Status;
}

const prisma = new PrismaClient();

const createContributions = async (req: Request<{}, {}, addExpenceRequest>, res: Response) => {
    try {
        const {amount, type, playerId} = req.body;
        const contibution = await prisma.contribution.create({
            data: {
                amount,
                type,
                playerId
            }
        });
        await prisma.availableFund.update({
            where: {
                type: type
            }, data: {
                amount: {increment: amount}
            }
        })
        res.send(success(201, {result: "Contribution Created!!"}));
    } catch (err) {
        console.log(err);
        res.send(error(500, "Error occured!"));
    }
}

const updateContributions = async (req: Request, res: Response) => {
    
}

export {
    createContributions
}