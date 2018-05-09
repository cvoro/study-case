var express = require('express');
var router = express.Router();
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

router.get('/', (req, res, next)=> {
    res.send('index page')
})

router.get('/token', (request, response) => {
    console.log('alooooooooooooooooooooooooo');
    
    var identity = randomName();
  
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    var token = new AccessToken(
      'AC3eab34b392fea8541b274dd8e0376d78',
      'SK5e209eb720a631e07da00b9ba9139996',
      'Pm5ci3qL3wwQBKZdZy4fBnMEb7xNHMjZ'
    );
  
    // Assign the generated identity to the token.
    token.identity = identity;
  
    // Grant the access token Twilio Video capabilities.
    var grant = new VideoGrant();
    token.addGrant(grant);
  
    // Serialize the token to a JWT string and include it in a JSON response.
    response.send({
      "identity": identity,
      "token": token.toJwt()
    });
  });

  router.get('/server/api/token', (request, response) => {
    console.log('alooooooooooooooooooooooooo');
    // var identity = randomName();
  
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    var token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET
    );
  
    // Assign the generated identity to the token.
    token.identity = identity;
  
    // Grant the access token Twilio Video capabilities.
    var grant = new VideoGrant();
    token.addGrant(grant);
  
    // Serialize the token to a JWT string and include it in a JSON response.
    response.send({
      "identity": identity,
      "token": token.toJwt()
    });
  });



module.exports = router;