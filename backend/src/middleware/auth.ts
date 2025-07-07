import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { IUser } from "../types";

interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET! as Secret
    ) as JWTPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const generateToken = (userId: string, email: string): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN as any) || "7d";
  const options: SignOptions = { expiresIn };
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET! as Secret,
    options
  );
};
