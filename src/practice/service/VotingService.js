var WEB3 = require('web3');
const HttpStatus = require('http-status-codes');
var config = require('config');

const accountAddress = config.get("ACCOUNT_ADDRESS");
const web3 = new WEB3(config.get("BLOCKCHAIN_URL"));
const abi = require('../../../contract/abi.json');
const { encrypt, decrypt } = require('./crypto');

const votingContract = new web3.eth.Contract(abi, config.get("CONTRACT_ADDRESS"));

class VotingService {
  async getAccountInfo(response) {
    let balance;
    const result = await web3.eth.getBalance(accountAddress, (err, bal) => {
      if (err) {
        console.log(err);
      }
      balance = web3.utils.fromWei(bal, 'ether');
    });
    response.status(HttpStatus.OK).send({ "balance": balance});
  }

/*  async createAccount(response) {
    let balance;
    const result = await web3.eth.accounts.create()
    response.status(HttpStatus.OK).send({ "account-created": true,
      "address": result.address,
      "privateKey" : result.privateKey});
  }*/
/*
  contractInfo(response) {
    let res;
    //votingContract.options.from = kidAccountAddress;

    votingContract.methods.withdraw().call({from:kidAccountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
      response.status(HttpStatus.OK).send({ "result": res});

    });
    //response.status(HttpStatus.OK).send({ "result": res});
  }*/


