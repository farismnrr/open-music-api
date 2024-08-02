exports.up = pgm => {
	pgm.addColumn("albums", {
		cover: {
			type: "VARCHAR(100)",
			default: null
		}
	});
};

exports.down = pgm => {
	pgm.dropColumn("albums", "cover_url");
};
