/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const user = await UserService.createUser(payload);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await UserService.loginUser(payload);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const users = await UserService.getAllUsers(query as Record<string, string>);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserService.getMe(decodedToken.userId);
    sendResponse(res, {
      success: true,
      statusCode: status.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  },
);

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const users = await UserService.getSingleUser(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: users,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const decodedToken = req.user;

  if (!decodedToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const users = await UserService.updateUser(
    id as string,
    payload,
    decodedToken,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User updated successfully",
    data: users,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user;

  if (!decodedToken) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const users = await UserService.softDeleteUser(id as string, decodedToken);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User deleted successfully",
    data: users,
  });
});

export const UserController = {
  createUser,
  loginUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
  softDeleteUser,
};
