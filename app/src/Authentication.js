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
    this.getRestrictedContent = this.getRestrictedContent.bind(this)
    this.state = {}
  }

  componentDidMount() {

    if (process.env.NODE_ENV === "production"){
      this.CONTRACT_ADDRESS="0x5c89aBB2d8DCeEffcA0A409F8E3C4829b18D0c1D"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
      this.BASE_URL="https://gatedcommunity.netlify.app/.netlify/functions/server"
    }
    
    if (process.env.NODE_ENV === "development"){
      this.CONTRACT_ADDRESS="0xD354263873eB68ad6bA29b2166848a2cae2B6C64"
      this.BASE_URL="http://localhost:8080"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
    }

    this.setState({message:null})
    this.web3 = new web3(window.ethereum);
    this.abi = abi.abi
    this.contract = new this.web3.eth.Contract(this.abi,this.CONTRACT_ADDRESS)
    this.axios = axios
    this.unclaimedTokens()
  }

  obtainToken() {
    this.setState({message:"Waiting for transaction to clear.",showPurchaseButton:false})
    this.contract.methods.obtainToken()
        .send({ from: window.ethereum.selectedAddress })
        .on('confirmation', function(confirmationNumber, receipt){ this.setState({message:"Transaction successful.",showPurchaseButton:false})})
        .then(this.connect)
        .catch(e => this.setState({message:e.message,showPurchaseButton:true}))
  }

  getRestrictedContent() {
    this.axios.get(this.BASE_URL + '/protectedEndpoint')
      .then(res=>this.setState({protectedContent:res.data}))
      .catch(e=>console.log(e))
  }

  unclaimedTokens() {
    this.setState({message:null})
    this.contract.methods.unclaimedTokens()
        .call()
        .then(x => this.setState({unclaimedTokens:x}))
        .catch(e => this.setState({message:e.message}))
  }

  connect() {
    this.setState({message:null})
    if(window.ethereum){
      this.web3.eth.requestAccounts()
            .then(x=>this.web3.eth.personal.sign(this.CHALLENGE_MESSAGE,x[0]))
            .then(signedMsg => axios.post(this.BASE_URL + '/authenticate', { signedMsg: signedMsg, address: window.ethereum.selectedAddress }))
            .then(res => {
              this.setState(jwt.decode(res.data.jwt))
              this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.jwt
              console.log(this.state)
            })
            .then(this.unclaimedTokens)
            .then(this.getRestrictedContent)
            .catch(e => this.setState({message:e.message}))
  } else {
    this.setState({message:"Please check that you have MetaMask installed and set to the correct network."})
  }
}

  render() {
    return (
      <div>
        { this.state.unclaimedTokens ? <div>Unclaimed Access Tokens: {this.state.unclaimedTokens}</div>:null}
        { this.state.message ? <div>{this.state.message}</div>:null}
        { this.state.address && this.state.authorized ? <div>{this.state.address} is connected and authorized.</div>: null}
        { this.state.address && !this.state.authorized ? <div>{this.state.address} is connected but not authorized.</div> : null}
        { this.state.showPurchaseButton ? <button onClick={this.obtainToken}>Get Token</button>:null}
        { !this.state.address ? <div>No address connected.<button onClick={this.connect}>Login</button></div> : null}
        { this.state.protectedContent ? <div>{this.state.protectedContent.message}</div>:null}
      </div>
    )
  }
}

export default Authentication
