exports.up = pgm => {
	pgm.createTable("users", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		username: {
			type: "VARCHAR(20)",
			unique: true,
			notNull: true
		},
		password: {
			type: "VARCHAR(128)",
			notNull: true
		},
		fullname: {
			type: "VARCHAR(100)",
			notNull: true
		},
		created_at: {
			type: "TIMESTAMP",
			notNull: true,
			default: pgm.func("current_timestamp")
		},
		updated_at: {
			type: "TIMESTAMP",
			notNull: true,
			default: pgm.func("current_timestamp")
		}
	});
};

exports.down = pgm => {
	pgm.dropTable("users");
};
