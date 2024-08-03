const autoBind = require("auto-bind");

class PlaylistsHandler {
	constructor(service, validator) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

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
		response.code(201);
		return response;
	}

	async getPlaylistsHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const playlists = await this._service.getPlaylists(credentialId);

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

		await this._service.verifyPlaylistOwner(id, credentialId);
		await this._service.deletePlaylistById(id);

		const response = h.response({
			status: "success",
			message: "Playlist deleted successfully"
		});
		response.code(200);
		return response;
	}

	async getPlaylistSongActivitiesHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: playlistId } = request.params;

		await this._service.verifyPlaylistAccess(playlistId, credentialId);
		const playlistSongActivities = await this._service.getPlaylistSongActivities(playlistId);

		const response = h.response({
			status: "success",
			data: playlistSongActivities
		});
		response.code(200);
		return response;
	}
}

module.exports = PlaylistsHandler;
