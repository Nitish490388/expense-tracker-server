import { Request, Response } from "express";
import { galleryPostSchema } from "../validators/galleryValidator";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ZodError } from "zod";
import { PrismaClient } from "@prisma/client";
import { success,error } from "../utils/responseWrapper";

const prisma = new PrismaClient();

export const createGalleryPost = async (req: Request, res: Response) => {
  try {
    const { title, description } = galleryPostSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.send(error(400, "At least one media file is required."));
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const result = await uploadToCloudinary(file);
      return {
        url: result.secure_url,
        type: result.resource_type.toUpperCase(), // "IMAGE" or "VIDEO"
        thumbnail: result.resource_type === "video" ? result.thumbnail_url || null : null,
      };
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    console.log("media upload succes");
    

    const post = await prisma.galleryPost.create({
      data: {
        title,
        description,
        media: {
          create: uploadedMedia.map((m) => ({
            url: m.url,
            type: m.type,
            thumbnail: m.thumbnail,
          })),
        },
      },
      include: {
        media: true,
      },
    });

    res.send(success(201, {post}));
  } catch (err) {

    console.log(err);
    
    if (err instanceof ZodError) {
      res.send(error(400, "Invalid input"));
    }
    res.send(error(500, "Gallery post error"));
    return;
  }
};


export const getGalleryPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.galleryPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { media: true },
    });

    res.send(success(200, {posts}));
    return;
  } catch (err) {
    console.error("Failed to fetch gallery:", err);
    res.send(error(500, "Server error"));
    return;
  }
};