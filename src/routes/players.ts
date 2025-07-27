import {Router} from "express";
import { 
    check,
    getAllPlayers,
    getNotApprovedPlayers,
    markPlayerAsApproved,
} from "../controller/playerController";
import { 
    signinController,
    signupController,
    logoutController
} from "../controller/playerController";

const router = Router();

router.post("/signin", signinController);
router.post("/signup", signupController);
router.post("/logout", logoutController);
router.get("/getAllPlayers", getAllPlayers);
router.get("/getNotApprovedAllPlayers", getNotApprovedPlayers);
router.patch("/", markPlayerAsApproved);

export default router;