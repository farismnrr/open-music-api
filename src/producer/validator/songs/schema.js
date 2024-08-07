const Joi = require("joi");
const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
	title: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(100)
		.regex(/^[a-zA-Z0-9\s\-]+$/),
	year: Joi.number().integer().min(1900).max(currentYear).required(),
	performer: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(100)
		.regex(/^[a-zA-Z0-9\s]+$/),
	genre: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9\s]+$/),
	duration: Joi.number().integer().min(0).max(3600),
	albumId: Joi.string().regex(/^[a-zA-Z0-9_-]+$/)
});

module.exports = { SongPayloadSchema };
