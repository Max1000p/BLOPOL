# BLOPOL
## Une solution décentralisée pour les produits volés ou perdus

## Description et fonctionnalités

POC - Fonctionnalités dévelopées : 

- Connexion avec l'oracle Chainlink pour le calcul du SoftCap de l'application
<https://blopol-app-2023.vercel.app/>

- Dépot d'une annonce
- Paiement d'une annonce
- Système de staking et unstaking avec récompense en token de la plateforme Blopol
- Système de commentaires pour validation des rewards informateur
- Système de reward degressif pour les informateurs
- Suppression de l'annonce



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
