exports.up = pgm => {
	pgm.createTable("songs", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true
		},
		title: {
			type: "VARCHAR(100)",
			notNull: true
		},
		year: {
			type: "INTEGER",
			notNull: true
		},
		genre: {
			type: "VARCHAR(50)",
			notNull: true
		},
		performer: {
			type: "VARCHAR(100)",
			notNull: true
		},
		duration: {
			type: "INTEGER"
		},
		album_id: {
			type: "VARCHAR(50)",
			references: '"albums"',
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
	pgm.dropTable("songs");
};
