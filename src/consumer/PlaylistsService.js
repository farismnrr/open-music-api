const { Pool } = require("pg");
const { mapSongsModel } = require("../utils");

class PlaylistsService {
	constructor() {
		this._pool = new Pool();
	}

	async getPlaylists(playlistId) {
		const playlistQuery = {
			text: "SELECT id, name FROM playlists WHERE id = $1",
			values: [playlistId]
		};
		const playlists = await this._pool.query(playlistQuery);

		const playlistSongIdsQuery = {
			text: "SELECT song_id FROM playlist_songs WHERE playlist_id = $1",
			values: [playlistId]
		};
		const playlistSongIdsResult = await this._pool.query(playlistSongIdsQuery);

		const playlistSongs = await Promise.all(
			Object.values(playlistSongIdsResult.rows).map(async song => {
				const songQuery = {
					text: "SELECT id, title, performer FROM songs WHERE id = $1",
					values: [song.song_id]
				};
				const songs = await this._pool.query(songQuery);
				return mapSongsModel(songs.rows[0]);
			})
		);

		return {
			playlist: {
				id: playlists?.rows?.[0]?.id,
				name: playlists?.rows?.[0]?.name,
				songs: playlistSongs
			}
		};
	}
}

module.exports = PlaylistsService;
