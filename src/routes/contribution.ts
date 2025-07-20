import express from "express";
import { markContributionAsPaid } from "../controller/contributionController";

const router = express.Router();

router.patch("/mark-paid", markContributionAsPaid);

export default router;