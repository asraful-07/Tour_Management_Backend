import bcrypt from "bcryptjs";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/envVars";
import { createUserTokens } from "../../utils/userToken";

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

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(status.BAD_REQUEST, "User Not Found");
  }
  const isPasswordValid = await bcrypt.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordValid) {
    throw new AppError(status.BAD_REQUEST, "Invalid Password");
  }

  //? const jwtPayload = {
  //?     userId: isUserExist._id,
  //?     email: isUserExist.email,
  //?      role: isUserExist.role
  //? }
  //? const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
  //? const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

  const userTokens = createUserTokens(isUserExist);

  const { ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
  return result;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(status.FORBIDDEN, "You are not authorized");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(status.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(status.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND as unknown as number,
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const softDeleteUser = async (userId: string, decodedToken: JwtPayload) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }

  if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
    throw new AppError(status.FORBIDDEN, "You are not authorized");
  }

  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  );

  return deletedUser;
};

export const UserService = {
  createUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  softDeleteUser,
};
