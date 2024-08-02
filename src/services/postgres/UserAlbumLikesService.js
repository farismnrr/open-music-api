const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { InvariantError } = require("../../exceptions/InvariantError");

class UserAlbumLikesService {
	constructor(albumsService, cacheService) {
		this._pool = new Pool();
		this._albumsService = albumsService;
		this._cacheService = cacheService;
	}

	async addLike(albumId, userId) {
		await this._albumsService.getAlbumById(albumId);
		await this.verifyUserLike(userId, albumId);

		const id = `album-likes-${nanoid()}`;
		const query = {
			text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
			values: [id, userId, albumId]
		};

		const result = await this._pool.query(query);
		await this._cacheService.delete(`album-likes:${albumId}`);

		if (!result.rowCount) {
			throw new InvariantError("Failed to add like to the album.");
		}
	}

	async getTotalLikes(albumId) {
		try {
			const result = await this._cacheService.get(`album-likes:${albumId}`);
			return {
				data: JSON.parse(result),
				source: "cache"
			};
		} catch (error) {
			const query = {
				text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
				values: [albumId]
			};

			const result = await this._pool.query(query);
			await this._cacheService.set(`album-likes:${albumId}`, result.rows[0].count);

			let data = 0;
			if (result.rows[0].count) {
				data = parseInt(result.rows[0].count, 10);
			}

			return {
				data,
				source: "database"
			};
		}
	}

	async deleteLike(userId, albumId) {
		const query = {
			text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
			values: [userId, albumId]
		};

		const result = await this._pool.query(query);

		await this._cacheService.delete(`album-likes:${albumId}`);

		if (!result.rows.length) {
			throw new InvariantError("Failed to delete like from album.");
		}
	}

	async verifyUserLike(userId, albumId) {
		const query = {
			text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
			values: [userId, albumId]
		};

		const result = await this._pool.query(query);

		if (result.rowCount > 0) {
			throw new InvariantError("Album is already liked.");
		}
	}
}

module.exports = UserAlbumLikesService;
