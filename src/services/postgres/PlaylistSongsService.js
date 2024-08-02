const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapPlaylistSongsModel, mapPlaylistsWithUsernameModel, mapSongsModel } = require("../../utils");

class PlaylistSongsService {
	constructor(songsService) {
		this._pool = new Pool();
		this._songsService = songsService;
	}

	// Playlist Song Service
	async addPlaylistSong(playlistId, songId) {
		await this._songsService.getSongById(songId);

		const id = `playlist-${nanoid()}`;
		const playlistSongQuery = {
			text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
			values: [id, playlistId, songId]
		};

		const playlistSongResult = await this._pool.query(playlistSongQuery);
		if (!playlistSongResult.rowCount) {
			throw new InvariantError("Gagal menambahkan lagu ke playlist.");
		}

		return mapPlaylistSongsModel(playlistSongResult.rows[0]).id;
	}

	async getPlaylistSongById(id) {
		const playlistSongQuery = {
			text: `
				SELECT playlist_songs.id, 
					playlist_songs.playlist_id, 
					playlist_songs.song_id, 
					songs.title, 
					songs.performer, 
					playlists.name, 
					users.username
				FROM playlist_songs
				LEFT JOIN songs ON songs.id = playlist_songs.song_id
				LEFT JOIN playlists ON playlists.id = playlist_songs.playlist_id
				LEFT JOIN users ON users.id = playlists.owner
				WHERE playlist_songs.playlist_id = $1
			`,
			values: [id]
		};

		const playlistSongResult = await this._pool.query(playlistSongQuery);
		if (!playlistSongResult.rowCount) {
			throw new NotFoundError("Playlist tidak ditemukan.");
		}

		const playlistSong = mapPlaylistsWithUsernameModel(playlistSongResult.rows[0]);
		const songs = playlistSongResult.rows.map(mapSongsModel);

		return {
			...playlistSong,
			songs
		};
	}

	async deletePlaylistSong(playlistId, songId) {
		const playlistSongQuery = {
			text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
			values: [playlistId, songId]
		};

		const playlistSongResult = await this._pool.query(playlistSongQuery);
		if (!playlistSongResult.rowCount) {
			throw new InvariantError("Gagal menghapus lagu dari playlist.");
		}
	}
	// End Playlist Song Service
}

module.exports = PlaylistSongsService;
