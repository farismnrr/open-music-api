const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

// User
const Users = require("./api/users");
const UsersService = require("./services/postgres/UserService");
const UsersValidator = require("./validator/users");

// Authentication
const Auth = require("./api/auth");
const AuthService = require("./services/postgres/AuthService");
const AuthValidator = require("./validator/auth");
const TokenManager = require("./tokenize/TokenManager");

// Albums
const Albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");

// Songs
const Songs = require("./api/songs");
const SongsService = require("./services/postgres/SongService");
const SongsValidator = require("./validator/songs");

// Collaborations
const Collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collab");

// Playlists
const Playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

const ServerLog = require("./services/server/LogService");
const ClientError = require("./exceptions/ClientError");

require("dotenv").config();

const createServer = () => {
	const server = Hapi.server({
		port: process.env.PORT || 8080,
		host: process.env.HOST || "localhost",
		routes: {
			cors: {
				origin: ["*"]
			}
		}
	});

	return server;
};

const registerPlugins = async server => {
	await server.register([
		{
			plugin: Jwt
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
		validate: artifacts => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id
			}
		})
	});

	console.log("ACCESS_TOKEN_KEY:", process.env.ACCESS_TOKEN_KEY);
	console.log("ACCESS_TOKEN_AGE:", process.env.ACCESS_TOKEN_AGE);

	const userService = new UsersService();
	const authService = new AuthService();
	const albumsService = new AlbumsService();
	const songsService = new SongsService();
	const collaborationsService = new CollaborationsService();
	const playlistsService = new PlaylistsService(collaborationsService);

	await server.register([
		{
			plugin: Users,
			options: {
				service: userService,
				validator: UsersValidator
			}
		},
		{
			plugin: Auth,
			options: {
				authService,
				userService,
				tokenManager: TokenManager,
				validator: AuthValidator
			}
		},
		{
			plugin: Albums,
			options: {
				service: albumsService,
				validator: AlbumsValidator
			}
		},
		{
			plugin: Songs,
			options: {
				service: songsService,
				validator: SongsValidator
			}
		},
		{
			plugin: Playlists,
			options: {
				service: playlistsService,
				validator: PlaylistsValidator
			}
		},
		{
			plugin: Collaborations,
			options: {
				collaborationsService,
				playlistsService,
				validator: CollaborationsValidator
			}
		}
	]);
};

const handleServerRequest = server => {
	const serverLog = new ServerLog(server);

	if (process.env.NODE_ENV !== "production") {
		server.ext("onRequest", (request, h) => {
			serverLog.ServerRequestLog(request);
			return h.continue;
		});

		server.ext("onPreResponse", (request, h) => {
			serverLog.ServerResponseLog(request, h);
			return h.continue;
		});
	}
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

const startServer = async () => {
	const server = createServer();
	await registerPlugins(server);
	handleServerRequest(server);
	handleClientError(server);
	await server.start();
	console.log("PORT:", process.env.PORT);
	console.log("HOST:", process.env.HOST);
	console.log(`Server berjalan pada ${server.info.uri}`);
};

startServer();
