exports.up = pgm => {
	pgm.createTable("user_album_likes", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		user_id: {
			type: "VARCHAR(50)",
			references: '"users"',
			notNull: true,
			onDelete: "CASCADE",
			onUpdate: "CASCADE"
		},
		album_id: {
			type: "VARCHAR(50)",
			references: '"albums"',
			notNull: true,
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
	pgm.dropTable("user_album_likes");
};
