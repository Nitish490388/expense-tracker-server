import {Router} from "express";
import { getDataController } from "../controller/matchdayController";

const router = Router();

router.get("/getdata", getDataController);

export default router;
