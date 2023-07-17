// Importer les modules nécessaires
const { ethers } = require('hardhat');

/* Etapes du déploiement et script
  1) Indiquer la valeur du nombre de token à distribuer pendant la durée du Staking
  1 année = 31536000 secondes.
  1000000
  2) Transferer les Tokens Blopol dans le SC de staking - mint + transfer
  3) Lancer la fonction notifurewardAmount pour calculer le rewardRate (10^18) calc amount / duration
  100000000000000000000000
  pour 31536000000000000000000000
  Test Staking > 
  1) user stake
  2) balance of stake by ads
  3) earned calc token
  puis
  Get Reward > 
  1) user claim reward by Ads
  2) Envoi les tokens Blopol à l'utilisateur > Check balance blopol-UserAdress
  puis Withdraw ....
  1) user make wihdraw by Ads > Regle de gestion à intégrée
  Opération de l'admin pour le staking : 
  SetDuration
  Send Token Blopol to the Smartcontract
  Notif Amount to ditribute per token by block
  A lancer pour l'app > setFees : montant de l'annnonce minmum pour la plateforme
  A lancer pour l'app > setSoftCap : montant minimum pour le paiment de l'annonce
*/
async function main() {
  // Récupérer l'objet HRE (Hardhat Runtime Environment)
    const hre = require('hardhat');
    const { deployments, getNamedAccounts } = hre;

    // Obtenir les comptes nommés
    const { deployer } = await getNamedAccounts();
    // Déployer le premier contrat
    const tokenblopol = await deployments.deploy('TokenBlopol', {
    from: deployer,
    args: [10000],
    log: true,
  });
  console.log(tokenblopol.address);

  // Obtenir l'adresse du premier contrat déployé et déployé le 2eme Contrat

  const blopol = await deployments.deploy('Blopol', {
    from: deployer,
    args: [tokenblopol.address],
    log: true,
  });
    
    console.log(blopol.address)

}

// Exécuter la fonction principale
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});