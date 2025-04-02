import express, { urlencoded,Request, Response } from "express";
import dotenv from "dotenv"
import playerRouter from "../src/routes/players";
import morgan from "morgan";

dotenv.config({
  path: "./.env"
});

const app = express();

const PORT = process.env.PORT || 8001;

app.use(express.json({limit:'25mb'}));
app.use(urlencoded({extended: true}));
app.use(morgan("common"));

app.get('/', (req: Request, res: Response) => {
     res.send('Hello, world!');
});

app.use("/api/v1/player", playerRouter);

app.listen(PORT, () => {
    console.log("Server is started and running at port no: ", PORT);
    
});