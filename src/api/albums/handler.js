class AlbumsHandler {
	constructor(albumsService, validator) {
		this._albumsService = albumsService;
		this._validator = validator;

		this.postAlbumHandler = this.postAlbumHandler.bind(this);
		this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
		this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
		this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
	}

	async postAlbumHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { name, year } = request.payload;

		const albumId = await this._albumsService.addAlbum({ name, year });

		return h
			.response({
				status: "success",
				message: "Album berhasil ditambahkan",
				data: {
					albumId
				}
			})
			.code(201);
	}

	async getAlbumByIdHandler(request, h) {
		const { id } = request.params;
		const album = await this._albumsService.getAlbumById(id);

		return h
			.response({
				status: "success",
				data: {
					album
				}
			})
			.code(200);
	}

	async putAlbumByIdHandler(request, h) {
		this._validator.validateAlbumPayload(request.payload);
		const { id } = request.params;

		await this._albumsService.editAlbumById(id, request.payload);

		return h
			.response({
				status: "success",
				message: "Album berhasil diperbarui"
			})
			.code(200);
	}

	async deleteAlbumByIdHandler(request, h) {
		const { id } = request.params;

		await this._albumsService.deleteAlbumById(id);

		return h
			.response({
				status: "success",
				message: "Album berhasil dihapus"
			})
			.code(200);
	}
}

module.exports = AlbumsHandler;
