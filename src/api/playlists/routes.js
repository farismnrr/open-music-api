const routes = handler => [
	{
		method: "POST",
		path: "/playlists",
		handler: (request, h) => handler.postPlaylistHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "POST",
		path: "/playlists/{id}/songs",
		handler: (request, h) => handler.postPlaylistSongHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/playlists",
		handler: (request, h) => handler.getPlaylistsHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/playlists/{id}/activities",
		handler: (request, h) => handler.getPlaylistSongActivitiesHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/playlists/{id}/songs",
		handler: (request, h) => handler.getPlaylistSongByIdHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "DELETE",
		path: "/playlists/{id}",
		handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "DELETE",
		path: "/playlists/{id}/songs",
		handler: (request, h) => handler.deletePlaylistSongHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	}
];

module.exports = routes;
