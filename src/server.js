const Hapi = require("@hapi/hapi");
const dotenv = require("dotenv");
const albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongService");
const SongsValidator = require("./validator/songs");
const RequestService = require("./services/RequestService");
const ClientError = require("./exceptions/ClientError");

dotenv.config();

const createServer = () => {
	const server = Hapi.server({
		port: process.env.PORT || 8080,
		host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
		routes: {
			cors: {
				origin: ["*"]
			}
		}
	});

	return server;
};

const registerPlugins = async server => {
	await server.register({
		plugin: albums,
		options: {
			service: new AlbumsService(),
			validator: AlbumsValidator
		}
	});

	await server.register({
		plugin: songs,
		options: {
			service: new SongsService(),
			validator: SongsValidator
		}
	});
};

const setupRequestService = server => {
	if (process.env.NODE_ENV !== "production") {
		server.ext("onRequest", (request, h) =>
			new RequestService().onRequest(request, h)
		);
		server.ext("onPreResponse", (request, h) =>
			new RequestService().onPreResponse(request, h)
		);
	}
};

const handleClientError = server => {
	server.ext("onPreResponse", (request, h) => {
		const { response } = request;

		if (!(response instanceof Error)) {
			return h.continue;
		}

		if (response instanceof ClientError) {
			const newResponse = h.response({
				status: "fail",
				message: response.message
			});
			newResponse.code(response.statusCode);
			return newResponse;
		}

		if (!response.isServer) {
			return h.continue;
		}

		const newResponse = h.response({
			status: "error",
			message: response.message
		});
		newResponse.code(500);
		return newResponse;
	});
};

const startServer = async () => {
	const server = createServer();
	await registerPlugins(server);
	setupRequestService(server);
	handleClientError(server);
	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

startServer();
