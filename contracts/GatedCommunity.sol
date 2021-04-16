// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22;

import "./OpenZeppelin/token/ERC721/ERC721.sol";

contract GatedCommunity is ERC721 {

    constructor() ERC721("GatedCommunity", "GC") public {
    }

  function mintToken(address to, uint256 tokenId, string uri) public {
      _safeMint(to, tokenId);
      require(_exists(tokenId));
  }

    function _totalSupply() {
        
    }   

}
