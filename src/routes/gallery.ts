import express from "express";
import { getGalleryPosts } from "../controller/galleryController";

const router = express.Router();

router.get("/", getGalleryPosts);

export default router;
