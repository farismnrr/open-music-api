const autoBind = require("auto-bind");

class SongsHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
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

		const response = h.response({
			status: "success",
			data: {
				songId
			}
		});
		return response.code(201);
	}

	async getSongsHandler(request, h) {
		const { title, performer } = request.query;
		const songs = await this._service.getSongs({ title, performer });
		
		const response = h.response({
			status: "success",
			data: {
				songs
			}
		});
		return response.code(200);
	}

	async getSongByIdHandler(request, h) {
		const { id } = request.params;
		const song = await this._service.getSongById(id);

		const response = h.response({
			status: "success",
			data: {
				song
			}
		});
		return response.code(200);
	}

	async putSongByIdHandler(request, h) {
		this._validator.validateSongPayload(request.payload);

		const { id } = request.params;
		const { title, year, genre, performer, duration, albumId } = request.payload;
		await this._service.editSongById(id, {
			title,
			year,
			genre,
			performer,
			duration,
			albumId
		});

		const response = h.response({
			status: "success",
			message: "Lagu berhasil diperbarui"
		});
		return response.code(200);
	}

	async deleteSongByIdHandler(request, h) {
		const { id } = request.params;
		await this._service.deleteSongById(id);

		const response = h.response({
			status: "success",
			message: "Lagu berhasil dihapus"
		});
		return response.code(200);
	}
}

module.exports = SongsHandler;
