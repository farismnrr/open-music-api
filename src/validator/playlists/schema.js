const Joi = require("joi");

const PlaylistPayloadSchema = Joi.object({
	name: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(100)
		.regex(/^[a-zA-Z0-9\s\-]+$/)
});

const PlaylistSongPayloadSchema = Joi.object({
	songId: Joi.string()
		.required()
		.regex(/^[a-zA-Z0-9_-]+$/)
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema };
