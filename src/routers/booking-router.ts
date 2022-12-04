import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getUserBooking, postUserBooking, putUserBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", postUserBooking)
  .put("/:bookingId", putUserBooking);

export { bookingRouter };
