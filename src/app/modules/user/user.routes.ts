import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser,
);
router.post("/login", UserController.loginUser);
router.get("/", checkAuth(Role.USER), UserController.getAllUsers);
router.get(
  "/:id",
  checkAuth(Role.USER, Role.SUPER_ADMIN, Role.ADMIN, Role.GUIDE),
  UserController.getSingleUser,
);
router.put(
  "/:id",
  checkAuth(Role.USER, Role.SUPER_ADMIN, Role.ADMIN, Role.GUIDE),
  UserController.updateUser,
);
router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  UserController.softDeleteUser,
);

export const UserRoutes = router;
