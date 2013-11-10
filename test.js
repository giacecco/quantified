var argv = require('optimist') 
		.usage('Usage: $0 --email email --password password]')
		.demand([ 'email', 'password' ])
		.alias('email', 'e')
		.alias('password', 'p')
		.argv,
	UPSession = require("./UPSession").UPSession;

new UPSession(argv.email, argv.password, function (err, s) {
	s.band(1382885000, 1383487651, function (err, body) {
		console.log(body);
	})
});
