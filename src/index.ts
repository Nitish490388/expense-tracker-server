import express, { urlencoded,Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import playerRouter from "../src/routes/players";
import expenseRouter from "../src/routes/expense";
import equipmentRouter from "../src/routes/equipment";
import matchdayRouter from "../src/routes/matchday";
import contributionRouter from "../src/routes/contribution";
import galleryAdmin from "../src/routes/admin/gallery";
import gallery from "../src/routes/gallery";
import auth from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/passport";
import verifyToken from "./middlewares/verifyUser";
import appRouter from "../src/routes/appRouter";
import "../src/cron/contributionJob";
import refundRouters from "../src/routes/refund"

import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { ensureApproved } from "./middlewares/ensureApproved";



dotenv.config({
  path: "./.env"
});

const app = express();

const PORT = process.env.PORT || 8001;

const corsOptions = {
  origin: process.env.CORS_URL,
  optionsSuccessStatus: 200 
}

app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));
const origin = process.env.CORS_URL;
app.use(cors({
  origin,
  credentials: true,
}));

const secret: string= process.env.JWT_SECRET as string;
app.use(session({ secret: secret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", auth);

app.get('/', (req: Request, res: Response) => {
     res.send('Hello, world!');
});


app.use("/api/v1/player", playerRouter);
app.use("/api/v1/expence", verifyToken,ensureApproved, expenseRouter);
app.use("/api/v1/equiment", equipmentRouter);
app.use("/api/v1/matchday", matchdayRouter);
app.use("/api/v1/app", verifyToken,ensureApproved, appRouter);
app.use("/api/v1/contributions",verifyToken,ensureApproved, contributionRouter);
app.use("/api/v1/refunds",verifyToken,ensureApproved, refundRouters);
app.use("/api/v1/admin/gallery", galleryAdmin);
app.use("/api/v1/gallery", gallery);

const httpServer = app.listen(PORT, () => {
    console.log("Server is started and running at port no: ", PORT);
});

// websocket

const wss = new WebSocketServer({ server: httpServer });
export { wss };

wss.on("connection", (ws: WebSocket) => {
  console.log("🔌 Client connected");

  // ws.send("👋 Hello from the WebSocket server");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());

    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});


