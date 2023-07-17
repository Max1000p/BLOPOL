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
  const blopolToken = await ethers.getContractFactory("TokenBlopol");
  const instanceToken = await blopolToken.attach(tokenblopol.address);
  await instanceToken.mint("0x90F79bf6EB2c4f870365E785982E1f101E93b906", 1000);
  const i = await instanceToken.calling();
  console.log(i);
}

// Exécuter la fonction principale
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});