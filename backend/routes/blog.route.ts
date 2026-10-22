import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  searchFilterBlogs,
  updateBlog,
} from "../controllers/blog.controller.ts";
import { authMiddleWare } from "../middlewares/auth.middleware.ts";
import { canModifyBlog } from "../middlewares/blog.middleware.ts";

const router = Router();
router.post("/api/blogs/create", authMiddleWare, createBlog);
router.put("/api/blogs/update/:id", authMiddleWare, canModifyBlog, updateBlog);
router.delete(
  "/api/blogs/delete/:id",
  authMiddleWare,
  canModifyBlog,
  deleteBlog,
);
// router.get("/api/blogs", getAllBlogs);
router.get("/api/blogs/:id", getBlogById);
router.get("/api/blogs", searchFilterBlogs);

export default router;
