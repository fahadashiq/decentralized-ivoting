const express = require('express');
var config = require('config');
var bodyParser = require('body-parser');
var logger = require('./src/practice/helper/Logger');
// create express app
const app = express();
var HttpStatus = require('http-status-codes');
app.use(bodyParser.json());
app.use(logger.getExpressLogger());
const Web3Controller = require('./src/practice/service/Web3Controller')
const web3Controller = new Web3Controller();

const VotingService = require('./src/practice/service/VotingService')
const votingService = new VotingService();


app.post('/create-campaign', function (req, res) {
  votingService.createElectionCampaign(req, res);
});

app.post('/add-candidate', function (req, res) {
  votingService.addCandidate(req, res);
});

app.post('/vote', function (req, res) {
  votingService.voteForCandidate(req, res);
});

app.get('/details', function (req, res) {
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

app.listen(config.get("PORT"), function () {
  logger.info('App listening on port: ' + config.get("PORT"));
  console.log('App listening on port: ' + config.get("PORT"));
});