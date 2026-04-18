import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { DivisionRoutes } from "../modules/division/division.routes";
import { TourRoutes } from "../modules/tour/tour.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";

const router = Router();

router.use("/user", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/division", DivisionRoutes);
router.use("/tour", TourRoutes);
router.use("/booking", BookingRoutes);
router.use("/payment", PaymentRoutes);

export const IndexRoutes = router;
