import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import roomRepository from "@/repositories/rooms-repository";
import { notFoundError, unauthorizedError } from "@/errors";

async function findUserBooking(userId: number) {
  const booking = await bookingRepository.findBookingWithUserId(userId);

  if (!booking) throw notFoundError();
  return booking;
}

async function createUserBookingWithRoomId(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw unauthorizedError();
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === "RESERVED") throw unauthorizedError();

  const booking = await bookingRepository.findBookingWithUserId(userId);
  if (booking) throw unauthorizedError();

  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const roomOccupancy = await bookingRepository.countBookingsByRoomId(roomId);
  if (roomOccupancy === room.capacity) throw unauthorizedError();

  return await bookingRepository.createNewBooking(userId, roomId);
}

async function updateUserBookingWithRoomId(userId: number, roomId: number, bookingId: number) {
  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking) throw notFoundError();
  if (booking.userId !== userId) throw unauthorizedError();

  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const roomOccupancy = await bookingRepository.countBookingsByRoomId(roomId);
  if (roomOccupancy === room.capacity) throw unauthorizedError();

  return await bookingRepository.updateExistingBooking(bookingId, roomId);
}

const bookingService = {
  findUserBooking,
  createUserBookingWithRoomId,
  updateUserBookingWithRoomId
};

export default bookingService;
