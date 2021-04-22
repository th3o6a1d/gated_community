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
    this.state = {showPurchaseButton:false}
  }

  componentDidMount() {

    if (process.env.NODE_ENV === "production"){
      this.CONTRACT_ADDRESS="0x5c89aBB2d8DCeEffcA0A409F8E3C4829b18D0c1D"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
      this.BASE_URL="https://gatedcommunity.netlify.app/.netlify/functions/server"
    }
    
    if (process.env.NODE_ENV === "development"){
      this.CONTRACT_ADDRESS="0xab671897DbE345F63EB0E1fd553C7bC68dDE418B"
      this.BASE_URL="http://localhost:8080"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
    }

    this.setState({message:null})
    this.web3 = new web3(window.ethereum);
    this.abi = abi.abi
    this.contract = new this.web3.eth.Contract(this.abi,this.CONTRACT_ADDRESS)
    this.axios = axios

    if(localStorage.getItem("jwt")){
      let token = localStorage.getItem("jwt")
      this.setState(jwt.decode(token))
      if(this.state['authorized']===false){this.setState({showPurchaseButton:true})}
      this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem("jwt")
      this.getRestrictedContent()
    } else {
      this.setState({showConnectButton:true})
    }
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
    .then(res=>this.setState({ protectedContent:res.data, showConnectButton:false, showPurchaseButton:false }))
    .catch(e=>{
      
      if (e.response.status===401){
        this.setState({message:"Invalid or expired browser authentication. Please reconnect.",showConnectButton:true,showPurchaseButton:false})
      } 

      if (e.response.status===403){
        this.setState({message:"You must own a membership token to view protected content.", showConnectButton:false, showPurchaseButton:true})
      }

    })
  }

  unclaimedTokens() {
    this.setState({message:null})
    this.contract.methods.unclaimedTokens()
        .call()
        .then(x => this.setState({unclaimedTokens:x}))
        .catch(e => this.setState({message:e.message}))
  }

  tokenOwners() {
    this.setState({message:null})
    this.contract.methods.tokenOwners()
        .call()
        .then(x => this.setState({tokenOwners:this.tokenOwners}))
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
              if(this.state['authorized']===false){this.setState({showPurchaseButton:true})}
              this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.jwt
              localStorage.setItem("jwt", res.data.jwt);
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
        { this.state.message ? <div>{this.state.message}</div>:null}
        { this.state.address ? <div>Address: {this.state.address}</div>: null}
        { this.state.unclaimedTokens ? <div>Unclaimed Access Tokens: {this.state.unclaimedTokens}</div>:null}
        { this.state.showPurchaseButton ? <button onClick={this.obtainToken}>Get Token</button>:null}
        { this.state.showConnectButton ? <button onClick={this.connect}>Login</button> : null}
        { this.state.protectedContent ? <div>{this.state.protectedContent.message}</div>:null}
      </div>
    )
  }
}

export default Authentication
