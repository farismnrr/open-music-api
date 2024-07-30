const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { mapCollaborationModel } = require("../../utils");
const { InvariantError } = require("../../exceptions/InvariantError");
const { NotFoundError } = require("../../exceptions/NotFoundError");

class CollaborationsService {
	constructor() {
		this._pool = new Pool();
	}

	async addCollaboration(playlistId, userId) {
		const id = `collaboration-${nanoid()}`;
		const userQuery = {
			text: "SELECT id FROM users where id = $1",
			values: [userId]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("User tidak ditemukan.");
		}

		const collaborationQuery = {
			text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
			values: [id, playlistId, userId]
		};

		const collaborationResult = await this._pool.query(collaborationQuery);
		if (!collaborationResult.rowCount) {
			throw new InvariantError("Gagal menambahkan collaboration.");
		}

		return mapCollaborationModel(collaborationResult.rows[0]).id;
	}

	async deleteCollaboration(playlistId, userId) {
		const collaborationQuery = {
			text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
			values: [playlistId, userId]
		};

		const collaborationResult = await this._pool.query(collaborationQuery);
		if (!collaborationResult.rowCount) {
			throw new InvariantError("Gagal menghapus collaboration.");
		}
	}

	async verifyCollaborator(playlistId, userId) {
		const collaborationQuery = {
			text: "SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
			values: [playlistId, userId]
		};

		const collaborationResult = await this._pool.query(collaborationQuery);
		if (!collaborationResult.rowCount) {
			throw new InvariantError("Gagal memverifikasi collaboration.");
		}
	}
}

module.exports = CollaborationsService;
