import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import httpStatus from "http-status";

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.findUserBooking(Number(userId));
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function postUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);

  try {
    const newBooking = await bookingService.createUserBookingWithRoomId(Number(userId), roomId);
    return res.status(httpStatus.OK).send({ bookingId: newBooking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function putUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);
  const bookingId = Number(req.params.bookingId);
  
  try {
    const booking = await bookingService.updateUserBookingWithRoomId(userId, roomId, bookingId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}
