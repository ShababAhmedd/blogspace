import { Router } from "express";
import {
  getUserById,
  getUsers,
  ownProfile,
  updatePassword,
  updateProfile,
  uploadProfileImage,
  userStatus,
} from "../controllers/users.controller.ts";
import { authMiddleWare, isAdmin } from "../middlewares/auth.middleware.ts";
import { uploadImage } from "../middlewares/upload.middleware.ts";

const router = Router();
router.get("/api/users/profile", authMiddleWare, ownProfile);
router.get("/api/users", authMiddleWare, isAdmin, getUsers);
router.get("/api/users/:id", authMiddleWare, isAdmin, getUserById);
router.patch("/api/users/:id/status", authMiddleWare, isAdmin, userStatus);
router.put("/api/users/profile/update", authMiddleWare, updateProfile);
router.patch("/api/users/password", authMiddleWare, updatePassword);
router.patch(
  "/api/users/profile/image",
  authMiddleWare,
  uploadImage,
  uploadProfileImage,
);

export default router;
