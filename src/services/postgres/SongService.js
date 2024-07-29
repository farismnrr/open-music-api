const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapSongModel } = require("../../utils/index");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");

class SongService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({ title, year, performer, genre, duration, albumId }) {
		const id = `song-${nanoid()}`;
		const query = {
			text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
			values: [id, title, year, performer, genre, duration, albumId]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Gagal menambahkan lagu");
		}

		const song = mapSongModel(result.rows[0]);

		return song.id;
	}

	async getSongs({ title, performer }) {
		const condition = [];
		const values = [];

		const addCondition = (field, value) => {
			condition.push(`${field} ILIKE $${values.length + 1}`);
			values.push(`%${value}%`);
		};

		if (title) {
			addCondition("title", title);
		}

		if (performer) {
			addCondition("performer", performer);
		}

		const whereClause = condition.length > 0 ? `WHERE ${condition.join(" AND ")}` : "";

		const query = {
			text: `SELECT id, title, performer FROM songs ${whereClause}`,
			values
		};

		const result = await this._pool.query(query, values);
		return result.rows.map(mapSongModel);
	}

	async getSongById(id) {
		const query = {
			text: "SELECT id, title, year, performer, genre, duration FROM songs WHERE id = $1",
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Lagu tidak ditemukan");
		}

		return mapSongModel(result.rows[0]);
	}

	async editSongById(id, { title, year, performer, genre, duration, albumId }) {
		const query = {
			text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7",
			values: [title, year, performer, genre, duration, albumId, id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Gagal mengubah lagu. Id tidak ditemukan");
		}
	}

	async deleteSongById(id) {
		const query = {
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Gagal menghapus lagu. Id tidak ditemukan");
		}
	}
}

module.exports = SongService;
