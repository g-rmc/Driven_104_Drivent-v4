import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";

async function findUserBooking(userId: number) {
  const booking = await bookingRepository.findBookingWithUserId(userId);

  if (!booking) throw notFoundError();
  return booking;
}

const bookingService = {
  findUserBooking
};

export default bookingService;
