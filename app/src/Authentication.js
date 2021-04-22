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
    this.balanceOf = this.balanceOf.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.totalTokenOwners = this.totalTokenOwners.bind(this)
    this.state = {}
  }

  componentDidMount() {

    if (process.env.NODE_ENV === "production"){
      this.CONTRACT_ADDRESS="0x738ccd02a55c54E84D768Aeac2bCe70d485708d2"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
      this.BASE_URL="https://gatedcommunity.netlify.app/.netlify/functions/server"
    }
    
    if (process.env.NODE_ENV === "development"){
      this.CONTRACT_ADDRESS="0x0f94a9FBe040754B1518f3043D811F8f35F98a8C"
      this.BASE_URL="http://localhost:8080"
      this.CHALLENGE_MESSAGE="Welcome to Gated Community!"
    }

    this.web3 = new web3(window.ethereum);
    this.abi = abi.abi
    this.contract = new this.web3.eth.Contract(this.abi,this.CONTRACT_ADDRESS)
    this.axios = axios

    if(localStorage.getItem("jwt")){
      let token = localStorage.getItem("jwt")
      let decoded = jwt.decode(token)
      this.setState({ authorized: decoded['authorized'], address: decoded['address']},this.balanceOf)
      // if(this.state['authorized']===false){this.setState({showPurchaseButton:true})}
      this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem("jwt")
      this.getRestrictedContent()
    } else {
      this.setState({showConnectButton:true})
    }
    
    this.unclaimedTokens()
    this.totalTokenOwners()
    
  }

  obtainToken() {
    this.setState({message:"Waiting for transaction to clear.",showPurchaseButton:false})
    this.contract.methods.obtainToken()
        .send({ from: window.ethereum.selectedAddress, value: 100000000000000000 })
        .on('confirmation', function(confirmationNumber, receipt){ this.setState({message:"Transaction successful.",showPurchaseButton:false})})
        .then(this.connect)
        .then(this.unclaimedTokens)
        .then(this.totalTokenOwners)
        .catch(e => this.setState({message:e.message,showPurchaseButton:true}))
  }

  balanceOf() {
    console.log(this.state)
    this.contract.methods.balanceOf(this.state.address)
        .call()
        .then(tokenCount=>{
          let x = parseInt(tokenCount)
          if(x===1) {
            this.setState({member:true})
           } else {
            this.setState({member:false})
          }
        })
        .catch(e => this.setState({message:e.message}))
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

  totalTokenOwners() {
    this.setState({message:null})
    this.contract.methods.totalTokenOwners()
        .call()
        .then(x => this.setState({tokenOwners:x}))
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
            .then(this.balanceOf)
            .catch(e => this.setState({message:e.message}))
  } else {
    this.setState({message:"Please check that you have MetaMask installed and set to the correct network."})
  }
}



  render() {
    return (
      <div>
        { this.state.message ? <div>{this.state.message}</div>:null}
        { this.state.unclaimedTokens ? <div>Unclaimed membership tokens: {this.state.unclaimedTokens}</div>:null}
        { this.state.tokenOwners ? <div>Membership token owners: {this.state.tokenOwners}</div>:null}
        { this.state.address ? <div>{this.state.address} {this.state.member ? "owns a membership token." : "does not own a membership token."}</div>: null}
        { this.state.showPurchaseButton ? <button onClick={this.obtainToken}>Get Token</button>:null}
        { this.state.showConnectButton ? <button onClick={this.connect}>Login</button> : null}
        { this.state.protectedContent ? <div className="protectedContent">{this.state.protectedContent.message}</div>:null}
      </div>
    )
  }
}

export default Authentication
