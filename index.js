
/**
    Purpose : 1.To perform an oauth2 connection
	          2.Refresh the token after token expires
	Input   : 1.clientId(Obtained during the app config)
	          2.clientSecret(Obtained during the app config)
			  3.username
			  4.password
			  5.redirectUri
**/


// For providing the callback URL,we need http,express packages
var http = require('http');
var express = require('express')
var app = express();



// Include the jsforce package 
var jsforce = require('jsforce');

// Prepare the oauth2 object
var oauth2 = new jsforce.OAuth2({
  loginUrl : 'https://login.salesforce.com',
  // Client-id,clientSecret is provided during app connfiguration
  clientId : '3MVG9i1HRpGLXp.qcWt66xy9NSh6DuRCzjRetpKK.0qC9VobxcxY5xsuRfzuGk7dsTfl0OuSMEOHvFMQpwtoG ',
  clientSecret : '564223176942651198',
  // redirectUri is the url that must be given,
  // so that after login,we get redirected to this url and 
  // query accordingly
  redirectUri : 'https://localhost:3000/oauth2/callbacks'
});


// Refreshtoken method
oauth2.refreshToken(oauth2.refreshToken).then(function(ret) {
  var conn = new jsforce.Connection({
     accessToken: ret.access_token,
     instanceUrl: ret.instance_url
  });
});

/** Establish oauth2 connection **/
var conn = new jsforce.Connection({
  oauth2 :oauth2
});

// The instanceUrl must be concatenated to "https://test.salesforce.com",
// to obtain the correct URL
conn.instanceUrl="https://test.salesforce.com"+conn.instanceUrl;


// Provide the user credentials and perform login
conn.login("mani@appsbrew.com", "Welcome123", function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});


// /oauth2/callback is the redirectUri,i.e,
// after log-in,we get redirected to this uri 
// so that we can query
app.get('/oauth2/callback', function (req, res) {
  var records = [];
  conn.query("SELECT Id, Name FROM Account", function(err, result) {
    if (err) { return console.error(err); }
    console.log("total : " + result.totalSize);
    console.log("fetched : " + result.records.length);
  });
});

// Create a http server and listen to port-3000
http.createServer(app).listen(3000, "0.0.0.0", function(){
  console.log('Express server listening on port ' + 3000);
});





