# BLOPOL
## Une solution décentralisée pour les produits volés ou perdus
Application de dépôt d’annonce pour objets perdus ou volés avec un système de récompenses. Un informateur peut déposer un commentaire, si ce commentaire est approuvé, il gagne la récompense que l’utilisateur a bloqué sur la plateforme.


## Description et fonctionnalités

POC - Fonctionnalités dévelopées : 

- Connexion avec l'oracle Chainlink pour le calcul du SoftCap de l'application
Source Code branche deploy : https://github.com/Max1000p/BLOPOL/blob/deploy/backend/contracts/Blopol.sol
- <https://blopol-app-2023.vercel.app/>

- Dépot d'une annonce
- Paiement d'une annonce
- Système de staking et unstaking avec récompense en token de la plateforme Blopol
- Système de commentaires pour validation des rewards informateur
- Système de reward degressif pour les informateurs
- Suppression de l'annonce

## Déploiement des scripts
Déployer les contrats :

```bash
yarn hardhat run ./scripts/01_deploy.js --network localhost
```

Setup de l'application : 
```bash
yarn hardhat run ./scripts/02_interact.js --network localhost
```



## Stack technique
HARDHAT + SOLIDITY + NEXTJS + RainbowKit + WAGMI + VIEM

## Utilisation de contrats
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "https://github.com/bokkypoobah/BokkyPooBahsDateTimeLibrary/blob/master/contracts/BokkyPooBahsDateTimeLibrary.sol";


## Run tests
Control function, expect, event, and revert
60 passing

```sh
yarn hardhat test
```

## Liens utiles
* Video de présentation de l'application : https://youtu.be/JWy7kSVybDs
* Lien pour le POC sur Chainlink - réseau Polygon Mumbai : https://blopol-app-2023.vercel.app/


## Author

👤 **Pareja Cyril**

* Twitter: [@cypareja](https://twitter.com/cypareja)
* Github: [@Max1000p](https://github.com/Max1000p)
