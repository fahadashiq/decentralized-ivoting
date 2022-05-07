var WEB3 = require('web3');
var HttpStatus = require('http-status-codes');


var url = 'http://localhost:7545';
var accountAddress = '0xdeD74C9017812bdd518453ea666399FE9433F757';
var web3 = new WEB3(url);

const trustFundAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "kid",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timeToMaturity",
        "type": "uint256"
      }
    ],
    "name": "addKid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "withdraw",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "kids",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maturity",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "paid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x7295C3d11aDfE6285726C3C3a5D560762f35735d';
const kidAccountAddress = '0xF870C68e53911d9676Ee60d360f77ea26A0A7254';

const childFundContract = new web3.eth.Contract(trustFundAbi, contractAddress);

class Web3Controller {
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

  async createAccount(response) {
    let balance;
    const result = await web3.eth.accounts.create()
    response.status(HttpStatus.OK).send({ "account-created": true,
    "address": result.address,
    "privateKey" : result.privateKey});
  }

  contractInfo(response) {
    let res;
    //childFundContract.options.from = kidAccountAddress;

    childFundContract.methods.withdraw().call({from:kidAccountAddress}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
      response.status(HttpStatus.OK).send({ "result": res});

    });
    //response.status(HttpStatus.OK).send({ "result": res});
  }


  async addChildToFund(response) {

    // From means the account from which this transaction should be done. And our contract says only admin can add children to fund.
    // its basically msg.sender in our contract.
   // childFundContract.options.from = accountAddress;
    //childFundContract.options.value = web3.utils.toWei('3', 'ether');

    /*childFundContract.addKid(kidAccountAddress, 30, {from:accountAddress, value:web3.toWei("4",'ether')}).se (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });
     const results = await childFundContract.methods.addKid([kidAccountAddress, 30] , {from:accountAddress, value: web3.utils.toWei('3', 'ether')}).send((err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });


    */

    let res;
    const results = await childFundContract.methods.addKid(kidAccountAddress, 30).send({from:accountAddress, value: web3.utils.toWei('3', 'ether')}, (err, result) => {
      if (err) {
        console.log(err);
      }
      res = result;
    });

    response.status(HttpStatus.OK).send({ "result": res});
  }

}
module.exports = Web3Controller;