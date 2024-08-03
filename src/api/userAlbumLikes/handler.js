const autoBind = require("auto-bind");

class UserAlbumLikesHandler {
	constructor(service) {
		autoBind(this);
		this._service = service;
	}

	async postUserAlbumLikesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: albumId } = request.params;

		await this._service.addLike(albumId, credentialId);

		const response = h.response({
			status: "success",
			message: "Like is successfully added on album."
		});
		response.code(201);
		return response;
	}

	async getUserAlbumLikesHandler(request, h) {
		const { id: albumId } = request.params;
		const result = await this._service.getTotalLikes(albumId);

		const response = h.response({
			status: "success",
			data: {
				likes: result.data
			}
		});

		if (result.source === "cache") {
			response.header("X-Data-Source", "cache");
		}

		response.code(200);
		return response;
	}

	async deleteUserAlbumLikesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: albumId } = request.params;

		await this._service.deleteLike(credentialId, albumId);

		const response = h.response({
			status: "success",
			message: "Like is successfully deleted on album."
		});
		response.code(200);
		return response;
	}
}

module.exports = UserAlbumLikesHandler;
