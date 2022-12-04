import { prisma } from "@/config";

async function findBookingWithUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true
    }
  });
}

async function findBookingById(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
    include: {
      Room: true
    }
  });
}

async function countBookingsByRoomId(roomId: number) {
  return prisma.booking.count({
    where: {
      roomId
    }
  });
}

async function createNewBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId
    }
  });
}

async function updateExistingBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId,
    }
  });
}

const bookingRepository = {
  findBookingWithUserId,
  findBookingById,
  countBookingsByRoomId,
  createNewBooking,
  updateExistingBooking
};

export default bookingRepository;
