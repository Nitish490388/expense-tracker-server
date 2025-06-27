import {Router} from "express";
import { addExpence } from "../controller/expenseController";

const router = Router();

router.post("/add", addExpence);

export default router;