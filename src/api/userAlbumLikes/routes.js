const routes = handler => [
	{
		method: "POST",
		path: "/albums/{id}/likes",
		handler: (request, h) => handler.postUserAlbumLikesHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	},
	{
		method: "GET",
		path: "/albums/{id}/likes",
		handler: (request, h) => handler.getUserAlbumLikesHandler(request, h)
	},
	{
		method: "DELETE",
		path: "/albums/{id}/likes",
		handler: (request, h) => handler.deleteUserAlbumLikesHandler(request, h),
		options: {
			auth: "openmusic_jwt"
		}
	}
];

module.exports = routes;
