const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { AuthorizationError } = require("../../exceptions/AuthError");
const {
	mapSongsModel,
	mapPlaylistsModel,
	mapPlaylistSongsModel,
	mapPlaylistsWithUsernameModel,
	mapPlaylistSongActivitiesModel,
	mapPlaylistSongActivitiesWithUsernameModel
} = require("../../../utils");

class PlaylistsService {
	constructor(songsService, cacheService, collaborationService) {
		this._pool = new Pool();
		this._songsService = songsService;
		this._cacheService = cacheService;
		this._collaborationService = collaborationService;
	}

	// Playlist Service
	async addPlaylist({ name, owner }) {
		const id = `playlist-${nanoid()}`;
		const playlistQuery = {
			text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
			values: [id, name, owner]
		};

		const playlistResult = await this._pool.query(playlistQuery);
		if (!playlistResult.rowCount) {
			throw new InvariantError("Gagal menambahkan playlist.");
		}

		return mapPlaylistsModel(playlistResult.rows[0]).id;
	}

	async getPlaylists(owner) {
		const playlistQuery = {
			text: `
				SELECT playlists.id, playlists.name, users.username 
				FROM playlists
				LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
				LEFT JOIN users ON users.id = playlists.owner
				WHERE playlists.owner = $1 OR collaborations.user_id = $1
				GROUP BY playlists.id, users.username
			`,
			values: [owner]
		};

		const playlistResult = await this._pool.query(playlistQuery);
		return playlistResult.rows.map(mapPlaylistsWithUsernameModel);
	}

	async deletePlaylistById(id) {
		const playlistQuery = {
			text: "DELETE FROM playlists WHERE id = $1",
			values: [id]
		};

		const playlistResult = await this._pool.query(playlistQuery);
		if (!playlistResult.rowCount) {
			throw new NotFoundError("Gagal menghapus playlist. Id tidak ditemukan.");
		}
	}

	async verifyPlaylistOwner(id, owner) {
		const playlistQuery = {
			text: "SELECT id, owner FROM playlists WHERE id = $1",
			values: [id]
		};

		const playlistResult = await this._pool.query(playlistQuery);
		if (!playlistResult.rowCount) {
			throw new NotFoundError("Playlist tidak ditemukan.");
		}

		const playlist = mapPlaylistsModel(playlistResult.rows[0]);
		if (playlist.owner !== owner) {
			throw new AuthorizationError("Tidak memiliki akses.");
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
	// End Playlist Service

	// Playlist Song Service
	async addPlaylistSong(playlistId, songId) {
		await this._songsService.getSongById(songId);

		const id = `playlist-${nanoid()}`;
		const playlistSongQuery = {
			text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
			values: [id, playlistId, songId]
		};

		const playlistSongResult = await this._pool.query(playlistSongQuery);
		await this._cacheService.delete(`playlist-song:${id}`);
		if (!playlistSongResult.rowCount) {
			throw new InvariantError("Gagal menambahkan lagu ke playlist.");
		}

		return mapPlaylistSongsModel(playlistSongResult.rows[0]).id;
	}

	async getPlaylistSongById(id) {
		try {
			const playlistSongResult = JSON.parse(await this._cacheService.get(`playlist-song:${id}`));
			return {
				data: playlistSongResult,
				source: "cache"
			};
		} catch (error) {
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

			await this._cacheService.set(`playlist-song:${id}`, JSON.stringify(playlistSong));
	
			return {
				...playlistSong,
				songs,
				source: "database"
			};
		}
	}

	async deletePlaylistSong(playlistId, songId) {
		const playlistSongQuery = {
			text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
			values: [playlistId, songId]
		};

		const playlistSongResult = await this._pool.query(playlistSongQuery);
		await this._cacheService.delete(`playlist-song:${playlistId}`);
		if (!playlistSongResult.rowCount) {
			throw new InvariantError("Gagal menghapus lagu dari playlist.");
		}
	}
	// End Playlist Song Service

	// Playlist Song Activity Service
	async addPlaylistSongActivity(playlistId, songId, userId, action) {
		const id = `playlist-${nanoid()}`;
		const playlistSongActivityQuery = {
			text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id",
			values: [id, playlistId, songId, userId, action]
		};

		const playlistSongActivityResult = await this._pool.query(playlistSongActivityQuery);
		if (!playlistSongActivityResult.rowCount) {
			throw new InvariantError("Gagal menambahkan aktivitas lagu.");
		}

		await this._cacheService.delete(`playlist-song-activity:${playlistId}`);

		return mapPlaylistSongActivitiesModel(playlistSongActivityResult.rows[0]).id;
	}

	async getPlaylistSongActivities(playlistId) {
		try {
			const playlistSongActivityResult = JSON.parse(await this._cacheService.get(`playlist-song-activity:${owner}`));
			return {
				data: playlistSongActivityResult,
				source: "cache"
			};
		} catch (error) {
			const playlistSongActivityQuery = {
				text: `
					SELECT playlist_song_activities.action, 
						playlist_song_activities.time, 
						playlists.id, 
						users.username, 
						songs.title
					FROM playlist_song_activities
					LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
					LEFT JOIN users ON users.id = playlist_song_activities.user_id
					LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
					WHERE playlist_song_activities.playlist_id = $1
					ORDER BY time asc
				`,
				values: [playlistId]
			};
			const playlistSongActivityResult = await this._pool.query(playlistSongActivityQuery);
			const playlistResult = mapPlaylistsWithUsernameModel(playlistSongActivityResult.rows[0]);
			const activities = playlistSongActivityResult.rows.map(
				mapPlaylistSongActivitiesWithUsernameModel
			);

			await this._cacheService.set(`playlist-song-activity:${playlistId}`, JSON.stringify(playlistSongActivityResult));
	
			return {
				playlistId: playlistResult.id,
				activities,
				source: "database"
			};
		}
	}
	// End Playlist Song Activity Service
}

module.exports = PlaylistsService;
