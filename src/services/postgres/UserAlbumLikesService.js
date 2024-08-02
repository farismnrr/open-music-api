const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapUserAlbumLikesModel } = require("../../utils");

class UserAlbumLikesService {
	constructor(albumsService, cacheService) {
		this._pool = new Pool();
		this._albumsService = albumsService;
		this._cacheService = cacheService;
	}

	async addLike(albumId, userId) {
		await this._albumsService.getAlbumById(albumId);
		await this.verifyUserLike(userId, albumId);

		const id = `album-${nanoid()}`;
		const albumLikeQuery = {
			text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
			values: [id, userId, albumId]
		};

		const albumLikeResult = await this._pool.query(albumLikeQuery);
		await this._cacheService.delete(`album:${albumId}`);

		if (!albumLikeResult.rowCount) {
			throw new InvariantError("Gagal menambahkan like ke album.");
		}
	}

	async getTotalLikes(albumId) {
		try {
			const albumLikeResult = JSON.parse(await this._cacheService.get(`album:${albumId}`));
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
			await this._cacheService.set(`album:${albumId}`, albumLikeCountResult);

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
		await this._cacheService.delete(`album:${albumId}`);

		if (!albumLikeResult.rowCount) {
			throw new InvariantError("Gagal menghapus like dari album.");
		}
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
}

module.exports = UserAlbumLikesService;
