import {Router} from "express";
import { 
    check,
    getAllPlayers,
} from "../controller/playerController";
import { 
    signinController,
    signupController,
    logoutController
} from "../controller/playerController";

const router = Router();

router.get("/", check);
router.post("/signin", signinController);
router.post("/signup", signupController);
router.post("/logout", logoutController);
router.get("/getAllPlayers", getAllPlayers);

export default router;