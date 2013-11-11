var DEFAULT_TIME_WINDOW = 7; // days

var RFRIENDLY_TRASFORMATIONS = {

	band: {
		'jpath': 'data.ticks.value',
		'transformation': function (item) {
			item.time = DateToRDate(new Date(item.time * 1000));
			item.time_offset = (item.time_offset || 0) * 1000;
			return item; 
		},
	},

	sleeps: {
		'jpath': 'data.items.details',
		'transformation': function (item) {
			if ((item.light == 0) && (item.deep == 0) 
				&& (item.awake == 0) && (item.quality == 0)) {
					// if I am here, sleep was logged manually
					item.awakenings = null; 
					item.body = null;
					item.mind = null;
					item.rem = null;
					item.light = null;
					item.deep = null;
					item.awake = null;
					item.quality = null;
					item.smart_alarm_fire = null;
			}
			item.smart_alarm_fire = item.smart_alarm_fire ? DateToRDate(new Date(item.smart_alarm_fire * 1000)) : null;
			if (item.asleep_time)
				item.asleep_time = DateToRDate(new Date(item.asleep_time * 1000));
			if (item.awake_time)
				item.awake_time = DateToRDate(new Date(item.awake_time * 1000));
			return item; 
		},
	},

	sleepsdetail: {
		// The line below is commented as a workaround to an issue 
		// of node-jpath described at 
		// https://github.com/stsvilik/node-jpath/issues/1 . The 
		// callback(err, { data: result });
		// 'jpath': 'data',
		'jpath': undefined,
		'transformation': function (item) {
			return { time: DateToRDate(new Date(item[0] * 1000)), state: ['awake', 'deep', 'light'][item[1] - 1] };
		}
	},

}

var DateToRDate = function (d) {
	return d.getFullYear() + 
		   "-" +
		   ("0" + (d.getMonth() + 1)).slice(-2) + 
		   "-" +
		   ("0" + d.getDate()).slice(-2) + 
		   " " +
		   ("0" + d.getHours()).slice(-2) + 
		   ":" +
		   ("0" + d.getMinutes()).slice(-2) + 
		   ":" +
		   ("0" + d.getSeconds()).slice(-2);
}

var RDateToDate = function (s) {
	var d = s.split(" ")
		t = d[1];
	d = d[0].split("-"); 
	return new Date(d[0] + "/" + d[1] + "/" + d[2] + " " + t); 
}

var toCsv = function (items, callback) {
	if (items.length == 0) {
		if (callback) callback(null, "");
	} else {
		csv()
	        .from.array(items)
	        .to.options({ columns: _.keys(items[0]), header: true })
	        .to.string(function (data, count) {
				if (callback) callback(null, data)	        	
	        });
    }
}

var print = function (err, result, callback) {
	if (argv.jpath) result = jpath.filter(result, argv.jpath);
	if (!argv.csv) {
		console.log(JSON.stringify(result));
		if (callback) callback(null);
	} else {
		toCsv(_.map(result, transformation), function (err, csv) { 
			console.log(csv);
			if (callback) callback(null); 
		});
	}
}

var argv = require('optimist') 
		.usage('Usage: $0 command --email email --password password [--jpath jpath] [--csv] [--rfriendly]')
		.demand([ 'email', 'password' ])
		.alias('csv', 'c')
		.alias('email', 'e')
		.alias('jpath', 'j')
		.alias('password', 'p')
		.alias('rfriendly', 'r')
		.argv,
	csv = require("csv"),
	jpath = require("node-jpath"),
	_ = require("underscore"),
	UPSession = require("../lib/up").Up;

var command = _.contains(['band', 'sleeps', 'sleepsdetail', 'workouts'], (argv._[0].toLowerCase() || "")) ? argv._[0].toLowerCase() : undefined,
	toDate = argv.toDate ? RDateToDate(argv.toDate + " 23:59:59") : new Date(),
	fromDate = argv.fromDate ? RDateToDate(argv.fromDate + " 0:00:00") : new Date(toDate - DEFAULT_TIME_WINDOW * 86400000),
	transformation = function (item) { return item; }; // the default transformation function

if ((command != "") && argv.rfriendly) {
	argv.csv = true;
	argv.jpath = RFRIENDLY_TRASFORMATIONS[command].jpath;
	transformation = RFRIENDLY_TRASFORMATIONS[command].transformation || transformation;
}

if(command) {
	new UPSession(argv.email, argv.password, function (err, session) {
		session[command](fromDate.valueOf(), toDate.valueOf(), function (err, result) {
			print(err, result);
		});
	});
} else {
	console.log("Command not recognised.");
}
