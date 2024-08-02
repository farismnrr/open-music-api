exports.up = pgm => {
	pgm.createTable("albums", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		name: {
			type: "VARCHAR(100)",
			notNull: true
		},
		year: {
			type: "INTEGER",
			notNull: true
		},
		cover: {
			type: "VARCHAR(100)",
			default: null
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
	pgm.dropTable("albums");
	pgm.dropColumn("albums", "cover");
};
