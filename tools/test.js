var argv = require('optimist') 
		.usage('Usage: $0 command --email email --password password --out filename')
		.demand([ 'email', 'password', 'out' ])
		.alias('email', 'e')
		.alias('password', 'p')
		.alias('out', 'o')
		.argv,
	csv = require("csv"),
	_ = require("underscore"),
	UPSession = require("../lib/UPSession").UPSession;


var saveToCsv = function (filename, items, callback) {
	csv()
        .from.array(
            items, 
            { columns: true })
        .to.options({ columns: _.keys(items[0]), header: true })
        .to.path(filename)
        .on('error', function (err) {
			if (callback) callback(err);
		})
        .on('end', function (count) {
			if (callback) callback(err);
        });
}

var command = (argv._[0] || "").toLowerCase();
new UPSession(argv.email, argv.password, function (err, s) {
	switch (command) {
		case 'band':
			s.band(1382885000, 1383487651, function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		default:
			console.log("Command not recognised.");
			break;
	};
});
