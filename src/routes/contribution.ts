import express from "express";
import { getPendingContribution, markContributionAsPaid } from "../controller/contributionController";

const router = express.Router();

router.patch("/mark-paid", markContributionAsPaid);
router.get("/pendings", getPendingContribution);


export default router;