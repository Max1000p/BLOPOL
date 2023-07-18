const TokenBlopol = artifacts.require("./TokenBlopol.sol");
const Blopol = artifacts.require("./Blopol.sol");
const { BN } = require('@openzeppelin/test-helpers/');
const {expectRevert, expectEvent} = require('@openzeppelin/test-helpers/');
const { expect } = require('chai');

contract('Blopol', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];
    const four = accounts[3];

    let instance, erc20instance;


    describe("Blopol - Smart Contract test Unit", function () {

        before(async function () {
            erc20instance = await TokenBlopol.new(10000);
            instance = await Blopol.new(erc20instance.address,{from:owner});
        });

        context("Test Admin function setting value", function () {
            
            it("account who is not owner can't set duration, revert", async () => {
                await expectRevert(instance.setSoftCap(new BN(1000), {from: second}), "Ownable: caller is not the owner");
            });
            it("Owner account can set duration", async () => {
                await instance.setSoftCap(new BN(1000), {from: owner});
                const storedData = await instance.getSoftCap({from: owner});
                expect(storedData).to.be.bignumber.equal(new BN(1000));
            });

            it("account who is not owner can't set Fees, revert", async () => {
                await expectRevert(instance.setFees(new BN(5), {from: second}), "Ownable: caller is not the owner");
            });

            it("Owner account can set Fees", async () => {
                await instance.setFees(new BN(5), {from: owner});
                const storedData = await instance.getFees({from: owner});
                expect(storedData).to.be.bignumber.equal(new BN(5));
            });

            it("account who is not owner can't set Duration, revert", async () => {
                await expectRevert(instance.setRewardsDuration(new BN(10000), {from: second}), "Ownable: caller is not the owner");
            });

            it("Owner account can set Duration", async () => {
                await instance.setRewardsDuration(new BN(10000), {from: owner});
                const storedData = await instance.getRewardsDuration({from: owner});
                expect(storedData).to.be.bignumber.equal(new BN(10000));
            });

            it("account who is not owner can't add category, revert", async () => {
                await expectRevert(instance.addCategory('MONTRES', {from: second}), "Ownable: caller is not the owner");
            });

            it("category name not empty, revert", async () => {
                await expectRevert(instance.addCategory('', {from: owner}), "Category name required");
            });

            it("Owner account can add category", async () => {
                await instance.addCategory('TELEPHONE', {from: owner});
                const storedData = await instance.getCategory(new BN(0),{from: owner});
                expect(storedData).to.be.equal('TELEPHONE');
            });

            it("Counter Id category auto increment when adding new category", async () => {
                await instance.addCategory('MONTRES', {from: owner});
                const storedData = await instance.counterCat.call();
                expect(storedData).to.be.bignumber.equal(new BN(2));
            });
        })

        describe("Setup staking rate with notifyRewardAmount. Smart contract need Token first", function () {

            context("Send Token to SmartContract Blopol - Mint token Blopol)", function () {
                 
                it("user can't mint token, revert", async () => {
                    await expectRevert(erc20instance.mint(third,new BN(10000), {from: second}), "Ownable: caller is not the owner");
                });
                
                it("Is Owner can mint token to smartcontract address", async () => {
                    const balancebeforeSmartContract = await erc20instance.balanceOf(instance.address);
                    await erc20instance.mint(instance.address,new BN(100), {from: owner});
                    const storedData = await erc20instance.balanceOf(instance.address);
                    const balanceAfterSmartContract = await erc20instance.balanceOf(instance.address);
                    expect(storedData.toString()).to.be.equal(balanceAfterSmartContract.toString());
                });

                it("user can't define reward rate -  call notifyRewardAmount", async () => {
                    await expectRevert(instance.notifyRewardAmount(new BN(10000), {from: second}), "Ownable: caller is not the owner");
                });

            })

        })
        
    })     
})
