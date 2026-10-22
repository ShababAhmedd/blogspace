import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("only jpg, png, webp or gif images are allowed"));
    }
    cb(null, true);
  },
}).single("image");

export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "image must be smaller than 2MB"
          : error.message;
      return res.status(400).json({ message });
    }
    if (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
    return next();
  });
};
