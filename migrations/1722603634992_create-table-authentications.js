exports.up = pgm => {
	pgm.createTable("authentications", {
		token: {
			type: "TEXT",
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
	pgm.dropTable("authentications");
};
