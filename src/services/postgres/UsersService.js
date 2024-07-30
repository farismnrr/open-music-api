const bcrypt = require("bcrypt");

const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapUserModel } = require("../../utils/index");
const { InvariantError } = require("../../exceptions/InvariantError");
const { AuthenticationError } = require("../../exceptions/AuthError");

class UsersService {
	constructor() {
		this._pool = new Pool();
	}

	async addUser({ username, password, fullname }) {
		await this.verifyUsername(username);

		const id = `user-${nanoid()}`;
		const hashedPassword = await bcrypt.hash(password, 12);
		const userQuery = {
			text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id",
			values: [id, username, hashedPassword, fullname]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new InvariantError("Gagal menambahkan user.");
		}

		return mapUserModel(userResult.rows[0]).id;
	}

	async verifyUsername(username) {
		const userQuery = {
			text: "SELECT username FROM users WHERE username = $1",
			values: [username]
		};

		const userResult = await this._pool.query(userQuery);
		if (userResult.rowCount) {
			throw new InvariantError("Gagal menambahkan user. Username sudah digunakan.");
		}
	}

	async verifyUserCredential(username, password) {
		const userQuery = {
			text: "SELECT id, password FROM users WHERE username = $1",
			values: [username]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new AuthenticationError("Kredensial yang anda masukan salah");
		}

		const user = mapUserModel(userResult.rows[0]);
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new AuthenticationError("Kredensial yang anda masukan salah");
		}

		return user.id;
	}
}

module.exports = UsersService;
