#Quantified

##Objectives
The objective of this project is to build a Nodejs library capable of interfacing the mainstream health and fitness trackers and to export their data in a way that is consistent across different brands and devices. This will allow to run data analysis on larger populations of users who are willing to offer access to their personal data, e.g. for medical research.

##Status
The project is in its very early stages. Data extraction is supported only for the Jawbone UP. The design of the cross-device API has not started. 

##Usage

###Command line tools

####Jawbone Up (upcl)
    node ./upcl.js command --email email --password password [--csv jpath]

Returns the raw JSON output of the execution of the _/nudge/api/users/user_xid/band_ API. _command_ is one of: [band](http://eric-blue.com/projects/up-api/#JawboneUPAPI-DetailedActivityData), [sleeps](http://eric-blue.com/projects/up-api/#JawboneUPAPI-SleepSummaryData), [sleepssnapshot](http://eric-blue.com/projects/up-api/#JawboneUPAPI-SleepDetailedData%28Snapshot%29), [workouts](http://eric-blue.com/projects/up-api/#JawboneUPAPI-WorkoutSummaryData) (to be expanded as ready), while _email_ and _password_ are the credentials required to authenticate on the Jawbone servers.

Alternatively, the tool can output to csv format, but in that case it is necessary to specify one point in the original JSON structure that can be 'flattened' to csv. This is achieved by specifying a 'jpath', that is a JSON equivalent to XPath. See the [node-jPath project page](https://github.com/stsvilik/node-jpath) to find out more.

If, for example, the API returned:

    { "meta": { "user_xid": "[removed]", "message":"OK", "code":200, "time":1384158919 },
      "data": { "ticks": [
						   { "value": {
						   		"distance": 27,
						   		"active_time": 27,
						   		"aerobic": false,
						   		"calories": 1.66470658779,
						   		"steps": 41,
						   		"time": 1380588480,
						   		"speed": 1 }
						   },
						   { "value": {
						   		"distance": 3,
						   		"active_time": 2,
						   		"aerobic": false,
						   		"calories": 0.167267397046,
						   		"steps": 4,
						   		"time": 1380588540,
						   		"speed": 1 }
						   },
						   (...)

the jPath path we are interested in is _data.ticks.value_. If we then run:

    node upcl.js band --fromDate 2013-10-01 --toDate 2013-10-31 -e john-appleseed@mac.com -p password --csv data.ticks.value > band.csv

we will be saving a csv file named _band.csv_, with one line being created for every item in 'data.ticks', with one column for every property in the 'value' property of each item. The file contents will look like:

    distance,active_time,aerobic,calories,steps,time,speed
    27,27,,1.66470658779,41,1380588480,1
    3,2,,0.167267397046,4,1380588540,1
    (...)

##Credits

###Jawbone UP
Data extraction from the UP band was made possible thanks to [Eric Blue](https://twitter.com/ericblue)'s pioneering work aimed at studying the communication protocol between the UP mobile app and the Jawbone servers, described in his [blog post](http://eric-blue.com/2011/11/28/jawbone-up-api-discovery/) dated 28/11/2011. 

Almost two years later and to the best of my knowledge, the protocol documented by Eric is still the only way UP users can own the entire detailed dataset produced by the device, as Jawbone only offers aggregated data for download. Alternatively, you need to develop a custom UP application, that is beyond most users' reach.

I re-iterate the same recommendation Eric made then: as this API isn’t officially supported and appears to be used only by Jawbone's app, please use it sparingly (no excessive requests) and don’t do anything that would violate a TOS/AUP. Use at your own risk. 