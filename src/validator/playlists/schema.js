const Joi = require("joi");

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-]+$/),
});

module.exports = { PlaylistPayloadSchema };
