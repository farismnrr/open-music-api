const Joi = require("joi");

const PostAuthenticationSchema = Joi.object({
	username: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_]+$/),

	password: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(128)
		.regex(/^[a-zA-Z0-9_!@#$%^&*()]+$/)
});

const PutAuthenticationSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

const DeleteAuthenticationSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

module.exports = {
	PostAuthenticationSchema,
	PutAuthenticationSchema,
	DeleteAuthenticationSchema
};
