import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.ts";
import getErrorMessage from "../utils/getErrorMessage.ts";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { Op } from "sequelize";
import sendMail from "../utils/mailer.ts";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({
        message: "one of the mandatory field was skipped",
      });
    }

    if (req.body.role !== undefined) {
      return res.status(400).json({
        message: "you cannot assign role during registration",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "invalid email format",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "password must be at least 4 characters long",
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        message: "email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "user created successfully",
      data: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isActive: newUser.isActive,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ where: { email } });
    if (!findUser) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    if (!findUser.isActive) {
      return res.status(403).json({
        message: "your account has been deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("secret key not configured");
    }

    const token = jwt.sign(
      {
        id: findUser?.id,
        email: findUser?.email,
        role: findUser?.role,
      },
      secretKey,
      { expiresIn: 3600 },
    );
    res.status(200).json({
      message: "login successful",
      data: {
        token,
        user: {
          id: findUser?.id,
          firstName: findUser?.firstName,
          lastName: findUser?.lastName,
          email: findUser?.email,
          role: findUser?.role,
          profileImage: findUser?.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    // same reply whether or not the email exists, so accounts can't be probed
    const reply = {
      message: "if an account exists for this email, a reset link has been sent",
    };

    const findUser = await User.findOne({ where: { email } });
    if (!findUser) {
      return res.status(200).json(reply);
    }

    const token = crypto.randomBytes(32).toString("hex");
    findUser.resetPasswordToken = hashToken(token);
    findUser.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await findUser.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password/${token}`;
    try {
      await sendMail(
        findUser.email,
        "Reset your BlogSpace password",
        `<p>Hi ${findUser.firstName},</p>
         <p>Click the link below to reset your password. It expires in 15 minutes.</p>
         <p><a href="${resetUrl}">${resetUrl}</a></p>
         <p>If you did not request this, you can ignore this email.</p>`,
      );
    } catch (error) {
      // e.g. wrong SMTP settings: the reason goes to the server console, not to the client
      console.error(`[mail] could not send the reset email: ${getErrorMessage(error)}`);
      return res.status(502).json({
        message: "could not send the reset email, please try again later",
      });
    }

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};

export const resetPassword = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({
        message: "password must be at least 4 characters long",
      });
    }

    const findUser = await User.findOne({
      where: {
        resetPasswordToken: hashToken(req.params.token),
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
    if (!findUser) {
      return res.status(400).json({
        message: "reset link is invalid or has expired",
      });
    }

    findUser.password = await bcrypt.hash(password, 10);
    findUser.resetPasswordToken = null;
    findUser.resetPasswordExpires = null;
    await findUser.save();

    res.status(200).json({
      message: "password successfully changed",
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      data: getErrorMessage(error),
    });
  }
};
