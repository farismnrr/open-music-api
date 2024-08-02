const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapAlbumsModel } = require("../../utils");

class AlbumsService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = `album-${nanoid(16)}`;

		const query = {
			text: "INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id",
			values: [id, name, year, null]
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError("Failed to add album.");
		}

		return result.rows[0].id;
	}

	async getAlbumById(id) {
		const albumQuery = {
			text: "SELECT * FROM albums WHERE id=$1",
			values: [id]
		};
		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rows.length) {
			throw new NotFoundError("Album not found.");
		}

		const songQuery = {
			text: "SELECT * FROM songs WHERE album_id=$1",
			values: [albumResult.rows[0].id]
		};
		const songResult = await this._pool.query(songQuery);

		const album = albumResult.rows.map(mapAlbumsModel)[0];
		const songs = songResult.rows.map(song => ({
			id: song.id,
			title: song.title,
			performer: song.performer
		}));

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

		if (!result.rows.length) {
			throw new NotFoundError("Failed to update album. Id not found.");
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: "DELETE FROM albums WHERE id=$1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Failed to delete album. Id not found.");
		}
	}

	async updateAlbumCoverUrl(id, url) {
		const query = {
			text: "UPDATE albums SET cover = $2 WHERE id = $1",
			values: [id, url]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Failed to add Album Cover. Id not found.");
		}
	}
}

module.exports = AlbumsService;
