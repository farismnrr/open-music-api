const autoBind = require("auto-bind");

class UsersHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

	async postUserHandler(request, h) {
		this._validator.validateUserPayload(request.payload);

		const { username, password, fullname } = request.payload;
		const userId = await this._service.addUser({ username, password, fullname });

		const response = h.response({
			status: "success",
			data: {
				userId
			}
		});
		return response.code(201);
	}
}

module.exports = UsersHandler;
