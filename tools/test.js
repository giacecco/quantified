var DEFAULT_TIME_WINDOW = 7; // days

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

var RDateToDate = function (s) {
	var d = s.split(" ")
		t = d[1];
	d = d[0].split("-"); 
	return new Date(d[0] + "/" + d[1] + "/" + d[2] + " " + t); 
}

var command = (argv._[0] || "").toLowerCase();
new UPSession(argv.email, argv.password, function (err, s) {
	switch (command) {
		case 'band':
			var toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
				fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000);
			s.band(fromDate.valueOf(), toDate.valueOf(), function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		case 'sleeps':
			var toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
				fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000);
			s.sleeps(fromDate.valueOf(), toDate.valueOf(), function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		default:
			console.log("Command not recognised.");
			break;
	};
});
