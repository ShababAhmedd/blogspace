import type { AuthenticatedRequest } from "../utils/authenticatedRequest.ts";
import type { Request, Response, NextFunction } from "express";
import getErrorMessage from "../utils/getErrorMessage.ts";
import Blog from "../models/blog.model.ts";

export const canModifyBlog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const blogID = req.params.id;

    if (!blogID || !/^\d+$/.test(blogID)) {
      return res.status(400).json({
        message: "invalid blog id",
      });
    }

    const findBlog = await Blog.findByPk(blogID);
    if (!findBlog) {
      return res.status(404).json({
        message: "blog not found",
      });
    }

    const userID =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;
    const userRole =
      typeof req.user === "object" && req.user != null
        ? req.user.role
        : undefined;

    const isOwner = findBlog.userId === userID;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "you are not authorized to modify this blog",
      });
    }

    req.blog = findBlog;

    return next();
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};
