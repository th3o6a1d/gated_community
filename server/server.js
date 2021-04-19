const express = require('express')
const app = express()
const fs = require("fs");
const ethUtils = require('ethereumjs-util')
const jwt = require('jsonwebtoken')
var Contract = require('web3-eth-contract');
// Contract.setProvider('https://rinkeby.infura.io/v3/c9f0e6b4f596427a8eb78f2b8e1a6d0a');
Contract.setProvider('http://127.0.0.1:8545');

const abi = JSON.parse(fs.readFileSync('../build/contracts/GatedCommunity.json')).abi
var contractAddress = "0xD54E9424ea8536e617f72402fB901FBe3358B4d0"
var contract = new Contract(abi, contractAddress);
let a = "0x059FB531956d46caba0f8Cf13C9511132dD168d4"

const TOKEN_SECRET = '832nc80123mxk09ia0f9siamcosf'

function generateAccessToken(address) {
  return jwt.sign(address, TOKEN_SECRET, { expiresIn: '1800s' })
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  let verified = jwt.verify(token, TOKEN_SECRET)
  next()
}

const extractAddress = function (signedMsg) {
  let msg = 'Connect to GatedCommunity'
  const msgBuffer = Buffer.from(msg, 'utf8')
  const msgHash = ethUtils.hashPersonalMessage(msgBuffer)
  const sigBuffer = ethUtils.toBuffer(signedMsg)
  const sigParams = ethUtils.fromRpcSig(sigBuffer)
  const pubKey = ethUtils.ecrecover(
    msgHash,
    sigParams.v,
    sigParams.r,
    sigParams.s,
  )
  const addressBuffer = ethUtils.publicToAddress(pubKey)
  const address = ethUtils.bufferToHex(addressBuffer)
  return address
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

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/connect',function (req, res) {
  let address = extractAddress(req.body.signedMsg)
  let authorized = false
  let connected = address == req.body.address
  if (connected) {
    contract.methods.balanceOf(address).call(function(result){
        console.log(result)
        if (result >= 1) { authorized = true }
        const token = generateAccessToken({ address: req.body.address, authorized: authorized })
        res.json({ jwt: token, address: address })
    })
  } else {
    res.json({ message: 'Invalid signature.' })
  }
})

var server = app.listen(8080, 'localhost', function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
