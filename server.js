// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
var app = express();
var io = require('socket.io')(http); 
require('dotenv').load();

var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var api = require('./server/api');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', api);

app.get('*', (req, res)=> {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})

var port  = process.env.PORT || '3000';
app.set('port', port)

  //socketio event listeners
io.on('connection', function(socket){ 
  socket.on('token', function(user){ 
    var identity = 'testUser'

  var token = new AccessToken(
    "AC3eab34b392fea8541b274dd8e0376d78",
    "SK5e209eb720a631e07da00b9ba9139996",
    "Pm5ci3qL3wwQBKZdZy4fBnMEb7xNHMjZ"
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.

    socket.emit('token_received', {
      identity: identity,
      token: token.toJwt()
    })

  });   

});

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
io.listen(server)