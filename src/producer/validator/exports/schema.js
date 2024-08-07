const Joi = require("joi");

const ExportPlaylistsPayloadSchema = Joi.object({
	targetEmail: Joi.string()
		.email({ tlds: { allow: true }, ignoreLength: true })
		.trim()
		.required()
});

module.exports = { ExportPlaylistsPayloadSchema };
