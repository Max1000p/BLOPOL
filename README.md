# BLOPOL
## Une solution décentralisée pour les produits volés ou perdus

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


## Stack technique
HARDHAT

NEXTJS + RainbowKit + WAGMI + VIEM 

## Run tests

```sh
yarn hardhat test
```

## Test structure
Control function, expect, event, and revert

59 passing (3s)

Contract: Blopol
    Blopol - Smart Contract test Unit
      Test Admin function setting value
        ✔ No ads deposit, no staking, total supply amount = 0
        ✔ account who is not owner can't set SoftCap, revert
        ✔ Owner account can set SoftCap
        ✔ account who is not owner can't set Fees, revert
        ✔ Owner account can set Fees
        ✔ account who is not owner can't set Duration, revert
        ✔ Owner account can set Duration
        ✔ account who is not owner can't add category, revert
        ✔ category name not empty, revert
        ✔ Owner account can add category
        ✔ Counter Id category auto increment when adding new category
      Setup staking rate with notifyRewardAmount. Smart contract need Token first
        Send Token to SmartContract Blopol and setup rate and staking vars
          ✔ user can't mint token, revert
          ✔ Is Owner can mint token to smartcontract address
          ✔ user can't define reward rate -  call notifyRewardAmount
          ✔ Owner can't define reward rate if amount / duration = 0
          ✔ Owner can't define reward rate if rewardRate * duration <= token balance contract Blopol
          ✔ Owner can define reward rate
      Notify reward and setDuration test
        Check calculation variables for staking
          ✔ reward rate and duration set, finishAt must be set timestamp (set to updatedAt) + duration
          ✔ Owner want to set new duration before finishAt expired, revert
        User want to deposit an Ad, system to calcul Ad and reward helpers
          ✔ Give minimum price for fees platform and reward helpers, result not be 0
        Deposit AD, check minimum price, check total Supply
          ✔ User can't deposit Ad if payment minimal amount is not reach
          ✔ User deposit Ad with minimum payment, get Event PaymentReceived
          ✔ Total supply ++ when ads is staking
          ✔ first ads deposit, check data idAds set to 0
          ✔ first ads deposit, check data OwnerAds set to third address
          ✔ first ads deposit, check data depositAds timestamp
          ✔ first ads deposit, check data titleAds set to Montre Rollex volee
          ✔ first ads deposit, check data idcatAds set to 0
          ✔ first ads deposit, check data geolocs set to 48.8588897,2.320041
          ✔ Ads deposit, total supply amount added
          ✔ User deposit Ad with minimum payment, get Event CreateAds
          ✔ User deposit Ad with minimum payment, get Event AddReward
          ✔ counterId Ads auto increment when adding new Ads
      Use interaction with staking method
        Check calculation variables for staking
          ✔ reward rate and duration set, finishAt must be set timestamp (set to updatedAt) + duration
          ✔ Owner want to set new duration before finishAt expired, revert
        Stake token by Ad, show Balance earned, ask for reward
          ✔ User can't check balance staking token if he is not the Owner Creator Ad
          ✔ User who create ads can show his balance staking ads
          ✔ User who is not owner ad can't see earned balance token Blopol by Ad
          ✔ User owner ads can see earned balance token Blopol by Ad
          ✔ User who is not owner ad can't ask to get reward Token Blopol
          ✔ User owner ads can get reward token Blopol by Ad
      Use interaction with withdraw methods
        Ads Timestamp = > 48 days deposit Ads
          ✔ User can't withdraw he is not the Owner Creator Ad
          ✔ User can't ask for withdraw he is not the Owner Creator Ad
          ✔ User owner ads ask for withdraw (NO softCap block) - deposit > 48 days | amount staked for Ads < SoftCap
        Ads ads Timestamp < 7 days deposit Ads - No withdraw possible
          ✔ User owner ads ask for withdraw (ads2 - STEP_0_7_DAYS) - Ads 6 | deposit > Now | amount staked for Ads > SoftCap
        Ads ads Timestamp > 7 days deposit Ads 
          ✔ User owner can withdraw (STEP_8_15_DAYS) | amount staked for Ads > SoftCap
          ✔ User owner can withdraw - get event WithdrawReceived
        Ads ads Timestamp > 7 days deposit Ads 
          ✔ User owner can't withdraw, amount reward - % allowed < SoftCap (ads3 - STEP_8_15_DAYS)
      function for Comments and Reward for Helpers
        Add and Get comments
          ✔ User can't add a comment if ad not exist
          ✔ User can add a comment if ad exist
        Givre rewards
          ✔ user not creator Ads can't give reward for this ads
          ✔ Creator owner ad can give reward
          ✔ Give reward for helpers - get event RewardReceived
          ✔ Creator owner ad can't give reward if total reward already send
      Remove Ads
        ✔ Creator not owner ad can't cancel Ads
        ✔ ad Creator owner  can cancel his Ads - ownerAds reset to 0
        ✔ ad Creator owner can cancel his Ads - withdraw funds staking platform
        ✔ ad Creator owner can cancel his Ads - Total supply --
      Panic Withdraw SmartContract Balance
        ✔ ad Creator owner can cancel his Ads - withdraw funds staking platform


## Author

👤 **Pareja Cyril**

* Twitter: [@cypareja](https://twitter.com/cypareja)
* Github: [@Max1000p](https://github.com/Max1000p)
