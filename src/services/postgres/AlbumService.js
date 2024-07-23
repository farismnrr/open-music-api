const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapAlbumDBToModel } = require("../../utils");
const { InvariantError } = require("../../exceptions/InvariantError");
const { NotFoundError } = require("../../exceptions/NotFoundError");

class AlbumService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = nanoid();
		const createdAt = new Date().toISOString();

		const query = {
			text: "INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id",
			values: [id, name, year, createdAt]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new InvariantError("Album gagal ditambahkan");
		}

		return result.rows[0].id;
	}

	async getAlbumById(id) {
		const albumQuery = {
			text: "SELECT id, name, year, created_at, updated_at FROM albums WHERE id=$1",
			values: [id]
		};
		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Album tidak ditemukan.");
		}

		const album = mapAlbumDBToModel(albumResult.rows[0]);

		const songQuery = {
			text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
			values: [id]
		};
		const songResult = await this._pool.query(songQuery);

		const songs = songResult.rows;

		return {
			...album,
			songs
		};
	}

	async editAlbumById(id, { name, year }) {
		const updatedAt = new Date().toISOString();

		const query = {
			text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
			values: [name, year, updatedAt, id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: "DELETE FROM albums WHERE id = $1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
		}
	}
}

module.exports = AlbumService;
