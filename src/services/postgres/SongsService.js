const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapSongModel } = require("../../utils/index");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");

class SongsService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({ title, year, performer, genre, duration, albumId }) {
		const id = `song-${nanoid()}`;
		const songQuery = {
			text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
			values: [id, title, year, performer, genre, duration, albumId]
		};

		const songResult = await this._pool.query(songQuery);
		if (!songResult.rowCount) {
			throw new InvariantError("Gagal menambahkan lagu.");
		}

		return mapSongModel(songResult.rows[0]).id;
	}

	async getSongs({ title, performer }) {
		const conditions = [];
		const values = [];

		const addCondition = (field, value) => {
			if (value) {
				conditions.push(`${field} ILIKE $${values.length + 1}`);
				values.push(`%${value}%`);
			}
		};

		addCondition("title", title);
		addCondition("performer", performer);

		const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
		const songsQuery = {
			text: `SELECT id, title, performer FROM songs ${whereClause}`,
			values
		};

		const songsResult = await this._pool.query(songsQuery);
		return songsResult.rows.map(mapSongModel);
	}

	async getSongById(id) {
		const songQuery = {
			text: `
			  SELECT id, title, year, performer, genre, duration, album_id 
			  FROM songs 
			  WHERE id = $1
			`,
			values: [id]
		};

		const songResult = await this._pool.query(songQuery);
		if (!songResult.rowCount) {
			throw new NotFoundError("Lagu tidak ditemukan.");
		}

		return mapSongModel(songResult.rows[0]);
	}

	async editSongById(id, { title, year, genre, performer, duration, albumId }) {
		const songQuery = {
			text: `
			  UPDATE songs 
			  SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 
			  WHERE id = $7
			`,
			values: [title, year, genre, performer, duration, albumId, id]
		};

		const songResult = await this._pool.query(songQuery);
		if (!songResult.rowCount) {
			throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan.");
		}
	}

	async deleteSongById(id) {
		const songQuery = {
			text: "DELETE FROM songs WHERE id=$1",
			values: [id]
		};

		const songResult = await this._pool.query(songQuery);
		if (!songResult.rowCount) {
			throw new NotFoundError("Gagal menghapus lagu. Id tidak ditemukan.");
		}
	}
}

module.exports = SongsService;
