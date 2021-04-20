import React, { Component } from 'react'
import axios from 'axios'
import web3 from 'web3'
import jwt from 'jsonwebtoken'
import abi from './abi/GatedCommunity.json'

class Authentication extends Component {

  constructor(props) {
    super(props)
    this.connect = this.connect.bind(this)
    this.obtainToken = this.obtainToken.bind(this)
    this.unclaimedTokens = this.unclaimedTokens.bind(this)
    this.state = {loggedIn:false}
  }

  componentDidMount() {

    if (process.env.NODE_ENV === "production"){
      this.CONTRACT_ADDRESS="0x5c89aBB2d8DCeEffcA0A409F8E3C4829b18D0c1D"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
      this.AUTH_URL="https://gatedcommunity.netlify.app/.netlify/functions/server/authenticate"
    }
    
    if (process.env.NODE_ENV === "development"){
      this.CONTRACT_ADDRESS="0xD354263873eB68ad6bA29b2166848a2cae2B6C64"
      this.AUTH_URL="http://localhost:8080/authenticate"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
    }

    this.setState({error:null})
    this.web3 = new web3(window.ethereum);
    this.abi = abi.abi
    this.contract = new this.web3.eth.Contract(this.abi,this.CONTRACT_ADDRESS)
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
      this.web3.eth.requestAccounts()
            .then(x=>this.web3.eth.personal.sign(this.CHALLENGE_MESSAGE,x[0]))
            .then(signedMsg => axios.post(this.AUTH_URL, { signedMsg: signedMsg, address: window.ethereum.selectedAddress }))
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
