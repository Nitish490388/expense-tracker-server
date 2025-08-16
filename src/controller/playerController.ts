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

    const secret: string = process.env.JWT_SECRET || "";

    const jwt_secret: string = process.env.JWT_ACCESS_SECRET || "";
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "3d",
    });

    res.cookie("token", token, {
      // path: "/",
      // sameSite: "lax",
      // httpOnly: true,
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 3),
    });
    res.send(success(201, { token }));
    return;
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occured"));
    return;
  }
};

const signinController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await Prisma.player.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      res.send(error(404, "Email not found. Please create an account!"));
      return;
    }
    const matched = await bcrypt.compare(password, user?.password as string);
    if (!matched) {
      res.send(error(401, "Invalid credential!!"));
      return;
    }

    const jwt_secret: string = process.env.JWT_SECRET || "";
    const token = await jwt.sign(
      {
        id: user?.id,
        email: user?.email,
      },
      jwt_secret,
      {
        expiresIn: "3d",
      }
    );
    res.cookie("token", token, {
      domain: "karnival-kings-client.onrender.com",
      path: "/",
      sameSite: "none",
      secure: true,
      httpOnly: false,
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 3),
    });

    // res.cookie("token", token, {
    //   httpOnly: false, // so React can read it
    //   secure: true, // Render uses HTTPS
    //   sameSite: "lax",  // since frontend & backend are "same" now
    //   path: "/",
    //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
    // });

    res.send(success(201, { token }));
    return;
  } catch (err) {
    console.log(err);
    res.send(error(505, "Error occured"));
  }
};

const logoutController = (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    // req.session = null;

    res.send(success(200, { msg: "user logged out successfully" }));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const result = await Prisma.player.findMany();
    res.send(success(201, result));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

const markPlayerAsApproved = async (req: Request, res: Response) => {
  try {
    const { id, isApproved } = req.body;
    const updated = await Prisma.player.update({
      where: { id },
      data: { isApproved },
    });
    res.send(success(201, { result: "Player marked as approved" }));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

const getNotApprovedPlayers = async (req: Request, res: Response) => {
  try {
    const players = await Prisma.player.findMany({
      where: {
        isApproved: false,
      },
    });
    res.send(success(201, { players }));
  } catch (err) {
    console.log(error);
    res.send(error(505, "Error occusred"));
  }
};

export {
  check,
  signupController,
  signinController,
  logoutController,
  getAllPlayers,
  markPlayerAsApproved,
  getNotApprovedPlayers,
};
