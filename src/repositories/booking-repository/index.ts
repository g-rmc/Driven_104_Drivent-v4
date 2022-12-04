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

const bookingRepository = {
  findBookingWithUserId,
  countBookingsByRoomId,
  createNewBooking
};

export default bookingRepository;
