const autoBind = require("auto-bind");

class PlaylistsHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

	// Playlist Service
	async postPlaylistHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);

		const { name } = request.payload;
		const { id: credentialId } = request.auth.credentials;
		const playlistId = await this._service.addPlaylist({
			name,
			owner: credentialId
		});

		const response = h.response({
			status: "success",
			data: {
				playlistId
			}
		});
		return response.code(201);
	}

	async getPlaylistsHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const playlists = await this._service.getPlaylists(credentialId);

		const response = h.response({
			status: "success",
			data: { playlists }
		});
		return response.code(200);
	}

	async deletePlaylistByIdHandler(request, h) {
		const { id } = request.params;
		const { id: credentialId } = request.auth.credentials;

		await this._service.verifyPlaylistOwner(id, credentialId);
		await this._service.deletePlaylistById(id);

		const response = h.response({
			status: "success",
			message: "Playlist deleted successfully"
		});
		return response.code(200);
	}
	// End Playlist Service

	// Playlist Song Service
	async postPlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { songId } = request.payload;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		await this._service.addPlaylistSong(playlistId, songId);
		await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, "add");

		const response = h.response({
			status: "success",
			message: "Playlist song added successfully"
		});
		return response.code(201);
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

		if (playlist.source === "cache") {
			response.header("X-Data-Source", "cache");
		}

		return response.code(200);
	}

	async deletePlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { songId } = request.payload;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		await this._service.deletePlaylistSong(playlistId, songId);
		await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, "delete");

		const response = h.response({
			status: "success",
			message: "Playlist Song deleted successfully"
		});
		return response.code(200);
	}
	// End Playlist Song Service

	// Playlist Song Activities Service
	async getPlaylistSongActivitiesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongActivities = await this._service.getPlaylistSongActivities(playlistId);

		if (playlistSongActivities.source === "cache") {
			response.header("X-Data-Source", "cache");
		}

		const response = h.response({
			status: "success",
			data: playlistSongActivities
		});
		return response.code(200);
	}
	// End Playlist Song Activities Service
}

module.exports = PlaylistsHandler;
