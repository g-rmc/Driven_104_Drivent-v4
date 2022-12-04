import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import {  } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoomWithHotelId,
  createUser,
  createBooking,
  createTicketTypeRemote,
  createTicket,
  createTicketTypeWithoutHotel,
  createTicketTypeWithHotel
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user doesnt have a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking(room.id, user.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        ...booking,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        Room: {
          ...room,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 403 if user doesnt have a enrollment", async () => {
      const token = await generateValidToken();
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user doesnt have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const remoteTicket = await createTicketTypeRemote();
      await createTicket(enrollment.id, remoteTicket.id, "RESERVED");
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user ticket doesnt includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const noHotelTicket = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, noHotelTicket.id, "RESERVED");
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user ticket isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const hotelTicket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, hotelTicket.id, "RESERVED");
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe("when ticket is valid and paid", () => {
      it("should respond with status 403 if user already have a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBooking(room.id, user.id);
        
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if roomId is missing", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
    
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 for invalid roomId", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
    
        const body = { roomId: -1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 404 if room doesnt exist", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
    
        const body = { roomId: room.id+1 };
        
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 403 if room capacity is full", async () => {
        const user = await createUser();
        const roomate = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        for(let i = 0; i < room.capacity; i++) {
          await createBooking(room.id, roomate.id);
        }
    
        const body = { roomId: room.id };
        
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
      
      it("should respond with status 200 and bookingId", async () => {
        const user = await createUser();
        const roomate = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBooking(room.id, roomate.id);
    
        const body = { roomId: room.id };
        
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
        const booking = await prisma.booking.findFirst({
          where: {
            userId: user.id
          }
        });

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({ bookingId: booking.id });
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 403 for invalid bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const hotelTicket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, hotelTicket.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(room.id, user.id);
      
      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 for bookingId doesnt exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const hotelTicket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, hotelTicket.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(room.id, user.id);
      
      const response = await server.put(`/booking/${booking.id+1}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if user doesnt own bookingId", async () => {
      const user = await createUser();
      const roomate = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const hotelTicket = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, hotelTicket.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(room.id, user.id);
      const roomateBooking = await createBooking(room.id, roomate.id);
      
      const response = await server.put(`/booking/${roomateBooking.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe("when bookingId is valid", () => {
      it("should respond with status 403 if roomId is missing", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
  
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(room.id, user.id);
        
        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 for invalid roomId", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
  
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(room.id, user.id);
  
        const body = { roomId: 0 };
        
        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 404 if room doesnt exist", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
  
        const hotel = await createHotel();
        const room1 = await createRoomWithHotelId(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(room1.id, user.id);
  
        const body = { roomId: room2.id+1 };
        
        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 if room capacity is full", async () => {
        const user = await createUser();
        const roomate = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
  
        const hotel = await createHotel();
        const room1 = await createRoomWithHotelId(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(room1.id, user.id);
        for(let i = 0; i < room2.capacity; i++) {
          await createBooking(room2.id, roomate.id);
        }
  
        const body = { roomId: room2.id };
        
        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 200 and bookingId", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotelTicket = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, hotelTicket.id, "PAID");
  
        const hotel = await createHotel();
        const room1 = await createRoomWithHotelId(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);
        const originalBooking = await createBooking(room1.id, user.id);
    
        const body = { roomId: room2.id };
        
        const response = await server.put(`/booking/${originalBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      
        const updatedBooking = await prisma.booking.findFirst({
          where: {
            id: originalBooking.id
          }
        });
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({ bookingId: updatedBooking.id });
        expect(updatedBooking.roomId).toBe(room2.id);
      });
    });
  });
});
