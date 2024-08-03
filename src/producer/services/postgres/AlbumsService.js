const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapAlbumsModel, mapSongsModel, mapUserAlbumLikesModel } = require("../../../utils");

class AlbumsService {
	constructor(cacheService) {
		this._pool = new Pool();
		this._cacheService = cacheService;
	}

	// Album Service
	async addAlbum({ name, year }) {
		const id = `album-${nanoid()}`;
		const albumQuery = {
			text: "INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id",
			values: [id, name, year, null]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new InvariantError("Gagal menambahkan album.");
		}

		await this._cacheService.delete(`album:${id}`);

		return mapAlbumsModel(albumResult.rows[0]).id;
	}

	async getAlbumById(id) {
		try {
			const albumResult = JSON.parse(await this._cacheService.get(`album:${id}`));
			return {
				data: albumResult,
				source: "cache"
			};
		} catch (error) {
			const albumQuery = {
				text: "SELECT id, name, year, cover FROM albums WHERE id=$1",
				values: [id]
			};
	
			const albumResult = await this._pool.query(albumQuery);
			if (!albumResult.rowCount) {
				throw new NotFoundError("Album tidak ditemukan.");
			}
	
			const albums = mapAlbumsModel(albumResult.rows[0]);
			const songQuery = {
				text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
				values: [albums.id]
			};
	
			const songResult = await this._pool.query(songQuery);
			const songs = songResult.rows.map(mapSongsModel);

			await this._cacheService.set(`album:${id}`, JSON.stringify({ ...albums, songs }));
	
			return {
				...albums,
				songs
			};
		}
	}

	async editAlbumById(id, { name, year }) {
		const albumQuery = {
			text: "UPDATE albums SET name=$1, year=$2, cover=$3 WHERE id=$4 RETURNING id",
			values: [name, year, null, id]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Gagal memperbarui album.");
		}

		await this._cacheService.delete(`album:${id}`);
	}

	async deleteAlbumById(id) {
		const albumQuery = {
			text: "DELETE FROM albums WHERE id=$1 RETURNING id",
			values: [id]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Gagal menghapus album.");
		}

		await this._cacheService.delete(`album:${id}`);
	}

	async updateAlbumCoverUrl(id, url) {
		const albumQuery = {
			text: "UPDATE albums SET cover = $2 WHERE id = $1",
			values: [id, url]
		};

		const albumResult = await this._pool.query(albumQuery);
		if (!albumResult.rowCount) {
			throw new NotFoundError("Gagal menambahkan cover album.");
		}

		await this._cacheService.delete(`album:${id}`);
	}
	// End Album Service

	// User Album Likes Service
	async addLike(albumId, userId) {
		await this.getAlbumById(albumId);
		await this.verifyUserLike(userId, albumId);

		const id = `album-${nanoid()}`;
		const albumLikeQuery = {
			text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
			values: [id, userId, albumId]
		};

		const albumLikeResult = await this._pool.query(albumLikeQuery);
		if (!albumLikeResult.rowCount) {
			throw new InvariantError("Gagal menambahkan like ke album.");
		}

		await this._cacheService.delete(`album-like:${albumId}`);
	}

	async getTotalLikes(albumId) {
		try {
			const albumLikeResult = JSON.parse(await this._cacheService.get(`album-like:${albumId}`));
			return {
				data: albumLikeResult,
				source: "cache"
			};
		} catch (error) {
			const albumLikeQuery = {
				text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
				values: [albumId]
			};

			const albumLikeResult = await this._pool.query(albumLikeQuery);
			const albumLikeCountResult = mapUserAlbumLikesModel(albumLikeResult.rows[0]).count;
			await this._cacheService.set(`album-like:${albumId}`, albumLikeCountResult);

			return {
				data: parseInt(albumLikeCountResult, 10) || 0,
				source: "database"
			};
		}
	}

	async deleteLike(userId, albumId) {
		const albumLikeQuery = {
			text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
			values: [userId, albumId]
		};

		const albumLikeResult = await this._pool.query(albumLikeQuery);
		if (!albumLikeResult.rowCount) {
			throw new InvariantError("Gagal menghapus like dari album.");
		}

		await this._cacheService.delete(`album-like:${albumId}`);
	}

	async verifyUserLike(userId, albumId) {
		const albumLikeQuery = {
			text: "SELECT id, user_id, album_id FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
			values: [userId, albumId]
		};

		const albumLikeResult = await this._pool.query(albumLikeQuery);
		if (albumLikeResult.rowCount) {
			throw new InvariantError("Album sudah pernah dilike.");
		}
	}
	// End User Album Likes Service
}

module.exports = AlbumsService;
