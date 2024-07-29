class PlaylistsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
		this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
		this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
		this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
	}

	async postPlaylistHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);
		const { name } = request.payload;
		const { id: credentialId } = request.auth.credentials;

		console.log("Credential ID:", credentialId);

		// const playlistId = await this._service.addPlaylist({
		// 	name,
		// 	owner: credentialId
		// });

		const response = h.response({
			status: "success",
			data: {
				// playlistId,
				id: credentialId
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
