const routes = handler => [
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
];

module.exports = routes;
