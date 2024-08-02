class PlaylistSongsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;
	}

	async postPlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);
		const { id: credentialId } = request.auth.credentials;
		const { songId } = request.payload;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		await this._service.addPlaylistSong(playlistId, songId);
		await this._service.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"add"
		);

		const response = h.response({
			status: "success",
			message: "Playlist song added successfully"
		});
		response.code(201);
		return response;
	}

	async getPlaylistSongByIdHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		const playlist = await this._service.getPlaylistSongById(playlistId);

		const response = h.response({
			status: "success",
			data: {
				playlist
			}
		});
		response.code(200);
		return response;
	}

	async deletePlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);
		const { id: credentialId } = request.auth.credentials;
		const { songId } = request.payload;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		await this._service.deletePlaylistSong(playlistId, songId);
		await this._service.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"delete"
		);

		const response = h.response({
			status: "success",
			message: "Playlist Song deleted successfully"
		});
		response.code(200);
		return response;
	}
}

module.exports = PlaylistSongsHandler;
