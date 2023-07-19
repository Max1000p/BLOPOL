// Importer les modules nécessaires
const { ethers } = require('hardhat');

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