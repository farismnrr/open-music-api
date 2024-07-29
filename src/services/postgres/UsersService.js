const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const { AuthenticationError } = require("../../exceptions/AuthError");
const { InvariantError } = require("../../exceptions/InvariantError");
const { mapUserModel } = require("../../utils/index");

class UsersService {
	constructor() {
		this._pool = new Pool();
	}

	async addUser({ username, password, fullname }) {
		await this.verifyUsername(username);

		const id = `user-${nanoid(16)}`;
		const hashedPassword = await bcrypt.hash(password, 12);

		const query = {
			text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname",
			values: [id, username, hashedPassword, fullname]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new InvariantError("Failed to add user.");
		}

		const user = mapUserModel(result.rows[0]);

		return user.id;
	}

	async verifyUsername(username) {
		const query = {
			text: "SELECT username FROM users WHERE username = $1",
			values: [username]
		};

		const result = await this._pool.query(query);

		if (result.rowCount > 0) {
			throw new InvariantError("Failed to add user. Username already used.");
		}
	}

	async verifyUserCredential(username, password) {
		const query = {
			text: "SELECT id, password FROM users WHERE username = $1",
			values: [username]
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new AuthenticationError("Your credential is wrong");
		}

		const user = mapUserModel(result.rows[0]);
		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			throw new AuthenticationError("Your credential is wrong");
		}

		return user.id;
	}
}

module.exports = UsersService;
