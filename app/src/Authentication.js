import React, { Component } from 'react'
import axios from 'axios'
import web3 from 'web3'
import jwt from 'jsonwebtoken'
import abi from './abi/GatedCommunity.json'

class Authentication extends Component {
  constructor(props) {
    super(props)
    this.authenticate = this.authenticate.bind(this)
    this.obtainToken = this.obtainToken.bind(this)
    this.unclaimedTokens = this.unclaimedTokens.bind(this)
    this.getRestrictedContent = this.getRestrictedContent.bind(this)
    this.checkMembership = this.checkMembership.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.totalTokenOwners = this.totalTokenOwners.bind(this)
    this.checkForJWT = this.checkForJWT.bind(this)
    this.state = {}
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      this.CONTRACT_ADDRESS = '0x738ccd02a55c54E84D768Aeac2bCe70d485708d2'
      this.CHALLENGE_MESSAGE = 'Welcome to Gated Community!'
      this.BASE_URL =
        'https://gatedcommunity.netlify.app/.netlify/functions/server'
    }

    if (process.env.NODE_ENV === 'development') {
      this.CONTRACT_ADDRESS = '0xaD3F92878036dE7A9bC1191d237A5eB38b614D86'
      this.BASE_URL = 'http://localhost:8080'
      this.CHALLENGE_MESSAGE = 'Welcome to Gated Community!'
    }

    this.web3 = new web3(window.ethereum)
    this.abi = abi.abi
    this.contract = new this.web3.eth.Contract(this.abi, this.CONTRACT_ADDRESS)
    this.axios = axios
    this.checkForJWT()
  }

  checkForJWT() {
    let token = localStorage.getItem('jwt')
    if(token) {
      this.setState({showConnectButton:false})
      let decoded = jwt.decode(token)
      this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('jwt')
      if(decoded['authorized']){
        this.getRestrictedContent()
      } else {
        this.setState({showPurchaseButton:true})
      }
      this.setState({ authorized: decoded['authorized'], address: decoded['address'] }, function(){
      this.checkMembership()
      this.unclaimedTokens()
      this.totalTokenOwners()
      })
    } else {
      this.unclaimedTokens()
      this.totalTokenOwners()
      this.setState({showConnectButton:true})
    }
  }

  obtainToken() {
    this.setState({
      message: 'Waiting for transaction to clear.',
      showPurchaseButton: false,
    })
    this.contract.methods
      .obtainToken()
      .send({
        from: window.ethereum.selectedAddress,
        value: 100000000000000000,
      })
      .then(this.authenticate)
      .catch((e) => {
        this.setState({ message: e.message })
      })
  }

  checkMembership() {
    this.contract.methods
      .balanceOf(this.state.address)
      .call()
      .then((tokenCount) => {
        let x = parseInt(tokenCount)
        if (x === 1) {
          this.setState({ member: true })
        } else {
          this.setState({ member: false })
        }
      })
      .catch((e) => this.setState({ message: e.message }))
  }

  getRestrictedContent() {
    this.axios
      .get(this.BASE_URL + '/protectedEndpoint')
      .then((res) =>
        this.setState({
          protectedContent: res.data,
        }),
      )
      .catch((e) => {
        if (e.response.status === 401) {
          // localStorage.clear()
          this.setState({
            message:
              'Invalid or expired browser authentication. Please reconnect.',
              showConnectButton:true
          })
        }

        if (e.response.status === 403) {
          // localStorage.clear()
          this.setState({
            message:
              'You must own a membership token to view protected content.',
              showConnectButton:true
          })
        }
      })
  }

  unclaimedTokens() {
    this.setState({ message: null })
    this.contract.methods
      .unclaimedTokens()
      .call()
      .then((x) => this.setState({ unclaimedTokens: x }))
      .catch((e) => this.setState({ message: e.message }))
  }

  totalTokenOwners() {
    this.setState({ message: null })
    this.contract.methods
      .totalTokenOwners()
      .call()
      .then((x) => this.setState({ tokenOwners: x }))
      .catch((e) => this.setState({ message: e.message }))
  }

  authenticate() {
    this.setState({ message: null })
    if (window.ethereum) {
      this.web3.eth
        .requestAccounts()
        .then((x) => this.web3.eth.personal.sign(this.CHALLENGE_MESSAGE, x[0]))
        .then((signedMsg) =>
          axios.post(this.BASE_URL + '/authenticate', {
            signedMsg: signedMsg,
            address: window.ethereum.selectedAddress,
          }),
        )
        .then((res) => localStorage.setItem('jwt', res.data.jwt))
        .then(this.checkForJWT)
        .catch((e) => {
          this.setState({ message: e.message })
          localStorage.clear()
        })
    } else {
      this.setState({
        message:
          'Please check that you have MetaMask installed and set to the correct network.',
      })
    }
  }

  render() {
    return (
      <div>
        <div><a className="App-link" href={"https://rinkeby.etherscan.io/address/" +this.CONTRACT_ADDRESS}>Look at contract on Etherscan</a></div>
        {this.state.message ? <div className="message">{this.state.message}</div> : null}
        {this.state.unclaimedTokens ? (
          <div>Unclaimed membership tokens: {this.state.unclaimedTokens}</div>
        ) : null}
        {this.state.tokenOwners ? (
          <div>Membership token owners: {this.state.tokenOwners}</div>
        ) : null}
        {this.state.address ? (
          <div>
            {this.state.address}{' '}
            {this.state.member
              ? 'owns a membership token.'
              : 'does not own a membership token.'}
          </div>
        ) : null}
        {this.state.showPurchaseButton ? (
          <button onClick={this.obtainToken}>Get Token</button>
        ) : null}
        {this.state.showConnectButton ? (
          <button onClick={this.authenticate}>Login</button>
        ) : null}
        {this.state.protectedContent ? (
          <div className="protectedContent">
            {this.state.protectedContent.message}
          </div>
        ) : null}
      </div>
    )
  }
}

export default Authentication
