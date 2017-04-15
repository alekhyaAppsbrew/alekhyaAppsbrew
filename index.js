
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

// Declare a inputsFromDb
var inputsFromDb={};



// Include the jsforce package 
var jsforce = require('jsforce');

// specify the folder for views
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


/** Insert all the static inputs
    in MongoDb
 **/
 // Include all the packages required for MongoDb
 var mongoose = require('mongoose');
 mongoose.connect('mongodb://localhost/27017');
 var db = mongoose.connection;
 
 // If there is an error in the connection,console the same
 db.on('error', console.error.bind(console, 'connection error:'));
 
 // Once the connection is established
 db.once('open', function() {
   // Create a schema for inputs
   var inputsSchema = mongoose.Schema({
                      loginUrl     : String,
                      clientId     : String,
                      clientSecret : String,
                      redirectUri  : String,
                      userName     : String,
                      password     : String

  });
  
  var inputs = mongoose.model('inputs', inputsSchema);
  
  // Insert the static inputs
  var input = new inputs({
                  loginUrl    :"https://login.salesforce.com",
                  clientId    : "3MVG9i1HRpGLXp.qcWt66xy9NSh6DuRCzjRetpKK.0qC9VobxcxY5xsuRfzuGk7dsTfl0OuSMEOHvFMQpwtoG ",
                  clientSecret: "564223176942651198",
                  redirectUri : 'https://localhost:3000/oauth2/callbacks',
                  userName    : 'mani@appsbrew.com',
                  password    : 'Welcome123'
				  
   });

   //Saving the model instance to the DB
   input.save(function(err){
    if ( err ) throw err;
  
    // Once the input is saved
    // get the user mani@appsbrew.com
    inputs.findOne({ userName: 'mani@appsbrew.com' }, function(err, row) {
                                                     if (err) throw err;
                                                     // Assign the query result to inputsFromDb
													 inputsFromDb = row;
                                                     console.log(inputsFromDb);
    });
  });
});


// Prepare the oauth2 object
var oauth2 = new jsforce.OAuth2({
  loginUrl : inputsFromDb.loginUrl,
  // Client-id,clientSecret is provided during app connfiguration
  clientId : inputsFromDb.clientId,
  clientSecret : inputsFromDb.clientSecret,
  // redirectUri is the url that must be given,
  // so that after login,we get redirected to this url and 
  // query accordingly
  redirectUri : inputsFromDb.redirectUri
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
conn.login("mani@appsbrew.com", "Welcome123Z3qaZ1Ykz6UeHxjoaXFDRQFPW", function(err, userInfo) {
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

// Connection
app.get('/connection', function (req, res)
{
    res.render('connection.html');
});

// Create a http server and listen to port-3000
http.createServer(app).listen(8000, "0.0.0.0", function(){
  console.log('Express server listening on port ' + 3000);
});





