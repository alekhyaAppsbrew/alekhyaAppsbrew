
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

// Include Body-Parser
var bodyParser = require('body-parser');

// Declare a inputsFromDb
var inputsFromDb={};

// User Details
var id;
var app;
var instanceName;
var instanceType;
var instanceUrl;
var acessToken;
var refreshToken;



// Include the jsforce package 
var jsforce = require('jsforce');

// specify the folder for views
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


// Path for css
app.use(express.static(__dirname + '/views'));

// Add body-parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


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

// Connection
app.get('/connection', function (req, res)
{
    res.render('connection.html');
});

// callback
app.get('/callback', function (req, res)
{
    res.render('callback.html');
});

// userDb
app.post('/userDb', function (req, res)
{
	var object=req.body;
	console.log(req.body.refreshToken+"refreshToken");
	acessToken=object.accessToken;
	refreshToken=object.refreshToken;
	instanceUrl=object.instanceUrl;
    // Insert the user details in PostgressDb
	// instance,usernamesignup,emailsignup
	var pg = require('pg');
    //or native libpq bindings
    //var pg = require('pg').native
	
	
	/**
	   var id;
var app;
var instanceName;
var instanceType;
var instanceUrl;
var acessToken;
var refreshToken;
	
	**/

    var conString = process.env.ELEPHANTSQL_URL || "postgres://zzlbzdoi:zfQnIJMTForgzLtojNWFkbVK05iuVpxx@stampy.db.elephantsql.com:5432/zzlbzdoi";

    var client = new pg.Client(conString);
	var client = new pg.Client(conString);
    client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    //client.query('INSERT into InstanceRegistration (id, Application, Instance_Name,Instance_Type,instance_URL,Access_Token,Refresh_Token) VALUES(id, app, instanceName,instanceType,instanceUrl,acessToken,refreshToken)', function(err, result) {
      /**CREATE TABLE InstanceRegistration(
   id VARCHAR UNIQUE NOT NULL,
   Application VARCHAR    NOT NULL,
   Instance_Name  VARCHAR  UNIQUE   NOT NULL,
   Instance_Type VARCHAR        ,
   instance_URL   VARCHAR  ,
    Access_Token  VARCHAR,
   Refresh_Token VARCHAR
)**/
    client.query('CREATE TABLE IF NOT EXISTS InstanceRegistration1(id VARCHAR(50) UNIQUE NOT NULL,Application VARCHAR(50) NOT NULL,Instance_Name  VARCHAR(50)  UNIQUE   NOT NULL,Instance_Type VARCHAR(50),instance_URL   VARCHAR(50) ,Access_Token  VARCHAR(50),Refresh_Token VARCHAR(50))', function(err, result) {
	  if(err) {
        return console.error('error running query', err);
      }
      console.log("Table Created");
	  var queryString='INSERT into InstanceRegistration1 (id, Application, Instance_Name,Instance_Type,instance_URL,Access_Token,Refresh_Token) VALUES('+"'"+id+"','"+ app+"','"+ instanceName+"','"+instanceType+"','"+instanceUrl+"','"+acessToken+"','"+refreshToken+"')";
	  console.log(queryString+"queryString");
	 /** client.query(queryString, function(err, result) {
		 
		     if(err) {
               return console.error('error running query', err);
             }
			  console.log("Row inserted");
			  client.end();
			  
		  
	    
	  });**/
      
    });
  });
	
	
	
});	

// registration
app.get('/registration', function (req, res)
{
    res.render('index2.html');
});

// Inputs from registeration
app.post('/inputsFromRegisteration', function (req, res)
{
 
    //res.writeHead(200, {'Content-Type': 'text/html'});
	
	id=req.body.emailsignup;
	app="SFDC";
	instanceName=req.body.usernamesignup;
	
	

    // Check for SF instance	
	if(req.body.instance=="production")
	{
		instanceType="production";
		console.log("Production");
		
        res.render('connection.html');
	}
	else if(req.body.instance=="test")
	{
		instanceType="test" ;
		console.log("Test")
		res.render('connection.html');
	}
    console.log(req.body);
	// instance,usernamesignup,emailsignup
	var pg = require('pg');
    //or native libpq bindings
    //var pg = require('pg').native

    var conString = process.env.ELEPHANTSQL_URL || "postgres://zzlbzdoi:zfQnIJMTForgzLtojNWFkbVK05iuVpxx@stampy.db.elephantsql.com:5432/zzlbzdoi";

    var client = new pg.Client(conString);
    client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
  
});

// Create a http server and listen to port-3000
http.createServer(app).listen(8000, "0.0.0.0", function(){
	
  console.log('Express server listening on port ' + 8000);
});





