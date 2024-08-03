const routes = handler => [
	// Album Service
	{
		method: "POST",
		path: "/albums",
		handler: handler.postAlbumHandler
	},
	{
		method: "GET",
		path: "/albums/{id}",
		handler: handler.getAlbumByIdHandler
	},
	{
		method: "PUT",
		path: "/albums/{id}",
		handler: handler.putAlbumByIdHandler
	},
	{
		method: "DELETE",
		path: "/albums/{id}",
		handler: handler.deleteAlbumByIdHandler
	},
	// End Album Service

	// User Album Likes Service
	{
		method: "POST",
		path: "/albums/{id}/likes",
		handler: handler.postUserAlbumLikesHandler,
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/albums/{id}/likes",
		handler: handler.getUserAlbumLikesHandler
	},
	{
		method: "DELETE",
		path: "/albums/{id}/likes",
		handler: handler.deleteUserAlbumLikesHandler,
		options: {
			auth: "openmusic_jwt"
		}
	}
	// End User Album Likes Service
];

module.exports = routes;
