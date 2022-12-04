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
  
  try {
    return res.status(httpStatus.OK).send(0);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
}

export async function putUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  try {
    return res.status(httpStatus.OK).send(0);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
}
