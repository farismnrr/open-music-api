const Joi = require("joi");

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string()
    .required()
    .regex(/^[a-zA-Z0-9_-]+$/),
  userId: Joi.string()
    .required()
    .regex(/^[a-zA-Z0-9_-]+$/),
});

module.exports = { CollaborationPayloadSchema };
