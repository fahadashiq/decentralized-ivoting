var WEB3 = require('web3');
var HttpStatus = require('http-status-codes');


var url = 'http://localhost:7545';
var accountAddress = '0xdeD74C9017812bdd518453ea666399FE9433F757';
var web3 = new WEB3(url);

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "campaignName",
        "type": "string"
      }
    ],
    "name": "addCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "campaignName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateSign",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "campaigns",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "compaignNames",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCompainNames",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "campaignNames",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "campaignName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateName",
        "type": "string"
      }
    ],
    "name": "getCandidateVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "votes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNumResult",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "res",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "campaignName",
        "type": "string"
      }
    ],
    "name": "getcompaignInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "sign",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "votes",
                "type": "uint256"
              }
            ],
            "internalType": "struct Voting.Candidate[]",
            "name": "candidates",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Voting.Campaign",
        "name": "campaign",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "campaignName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateName",
        "type": "string"
      }
    ],
    "name": "voteForCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0xd09e5620409C4636c70Cc19aeeed2287490aa95C';
const votingContract = new web3.eth.Contract(abi, contractAddress);

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


  async createElectionCampaign(request, response) {
    let res;
    const results = await votingContract.methods.addCampaign(request.body.name).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });

    response.status(HttpStatus.OK).send({ "result": res});
  }

  async addCandidate(request, response) {
    let res;
    const results = await votingContract.methods.addCandidate(request.body.campaign_name, request.body.name, request.body.sign).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });

    response.status(HttpStatus.OK).send({ "result": res});
  }

  async voteForCandidate(request, response) {
    let res;
    const results = await votingContract.methods.voteForCandidate(request.body.campaign_name, request.body.name).send({from:accountAddress, gas: 3000000}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });

    response.status(HttpStatus.OK).send({ "result": res});
  }

  async getResults(request, response) {
    let res;
    // const results = await votingContract.methods.getNumResult().call({from:accountAddress}, (err, result) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   res = result;
    // });
    const results = await votingContract.methods.getcompaignInfo(request.body.name).call({from:accountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });

    response.status(HttpStatus.OK).send({ "result": res});
  }

}
module.exports = VotingService;
