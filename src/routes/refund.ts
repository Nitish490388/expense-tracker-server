import express from "express";
import { markRefundAsPaid, getPendingRefunds }
from "../controller/refundController"

const router = express.Router();

router.patch("/mark-approved", markRefundAsPaid);
router.get("/pendings", getPendingRefunds);


export default router;