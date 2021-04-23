
[![Netlify Status](https://api.netlify.com/api/v1/badges/e53034de-5dd9-4845-bac8-d7976b490e50/deploy-status)](https://app.netlify.com/sites/gatedcommunity/deploys)

# Gated Community
Anonymous communities with finite membership based on a tradeable ERC721 compatible access token. 
[Demo](https://gatedcommunity.netlify.app) (requires Chrome, MetaMask, set to Rinkeby testnet)

## The Concept
The idea is to restrict access to physical or virtual content based on ownership of a token, in this case one based on ERC721. The tokens are "fungible" in the sense that they  can be listed for sale and transferred, but they are "non-fungible" in the sense that the token IDs are each unique, not like ERC20, allowing tiered access or admin rights within an organization. The token can be configured to allow royalties to flow back to the owner after each sale.

Example:
- An exclusive restaurant where only 1000 token owners have the right to make a reservation. They can buy and sell this right on a secondary market. 
- An exclusive job posting site. Token owners get access. Once they find a job, they either retain the token, or sell it. 

## Governance Example
- 1 token per address. 
- Limited number of tokens, in this case, 100. 
- Community members may vote to burn the token of a bad actor. Burned token gets added back to initial pool.

## The Authorization Flow:
- User visits site, signs message with wallet (MetaMask)
- Server recovers public key from signed message
- Server queries contract to assess for token ownership
- If there is a token associated with public key, issues json webtoken with authorization permission. This becomes the Bearer token that authorizes all future API calls for a period of time. 
- If there is not a token associated with public key, user is prompted to purchase initial token offering or buy one on secondary market. 

## Tech Used:
- solidity, truffle, ganache, vscode, create-react-app, json webtokens

## Installation:

### Client and Server
`npm install` in `./app` directory

`NODE_ENV=development yarn start` to run client (`localhost:3000`)

`NODE_ENV=development node server/server-local.js` to run server (`localhost:8080`)

### Contracts
`npm i truffle -g`
Run a local blockchain with Ganache or similar, served at port `8545`. 

Deploy to local network: 
`truffle migrate --compile-all --resert --network ganache`

Deploy to Rinkeby:
`truffle migrate --compile-all --resert --network rinkeby`

Need to have your seed phrase in a `seed.txt` file, and an Infura endpoint.

## To Do:

- Implement secondary market
- Implement token burn mechanism
- Implement royalty mechanism
