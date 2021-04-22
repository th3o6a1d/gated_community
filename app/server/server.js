const express = require('express')
const app = express()
const serverless = require('serverless-http')
const fs = require("fs")
const jwt = require('jsonwebtoken')
const Web3 = require('web3')
const cors = require('cors')

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === "production"){
  app.CONTRACT_ADDRESS="0x738ccd02a55c54E84D768Aeac2bCe70d485708d2"
  app.CHALLENGE_MESSAGE="Welcome to Gated Community!"
  app.WEB3_URL="https://rinkeby.infura.io/v3/c9f0e6b4f596427a8eb78f2b8e1a6d0a"
  app.TOKEN_SECRET="asdfasdfasd"
}

if (process.env.NODE_ENV === "development"){
  app.CONTRACT_ADDRESS="0xaD3F92878036dE7A9bC1191d237A5eB38b614D86"
  app.CHALLENGE_MESSAGE="Welcome to Gated Community!"
  app.WEB3_URL="http://localhost:8545"
  app.TOKEN_SECRET="asdfasdfasd"
}

app.abi = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "maxTokens", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "tokenCount", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "obtainToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unclaimedTokens", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true } ]
app.web3 = new Web3(new Web3.providers.HttpProvider(app.WEB3_URL))
app.contract = new app.web3.eth.Contract(app.abi,app.CONTRACT_ADDRESS)
app.use(cors())

function generateAccessToken(address) {
  return jwt.sign(address, app.TOKEN_SECRET, { expiresIn: '1000s' })
}

function authenticateToken(req, res, next) {
  
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    return res.sendStatus(400)
  }

  try {
    let verified = jwt.verify(token, app.TOKEN_SECRET)
    if (verified && verified['authorized'] == true){
      next()
    } else {
      return res.sendStatus(403)
    }
  } catch(e){
    console.log(e)
    return res.sendStatus(401)
  }


}

const router = express.Router();

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
    'Authorization'
  )
  req.accepts('application/json')
  req.accepts('authorization')
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

router.get('/protectedEndpoint', authenticateToken, function(req,res){
  res.json({message:"This is the secret content that only token owners get to access."})
})

router.post('/authenticate',function (req, res) {
  let address = app.web3.eth.accounts.recover(app.CHALLENGE_MESSAGE,req.body.signedMsg);
  let connected = (address.toLowerCase() == req.body.address.toLowerCase())
  if (connected) {
    app.contract.methods.balanceOf(address)
    .call()
    .then(function(x){
        let authorized = false
        if(x == 1) {authorized = true}
        const token = generateAccessToken({ address: req.body.address, authorized: authorized })
        res.json({jwt:token,address:address,authorized:authorized})
    })
    .catch(e => res.sendStatus(500))
  } else {
    res.sendStatus(403)
  }
})

if (process.env.NODE_ENV==="production"){
  app.use('/.netlify/functions/server', router);
} else {
  app.use('/',router);
}

module.exports = app;
module.exports.handler = serverless(app);