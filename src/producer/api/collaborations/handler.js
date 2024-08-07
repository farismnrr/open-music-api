const autoBind = require("auto-bind");

class CollaborationsHandler {
	constructor(collaborationsService, playlistsService, validator) {
		autoBind(this);
		this._collaborationsService = collaborationsService;
		this._playlistsService = playlistsService;
		this._validator = validator;
	}

	async postCollaborationHandler(request, h) {
		this._validator.validateCollaborationPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { playlistId, userId } = request.payload;

		await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
		const collaborationId = await this._collaborationsService.addCollaboration(
			playlistId,
			userId
		);

		const response = h.response({
			status: "success",
			data: {
				collaborationId
			}
		});
		return response.code(201);
	}

	async deleteCollaborationHandler(request, h) {
		this._validator.validateCollaborationPayload(request.payload);

		const { id: credentialId } = request.auth.credentials;
		const { playlistId, userId } = request.payload;

		await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
		await this._collaborationsService.deleteCollaboration(playlistId, userId);

		const response = h.response({
			status: "success",
			message: "Kolaborasi berhasil dihapus"
		});
		return response.code(200);
	}
}

module.exports = CollaborationsHandler;
