#Quantified

##Objectives
The objective of this project is to build a Nodejs library capable of interfacing the mainstream health and fitness trackers and to export their data in a way that is consistent across different brands and devices. This will allow to run data analysis on larger populations of users who are willing to offer access to their personal data, e.g. for medical research.

##Status
The project is in its very early stages. Data extraction is supported only for the Jawbone UP. The design of the device-agnostic API has not started. 

##Credits

###Jawbone UP
Data extraction from the UP band was made possible thanks to [+IvanKutil](https://plus.google.com/u/0/+IvanKutil/posts)'s pioneering work aimed at studying the communication protocol between the UP mobile app and the Jawbone servers, described in [this article](http://eric-blue.com/2011/11/28/jawbone-up-api-discovery/) dated 28/11/2011. 

Almost two years later, the protocol documented by Ivan is still the only way UP users can own the entire detailed dataset produced by the device, as Jawbone only offers aggregated data for download. Alternatively, you need to develop a custom UP application, that is beyond most users' reach.

I re-iterate the same recommendation Ivan made then: as this API isn’t officially supported and appears to be used only by Jawbone's app, please use it sparingly (no excessive requests) and don’t do anything that would violate a TOS/AUP. Use at your own risk. 