const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");

class PlaylistSongsService {
	constructor(songsService) {
		this._pool = new Pool();
		this._songsService = songsService;
	}

	async addPlaylistSong(playlistId, songId) {
		const id = `playlist-song-${nanoid(16)}`;
		const createdAt = new Date().toISOString();

		await this._songsService.getSongById(songId);

		const query = {
			text: "INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $4) RETURNING id",
			values: [id, playlistId, songId, createdAt]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to add Playlist Song.");
		}

		return result.rows[0].id;
	}

	async getPlaylistSongById(id) {
		const query = {
			text: `
      SELECT playlist_songs.*, songs.title, songs.performer, playlists.*, users.username
      FROM playlist_songs
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      LEFT JOIN playlists ON playlists.id = playlist_songs.playlist_id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlist_songs.playlist_id = $1`,
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Playlist not found.");
		}

		const playlist = {
			id: result.rows[0].id,
			name: result.rows[0].name,
			username: result.rows[0].username,
			songs: result.rows.map(({ id: songId, title, performer }) => ({
				id: songId,
				title,
				performer
			}))
		};

		return playlist;
	}

	async deletePlaylistSong(playlistId, songId) {
		const query = {
			text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
			values: [playlistId, songId]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to delete Playlist Song.");
		}
	}
}

module.exports = PlaylistSongsService;
