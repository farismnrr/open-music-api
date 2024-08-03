const { Pool } = require("pg");
const { InvariantError } = require("../../exceptions/InvariantError");

class AuthenticationsService {
	constructor() {
		this._pool = new Pool();
	}

	async addRefreshToken(token) {
		const authenticationQuery = {
			text: "INSERT INTO authentications VALUES($1)",
			values: [token]
		};

		const authenticationResult = await this._pool.query(authenticationQuery);
		if (!authenticationResult.rowCount) {
			throw new InvariantError("Gagal menambahkan token refresh");
		}
	}

	async verifyRefreshToken(token) {
		const authenticationQuery = {
			text: "SELECT token FROM authentications WHERE token = $1",
			values: [token]
		};

		const authenticationResult = await this._pool.query(authenticationQuery);
		if (!authenticationResult.rowCount) {
			throw new InvariantError("Refresh token tidak valid");
		}
	}

	async deleteRefreshToken(token) {
		const authenticationQuery = {
			text: "DELETE FROM authentications WHERE token = $1",
			values: [token]
		};

		const authenticationResult = await this._pool.query(authenticationQuery);
		if (!authenticationResult.rowCount) {
			throw new InvariantError("Refresh token tidak valid");
		}
	}
}

module.exports = AuthenticationsService;
