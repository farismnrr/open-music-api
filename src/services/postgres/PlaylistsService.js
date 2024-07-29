const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { InvariantError } = require("../../exceptions/InvariantError");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { AuthorizationError } = require("../../exceptions/AuthError");

class PlaylistsService {
	constructor(songsService, collaborationService) {
		this._pool = new Pool();
		this._songsService = songsService;
		this._collaborationService = collaborationService;
	}

	// Playlist Service
	async addPlaylist({ name, owner }) {
		const id = `playlist-${nanoid(16)}`;
		const createdAt = new Date().toISOString();

		const query = {
			text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id",
			values: [id, name, owner, createdAt]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Playlist failed to add.");
		}

		return result.rows[0].id;
	}

	async getPlaylists(owner) {
		const query = {
			text: `SELECT playlists.*, users.username FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
			values: [owner]
		};

		const result = await this._pool.query(query);
		return result.rows.map(item => ({
			id: item.id,
			name: item.name,
			username: item.username
		}));
	}

	async deletePlaylistById(id) {
		const query = {
			text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Failed to delete playlist. Id not found.");
		}
	}
	// End Playlist Service

	// Playlist Song Activities Service
	async addPlaylistSongActivity(playlistId, songId, userId, action) {
		const id = `playlist-song-activity-${nanoid(16)}`;
		const time = new Date().toISOString();

		const query = {
			text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
			values: [id, playlistId, songId, userId, action, time]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to add Song Activity.");
		}

		return result.rows[0].id;
	}

	async getPlaylistSongActivities(owner) {
		const query = {
			text: `SELECT playlist_song_activities.*, playlists.id, users.username, songs.title
      FROM playlist_song_activities
      LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY time asc`,
			values: [owner]
		};
		const result = await this._pool.query(query);

		return {
			playlistId: result.rows[0].id,
			activities: result.rows
		};
	}

	async verifyPlaylistOwner(id, owner) {
		const query = {
			text: "SELECT * FROM playlists WHERE id = $1",
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Playlist not found.");
		}

		const playlist = result.rows[0];

		if (playlist.owner !== owner) {
			throw new AuthorizationError("Not authorized.");
		}
	}

	async verifyPlaylistAccess(playlistId, userId) {
		try {
			await this.verifyPlaylistOwner(playlistId, userId);
		} catch (error) {
			try {
				if (error instanceof NotFoundError) throw error;
				await this._collaborationService.verifyCollaborator(playlistId, userId);
			} catch {
				throw error;
			}
		}
	}
	// End Playlist Song Activities Service

	// Playlist Song Service
	async addPlaylistSong(playlistId, songId) {
		const id = `playlist-${nanoid(16)}`;
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
	// End Playlist Song Service
}

module.exports = PlaylistsService;
