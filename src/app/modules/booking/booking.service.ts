/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getTransactionId } from "../../utils/getTransactionId";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please Update Your Profile to Book a Tour.",
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!);

    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session },
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount: amount,
        },
      ],
      { session },
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session },
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount: amount,
      transactionId: transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    console.log(sslPayment);

    await session.commitTransaction(); //transaction
    session.endSession();
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error)
    throw error;
  }
};

const getAllBookings = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate("user", "name email phone")
      .populate("tour", "title costFrom")
      .populate("payment")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// ─── Get Logged-in User's Bookings ────────────────────────────────────────────

const getUserBookings = async (userId: string) => {
  const bookings = await Booking.find({ user: userId })
    .populate("tour", "title costFrom images")
    .populate("payment")
    .sort({ createdAt: -1 });

  return bookings;
};

// ─── Get Single Booking ───────────────────────────────────────────────────────

const getBookingById = async (
  bookingId: string,
  userId: string,
  role: string,
) => {
  const booking = await Booking.findById(bookingId)
    .populate("user", "name email phone address")
    .populate("tour", "title costFrom")
    .populate("payment");

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found.");
  }

  // Regular users can only view their own bookings
  const isOwner = (booking.user as any)._id.toString() === userId;
  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this booking.",
    );
  }

  return booking;
};

// ─── Update Booking Status ────────────────────────────────────────────────────

const updateBookingStatus = async (
  bookingId: string,
  status: BOOKING_STATUS,
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found.");
  }

  // Prevent invalid status transitions
  if (booking.status === BOOKING_STATUS.COMPLETE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot change status of a completed booking.",
    );
  }

  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true, runValidators: true },
  )
    .populate("user", "name email phone")
    .populate("tour", "title costFrom")
    .populate("payment");

  return updated;
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
