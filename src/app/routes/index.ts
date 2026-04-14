import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

const router = Router();

router.use("/users", UserRoutes);

export const IndexRoutes = router;
