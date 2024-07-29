const Joi = require("joi");

const PlaylistSchema = Joi.object({
	name: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(100)
		.regex(/^[a-zA-Z0-9\s\-]+$/)
});

const PlaylistSongSchema = Joi.object({
	songId: Joi.string()
		.required()
		.regex(/^[a-zA-Z0-9_-]+$/)
});

module.exports = { PlaylistSchema, PlaylistSongSchema };
