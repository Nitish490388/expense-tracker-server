import express from "express";
import { upload } from "../../middlewares/upload";
import { createGalleryPost } from "../../controller/galleryController"; 

const router = express.Router();

router.post(
  "/post",
  upload.array("media", 20), 
  createGalleryPost
);

export default router;
