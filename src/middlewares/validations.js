import { Joi } from "express-validation";

export const signupValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string(),
    mobile: Joi.string()
      .regex(/^\+[1-9]{1}[0-9]{7,11}$/)
      .required(),
  }),
};

export const verifyValidation = {
  body: Joi.object({
    otp: Joi.string()
      .regex(/^[0-9]{4}$/)
      .required(),
    mobile: Joi.string().regex(/^\+[1-9]{1}[0-9]{7,11}$/),
    email: Joi.string().email(),
    login: Joi.boolean().required(),
  }),
};
