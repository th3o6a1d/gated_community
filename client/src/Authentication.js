import React, { Component } from 'react'
import axios from 'axios'
import web3 from 'web3'
import jwt from 'jsonwebtoken'
import abi from './abi/GatedCommunity.json'

let CHALLENGE_MSG = process.env.CHALLENGE_MSG
let CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

if (process.env.NODE_ENV === "development") { 
  'http://localhost:8080/authenticate'
}

if (process.env.NODE_ENV === "production") {
  let AUTH_URL = window.location.href + "authenticate"
}

class Authentication extends Component {

  constructor(props) {
    super(props)
    this.connect = this.connect.bind(this)
    this.obtainToken = this.obtainToken.bind(this)
    this.unclaimedTokens = this.unclaimedTokens.bind(this)
    this.state = {loggedIn:false}
  }

  componentDidMount() {
    this.setState({error:null})
    this.web3 = new web3(window.ethereum);
    this.abi = abi.abi
    console.log(abi)
    this.contract = new this.web3.eth.Contract(this.abi,CONTRACT_ADDRESS)
    this.unclaimedTokens()
  }

  obtainToken() {
    this.setState({error:null})
    this.contract.methods.obtainToken()
        .send({ from: window.ethereum.selectedAddress })
        .then(this.connect)
        .catch(e => this.setState({error:e.message}))
  }

  unclaimedTokens() {
    this.setState({error:null})
    this.contract.methods.unclaimedTokens()
        .call()
        .then(x => this.setState({unclaimedTokens:x}))
        .catch(e => this.setState({error:e.message}))
  }

  connect() {
    this.setState({error:null})
    if(window.ethereum){
      window.ethereum.request({ method: 'personal_sign', params: [window.ethereum.selectedAddress, CHALLENGE_MSG] })
            .then(signedMsg => axios.post(AUTH_URL, { signedMsg: signedMsg, address: window.ethereum.selectedAddress }))
            .then(res => this.setState(jwt.decode(res.data.jwt)))
            .then(this.unclaimedTokens)
            .catch(e => this.setState({error:e.message}))
  } else {
    this.setState({error:"Please check that you have MetaMask installed and set to the correct network."})
  }
}

  render() {
    return (
      <div>
        { this.state.unclaimedTokens ? <div>Unclaimed Access Tokens: {this.state.unclaimedTokens}</div>:null}
        { this.state.error ? <div>{this.state.error}</div>:null}
        { this.state.address && this.state.authorized ? <div>{this.state.address} is connected and authorized.</div>: null}
        { this.state.address && !this.state.authorized ? <div>{this.state.address} is connected but not authorized.<button onClick={this.obtainToken}>Get Token</button></div>:null}
        { !this.state.address ? <div>No address connected.<button onClick={this.connect}>Login</button></div> : null}
      </div>
    )
  }
}

export default Authentication
