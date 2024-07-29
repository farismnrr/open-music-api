class AuthHandler {
	constructor(validator, authService, userService, tokenManager) {
		this._validator = validator;
		this._authService = authService;
		this._userService = userService;
		this._tokenManager = tokenManager;

		this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
		this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
		this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
	}

	async postAuthenticationHandler(request, h) {
		this._validator.validatePostAuthenticationPayload(request.payload);
		const { username, password } = request.payload;

		const userId = await this._userService.verifyUserCredential(username, password);

		const accessToken = this._tokenManager.createAccessToken(userId);
		const refreshToken = this._tokenManager.createRefreshToken(userId);

		await this._authService.addRefreshToken(refreshToken);

		return h
			.response({
				status: "success",
				message: "Authentication berhasil ditambahkan",
				data: {
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putAuthenticationHandler(request, h) {
		this._validator.validatePutAuthenticationPayload(request.payload);
		const { refreshToken } = request.payload;

		await this._authService.verifyRefreshToken(refreshToken);

		const id = this._tokenManager.verifyRefreshToken(refreshToken);
		const accessToken = this._tokenManager.createAccessToken(id);

		return h
			.response({
				status: "success",
				message: "Access token berhasil diperbarui",
				data: {
					accessToken
				}
			})
			.code(200);
	}

	async deleteAuthenticationHandler(request, h) {
		this._validator.validateDeleteAuthenticationPayload(request.payload);
		const { refreshToken } = request.payload;

		await this._authService.verifyRefreshToken(refreshToken);
		await this._authService.deleteRefreshToken(refreshToken);

		return h
			.response({
				status: "success",
				message: "Refresh token berhasil dihapus"
			})
			.code(200);
	}
}

module.exports = AuthHandler;
