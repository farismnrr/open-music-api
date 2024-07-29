const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapCollaborationModel } = require("../../utils/index");
const { NotFoundError } = require("../../exceptions/NotFoundError");
const { InvariantError } = require("../../exceptions/InvariantError");

class CollaborationsService {
	constructor() {
		this._pool = new Pool();
	}

	async addCollaboration(playlistId, userId) {
		const id = `collaboration-${nanoid(16)}`;
		const userQuery = {
			text: "SELECT * FROM users where id = $1",
			values: [userId]
		};

		const user = await this._pool.query(userQuery);
		if (!user.rowCount) {
			throw new NotFoundError("User not found.");
		}

		const createdAt = new Date().toISOString();
		const query = {
			text: "INSERT INTO collaborations VALUES($1, $2, $3, $4, $4) RETURNING id",
			values: [id, playlistId, userId, createdAt]
		};

		const result = await this._pool.query(query);

		return result.rows[0].id;
	}

	async deleteCollaboration(playlistId, userId) {
		const query = {
			text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
			values: [playlistId, userId]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to delete collaboration.");
		}
	}

	async verifyCollaborator(playlistId, userId) {
		const query = {
			text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
			values: [playlistId, userId]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to verify collaboration.");
		}
	}
}

module.exports = CollaborationsService;
