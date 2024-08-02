const path = require("path");

const config = {
	app: {
		host: process.env.HOST,
		port: process.env.PORT
	},
	storage: {
		location: path.resolve(__dirname, "../../assets/uploads/images")
	},
	rabbitMq: {
		server: process.env.RABBITMQ_SERVER
	},
	redis: {
		host: process.env.REDIS_SERVER
	}
};

module.exports = config;
