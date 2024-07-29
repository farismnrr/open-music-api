const Joi = require("joi");

const CollaborationSchema = Joi.object({
	playlistId: Joi.string()
		.required()
		.regex(/^[a-zA-Z0-9_-]+$/),
	userId: Joi.string()
		.required()
		.regex(/^[a-zA-Z0-9_-]+$/)
});

module.exports = { CollaborationSchema };
