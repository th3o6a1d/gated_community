const app = express()
const express = require('express')
const serverless = require('serverless-http')
const fs = require("fs")
const jwt = require('jsonwebtoken')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_URL))

const TOKEN_SECRET = process.env.TOKEN_SECRET
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const CHALLENGE_MSG = process.env.CHALLENGE_MSG

const abi = JSON.parse(fs.readFileSync('../contract/build/contracts/GatedCommunity.json')).abi

var contract = new web3.eth.Contract(abi,CONTRACT_ADDRESS)

function generateAccessToken(address) {
  return jwt.sign(address, TOKEN_SECRET, { expiresIn: '300s' })
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  let verified = jwt.verify(token, TOKEN_SECRET)
  let decodedToken = jwt.decode(token)
  if (verified && decodedToken['authorization'] == true){
    next()
  } else {
    res.json({'error':'Authentication error.'})
  }
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  req.accepts('application/json')
  next()
})

app.get('/tokenBalance', function(req,res){
    contract.methods.balanceOf(address)
    .call()
    .then((x) => res.json(x))
    .catch((e) => res.json(e))
})

app.get('/', function(req,res){
  res.json({message:"Hello World!"})
})

app.post('/authenticate',function (req, res) {
  let address = web3.eth.accounts.recover(CHALLENGE_MSG,req.body.signedMsg);
  let connected = (address.toLowerCase() == req.body.address.toLowerCase())
  if (connected) {
    contract.methods.balanceOf(address)
    .call()
    .then(function(x){
        let authorized = false
        if(x == 1) {authorized = true}
        const token = generateAccessToken({ address: req.body.address, authorized: authorized })
        res.json({jwt:token,address:address,authorized:authorized})
    })
    .catch(e => res.json(e))
  } else {
    res.json({ message: 'Invalid signature.' })
  }
})

module.exports = app;
module.exports.handler = serverless(app);