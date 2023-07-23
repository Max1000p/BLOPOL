// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

 
contract TokenBlopol is ERC20, Ownable {   

    constructor(uint256 initialSupply) ERC20("BLOPOL", "BLOPOL") {
        _mint(msg.sender, initialSupply* 10**18);
    }

     function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount* 10**18);
    }

}