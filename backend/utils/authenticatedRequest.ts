import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type Blog from "../models/blog.model.ts";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  blog?: Blog;
}

export type { AuthenticatedRequest };
