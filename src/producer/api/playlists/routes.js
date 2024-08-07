const routes = handler => [
	// Playlist Service
	{
		method: "POST",
		path: "/playlists",
		handler: handler.postPlaylistHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/playlists",
		handler: handler.getPlaylistsHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "DELETE",
		path: "/playlists/{id}",
		handler: handler.deletePlaylistByIdHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	// End Playlist Service

	// Playlist Song Service
	{
		method: "POST",
		path: "/playlists/{id}/songs",
		handler: handler.postPlaylistSongHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/playlists/{id}/songs",
		handler: handler.getPlaylistSongByIdHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "DELETE",
		path: "/playlists/{id}/songs",
		handler: handler.deletePlaylistSongHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	// End Playlist Song Service

	// Playlist Song Activities Service
	{
		method: "GET",
		path: "/playlists/{id}/activities",
		handler: handler.getPlaylistSongActivitiesHandler,
		options: {
			auth: "openmusic_jwt"
		}
	}
	// End Playlist Song Activities Service
];

module.exports = routes;
