# Gated Community
Anonymous communities with finite membership based on a tradeable ERC721 compatible access token. 

## The Concept
The idea is to restrict access to physical or virtual content based on ownership of a token, in this case one based on ERC721. The tokens are "fungible" in the sense that they are can be listed for sale and transferred, but they are "non-fungible" in the sense that the token IDs are each unique, allowing tiered access or admin rights within an organization. The token can be configured to allow royalties to flow back to the owner after each sale.

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
- Server queries GatedCommunity contract to assess for token ownership
- If there is a token associated with public key, issues json webtoken with authorization permission.
- If there is not a token associated with public key, user is prompted to purchase initial token offering or buy one on secondary market. 

## Tech Used:
- solidity, truffle, ganache, vscode, create-react-app, json webtokens

## Project Structure

- `./server` is a simple Node.js `express` server. `npm install` and use `node server.js` or `nodemon server.js` for development. This will run a server at `localhost:8080`

- `./contract` is a `truffle` project. Start a `ganache` server at port `8545` to compile and deploy. May also deploy to rinkeby, but will need to put your seed phrase in a text file called `seed.txt`. Make sure to have MetaMask installed in your browser and 

- `./client` is a `create-react-app` project. `yarn start` will run a client at `localhost:3000` that will send api calls to the `8080` port. 

## To Do:

- Implement secondary market
- Implement token burn mechanism
- Implement royalty mechanism
- Improve testnet deploy
