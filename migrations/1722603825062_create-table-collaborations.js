exports.up = pgm => {
	pgm.createTable("collaborations", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		playlist_id: {
			type: "VARCHAR(50)",
			references: '"playlists"',
			onDelete: "CASCADE",
			onUpdate: "CASCADE"
		},
		user_id: {
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

	pgm.addConstraint(
		"collaborations",
		"unique_playlist_id_and_user_id",
		"UNIQUE(playlist_id, user_id)"
	);
};

exports.down = pgm => {
	pgm.dropTable("collaborations");
};
