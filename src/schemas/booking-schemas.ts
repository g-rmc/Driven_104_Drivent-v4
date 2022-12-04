import Joi from "joi";

export const roomIdSchema = Joi.object<{roomId: number}>({
  roomId: Joi.number().min(0).required(),
});

export const bookingIdSchema = Joi.object<{bookingId: number}>({
  bookingId: Joi.number().min(0).required(),
});
