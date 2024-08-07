const Joi = require("joi");

const UserPayloadSchema = Joi.object({
	username: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(20)
		.regex(/^[a-zA-Z0-9_]+$/),
	password: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(128)
		.regex(/^[a-zA-Z0-9_!@#$%^&*()]+$/),
	fullname: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(100)
		.regex(/^[a-zA-Z\s]+$/)
});

module.exports = { UserPayloadSchema };
