exports.up = pgm => {
	pgm.createTable("playlist_songs", {
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
		song_id: {
			type: "VARCHAR(50)",
			references: '"songs"',
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
		"playlist_songs",
		"unique_playlist_id_and_song_id",
		"UNIQUE(playlist_id, song_id)"
	);
};

exports.down = pgm => {
	pgm.dropTable("playlist_songs");
};
