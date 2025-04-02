import { PrismaClient } from "@prisma/client";
import { error, success } from "../utils/responseWrapper";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Prisma = new PrismaClient({});

const check = (req: Request, res: Response) => {
  res.send(
    success(201, {
      msg: "Ok from player router",
    })
  );
};

const signupController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await Prisma.player.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.send(error(400, "Email already exists!!"));
      return;
    }

    const haskedPassword = await bcrypt.hash(password, 10);
    const user = await Prisma.player.create({
      data: {
        name,
        email,
        password: haskedPassword,
      },
    });

    console.log(user);
    const secret: string = process.env.JWT_SECRET || "";

    const jwt_secret: string = process.env.JWT_ACCESS_SECRET || "";
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "3d",
    });

    res.send(success(201, {token}));
    return;
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occured"));
    return;
  }
};

const signinController = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await Prisma.player.findFirst({
            where: {
                email
            }
        });
        if(!user) {
            res.send(error(404, "Email not found. Please create an account!"));
            return;
        }
        const matched = await bcrypt.compare(password, user?.password as string);
        if(!matched) {
            res.send(error(400, "Invalid credential!!"));
            return;
        }

        const jwt_secret: string = process.env.JWT_SECRET || "";
        const token = await jwt.sign(
            {
                id: user?.id,
                email: user?.email
            },
            jwt_secret,
            {
                expiresIn: "3d"
            },
        );

        res.send(success(201, {token}));
    } catch (err) {
      console.log(err);
      res.send(error(505, "Error occured"));
    }
};

const logoutController = (req: Request, res: Response) => {
  try {
    res.send(success(201, {result: "User logged out!"}))
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

export { 
    check,
    signupController,
    signinController,
    logoutController
 };
