const fs = require("fs");
const ethUtils = require('ethereumjs-util')
const jwt = require('jsonwebtoken')
var Contract = require('web3-eth-contract');
// Contract.setProvider('https://rinkeby.infura.io/v3/c9f0e6b4f596427a8eb78f2b8e1a6d0a');
Contract.setProvider('http://127.0.0.1:7545');

const abi = JSON.parse(fs.readFileSync('../build/contracts/GatedCommunity.json')).abi
var contractAddress = "0x9a5A1cc46Aa7597760c2Cfe7C307f48772AD6A6d"
var contract = new Contract(abi, contractAddress);
let a = "0xD54E9424ea8536e617f72402fB901FBe3358B4d0"

contract.methods.obtainToken().send(function(result){
    console.log(result)
})