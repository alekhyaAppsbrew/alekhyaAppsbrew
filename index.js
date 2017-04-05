



var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  oauth2 : {
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl : 'https://login.salesforce.com',
    clientId : '3MVG9i1HRpGLXp.qcWt66xy9NSh6DuRCzjRetpKK.0qC9VobxcxY5xsuRfzuGk7dsTfl0OuSMEOHvFMQpwtoG ',
    clientSecret : '564223176942651198',
    redirectUri : 'https://login.salesforce.com/services/oauth2/success'
  }
});
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