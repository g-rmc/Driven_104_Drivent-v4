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
  createBooking
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
      const token = await generateValidToken();

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
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user doesnt includes hotel", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user ticket isnt paid", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    describe("when ticket is valid and paid", () => {
      it("should respond with status 403 if roomId is missing", async () => {
        expect(500).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 for invalid roomId", async () => {
        expect(500).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 404 if room doesnt exist", async () => {
        expect(500).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if room capacity is full", async () => {
        expect(500).toBe(httpStatus.FORBIDDEN);
      });
      
      it("should respond with status 200 and bookingId", async () => {
        expect(500).toBe(httpStatus.FORBIDDEN);
      });
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 403 if user doesnt have a booking", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if roomId is missing", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 for invalid roomId", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if room doesnt exist", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if room capacity is full", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and bookingId", async () => {
      expect(500).toBe(httpStatus.FORBIDDEN);
    });
  });
});
