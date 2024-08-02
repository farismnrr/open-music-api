const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapSongsModel } = require("../../utils/index");

class SongsService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({ title, year, genre, performer, duration, albumId }) {
		const id = `song-${nanoid(16)}`;
		const createdAt = new Date().toISOString();

		const query = {
			text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id",
			values: [id, title, year, genre, performer, duration, albumId, createdAt]
		};

		const result = await this._pool.query(query);
		if (!result.rows[0].id) {
			throw new InvariantError("Failed to add song.");
		}
		return result.rows[0].id;
	}

	async getSongs({ title, performer }) {
		const conditions = [];
		const values = [];

		if (title) {
			conditions.push(`title ILIKE $${conditions.length + 1}`);
			values.push(`%${title}%`);
		}

		if (performer) {
			conditions.push(`performer ILIKE $${conditions.length + 1}`);
			values.push(`%${performer}%`);
		}

		const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const query = `SELECT * FROM songs ${whereClause}`;

		const result = await this._pool.query(query, values);
		return result.rows.map(song => ({
			id: song.id,
			title: song.title,
			performer: song.performer
		}));
	}

	async getSongById(id) {
		const query = {
			text: "SELECT * FROM songs WHERE id=$1",
			values: [id]
		};

		const { rowCount, rows } = await this._pool.query(query);

		if (!rowCount) {
			throw new NotFoundError("Song not found.");
		}
		return mapSongsModel(rows[0]);
	}

	async editSongById(id, { title, year, genre, performer, duration, albumId }) {
		const updatedAt = new Date().toISOString();

		const query = {
			text: "UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id",
			values: [title, year, genre, performer, duration, albumId, updatedAt, id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Failed to update song. Id not found.");
		}
	}

	async deleteSongById(id) {
		const query = {
			text: "DELETE FROM songs WHERE id=$1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Failed to delete song. Id not found.");
		}
	}
}

module.exports = SongsService;
