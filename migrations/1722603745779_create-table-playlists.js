exports.up = pgm => {
	pgm.createTable("playlists", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		name: {
			type: "VARCHAR(100)",
			notNull: true
		},
		owner: {
			type: "VARCHAR(50)",
			references: '"users"',
			onDelete: "CASCADE",
			onUpdate: "CASCADE"
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
	pgm.dropTable("playlists");
};
