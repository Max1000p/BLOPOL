// Importer les modules nécessaires
const { ethers } = require('hardhat');

async function main() {
    // Récupérer l'objet HRE (Hardhat Runtime Environment)
    const hre = require('hardhat');
    const { deployments, getNamedAccounts } = hre;

    // Obtenir les comptes nommés
    const { deployer, user1, user2 } = await getNamedAccounts();
    // Déployer le premier contrat

    const blopolAddress = "0xf2dF1A0fbA70d39A264E91717DA5Dce1143857b0";
    const tokenblopoladdress = "0x071c5BfDf9461cEBcD39b631de7db59329267b8B";
    // Initialize Smart Contract
    const blopolContract = await ethers.getContractFactory("Blopol");
    const instance = await blopolContract.attach(blopolAddress);
    // Set SoftCap for minimal amount reward per ADs
    await instance.setSoftCap(10);
    const SoftCap = await instance.getSoftCap();
    console.log("SoftCap updated : " + SoftCap);
    // Set Ad Amount for user Blopol 5$ en Matic 
    await instance.setFees(5);
    const adAmount = await instance.getFees();
    console.log("Ad amount updated : " + adAmount);
    // Set reward duration : Duration of rewards to be paid out (in seconds)
    await instance.setRewardsDuration(10000);
    // Transfer Token ownner mint when deployed contract (10 000 Blopol) to smartcontractAddress
    const blopolToken = await ethers.getContractFactory("TokenBlopol");
    const instanceToken = await blopolToken.attach(tokenblopoladdress);
    await instanceToken.mint(blopolAddress, 10000);  // Ne fonctionne pas
    const balanceBlopol = instanceToken.balanceOf(blopolAddress); // Ne fonctionne pas > Natif a l ERC20
    console.log('Balance token blopol in smart contract ' + balanceBlopol.toString());
    // Category management - Start idCat to 0
    await instance.addCategory("MONTRES");
    await instance.addCategory("TELEPHONES");
    const cat0 = await instance.getCategory(0);
    console.log("Category 0 = " + cat0);
    const cat1 = await instance.getCategory(1);
    console.log("Category 1 = " + cat1);

    
}
  
// Exécuter la fonction principale
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});