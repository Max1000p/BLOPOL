const { ethers } = require("hardhat")

// Populate on local testnet for comments user on Ads 0
async function main() {
    let owner, addr1, addr2;

    [owner, addr1, addr2] = await ethers.getSigners();


    const instance = await hre.ethers.getContractAt("Blopol", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

    let timestamp = Math.floor(Date.now() / 1000);
    let transaction = instance.connect(addr1).addComment(0,timestamp,"Objet retrouvé en face du square vers la plage de Palavas les Flots");
    transaction = await instance.connect(connect).addComment(0,timestamp,"Objet aperçu en face d'un bar sur la cote d'Azur");
   
    console.log();
    let comment = await instance.connect(owner).getCommentbyAd(0);
    console.log(comment);

}

main()
    .then(() => process.exit(0)) 
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })