const AuthHandler = require("./handler");
const routes = require("./routes");

module.exports = {
	name: "authentications",
	version: "1.0.0",
	register: async (server, { validator, authService, userService, tokenManager }) => {
		const authHandler = new AuthHandler(validator, authService, userService, tokenManager);
		server.route(routes(authHandler));
	}
};
