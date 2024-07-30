class PlaylistsHandler {
	constructor(playlistsService, validator) {
		this._playlistsService = playlistsService;
		this._validator = validator;

		// Playlist Binding
		this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
		this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
		this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

		// Playlist Song Binding
		this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
		this.getPlaylistSongByIdHandler = this.getPlaylistSongByIdHandler.bind(this);
		this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);

		// Playlist Song Activities Binding
		this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
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

		return h
			.response({
				status: "success",
				data: {
					playlistId
				}
			})
			.code(201);
	}

	async getPlaylistsHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const playlists = await this._playlistsService.getPlaylists(credentialId);

		return h
			.response({
				status: "success",
				data: { playlists }
			})
			.code(200);
	}

	async deletePlaylistByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._playlistsService.verifyPlaylistOwner(id, credentialId);
		await this._playlistsService.deletePlaylistById(id);

		return h
			.response({
				status: "success",
				message: "Playlist berhasil dihapus"
			})
			.code(200);
	}
	// End Playlist Handler

	// Playlist Song Handler
	async postPlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;
		const { songId } = request.payload;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongId = await this._playlistsService.addPlaylistSong(playlistId, songId);
		await this._playlistsService.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"add"
		);

		return h
			.response({
				status: "success",
				message: "Playlist lagu berhasil ditambahkan",
				data: {
					playlistSongId
				}
			})
			.code(201);
	}

	async getPlaylistSongByIdHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlist = await this._playlistsService.getPlaylistSongById(playlistId);

		return h
			.response({
				status: "success",
				data: {
					playlist
				}
			})
			.code(200);
	}

	async deletePlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;
		const { songId } = request.payload;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		await this._playlistsService.deletePlaylistSong(playlistId, songId);
		await this._playlistsService.addPlaylistSongActivity(
			playlistId,
			songId,
			credentialId,
			"delete"
		);

		return h
			.response({
				status: "success",
				message: "Playlist lagu berhasil dihapus"
			})
			.code(200);
	}
	// End Playlist Song Handler

	// Playlist Song Activities Handler
	async getPlaylistSongActivitiesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongActivities =
			await this._playlistsService.getPlaylistSongActivities(playlistId);

		return h
			.response({
				status: "success",
				data: playlistSongActivities
			})
			.code(200);
	}
	// End Playlist Song Activities Handler
}

module.exports = PlaylistsHandler;
