
const TwilioService = require('./TwilioService');
const twilioService = new TwilioService();

const VotingService = require('./VotingService')
const HttpStatus = require("http-status-codes");
const votingService = new VotingService();

class UtilityService {

  validateUser(request, response, successCallback) {

    votingService.getVoterRecord(request, response, (request, response, record) => {
      if (!record) {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter record doen't exist"});
      }
      if (JSON.parse(record)["areaCode"] != request.body.areaCode) {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter Can't vote in this area. Can vote in : " + JSON.parse(record)["areaCode"]});
      } else {
        twilioService.sendSms(JSON.parse(record)["phoneNumber"], request, response, successCallback);
      }
    });

  }

  verifyVoterBeforeVoting(request, response, successCallback) {
    votingService.getVoterRecord(request, response, (request, response, record) => {
      if (!record) {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter record doen't exist"});
      }
      if (JSON.parse(record)["areaCode"] != request.body.areaCode) {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter Can't vote in this area. Can vote in : " + JSON.parse(record)["areaCode"]});
      } else {
        twilioService.verifyOtp(request, response, successCallback, JSON.parse(record)["phoneNumber"]);
      }
    });
  }

}
module.exports = UtilityService;