// Importer les modules nécessaires
const { ethers } = require('hardhat');

async function main() {
    // Récupérer l'objet HRE (Hardhat Runtime Environment)
    const hre = require('hardhat');
    const { deployments, getNamedAccounts } = hre;

    // Obtenir les comptes nommés
    const { deployer, user1, user2 } = await getNamedAccounts();
    // Déployer le premier contrat

    const blopolAddress = "0xB0CA2446e79a4eADC67F5700348e3B79c4b65335";
    const tokenblopoladdress = "0x4AB7843Fc886D349E19Ba68267c000Af098EEf28";
    // Initialize Smart Contract
    const blopolContract = await ethers.getContractFactory("Blopol");
    const instance = await blopolContract.attach(blopolAddress);
    // Set SoftCap for minimal amount reward per ADs
    await instance.setSoftCap(10);
    // Set Ad Amount for user Blopol 5$ en Matic 
    await instance.setFees(5);
    // Set reward duration : Duration of rewards to be paid out (in seconds)
    await instance.setRewardsDuration(10000);
    // Transfer Token ownner mint when deployed contract (10 000 Blopol) to smartcontractAddress
    const blopolToken = await ethers.getContractFactory("TokenBlopol");
    const instanceToken = await blopolToken.attach(tokenblopoladdress);
    await instanceToken.mint(blopolAddress, 10000);  // Ne fonctionne pas
    const balanceBlopol = instanceToken.balanceOf(blopolAddress); // Ne fonctionne pas > Natif a l ERC20
  
    // Category management - Start idCat to 0
    await instance.addCategory("MONTRES");
    await instance.addCategory("TELEPHONES");
  
}
  
// Exécuter la fonction principale
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});