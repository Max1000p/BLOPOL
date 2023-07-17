# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## Notion de staking =>

on met des MATIC et on récuperes des BLOPOL
le timestamp détermine la periode t
ex. 200 MATIC en t=4  --> Combien de GG gagner en t=6
1 > La distribution se fait en block/sec : rewardRate
2 > Combien de MATIC sont en ce moment bloqués par tout le monde : totalSupply

Blopol décide d'emettre 200 tokens par blocks
https://medium.com/coinmonks/the-incredible-math-in-ethereum-staking-contract-and-how-to-implement-it-in-solidity-e8f8d973ea1f