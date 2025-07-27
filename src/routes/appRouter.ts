import {Router} from "express";
import { getAvailableFund, getProfileData } from "../controller/appController";

const router = Router();

router.get("/availableFund", getAvailableFund);
router.get("/profile", getProfileData);

export default router;