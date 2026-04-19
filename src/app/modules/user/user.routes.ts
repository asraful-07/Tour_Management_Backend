import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser,
);
router.post("/login", UserController.loginUser);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers,
);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.getSingleUser,
);
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updateUser,
);
router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  UserController.softDeleteUser,
);

export const UserRoutes = router;
