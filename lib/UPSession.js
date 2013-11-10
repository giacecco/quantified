/*
 * Node.js implementation of the Jawbone UP communication protocol between
 * the mobile apps and the Jawbone server, as documented by 
 * http://eric-blue.com/projects/up-api/
 */

var request = require("request"),
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

	var band = function (startTime, endTime, callback) {
		request.get(
			{ uri: "https://jawbone.com/nudge/api/users/" + xid + "/band", 
			  qs: { 'start_time': startTime, 'end_time': endTime },
			  headers: { 'x-nudge-token': token },
			  json: true, },
			function (err, response, body) {
				body = _.reduce(
					body.data.ticks, 
					function (memo, t) { 
						t.value.time = formatDateForR(new Date(t.value.time * 1000));
						return memo.concat(t.value); 
					},
					[ ]);
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
	    	});
		}
	);

};