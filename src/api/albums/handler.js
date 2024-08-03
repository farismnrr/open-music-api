const autoBind = require("auto-bind");

class AlbumHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

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
		response.code(201);
		return response;
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

		response.code(200);
		return response;
	}

	async putAlbumByIdHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { id } = request.params;

		await this._service.editAlbumById(id, request.payload);

		const response = h.response({
			status: "success",
			message: "Album updated successfully"
		});
		response.code(200);
		return response;
	}

	async deleteAlbumByIdHandler(request, h) {
		const { id } = request.params;
		await this._service.deleteAlbumById(id);

		const response = h.response({
			status: "success",
			message: "Album deleted successfully"
		});
		response.code(200);
		return response;
	}
}

module.exports = AlbumHandler;
