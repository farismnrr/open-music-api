const amqp = require("amqplib");
const PlaylistsService = require("./PlaylistsService");
const MailSender = require("./MailSender");
const Listener = require("./Listener");
const config = require("../utils/config");

const startServer = async () => {
	const mailSender = new MailSender();
	const playlistsService = new PlaylistsService();
	const listener = new Listener(playlistsService, mailSender);

	const connection = await amqp.connect(config.rabbitmq.server);
	const channel = await connection.createChannel();

	await channel.assertQueue("export:playlists", {
		durable: true
	});

	channel.consume("export:playlists", listener.listen, { noAck: true });
};

startServer();
