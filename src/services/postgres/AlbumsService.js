const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapAlbumModel, mapSongModel } = require("../../utils");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");

class AlbumsService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = `album-${nanoid()}`;
		const albumQuery = {
			text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
			values: [id, name, year]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new InvariantError("Gagal menambahkan album.");
		}

		return mapAlbumModel(albumResult.rows[0]).id;
	}

	async getAlbumById(id) {
		const albumQuery = {
			text: "SELECT id, name, year FROM albums WHERE id=$1",
			values: [id]
		};
		
		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Album tidak ditemukan.");
		}

		const album = mapAlbumModel(albumResult.rows[0]);
		const songQuery = {
			text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
			values: [album.id]
		};

		const songResult = await this._pool.query(songQuery);
		const songs = songResult.rows.map(mapSongModel);

		return {
			...album,
			songs
		};
	}

	async editAlbumById(id, { name, year }) {
		const albumQuery = {
			text: "UPDATE albums SET name=$1, year=$2 WHERE id=$3",
			values: [name, year, id]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan.");
		}
	}

	async deleteAlbumById(id) {
		const albumQuery = {
			text: "DELETE FROM albums WHERE id=$1",
			values: [id]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Gagal menghapus album. Id tidak ditemukan.");
		}
	}
}

module.exports = AlbumsService;
