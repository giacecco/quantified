#Quantified

##Objectives
The objective of this project is to build a Nodejs library capable of interfacing the mainstream health and fitness trackers and to export their data in a way that is consistent across different brands and devices. This will allow to run data analysis on larger populations of users who are willing to offer access to their personal data, e.g. for medical research.

##Status
The project is in its very early stages. Data extraction is supported only for the Jawbone UP. The design of the cross-device API has not started. 

##Usage

###Command line tools

####Jawbone Up (upcl)
    node ./upcl.js command --email email --password password [--out filename]

where _command_ is one of: [band](http://eric-blue.com/projects/up-api/#JawboneUPAPI-DetailedActivityData), [sleeps](http://eric-blue.com/projects/up-api/#JawboneUPAPI-SleepSummaryData), [sleepssnapshot](http://eric-blue.com/projects/up-api/#JawboneUPAPI-SleepDetailedData%28Snapshot%29), [workouts](http://eric-blue.com/projects/up-api/#JawboneUPAPI-WorkoutSummaryData) (to be expanded as ready), while _email_ and _password_ are the credentials required to authenticate on the Jawbone servers.

##Credits

###Jawbone UP
Data extraction from the UP band was made possible thanks to [Eric Blue](https://twitter.com/ericblue)'s pioneering work aimed at studying the communication protocol between the UP mobile app and the Jawbone servers, described in his [blog post](http://eric-blue.com/2011/11/28/jawbone-up-api-discovery/) dated 28/11/2011. 

Almost two years later and to the best of my knowledge, the protocol documented by Eric is still the only way UP users can own the entire detailed dataset produced by the device, as Jawbone only offers aggregated data for download. Alternatively, you need to develop a custom UP application, that is beyond most users' reach.

I re-iterate the same recommendation Eric made then: as this API isn’t officially supported and appears to be used only by Jawbone's app, please use it sparingly (no excessive requests) and don’t do anything that would violate a TOS/AUP. Use at your own risk. 