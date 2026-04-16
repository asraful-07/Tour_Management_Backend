/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/envVars";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userToken";
import { User } from "../user/user.model";
import status from "http-status";

//? custom authentication with email and password
// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(status.BAD_REQUEST, "Email does not exist");
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string,
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(status.BAD_REQUEST, "Incorrect Password");
//   }

//   const userTokens = createUserTokens(isUserExist);

//   const { password: pass, ...rest } = isUserExist.toObject();

//   return {
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string,
  );
  if (!isOldPasswordMatch) {
    throw new AppError(status.UNAUTHORIZED, "Old Password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user!.save();
};

//user - login - token (email, role, _id) - booking / payment / booking / payment cancel - token

export const AuthServices = {
  getNewAccessToken,
  resetPassword,
};
