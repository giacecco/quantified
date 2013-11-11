var DEFAULT_TIME_WINDOW = 7; // days

var argv = require('optimist') 
		.usage('Usage: $0 command --email email --password password [--csv jpath]')
		.demand([ 'email', 'password' ])
		.alias('csv', 'c')
		.alias('email', 'e')
		.alias('password', 'p')
		.argv,
	csv = require("csv"),
	jpath = require("node-jpath"),
	_ = require("underscore"),
	UPSession = require("../lib/up").Up;


var toCsv = function (items, callback) {
	if (items.length == 0) {
		if (callback) callback(err, "");
	} else {
		csv()
	        .from.array(
	            items, 
	            { columns: true })
	        .to.options({ columns: _.keys(items[0]), header: true })
	        .to.string(function (data, count) {
				if (callback) callback(null, data)	        	
	        });
    }
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
			s.band(fromDate.valueOf(), toDate.valueOf(), function (err, result) {
				if (!argv.csv) {
					console.log(JSON.stringify(result));
				} else {
					toCsv(jpath.filter(result, argv.csv), function (err, csv) {
						console.log(csv);
					});
				}
			});
			break;
		case 'sleeps':
			var toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
				fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000);
			s.sleeps(fromDate.valueOf(), toDate.valueOf(), function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		case 'sleepssnapshot':
			var toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
				fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000);
			s.sleepsSnapshot(fromDate.valueOf(), toDate.valueOf(), function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		case 'workouts':
			var toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
				fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000);
			s.workouts(fromDate.valueOf(), toDate.valueOf(), function (err, items) {
				saveToCsv(argv.out, items);
			});
			break;
		default:
			console.log("Command not recognised.");
			break;
	};
});
