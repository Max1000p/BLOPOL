// Importer les modules nécessaires
const { ethers } = require('hardhat');

async function main() {
  // Récupérer l'objet HRE (Hardhat Runtime Environment)
    const hre = require('hardhat');
    const { deployments, getNamedAccounts } = hre;

    // Obtenir les comptes nommés
    const { deployer } = await getNamedAccounts();
    // Déployer le premier contrat
    const Chainlink = await deployments.deploy('Chainlink', {
    from: deployer,
    args: [],
    log: true,
  });
  console.log("ChainlinBolopol " + Chainlink.address);
}

// Exécuter la fonction principale
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});