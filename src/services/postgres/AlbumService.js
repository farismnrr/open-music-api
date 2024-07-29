const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapAlbumModel, mapSongModel } = require("../../utils/index");

class AlbumService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = `album-${nanoid()}`;
		const query = {
			text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
			values: [id, name, year]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Album gagal ditambahkan");
		}

		const album = mapAlbumModel(result.rows[0]);

		return album.id;
	}

	async getAlbumById(id) {
		const queryAlbum = {
			text: "SELECT id, name, year FROM albums WHERE id = $1",
			values: [id]
		};

		const resultAlbum = await this._pool.query(queryAlbum);

		if (!resultAlbum.rowCount) {
			throw new NotFoundError("Album tidak ditemukan");
		}

		const querySong = {
			text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
			values: [resultAlbum.rows[0].id]
		};

		const resultSong = await this._pool.query(querySong);
		const album = mapAlbumModel(resultAlbum.rows[0]);
		const songs = resultSong.rows.map(mapSongModel);

		return { ...album, songs };
	}

	async editAlbumById(id, { name, year }) {
		const query = {
			text: "UPDATE albums SET name = $1, year = $2, updated_at = current_timestamp WHERE id = $3",
			values: [name, year, id]
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
