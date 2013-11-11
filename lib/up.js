/*
 * Node.js implementation of the Jawbone UP communication protocol between
 * the mobile apps and the Jawbone server, as documented by 
 * http://eric-blue.com/projects/up-api/
 */

var async = require("async"),
	request = require("request"),
	_ = require("underscore");

exports.Up = function (email, password, callback) {

	var	xid, 
		token;

	// detailed activity data
	var band = function (startTime, endTime, callback) {
		request.get(
			{ uri: "https://jawbone.com/nudge/api/users/" + xid + "/band", 
			  qs: { 'start_time': parseInt(startTime / 1000), 'end_time': parseInt(endTime / 1000) },
			  headers: { 'x-nudge-token': token },
			  json: true, },
			function (err, response, body) { callback(err, body); }
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
			function (err, response, body) { callback(err, body); }
		);
	}

	// sleep detail
	var sleepsdetail = function (startTime, endTime, callback) {
		sleeps(startTime, endTime, function (err, summaries) {
			async.reduce(
				_.map(summaries.data.items, function (s) { return s.xid; }),
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
										return memo.concat([ t ]);
									} else {
										return memo;
									}
								},
								[ ]); 
							callback(err, memo.concat(body));
						}
					);
				},
				function (err, result) {
					// The line below is commented as a workaround to an issue 
					// of node-jpath described at 
					// https://github.com/stsvilik/node-jpath/issues/1 . The 
					// callback(err, { data: result });
					callback(err, result);
				});
		});
	}

	// sleep summary
	var workouts = function (startTime, endTime, callback) {
		request.get(
			{ uri: "https://jawbone.com/nudge/api/users/" + xid + "/workouts", 
			  qs: { 'start_time': parseInt(startTime / 1000), 
			  		'end_time': parseInt(endTime / 1000),
			  		'limit': 100 },
			  headers: { 'x-nudge-token': token },
			  json: true, },
			function (err, response, body) {
				/* this was when data transformation was still managed here 
				body = _.reduce(
					body.data.items, 
					function (memo, t) { 
						// TODO: complete studying the response format for
						// more variables worth keeping
						t.details.title = t.title;
						t.details.workout_xid = t.xid;
						t.details.time_created = formatDateForR(new Date(t.time_created * 1000));
						// time_completed is redundant as it is time_created + time
						t.details.time_completed = formatDateForR(new Date(t.time_completed * 1000));
						return memo.concat(t.details); 
					},
					[ ]); */
				callback(err, body);
			}
		);
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
	    		sleepsdetail: sleepsdetail,
	    		workouts: workouts,
	    	});
		}
	);

};