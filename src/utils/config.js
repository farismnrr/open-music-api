require("dotenv").config();
const path = require("path");

const config = {
	server: {
		host: process.env.HOST,
		port: process.env.PORT
	},
	storage: {
		location: path.resolve(__dirname, "../producer/api/uploads/file/images")
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
	},
	mail: {
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		user: process.env.SMTP_USER,
		password: process.env.SMTP_PASSWORD
	}
};

module.exports = config;
