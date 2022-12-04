import { Router } from "express";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { getUserBooking, postUserBooking, putUserBooking } from "@/controllers";
import { bookingIdSchema, roomIdSchema } from "@/schemas/booking-schemas";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", validateBody(roomIdSchema), postUserBooking)
  .put("/:bookingId", validateParams(bookingIdSchema), validateBody(roomIdSchema), putUserBooking);

export { bookingRouter };
