import bcrypt from "bcryptjs";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { generateToken } from "../../utils/jwt";
import { IRequestUser } from "../../interface/requestUser.interface";

const createUser = async (payload: Partial<IUser>) => {
  const { name, email, password, ...rest } = payload;

  const existUser = await User.findOne({ email });

  if (existUser) {
    throw new AppError(status.BAD_REQUEST, "User Already Exist");
  }

  const hashPassword = await bcrypt.hash(
    password as string,
    Number(process.env.BCRYPT_SALT_ROUND),
  );

  const authProvider: IAuthProvider = {
    provider: "Credential",
    providerId: email as string,
  };

  const user = await User.create({
    name,
    email,
    password: hashPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const loginUser = async (payload: IUser) => {
  const { email, password } = payload;

  const existUser = await User.findOne({ email });

  if (!existUser) {
    throw new AppError(status.BAD_REQUEST, "User Not Found");
  }
  const isPasswordValid = await bcrypt.compare(
    password as string,
    existUser.password as string,
  );

  if (!isPasswordValid) {
    throw new AppError(status.BAD_REQUEST, "Invalid Password");
  }

  const jwtPayload = {
    id: existUser._id,
    name: existUser.name,
    email: existUser.email,
    role: existUser.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES as string,
  );

  return { user: existUser, accessToken };
};

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getSingleUser = async (id: string, user: IRequestUser) => {
  if (
    id !== user.userId &&
    !user.role.includes("SUPER_ADMIN") &&
    !user.role.includes("ADMIN")
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to access this user",
    );
  }

  const result = await User.findById(id);

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
  return result;
};

const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  user: IRequestUser,
) => {
  if (
    id !== user.userId &&
    !user.role.includes("SUPER_ADMIN") &&
    !user.role.includes("ADMIN")
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this user",
    );
  }

  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
  return result;
};

const softDeleteUser = async (id: string, user: IRequestUser) => {
  if (!user.role.includes("SUPER_ADMIN")) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to delete this user",
    );
  }

  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }

  return result;
};

export const UserService = {
  createUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  softDeleteUser,
};
