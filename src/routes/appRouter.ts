import {Router} from "express";
import { getAvailableFund } from "../controller/appController";

const router = Router();

router.get("/availableFund", getAvailableFund);

export default router;