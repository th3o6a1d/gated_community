const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require("fs");
let mnemonic = fs.readFileSync('./seed.txt', 'utf8');
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/c9f0e6b4f596427a8eb78f2b8e1a6d0a`),
      network_id: 4,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: "0.8.3"
    }
  }
};