  createElectionCampaign(request, response) {

    if (!request.body.code) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (!request.body.startDateTime) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "Starting date time required"});
    if (!request.body.endDateTime) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "Ending date time required"});
    if (request.body.name == undefined) request.body.name = "";

    var startingDateTime = new Date(request.body.startDateTime).getTime() / 1000;
    var endingDateTime = new Date(request.body.endDateTime).getTime() / 1000;


    if (isNaN(startingDateTime) || isNaN(endingDateTime)) {
      return response.status(HttpStatus.BAD_REQUEST).send({ "error": "Provide date time in right format. Example will be 2022-05-15T13:36:32"});
    }
    else {
      votingContract.methods.addCampaign(request.body.code, request.body.name, startingDateTime, endingDateTime).send({from:accountAddress, gas: 3000000}, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          response.status(HttpStatus.OK).send({ "result": result});
        }
      }).catch( err => {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
      });
    }

  }

  updateElectionCampaign(request, response) {

    if (!request.body.code) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (request.body.name == undefined) request.body.name = "";

    var startingDateTime = request.body.startDateTime == undefined ? 0 : new Date(request.body.startDateTime).getTime() / 1000;
    var endingDateTime = request.body.endDateTime == undefined ?  0 : new Date(request.body.endDateTime).getTime() / 1000;


    if (isNaN(startingDateTime) || isNaN(endingDateTime)) {
      return response.status(HttpStatus.BAD_REQUEST).send({ "error": "Provide date time in right format. Example will be 2022-05-15T13:36:32"});
    }
    else {
      votingContract.methods.updateCampaign(request.body.code, request.body.name, startingDateTime, endingDateTime).send({from:accountAddress, gas: 3000000}, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          response.status(HttpStatus.OK).send({ "result": result});
        }
      }).catch( err => {
        response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
      });
    }

  }

  deleteElectionCampaign(request, response) {

    if (!request.body.code) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});

    votingContract.methods.deleteCampaign(request.body.code).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });


  }

  addAreaToCampaign(request, response) {

    if (!request.body.campaignCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (!request.body.areaCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "area code required"});
    if (!request.body.areaName) request.body.areaName = "";

    votingContract.methods.addAreas(request.body.campaignCode, request.body.areaCode, request.body.areaName).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  updateArea(request, response) {

    if (!request.body.campaignCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (!request.body.areaCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "area code required"});
    if (!request.body.areaName) request.body.areaName = "";

    votingContract.methods.updateArea(request.body.campaignCode, request.body.areaCode, request.body.areaName).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  deleteArea(request, response) {

    if (!request.body.campaignCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (!request.body.areaCode)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "area code required"});

    votingContract.methods.deleteArea(request.body.campaignCode, request.body.areaCode).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }


  async addCandidate(request, response) {
    if (request.body.campaignCode == undefined) request.body.campaignCode = "";
    if (request.body.areaCode == undefined) request.body.areaCode = "";
    if (request.body.candidateCode == undefined) request.body.candidateCode = "";
    if (request.body.candidateName == undefined) request.body.candidateName = "";
    if (request.body.candidateSign == undefined) request.body.candidateSign = "";

    votingContract.methods.addCandidate(request.body.campaignCode, request.body.areaCode, request.body.candidateCode, request.body.candidateName, request.body.candidateSign).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  async updateCandidate(request, response) {
    if (request.body.campaignCode == undefined)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "campaign code required"});
    if (request.body.areaCode == undefined)  return response.status(HttpStatus.BAD_REQUEST).send({ "error": "area code required"});
    if (request.body.candidateCode == undefined) return response.status(HttpStatus.BAD_REQUEST).send({ "error": "candidate code required"});
    if (request.body.candidateName == undefined) request.body.candidateName = "";
    if (request.body.candidateSign == undefined) request.body.candidateSign = "";

    votingContract.methods.updateCandidate(request.body.campaignCode, request.body.areaCode, request.body.candidateCode, request.body.candidateName, request.body.candidateSign).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  async voteForCandidate(request, response) {
    if (request.body.campaignCode == undefined) request.body.campaignCode = "";
    if (request.body.areaCode == undefined) request.body.areaCode = "";
    if (request.body.candidateCode == undefined) request.body.candidateCode = "";
    if (request.body.voterId == undefined) request.body.voterId = "";

    votingContract.methods.voteForCandidate(request.body.campaignCode, request.body.areaCode, request.body.candidateCode, request.body.voterId).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send({ "result": result});
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

   getCampaignList(request, response) {
     votingContract.methods.getCompaignsList().call({from:accountAddress}, (err, result) => {
       if (err) {
         console.log(err);
       }
       else {
         response.status(HttpStatus.OK).send(this.parseCampaignResult(result));
       }
     }).catch( err => {
       response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
     });
  }

  parseCampaignResult(result) {
    var campaigns = [];
    result.forEach(res =>{
      if (res.code) {
        var campaign = {};
        campaign.code = res.code;
        campaign.name = res.name;
        campaign.startDateTime =  new Date(res.startTime * 1000).toISOString();
        campaign.endDateTime = new Date(res.endTime * 1000).toISOString();
        campaigns.push(campaign);
      }
    })
    return campaigns;
  }

  addVotersToVotingList(request, response) {

    if (request.body.voterId == undefined) response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter id is required."});
    if (request.body.areaCode == undefined) response.status(HttpStatus.BAD_REQUEST).send({ "error": "Area code is required."});
    if (request.body.phoneNumber == undefined) response.status(HttpStatus.BAD_REQUEST).send({ "error": "Phone number is required."});

    var voterRequest = {};
    voterRequest.voterId = request.body.voterId;
    voterRequest.areaCode = request.body.areaCode;
    voterRequest.phoneNumber = request.body.phoneNumber;
    const hashcode = JSON.stringify(encrypt(JSON.stringify(voterRequest)));

    votingContract.methods.addVoterToVotingList(request.body.voterId, hashcode).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        response.status(HttpStatus.OK).send({"result" : result});
      }
    }).catch(err => {
      response.status(HttpStatus.BAD_REQUEST).send({"error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  checkIfVoterCanVote(request, response) {

    if (request.body.voterId == undefined) response.status(HttpStatus.BAD_REQUEST).send({ "error": "Voter id is required."});

    votingContract.methods.getVoterHash(request.body.voterId).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send(this.parseVoterResult(result));
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }


  getVoterRecord(request, response, successCallback) {

    votingContract.methods.getVoterHash(request.body.voterId).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
         successCallback(request, response, this.parseVoterResult(result));
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  parseVoterResult(result) {
    const hashcode = decrypt(JSON.parse(result));
    return hashcode;
  }


  getAreaList(request, response) {
    if (request.query.campaignCode == undefined) request.query.campaignCode = "";
    votingContract.methods.getAreasList(request.query.campaignCode).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send(this.parseAreaResult(result));
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  parseAreaResult(result) {
    var areas = [];
    result.forEach(res =>{
      if (res.code) {
        var area = {};
        area.areaCode = res.code;
        area.areaName = res.name;
        areas.push(area);
      }
    })
    return areas;
  }

  getCandidateList(request, response) {
    if (request.query.campaignCode == undefined) request.query.campaignCode = "";
    if (request.query.areaCode == undefined) request.query.areaCode = "";
    votingContract.methods.getCandidatesList(request.query.campaignCode, request.query.areaCode).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send(this.parseCandidateResult(result));
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

  parseCandidateResult(result) {
    var areas = [];
    result.forEach(res =>{
      var area = {};
      area.candidateCode = res.code;
      area.candidateName = res.name;
      area.candidateSign = res.sign;
      areas.push(area);
    })
    return areas;
  }

  parseResult(result) {
    var areas = [];
    result.forEach(res =>{
      var area = {};
      area.code = res.code;
      area.name = res.name;
      area.sign = res.sign;
      area.votes = res.votes;
      areas.push(area);
    })
    return areas;
  }

  async getResults(request, response) {
    let res;
    // const results = await votingContract.methods.getNumResult().call({from:accountAddress}, (err, result) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   res = result;
    // });
   votingContract.methods.getResults(request.body.campaignCode, request.body.areaCode).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      else {
        response.status(HttpStatus.OK).send(this.parseResult(result));
      }
    }).catch( err => {
      response.status(HttpStatus.BAD_REQUEST).send({ "error": err.data[Object.keys(err.data)[0]].reason});
    });
  }

}
module.exports = VotingService;
