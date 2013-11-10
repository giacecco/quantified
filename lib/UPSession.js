/*
 * Node.js implementation of the Jawbone UP communication protocol between
 * the mobile apps and the Jawbone server, as documented by 
 * http://eric-blue.com/projects/up-api/
 */

var async = require("async"),
	request = require("request"),
	_ = require("underscore");

var formatDateForR = function (d) {
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

exports.UPSession = function (email, password, callback) {

	var	xid, 
		token;

	// detailed activity data
	var band = function (startTime, endTime, callback) {
		request.get(
			{ uri: "https://jawbone.com/nudge/api/users/" + xid + "/band", 
			  qs: { 'start_time': parseInt(startTime / 1000), 'end_time': parseInt(endTime / 1000) },
			  headers: { 'x-nudge-token': token },
			  json: true, },
			function (err, response, body) {
				body = _.reduce(
					body.data.ticks, 
					function (memo, t) { 
						t.value.time = formatDateForR(new Date(t.value.time * 1000));
						t.value.time_offset = (t.value.time_offset || 0) * 1000;
						return memo.concat(t.value); 
					},
					[ ]);
				callback(err, body);
			}
		);
	}

	// sleep summary
	var sleeps = function (startTime, endTime, callback) {
		request.get(
			{ uri: "https://jawbone.com/nudge/api/users/" + xid + "/sleeps", 
			  qs: { 'start_time': parseInt(startTime / 1000), 
			  		'end_time': parseInt(endTime / 1000),
			  		'limit': 100 },
			  headers: { 'x-nudge-token': token },
			  json: true, },
			function (err, response, body) {
				body = _.reduce(
					body.data.items, 
					function (memo, t) { 
						if ((t.details.light == 0) && (t.details.deep == 0) 
							&& (t.details.awake == 0) && (t.details.quality == 0)) {
								// if I am here, sleep was logged manually
								t.details.awakenings = null; 
								t.details.body = null;
								t.details.mind = null;
								t.details.rem = null;
								t.details.light = null;
								t.details.deep = null;
								t.details.awake = null;
								t.details.quality = null;
								t.details.smart_alarm_fire = null;
						}
						t.details.smart_alarm_fire = t.details.smart_alarm_fire ? formatDateForR(new Date(t.details.smart_alarm_fire * 1000)) : null;
						if (t.details.asleep_time)
							t.details.asleep_time = formatDateForR(new Date(t.details.asleep_time * 1000));
						if (t.details.awake_time)
							t.details.awake_time = formatDateForR(new Date(t.details.awake_time * 1000));
						return memo.concat(t.details); 
					},
					[ ]);
				callback(err, body);
			}
		);
	}

	// sleep detail
	var sleepsSnapshot = function (startTime, endTime, callback) {
		sleeps(startTime, endTime, function (err, summaries) {
			async.reduce(
				_.map(summaries, function (s) { return s.sleep_xid; }), 
				[ ],
				function (memo, sleepXid, callback) {
					request.get(
						{ uri: "https://jawbone.com/nudge/api/sleeps/" + sleepXid + "/snapshot", 
						  headers: { 'x-nudge-token': token },
						  json: true, },
						function (err, response, body) {
							body = _.reduce(
								body.data, 
								function (memo, t) { 
									var time = new Date(t[0] * 1000);
									if ((startTime <= time) && (time <= endTime)) {
										return memo.concat({ 
											time: formatDateForR(time), 
											state: t[1] 
										});
									}
									return memo;
								},
								[ ]);
							callback(err, memo.concat(body));
						}
					);
				},
				function (err, result) {
					callback(err, result);
				});
		});
	}

	request.post(
		{ uri: "https://jawbone.com/user/signin/login", 
		  form: { email: email, 
			  	  pwd: password,
				  service: 'nudge' } },
	    function (err, response, body) {
	    	body = JSON.parse(body);
	    	xid = body.user.xid;
	    	token = body.token;
	    	callback(null, {
	    		band: band,
	    		sleeps: sleeps,
	    		sleepsSnapshot: sleepsSnapshot,
	    	});
		}
	);

};