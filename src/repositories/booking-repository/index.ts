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

const bookingRepository = {
  findBookingWithUserId,
};

export default bookingRepository;
