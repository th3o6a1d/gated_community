// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22;

import "./OpenZeppelin/token/ERC721/ERC721.sol";

contract GatedCommunity is ERC721("GatedCommunity", "GC") {
    
    
    uint8 public tokenCount = 0;
    uint8 public maxTokens = 100;
    uint256 initialTokenPrice = 100000000000000000;
    
    constructor() public {
        
    }

    function obtainToken() public payable returns(bool) {
        require(msg.value == initialTokenPrice);
        if ((tokenCount < maxTokens) && (balanceOf(msg.sender) == 0)){
            _mint(msg.sender, tokenCount);
            tokenCount += 1;
        }
        return true;
    }

    function unclaimedTokens() public view returns(uint8){
        return maxTokens - tokenCount;
    }

    function totalTokenOwners() public view returns(uint8){
        return tokenCount;
    }

}
