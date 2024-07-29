const Joi = require("joi");

const AlbumPayloadSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-]+$/),
  year: Joi.number()
    .required()
    .integer()
    .min(1900)
    .max(new Date().getFullYear()),
});

module.exports = { AlbumPayloadSchema };
