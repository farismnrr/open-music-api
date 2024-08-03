const autoBind = require("auto-bind");

class ExportsHandler {
	constructor(service, validator, playlistsService) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
		this._playlistsService = playlistsService;
	}

	async postExportPlaylistsHandler(request, h) {
		this._validator.validateExportPlaylistsPayload(request.payload);

		const { targetEmail } = request.payload;
		const { playlistId } = request.params;
		const userId = request.auth.credentials.id;

		await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

		const message = {
			playlistId,
			targetEmail
		};

		await this._service.sendMessage("export:playlists", JSON.stringify(message));

		const response = h.response({
			status: "success",
			message: "Permintaan Anda sedang kami proses" // requirement testing message is using Bahasa Indonesia
		});
		response.code(201);
		return response;
	}
}

module.exports = ExportsHandler;
