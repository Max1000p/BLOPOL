// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; 

contract Chainlink {   

	AggregatorV3Interface internal priceFeed;   
	constructor() { 
        // Test déploiement JPY
		priceFeed = AggregatorV3Interface(0x982B232303af1EFfB49939b81AD6866B2E4eeD0B);

	}   /** * Returns the latest price */   

	function getLatestPrice() public view returns (int) {         
		
        ( /*uint80 roundID*/, int price, /*uint startedAt*/, /*uint timeStamp*/, /*uint80 answeredInRound*/ )     

		= priceFeed.latestRoundData();         

		return price;     
	}  
}