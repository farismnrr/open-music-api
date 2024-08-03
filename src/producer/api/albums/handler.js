const autoBind = require("auto-bind");

class AlbumHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

	// Album Service
	async postAlbumHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);

		const { name, year } = request.payload;
		const albumId = await this._service.addAlbum({ name, year });

		const response = h.response({
			status: "success",
			data: {
				albumId
			}
		});
		return response.code(201);
	}

	async getAlbumByIdHandler(request, h) {
		const { id } = request.params;
		const album = await this._service.getAlbumById(id);
		const response = h.response({
			status: "success",
			data: {
				album
			}
		});
		return response.code(200);
	}

	async putAlbumByIdHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { id } = request.params;

		await this._service.editAlbumById(id, request.payload);

		const response = h.response({
			status: "success",
			message: "Album updated successfully"
		});
		return response.code(200);
	}

	async deleteAlbumByIdHandler(request, h) {
		const { id } = request.params;
		await this._service.deleteAlbumById(id);

		const response = h.response({
			status: "success",
			message: "Album deleted successfully"
		});
		return response.code(200);
	}
	// End Album Service

	// User Album Likes Service
	async postUserAlbumLikesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: albumId } = request.params;

		await this._service.addLike(albumId, credentialId);

		const response = h.response({
			status: "success",
			message: "Like is successfully added on album."
		});
		return response.code(201);
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

		return response.code(200);
	}

	async deleteUserAlbumLikesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: albumId } = request.params;

		await this._service.deleteLike(credentialId, albumId);

		const response = h.response({
			status: "success",
			message: "Like is successfully deleted on album."
		});
		return response.code(200);
	}
	// End User Album Likes Service
}

module.exports = AlbumHandler;
