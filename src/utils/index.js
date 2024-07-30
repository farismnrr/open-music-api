const mapSongModel = ({
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


const mapUserModel = ({ id, username, password, fullname, created_at, updated_at }) => ({
	id,
	username,
	password,
	fullname,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapAlbumModel = ({ id, name, year, created_at, updated_at }) => ({
	id,
	name,
	year,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapCollaborationModel = ({ id, playlist_id, user_id, created_at, updated_at }) => ({
	id,
	playlistId: playlist_id,
	userId: user_id,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistModel = ({ id, name, owner, created_at, updated_at }) => ({
	id,
	name,
	owner,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongModel = ({ id, playlist_id, song_id, created_at, updated_at }) => ({
	id,
	playlistId: playlist_id,
	songId: song_id,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongActivityModel = ({
	id,
	playlist_id,
	song_id,
	user_id,
	action,
	time,
}) => ({
	id,
	playlistId: playlist_id,
	songId: song_id,
	userId: user_id,
	action,
	time,
});

const mapPlaylistWithUsernameModel = ({ id, name, username, created_at, updated_at }) => ({
	id,
	name,
	username,
	createdAt: created_at,
	updatedAt: updated_at
});

const mapPlaylistSongActivityWithUsernameModel = ({ username, title, action, time }) => ({
	username,
	title,
	action,
	time,
});

module.exports = {
	mapSongModel,
	mapUserModel,
	mapAlbumModel,
	mapCollaborationModel,
	mapPlaylistModel,
	mapPlaylistSongModel,
	mapPlaylistSongActivityModel,
	mapPlaylistWithUsernameModel,
	mapPlaylistSongActivityWithUsernameModel
};
