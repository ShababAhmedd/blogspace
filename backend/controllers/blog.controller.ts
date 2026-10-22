import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../utils/authenticatedRequest.ts";
import getErrorMessage from "../utils/getErrorMessage.ts";
import Blog from "../models/blog.model.ts";
import User from "../models/user.model.ts";
import { Op } from "sequelize";

const authorInclude = {
  model: User,
  as: "author",
  attributes: ["id", "firstName", "lastName", "profileImage"],
};

export const createBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogTitle, blog, category } = req.body;
    if (!blogTitle || !blog || !category) {
      return res.status(400).json({
        message: "all fields must be filled.",
      });
    }

    const userId =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;

    const newBlog = await Blog.create({
      userId: userId,
      blogTitle,
      blog,
      category,
    });

    res.status(201).json({
      message: "blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const updateBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { blogTitle, blog, category } = req.body;

    if (!blogTitle && !blog && !category) {
      return res.status(400).json({
        message: "invalid input",
      });
    }

    if (!blogTitle) blogTitle = req.blog!.blogTitle;
    if (!blog) blog = req.blog!.blog;
    if (!category) category = req.blog!.category;

    req.blog!.blogTitle = blogTitle;
    req.blog!.blog = blog;
    req.blog!.category = category;
    await req.blog!.save();

    res.status(200).json({
      message: "blog updated successfully",
      data: req.blog,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const deleteBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blogID = req.params.id;
    const deleted = await Blog.destroy({ where: { id: blogID } });

    if (!deleted) {
      return res.status(404).json({
        message: "blog not found",
      });
    }

    res.status(200).json({
      message: "blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.findAll({
      attributes: { exclude: ["userId"] },
      include: authorInclude,
    });
    res.status(200).json({
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blogID = req.params.id;

    if (!/^\d+$/.test(blogID!)) {
      return res.status(400).json({
        message: "invalid blog id",
      });
    }

    const findBlog = await Blog.findByPk(blogID, {
      attributes: { exclude: ["userId"] },
      include: authorInclude,
    });

    if (!findBlog) {
      return res.status(404).json({
        message: "blog not found",
      });
    }

    res.status(200).json({
      message: "blog found",
      data: findBlog,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const searchFilterBlogs = async (req: Request, res: Response) => {
  try {
    const { title, category } = req.query;

    const where: Record<string, unknown> = {};

    if (title) {
      where.blogTitle = { [Op.like]: `%${title}%` };
    }

    if (category) {
      where.category = category;
    }

    const blogs = await Blog.findAll({
      where,
      attributes: { exclude: ["userId"] },
      include: authorInclude,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};
