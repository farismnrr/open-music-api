const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapAlbumsModel, mapSongsModel } = require("../../utils");

class AlbumsService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = `album-${nanoid()}`;

		const query = {
			text: "INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id",
			values: [id, name, year, null]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Gagal menambahkan album.");
		}

		return mapAlbumsModel(result.rows[0]).id;
	}

	async getAlbumById(id) {
		const albumQuery = {
			text: "SELECT id, name, year, cover FROM albums WHERE id=$1",
			values: [id]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Album tidak ditemukan.");
		}

		const album = mapAlbumsModel(albumResult.rows[0]);
		const songQuery = {
			text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
			values: [album.id]
		};

		const songResult = await this._pool.query(songQuery);
		const songs = songResult.rows.map(mapSongsModel);

		return {
			...album,
			songs
		};
	}

	async editAlbumById(id, { name, year }) {
		const query = {
			text: "UPDATE albums SET name=$1, year=$2, cover=$3 WHERE id=$4 RETURNING id",
			values: [name, year, null, id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Gagal memperbarui album.");
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: "DELETE FROM albums WHERE id=$1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Gagal menghapus album.");
		}
	}

	async updateAlbumCoverUrl(id, url) {
		const query = {
			text: "UPDATE albums SET cover = $2 WHERE id = $1",
			values: [id, url]
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new NotFoundError("Gagal menambahkan cover album.");
		}
	}
}

module.exports = AlbumsService;
