// Importer les modules nécessaires
const { ethers } = require('hardhat');

async function main() {
    // Récupérer l'objet HRE (Hardhat Runtime Environment)
    const hre = require('hardhat');
    const { deployments, getNamedAccounts } = hre;

    // Obtenir les comptes nommés
    const { deployer, user1, user2 } = await getNamedAccounts();
    // Déployer le premier contrat

    const tokenblopoladdress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // Initialize Smart Contract
    const blopolContract = await ethers.getContractFactory("Blopol");
    const instance = await blopolContract.attach(blopolAddress);
    
    let timestamp = Math.floor(Date.now() / 1000);
    // Add comment
    await instance.addComment(0,timestamp,"Objet retrouvé en face du square vers la plage de Palavas les Flots", {from: user2});
    await instance.addComment(0,timestamp,"Objet aperçu en face d'un bar sur la cote d'Azur",{from: user1});
}