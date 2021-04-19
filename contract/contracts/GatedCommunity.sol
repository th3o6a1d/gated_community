// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22;

import "./OpenZeppelin/token/ERC721/ERC721.sol";

contract GatedCommunity is ERC721("GatedCommunity", "GC") {
    
    
    uint8 public tokenCount = 1;
    uint8 public maxTokens = 100;
    
    constructor() public {
        
    }

    function obtainToken() public {
        if ((tokenCount < maxTokens) && (balanceOf(msg.sender) == 0)){
            _mint(msg.sender, tokenCount);
            tokenCount += 1;
        }
    }


}
