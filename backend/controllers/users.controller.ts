import type { Request, Response } from "express";
import getErrorMessage from "../utils/getErrorMessage.ts";
import User, { privateUserFields } from "../models/user.model.ts";
import fs from "node:fs/promises";
import path from "node:path";
import type { AuthenticatedRequest } from "../utils/authenticatedRequest.ts";
import bcrypt from "bcrypt";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({ attributes: { exclude: privateUserFields } });
    res.status(200).json({
      message: "users data retrieved",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const userID = req.params.id;

    if (!/^\d+$/.test(userID)) {
      return res.status(400).json({
        message: "invalid user id",
      });
    }

    const findUser = await User.findByPk(userID, {
      attributes: { exclude: privateUserFields },
    });

    if (!findUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    res.status(200).json({
      message: "user found",
      data: findUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const userStatus = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const idParam = req.params.id;

    if (!/^\d+$/.test(idParam)) {
      return res.status(400).json({
        message: "invalid user id",
      });
    }

    const userID = parseInt(req.params.id);
    const status = req.body;

    const { user } = req as AuthenticatedRequest;
    const currentUserID =
      typeof user === "object" && user != null ? user.id : undefined;
    if (userID === currentUserID) {
      return res.status(400).json({
        message: "you cannot change your own status",
      });
    }

    if (status.isActive != true && status.isActive != false) {
      return res.status(400).json({
        message: "invalid status provided",
      });
    }

    const [affectedRows] = await User.update(
      { isActive: status.isActive },
      { where: { id: userID } },
    );
    if (affectedRows === 0) {
      return res.status(404).json({
        message: "no user found with the given id",
      });
    }

    const updated = await User.findByPk(userID);
    res.status(200).json({
      message: "user status updated",
      data: {
        id: updated?.id,
        firstName: updated?.firstName,
        lastName: updated?.lastName,
        email: updated?.email,
        isActive: updated?.isActive,
        role: updated?.role,
        profileImage: updated?.profileImage,
        createdAt: updated?.createdAt,
        updatedAt: updated?.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const ownProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userID =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;

    const findUser = await User.findByPk(userID, {
      attributes: { exclude: privateUserFields },
    });
    if (!findUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      data: findUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    let { firstName, lastName } = req.body;

    if (req.body.role !== undefined || req.body.isActive !== undefined) {
      return res.status(403).json({
        message: "you are not allowed to update role or isActive",
      });
    }

    const userID =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;

    const findUser = await User.findByPk(userID);
    if (!findUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    if (!firstName) {
      firstName = findUser.firstName;
    }

    if (!lastName) {
      lastName = findUser.lastName;
    }

    findUser.firstName = firstName;
    findUser.lastName = lastName;
    await findUser.save();

    res.status(200).json({
      message: "user updated successfully",
      data: {
        id: findUser.id,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        email: findUser.email,
        isActive: findUser.isActive,
        role: findUser.role,
        profileImage: findUser.profileImage,
        createdAt: findUser.createdAt,
        updatedAt: findUser.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "new password is required",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "password must be at least 4 characters long",
      });
    }

    const userID =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;

    const hashedPassword = await bcrypt.hash(password, 10);
    const [affectedRows] = await User.update(
      { password: hashedPassword },
      {
        where: { id: userID },
      },
    );

    if (affectedRows == 0) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    const updated = await User.findByPk(userID, {
      attributes: { exclude: privateUserFields },
    });

    res.status(200).json({
      message: "password updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const uploadProfileImage = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "image file is required",
      });
    }

    const userID =
      typeof req.user === "object" && req.user != null
        ? req.user.id
        : undefined;

    const findUser = await User.findByPk(userID, {
      attributes: { exclude: privateUserFields },
    });
    if (!findUser) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        message: "user not found",
      });
    }

    const oldImage = findUser.profileImage;
    findUser.profileImage = `/uploads/${req.file.filename}`;
    await findUser.save();

    if (oldImage) {
      await fs.unlink(path.join(".", oldImage)).catch(() => {});
    }

    res.status(200).json({
      message: "profile image updated successfully",
      data: findUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};
