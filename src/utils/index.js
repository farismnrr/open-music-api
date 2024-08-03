const mapSongsModel = ({
	id,
	title,
	year,
	performer,
	genre,
	duration,
	album_id,
	created_at,
	updated_at
}) => ({
	id,
	title,
	year,
	performer,
	genre,
	duration,
	albumId: album_id,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapUsersModel = ({ id, username, password, fullname, created_at, updated_at }) => ({
	id,
	username,
	password,
	fullname,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapAlbumsModel = ({ id, name, year, cover, created_at, updated_at }) => ({
	id,
	name,
	year,
	coverUrl: cover,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapCollaborationsModel = ({ id, playlist_id, user_id, created_at, updated_at }) => ({
	id,
	playlistId: playlist_id,
	userId: user_id,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistsModel = ({ id, name, owner, created_at, updated_at }) => ({
	id,
	name,
	owner,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongsModel = ({ id, playlist_id, song_id, created_at, updated_at }) => ({
	id,
	playlistId: playlist_id,
	songId: song_id,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongActivitiesModel = ({ id, playlist_id, song_id, user_id, action, time }) => ({
	id,
	playlistId: playlist_id,
	songId: song_id,
	userId: user_id,
	action,
	time
});

const mapUserAlbumLikesModel = ({ count }) => ({
	count
});

const mapPlaylistsWithUsernameModel = ({ id, name, username, created_at, updated_at }) => ({
	id,
	name,
	username,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongActivitiesWithUsernameModel = ({ username, title, action, time }) => ({
	username,
	title,
	action,
	time,
});

module.exports = {
	mapSongsModel,
	mapUsersModel,
	mapAlbumsModel,
	mapCollaborationsModel,
	mapPlaylistsModel,
	mapPlaylistSongsModel,
	mapPlaylistSongActivitiesModel,
	mapUserAlbumLikesModel,
	mapPlaylistsWithUsernameModel,
	mapPlaylistSongActivitiesWithUsernameModel
};
