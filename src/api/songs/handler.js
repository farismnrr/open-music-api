class SongsHandler {
	constructor(songsService, validator) {
		this._songsService = songsService;
		this._validator = validator;

		this.postSongHandler = this.postSongHandler.bind(this);
		this.getSongsHandler = this.getSongsHandler.bind(this);
		this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
		this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
		this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
	}

	async postSongHandler(request, h) {
		this._validator.validateSongPayload(request.payload);
		const { title, year, performer, genre, duration, albumId } = request.payload;

		const songId = await this._songsService.addSong({
			title,
			year,
			performer,
			genre,
			duration,
			albumId
		});

		return h
			.response({
				status: "success",
				message: "Lagu berhasil ditambahkan",
				data: {
					songId
				}
			})
			.code(201);
	}

	async getSongsHandler(request, h) {
		const { title, performer } = request.query;

		const songs = await this._songsService.getSongs({ title, performer });

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

		const song = await this._songsService.getSongById(id);

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
		const { title, year, performer, genre, duration, albumId } = request.payload;

		await this._songsService.editSongById(id, {
			title,
			year,
			performer,
			genre,
			duration,
			albumId
		});

		return h
			.response({
				status: "success",
				message: "Lagu berhasil diperbarui"
			})
			.code(200);
	}

	async deleteSongByIdHandler(request, h) {
		const { id } = request.params;

		await this._songsService.deleteSongById(id);

		return h
			.response({
				status: "success",
				message: "Lagu berhasil dihapus"
			})
			.code(200);
	}
}

module.exports = SongsHandler;
