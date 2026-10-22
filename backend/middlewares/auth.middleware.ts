import type { NextFunction, Request, Response } from "express";
import getErrorMessage from "../utils/getErrorMessage.ts";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../utils/authenticatedRequest.ts";
import User from "../models/user.model.ts";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleWare = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "auth token required",
      });
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "auth token required",
      });
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("secret key is not configured");
    }

    const payload = jwt.verify(token, secretKey);

    // a token stays valid for an hour, so re-check the account on each request
    const userID = typeof payload === "object" ? payload.id : undefined;
    const findUser = await User.findByPk(userID);
    if (!findUser) {
      return res.status(401).json({
        message: "user no longer exists",
      });
    }
    if (!findUser.isActive) {
      return res.status(403).json({
        message: "your account has been deactivated",
      });
    }

    req.user = { id: findUser.id, email: findUser.email, role: findUser.role };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "invalid or expired token",
      });
    }
    return res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const role =
    typeof req.user === "object" && req.user != null
      ? req.user.role
      : undefined;

  if (role !== "admin") {
    return res.status(403).json({
      message: "admins only. access denied.",
    });
  }

  return next();
};
