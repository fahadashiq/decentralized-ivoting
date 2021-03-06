const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
var config = require('config');
var logger = require('./src/practice/helper/Logger');
// create express app
const app = express();
const cors = require('cors');
var HttpStatus = require('http-status-codes');

const Web3Controller = require('./src/practice/service/Web3Controller')
const web3Controller = new Web3Controller();

const VotingService = require('./src/practice/service/VotingService')
const votingService = new VotingService();

const UtilityService = require('./src/practice/service/UtilityService')
const utilityService = new UtilityService();

const DatabaseClient = require('./src/practice/repository/DatabaseClient')
const databaseClient = new DatabaseClient();


const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const TwilioService = require('./src/practice/service/TwilioService');
const twilioService = new TwilioService();

app.use(cors());
app.use(bodyParser.json());
app.use(logger.getExpressLogger());



/**
 *
 * Authentication and authorization.
 *
 */


const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';

const users = [
  {
    name: 'John Smith',
    username: 'john',
    password: 'password123admin',
    email: 'test@test.com',
    role: 'admin'
  }, {
    name: 'Anna Smith',
    username: 'anna',
    password: 'password123member',
    email: 'test1@test.com',
    role: 'member'
  }
]

let refreshTokens = [];




app.post('/login', (req, res) => {
  // read username and password from request body
  const { username, password } = req.body;

  // filter user from the users array by username and password
  const user = users.find(u => { return u.username === username && u.password === password });

  if (user) {
    // generate an access token
    const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '7200m' });
    const refreshToken = jwt.sign({ username: user.username, role: user.role }, refreshTokenSecret);

    refreshTokens.push(refreshToken);
    res.json({
      accessToken,
      refreshToken,
      "name": user.name,
      "username": user.username,
      "email": user.email
    });
  } else {
    res.send('Username or password incorrect');
  }
});

// creates new access token if refresh token is passsed.
app.post('/token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '7200m' });

    res.json({
      accessToken
    });
  });
});


app.post('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);

  res.send("Logout successful");
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}



/**
 *
 * IVoting endpoints.
 *
 */


app.get('/time', function (req, res) {

  // its 10 digits for blockchain 13 for js. appending/removing 3 zeros is necessary else it fails.
  var date = new Date(1652618966000);
  console.log(date.toUTCString());
  console.log(Date.now());
  res.status(HttpStatus.OK).send({ "isAlive": new Date("2022-05-15T13:36:32").toISOString()});
  //res.status(HttpStatus.OK).send({ "isAlive": Date.now()});
});

app.post('/create-campaign', function (req, res) {
  votingService.createElectionCampaign(req, res);
});

app.post('/update-campaign', function (req, res) {
  votingService.updateElectionCampaign(req, res);
});

app.post('/update-candidate', function (req, res) {
  votingService.updateCandidate(req, res);
});

app.post('/delete-campaign', function (req, res) {
  votingService.deleteElectionCampaign(req, res);
});

app.post('/add-area', function (req, res) {
  votingService.addAreaToCampaign(req, res);
});

app.post('/update-area', function (req, res) {
  votingService.updateArea(req, res);
});

app.post('/delete-area', function (req, res) {
  votingService.deleteArea(req, res);
});

app.post('/add-candidate', function (req, res) {
  votingService.addCandidate(req, res);
});

app.post('/add-voter', function (req, res) {
  votingService.addVotersToVotingList(req, res);
});

app.post('/check-voter', function (req, res) {
  votingService.checkIfVoterCanVote(req, res);
});

app.post('/vote', function (req, res) {
  if (req.body.token === undefined) res.status(HttpStatus.BAD_REQUEST).send("Token is required");
  if (req.body.campaignCode === undefined) res.status(HttpStatus.BAD_REQUEST).send("Campaign code is required");
  if (req.body.voterId === undefined) res.status(HttpStatus.BAD_REQUEST).send("Voter Id is required");
  if (req.body.otp === undefined) res.status(HttpStatus.BAD_REQUEST).send("OTP is required");
  utilityService.verifyVoterBeforeVoting(req, res,(req, res)=> {
    databaseClient.getToken(req.body.token, req.body.voterId, req.body.campaignCode, () => {
          votingService.voteForCandidate(req, res);
        },
        () => {
          res.status(HttpStatus.BAD_REQUEST).send("Invalid token");
        });
  });

});

app.get('/campaign-list', function (req, res) {
  votingService.getCampaignList(req, res);
});

app.get('/area-list', function (req, res) {
  votingService.getAreaList(req, res);
});

app.get('/candidate-list', function (req, res) {
  votingService.getCandidateList(req, res);
});


app.post('/authenticate-voter', function (req, res) {
  if (req.body.voterId == undefined) res.status(HttpStatus.BAD_REQUEST).send("User id is required.");
  if (req.body.campaignCode == undefined) res.status(HttpStatus.BAD_REQUEST).send("Campaign code is required.");
  if (req.body.areaCode == undefined) res.status(HttpStatus.BAD_REQUEST).send("Area code is required.");

  utilityService.validateUser(req, res,  (req, res) => {
    const accessToken = jwt.sign({ username: req.body.voterId, role: "voter" }, accessTokenSecret, { expiresIn: '60m' });
    databaseClient.addOrUpdateToken(accessToken, req.body.voterId, req.body.campaignCode, () => {
          res.status(HttpStatus.OK).send({'token': accessToken});
        },
        (msg) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(msg);

        });
  });

});






app.get('/details', function (req, res) {
  votingService.getResults(req, res);
});

app.get('/detail',authenticateJWT, function (req, res) {
  votingService.getResults(req, res);
});

app.get('/is_alive', function (req, res) {
    res.status(HttpStatus.OK).send({ "isAlive": true});
});


app.get('/balance', function (req, res) {
  web3Controller.getAccountInfo(res);
});

app.get('/new-account', function (req, res) {
  web3Controller.createAccount(res);
});

app.get('/withdraw', function (req, res) {
  web3Controller.contractInfo(res);
});

app.get('/add-child', function (req, res) {
  web3Controller.addChildToFund(res);
});


/**
 * Starting server.
 */

app.listen(process.env.PORT || config.get("PORT"), function () {
  logger.info('App listening on port: ' + config.get("PORT"));
  console.log('App listening on port: ' + config.get("PORT"));
});