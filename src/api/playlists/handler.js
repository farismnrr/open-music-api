class PlaylistsHandler {
	constructor(playlistsService, validator) {
		this._playlistsService = playlistsService;
		this._validator = validator;
	}

	// Playlist Handler
	async postPlaylistHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);
		const { name } = request.payload;
		const { id: credentialId } = request.auth.credentials;

		const playlistId = await this._playlistsService.addPlaylist({
			name,
			owner: credentialId
		});

		const response = h.response({
			status: "success",
			data: {
				playlistId
			}
		});
		response.code(201);
		return response;
	}

	async getPlaylistsHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const playlists = await this._playlistsService.getPlaylists(credentialId);

		const response = h.response({
			status: "success",
			data: { playlists }
		});
		response.code(200);
		return response;
	}

	async deletePlaylistByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._playlistsService.verifyPlaylistOwner(id, credentialId);
		await this._playlistsService.deletePlaylistById(id);

		const response = h.response({
			status: "success",
			message: "Playlist deleted successfully"
		});
		response.code(200);
		return response;
	}
	// End Playlist Handler

	// Playlist Song Activities Handler
	async getPlaylistSongActivitiesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongActivities =
			await this._playlistsService.getPlaylistSongActivities(playlistId);

		const response = h.response({
			status: "success",
			data: playlistSongActivities
		});
		response.code(200);
		return response;
	}
	// End Playlist Song Activities Handler

	// Playlist Song Handler
	async postPlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);
		const { id: credentialId } = request.auth.credentials;
		const { songId } = request.payload;
		const { id: playlistId } = request.params;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongId = await this._playlistsService.addPlaylistSong(playlistId, songId);
		await this._playlistsService.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"add"
		);

		const response = h.response({
			status: "success",
			message: "Playlist song berhasil ditambahkan",
			data: {
				playlistSongId
			}
		});
		response.code(201);
		return response;
	}

	async getPlaylistSongByIdHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlist = await this._playlistsService.getPlaylistSongById(playlistId);

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

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		await this._playlistsService.deletePlaylistSong(playlistId, songId);
		await this._playlistsService.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"delete"
		);

		const response = h.response({
			status: "success",
			message: "Playlist Song berhasil dihapus"
		});
		response.code(200);
		return response;
	}
	// End Playlist Song Handler
}

module.exports = PlaylistsHandler;
