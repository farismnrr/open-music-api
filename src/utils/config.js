require("dotenv").config();
const path = require("path");

const config = {
	server: {
		host: process.env.HOST,
		port: process.env.PORT
	},
	storage: {
		location: path.resolve(__dirname, "../api/uploads/file/images")
	},
	rabbitmq: {
		server: process.env.RABBITMQ_SERVER
	},
	redis: {
		server: process.env.REDIS_SERVER
	},
	jwt: {
		secret: process.env.ACCESS_TOKEN_KEY,
		age: process.env.ACCESS_TOKEN_AGE
	}
};

module.exports = config;
