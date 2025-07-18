import express from "express";
import { markContributionAsPaid } from "../controller/contributionController";

const router = express.Router();

router.post("/mark-paid", markContributionAsPaid);

export default router;