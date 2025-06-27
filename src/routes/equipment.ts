import {Router} from "express";
import { getDataController } from "../controller/equipmentContoller";

const router = Router();

router.get("/getdata", getDataController);

export default router;
