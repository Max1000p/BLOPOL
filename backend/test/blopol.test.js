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
    /** Constantes for Ads */
    const ads = {idAds:0,ownerAds:"0x90F79bf6EB2c4f870365E785982E1f101E93b906",depositAds: 11689258304,
                        titleAds:"Montre Rollex volee",idcatAds:0,geolocAds:"48.8588897,2.320041"};
    const cads = {idAdsC:0,dateAndTimeAds:11689258900,complaintAds:0,productNameAds:"Rollex Or",estimatedValueAds:"2000$",
                        serialNumberAds:"xxxxxx",contentAds:"Vole en vacance au bord de la mer"};
    const rwd = {idAds:0,amountReward:12255565200000};


    describe("Blopol - Smart Contract test Unit", function () {

        before(async function () {
            erc20instance = await TokenBlopol.new(10000);
            instance = await Blopol.new(erc20instance.address,{from:owner});
        });

        context("Test Admin function setting value", function () {
            
            it("account who is not owner can't set SoftCap, revert", async () => {
                await expectRevert(instance.setSoftCap(new BN(1000), {from: second}), "Ownable: caller is not the owner");
            });
            it("Owner account can set SoftCap", async () => {
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
                const storedData = await instance.duration.call();
                expect(storedData.toString()).to.be.equal(new BN(10000));
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

            context("Send Token to SmartContract Blopol and setup rate and staking vars", function () {
                 
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

                
                it("Owner can't define reward rate if amount / duration = 0", async () => {
                    await expectRevert(instance.notifyRewardAmount(new BN(1000), {from: owner}), "reward rate = 0");
                });
                
                it("Owner can't define reward rate if rewardRate * duration <= token balance contract Blopol", async () => {
                    await expectRevert(instance.notifyRewardAmount(new BN("110000000000000000000000", 10), {from: owner}), "reward amount > balance");
                });

                it("Owner can define reward rate", async () => {
                    await instance.notifyRewardAmount(new BN(9000000000000000), {from: owner});
                    const storedData = await instance.rewardRate.call();
                    expect(storedData.toString()).to.be.equal('900000000000');
                });
                
                it("reward rate and duration set, finishAt must be set timestamp (set to updatedAt) + duration", async () => {
                    const finishAt = new BN(await instance.finishAt.call());
                    const updatedAt = new BN(await instance.updatedAt.call());
                    const duration = new BN(await instance.duration.call());
                    let sum = updatedAt.add(duration);
                    expect(finishAt.toString()).to.be.equal(sum.toString());
                });

                it("Owner want to set new duration before finishAt expired, revert", async () => {
                    await expectRevert(instance.setRewardsDuration(new BN(100000), {from: owner}), "reward duration not finished");
                });
            })

        })

        describe("Application is setup, interaction with user and staking", function () {
            
            context("User want to deposit an Ad, system to calcul Ad and reward helpers", function () {
                
                it("Give minimum price for fees platform and reward helpers, result not be 0", async () => {
                    const px = await instance.displayAmountForDepositAd();
                    expect(px.toString()).to.not.equal(new BN(0));
                });
            })    

            context("Deposit AD, check minimum price, stake token", function () {

                it("User can't deposit Ad if payment minimal amount is not reach", async () => {
                    await expectRevert(instance.paymentAds(ads,cads,rwd, {from: third, value: new BN(1000)}), "Price minimum required");
                });

                it("User deposit Ad with minimum payment, get Event PaymentReceived", async () => {
                    const pxmini = await instance.displayAmountForDepositAd();
                    const findEvent = await instance.paymentAds(ads,cads,rwd, {from: third, value: new BN("830000000000000000000", 10)});
                    expectEvent(findEvent,"PaymentReceived");
                });

                it("User deposit Ad with minimum payment, get Event CreateAds", async () => {
                    const findEvent = await instance.paymentAds(ads,cads,rwd, {from: third, value: new BN("830000000000000000000", 10)});
                    expectEvent(findEvent,"CreateAds");
                    const storedData = await instance.counterId.call();
                    console.log(storedData);
                });

                it("User deposit Ad with minimum payment, get Event CreateContentAds", async () => {
                    const findEvent = await instance.paymentAds(ads,cads,rwd, {from: second, value: new BN("830000000000000000000", 10)});
                    expectEvent(findEvent,"CreateContentAds");
                    const storedData = await instance.counterId.call();
                    console.log(storedData);
                });

                it("User deposit Ad with minimum payment, get Event AddReward", async () => {
                    const findEvent = await instance.paymentAds(ads,cads,rwd, {from: second, value: new BN("830000000000000000000", 10)});
                    expectEvent(findEvent,"AddReward");
                    const storedData = await instance.counterId.call();
                    console.log(storedData);
                });

                /*
                it("counterId Ads auto increment when adding new Ads", async () => {
                    await instance.paymentAds(ads,cads,rwd, {from: second, value: new BN("830000000000000000000", 10)});
                    const storedData = await instance.counterID.call();
                    expect(storedData).to.be.bignumber.equal(new BN(1));
                });
                */

            })    

        })

        
    })     
})
