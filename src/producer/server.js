const Jwt = require("@hapi/jwt");
const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const config = require("../utils/config.js");

const albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumsService");
const AlbumsValidator = require("./validator/albums");

const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongsService");
const SongsValidator = require("./validator/songs");

const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const AuthenticationsValidator = require("./validator/authentications");
const TokenManager = require("./tokenize/TokenManager");

const playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

const exportsModule = require("./api/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

const uploads = require("./api/uploads");
const StorageService = require("./services/storage/StorageService");
const UploadsValidator = require("./validator/uploads");

const logService = require("./services/log/LogService");
const ClientError = require("./exceptions/ClientError");
const CacheService = require("./services/redis/CacheService");

const createServer = () => {
	const server = Hapi.server({
		port: config.server.port,
		host: config.server.host,
		routes: {
			cors: {
				origin: ["*"]
			}
		}
	});

	return server;
};

const externalPlugin = async server => {
	await server.register([
		{
			plugin: Jwt
		},
		{
			plugin: Inert
		}
	]);

	server.auth.strategy("openmusic_jwt", "jwt", {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE
		},
		validate: payload => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.id
			}
		})
	});
};

const registerPlugins = async server => {
	const songsService = new SongsService();
	const usersService = new UsersService();
	const cacheService = new CacheService();
	const collaborationsService = new CollaborationsService();
	const authenticationsService = new AuthenticationsService();
	const albumsService = new AlbumsService(cacheService);
	const storageService = new StorageService(config.storage.location);
	const playlistsService = new PlaylistsService(songsService, cacheService, collaborationsService);

	await server.register([
		{
			plugin: albums,
			options: {
				service: albumsService,
				validator: AlbumsValidator
			}
		},
		{
			plugin: songs,
			options: {
				service: songsService,
				validator: SongsValidator
			}
		},
		{
			plugin: users,
			options: {
				service: usersService,
				validator: UsersValidator
			}
		},
		{
			plugin: authentications,
			options: {
				authenticationsService,
				usersService,
				tokenManager: TokenManager,
				validator: AuthenticationsValidator
			}
		},
		{
			plugin: playlists,
			options: {
				service: playlistsService,
				validator: PlaylistsValidator
			}
		},
		{
			plugin: collaborations,
			options: {
				collaborationsService,
				playlistsService,
				validator: CollaborationsValidator
			}
		},
		{
			plugin: exportsModule,
			options: {
				playlistsService,
				service: ProducerService,
				validator: ExportsValidator
			}
		},
		{
			plugin: uploads,
			options: {
				storageService,
				albumsService,
				validator: UploadsValidator
			}
		}
	]);
};

const handleClientError = server => {
	server.ext("onPreResponse", (request, h) => {
		const { response } = request;
		if (response instanceof ClientError) {
			const newResponse = h.response({
				status: "fail",
				message: response.message
			});
			newResponse.code(response.statusCode);
			return newResponse;
		}
		return h.continue;
	});
};

const handleServerLog = server => {
	if (process.env.NODE_ENV !== "production") {
		server.ext("onRequest", (request, h) => {
			logService.ServerRequestLog(request);
			return h.continue;
		});

		server.ext("onPreResponse", (request, h) => {
			logService.ServerResponseLog(request, h);
			return h.continue;
		});
	}
};

const startServer = async () => {
	const server = createServer();

	await externalPlugin(server);
	await registerPlugins(server);
	handleClientError(server);
	handleServerLog(server);

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

startServer();
