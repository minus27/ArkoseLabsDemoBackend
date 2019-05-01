// server.js
// where your node app starts

// init project
//const express = require('express');
//const app = express();
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var request    = require('request');
var cors       = require('cors');
var crypto     = require('crypto');

function checkToken(token) {
  if (!token) {
    return "Token Missing";
  }
  if (!(/^\d{10,11}_[a-f0-9]{40}$/.test(token))) {
    return "Token Improperly Formated";
  }
  var tokenPieces = token.split("_");
  var currentTime = new Date() / 1000;
  var signature = crypto.createHmac('sha1', process.env.SECRET).update(tokenPieces[0]).digest('hex');
  if (tokenPieces[1]!=signature) {
    return "Token Invalid";
  }
  if (currentTime > parseInt(tokenPieces[0])) {
    return "Token Expired";
  }
  return "";
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var apiRouter = express.Router();

apiRouter.post('/login', function(req, res) {
  console.log(`Path: /api${req.path}`);
  console.log(`QS Token: ${req.query.token}`);
  console.log(req.body);
  var message = checkToken(req.query.token);
  if (message!="") {
    res.json({message: message});
    return;
  }
  res.json({message: "Login Data Accepted",token: req.query.token});
});

apiRouter.get('/fastlyverify', function(req, res) {
  console.log(`Path: /api${req.path}`);
  console.log(req.body);
  console.log(req.headers);
  console.log(req.headers["arkoseprivatekey"]);
  console.log(req.headers["arkosesessiontoken"]);

  request.post(
    {
      url:'https://verify.arkoselabs.com/fc/v',
      form: {
        private_key: req.headers["arkoseprivatekey"],
        session_token: req.headers["arkosesessiontoken"]
     }
    },
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('upload failed:', err);
      }
      if (httpResponse.statusCode = 200) {
        var verifyinfo = JSON.parse(body);
        console.log(verifyinfo);
        if (verifyinfo.error === "DENIED ACCESS") {
          console.error('Token is incorrect');
          res.set('Arkose-Result','INVALID');
          return res.json({verify:false});
        } else if (verifyinfo.solved == false) {
          console.log('Token returned solved false')
         res.set('Arkose-Result','INVALID');
         return res.json({verify:false});
        } else {
          console.log('Token Looking Good');
          res.set('Arkose-Result','OK');
          return res.json({verify:true});
        }
      }
    }
  );
});

app.use('/api', apiRouter);

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  console.log("OK");
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/verify/', function(req, res) {
  var message = checkToken(req.query.token);
  if (message!="") {
    console.log(`Bad Token: ${message}`);
    res.status(403);
    res.send('Forbidden');
    return;
  }
  res.sendFile(__dirname + '/views/verify.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
