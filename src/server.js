require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

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

const playlistSongs = require("./api/playlistSongs");
const PlaylistSongsService = require("./services/postgres/PlaylistSongsService");

const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

const ClientError = require("./exceptions/ClientError");

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

const jwtPlugin = async server => {
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
		validate: payload => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.id
			}
		})
	});
};

const registerPlugins = async server => {
	const albumsService = new AlbumsService();
	const songsService = new SongsService();
	const usersService = new UsersService();
	const authenticationsService = new AuthenticationsService();
	const collaborationsService = new CollaborationsService();
	const playlistsService = new PlaylistsService(collaborationsService);
	const playlistSongsService = new PlaylistSongsService(songsService);

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
			plugin: playlistSongs,
			options: {
				playlistSongsService,
				playlistsService,
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

const startServer = async () => {
	const server = createServer();

	await jwtPlugin(server);
	await registerPlugins(server);

	handleClientError(server);

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

startServer();
