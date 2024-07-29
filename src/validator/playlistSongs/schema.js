const Joi = require("joi");

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string()
    .required()
    .regex(/^[a-zA-Z0-9_-]+$/),
});

module.exports = { PlaylistSongPayloadSchema };
