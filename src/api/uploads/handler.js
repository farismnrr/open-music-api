const autoBind = require("auto-bind");

class UploadsHandler {
	constructor(storageService, albumsService, validator) {
		autoBind(this);
		this._storageService = storageService;
		this._albumsService = albumsService;
		this._validator = validator;
	}

	async postUploadImageHandler(request, h) {
		const { cover } = request.payload;
		this._validator.validateImageHeaders(cover.hapi.headers);

		const { id: albumId } = request.params;
		const fileName = await this._storageService.writeFile(cover, cover.hapi, albumId);
		const fileLocation = `${request.server.info.uri}/albums/${albumId}/covers/${fileName}`;
		await this._albumsService.updateAlbumCoverUrl(albumId, fileLocation);

		const response = h.response({
			status: "success",
			message: "Sampul berhasil diunggah", // requirement testing message is using Bahasa Indonesia
			data: {
				fileLocation
			}
		});
		return response.code(201);
	}
}

module.exports = UploadsHandler;
