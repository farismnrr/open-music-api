class UserHandler {
	constructor(userService, validator) {
		this._userService = userService;
		this._validator = validator;

		this.postUserHandler = this.postUserHandler.bind(this);
	}

	async postUserHandler(request, h) {
		this._validator.validateUserPayload(request.payload);
		const { username, password, fullname } = request.payload;
		const userId = await this._userService.addUser({ username, password, fullname });
		return h
			.response({
				status: "success",
				message: "User berhasil ditambahkan",
				data: {
					userId
				}
			})
			.code(201);
	}
}

module.exports = UserHandler;
