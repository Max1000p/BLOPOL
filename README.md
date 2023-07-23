# BLOPOL
## Une solution décentralisée pour les produits volés ou perdus
Tools > TRUFFLE

## Description 

Vote process : 

- The voting administrator registers a whitelist of voters identified by their Ethereum address.

- The voting administrator starts the recording session of the proposal.

- Registered voters are allowed to register their proposals while the registration session is active.

- The voting administrator terminates the proposal recording session.

- The voting administrator starts the voting session.

- Registered voters vote for their preferred proposal.

- The voting administrator ends the voting session.

- The voting administrator counts the votes.

- Everyone can check the final details of the winning proposal.


## Run tests

```sh
truffle test
```

## Test structure
All test are realized by state process to control function, expect, event, and revert

44 Tests

- Testing getter function and access right
- testing return event on different state
- Building of tests from scenarios :
1) voting system start => add voter
2) Voting with voter => add proposals
3) Voting with voter and proposal => Set vote
4) Voting with voter, proposal and vote => Tallyvote


## Author

👤 **Pareja Cyril**

* Twitter: [@cypareja](https://twitter.com/cypareja)
* Github: [@Max1000p](https://github.com/Max1000p)
