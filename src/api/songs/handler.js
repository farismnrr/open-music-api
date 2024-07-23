class SongsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.postSongHandler = this.postSongHandler.bind(this);
		this.getSongsHandler = this.getSongsHandler.bind(this);
		this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
		this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
		this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
	}

	async postSongHandler(request, h) {
		this._validator.validateSongPayload(request.payload);
		const { title, year, genre, performer, duration, albumId } = request.payload;
		const songId = await this._service.addSong({
			title,
			year,
			genre,
			performer,
			duration,
			albumId
		});

		return h
			.response({
				status: "success",
				message: "Song berhasil ditambahkan",
				data: {
					songId
				}
			})
			.code(201);
	}

	async getSongsHandler(request, h) {
		const { title, performer } = request.query;
		const songs = await this._service.getSongs(title, performer);
		return h
			.response({
				status: "success",
				data: {
					songs
				}
			})
			.code(200);
	}

	async getSongByIdHandler(request, h) {
		const { id } = request.params;
		const song = await this._service.getSongById(id);
		return h
			.response({
				status: "success",
				data: {
					song
				}
			})
			.code(200);
	}

	async putSongByIdHandler(request, h) {
		this._validator.validateSongPayload(request.payload);
		const { id } = request.params;
		await this._service.editSongById(id, request.payload);
		return h
			.response({
				status: "success",
				message: "Song berhasil diubah"
			})
			.code(200);
	}

	async deleteSongByIdHandler(request, h) {
		const { id } = request.params;
		await this._service.deleteSongById(id);
		return h
			.response({
				status: "success",
				message: "Song berhasil dihapus"
			})
			.code(200);
	}
}

module.exports = SongsHandler;
