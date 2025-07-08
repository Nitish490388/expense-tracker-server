import {Router} from "express";
import { 
    getDataController,
    createMatchdaySessionController,
    getSessionDataById,
    getSessions
 } from "../controller/matchdayController";

const router = Router();

router.get("/getdata", getDataController);
router.post("/createMatchdaySession", createMatchdaySessionController);
router.get("/getSessionDataById/:id", getSessionDataById);
router.get("/getAllSessions", getSessions);

export default router;
