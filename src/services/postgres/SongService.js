const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapSongDBToModel } = require("../../utils");
const { InvariantError } = require("../../exceptions/InvariantError");
const { NotFoundError } = require("../../exceptions/NotFoundError");

class SongService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({ title, year, genre, performer, duration, albumId }) {
		const id = nanoid();
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const query = {
			text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
			values: [
				id,
				title,
				year,
				genre,
				performer,
				duration,
				albumId,
				createdAt,
				updatedAt
			]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new InvariantError("Song gagal ditambahkan");
		}

		return result.rows[0].id;
	}

	async getSongs(title, performer) {
		const conditions = [];
		const values = [];

		const addCondition = (field, value) => {
			conditions.push(`${field} ILIKE $${values.length + 1}`);
			values.push(`%${value}%`);
		};

		if (title) {
			addCondition("title", title);
		}

		if (performer) {
			addCondition("performer", performer);
		}

		const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
		const query = {
			text: `SELECT id, title, performer FROM songs${whereClause}`,
			values
		};

		const result = await this._pool.query(query);
		return result.rows.map(mapSongDBToModel);
	}

	async getSongById(id) {
		const query = {
			text: "SELECT id, title, year, performer, genre, duration, album_id, created_at, updated_at FROM songs WHERE id = $1",
			values: [id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Song tidak ditemukan");
		}

		return mapSongDBToModel(result.rows[0]);
	}

	async editSongById(id, { title, year, performer, genre, duration, albumId }) {
		const updatedAt = new Date().toISOString();

		const query = {
			text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8",
			values: [title, year, performer, genre, duration, albumId, updatedAt, id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Gagal memperbarui song. Id tidak ditemukan");
		}
	}

	async deleteSongById(id) {
		const query = {
			text: "DELETE FROM songs WHERE id = $1",
			values: [id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Song gagal dihapus. Id tidak ditemukan");
		}
	}
}

module.exports = SongService;
