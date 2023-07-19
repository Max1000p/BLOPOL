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
    // ads timestamp (1685611486)= 01/06/2023 11:24:46
    const ads = {idAds:0,ownerAds:"0x90F79bf6EB2c4f870365E785982E1f101E93b906",depositAds: 1685611486,titleAds:"Montre Rollex volee",idcatAds:0,geolocAds:"48.8588897,2.320041"};
    // ads timestamp2 = Now()
    let timestamp = Math.floor(Date.now() / 1000);
    const ads2 = {idAds:0,ownerAds:"0x90F79bf6EB2c4f870365E785982E1f101E93b906",depositAds: timestamp,titleAds:"Montre Cartier volee",idcatAds:0,geolocAds:"42.652912,2.942701"};
    // More than 7 DAYS
    const ads3 = {idAds:0,ownerAds:"0x90F79bf6EB2c4f870365E785982E1f101E93b906",depositAds: 1688217758,titleAds:"Montre Breitling volee",idcatAds:0,geolocAds:"42.652912,2.942701"};
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
                await instance.setSoftCap(new BN(10), {from: owner});
                const storedData = await instance.getSoftCap({from: owner});
                expect(storedData).to.be.bignumber.equal(new BN(10));
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
                    await instance.notifyRewardAmount(new BN(255555), {from: owner});
                    const storedData = await instance.rewardRate.call();
                    expect(storedData.toString()).to.be.equal(new BN(25));
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

            context("Deposit AD, check minimum price, check total Supply", function () {

                it("User can't deposit Ad if payment minimal amount is not reach", async () => {
                    await expectRevert(instance.paymentAds(ads,rwd, {from: third, value: new BN(1000)}), "Price minimum required");
                });

                it("No ads deposit, no staking, total supply amount = 0", async () => {
                    const storedData = await instance.totalSupply.call();
                    expect(storedData).to.be.bignumber.equal(new BN(0));
                });

                it("User deposit Ad with minimum payment, get Event PaymentReceived", async () => {
                    const findEvent = await instance.paymentAds(ads,rwd, {from: third, value: new BN("12255565200000000000", 10)});
                    expectEvent(findEvent,"PaymentReceived");
                });

                it("first ads deposit, check data idAds set to 0", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[0].toString()).to.be.bignumber.equal(new BN(0));
                });

                it("first ads deposit, check data OwnerAds set to third address", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[1].toString()).to.be.equal(third);
                });

                it("first ads deposit, check data depositAds set to timestamp 1685611486 ", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[2].toString()).to.be.equal("1685611486");
                });

                it("first ads deposit, check data titleAds set to Montre Rollex volee", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[3].toString()).to.be.equal("Montre Rollex volee");
                });

                it("first ads deposit, check data idcatAds set to 0", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[4].toString()).to.be.bignumber.equal(new BN(0));
                });

                it("first ads deposit, check data geolocs set to 48.8588897,2.320041", async () => {
                    const storedData = await instance.getAdsById(new BN(0));
                    expect(storedData[5].toString()).to.be.equal("48.8588897,2.320041");
                });

                it("only creator can data reward initial", async () => {
                    await expectRevert(instance.getRewardInitial(new BN(0), {from: second}), "Wrong account for this action");
                });

                it("first ads deposit, creator can check data reward set to 12255565200000 ", async () => {
                    const storedData = await instance.getRewardInitial(new BN(0), {from: third});
                    expect(storedData).to.be.bignumber.equal(new BN("12255565200000",10));
                });

                it("Second Ads deposit, total supply amount added", async () => {
                    await instance.paymentAds(ads,rwd, {from: third, value: new BN("1000000000000000000000", 10)});
                    const storedData = await instance.totalSupply.call();
                    expect(storedData).to.be.bignumber.not.equal(new BN(0));
                });

                it("User deposit Ad with minimum payment, get Event CreateAds", async () => {
                    const findEvent = await instance.paymentAds(ads,rwd, {from: third, value: new BN("1000000000000000000000", 10)});
                    expectEvent(findEvent,"CreateAds");
                });

                it("User deposit Ad with minimum payment, get Event AddReward", async () => {
                    const findEvent = await instance.paymentAds(ads,rwd, {from: third, value: new BN("1000000000000000000000", 10)});
                });

                it("counterId Ads auto increment when adding new Ads", async () => {
                    const counterBeforeCreate = await instance.counterId.call();
                    await instance.paymentAds(ads,rwd, {from: third, value: new BN("1000000000000000000000", 10)});
                    const counterAfterCreate = await instance.counterId.call();
                    expect(counterAfterCreate).to.be.bignumber.equal(new BN(counterBeforeCreate).add(new BN(1)));
                });

            })

            context("Stake token by Ad, show Balance earned, ask for reward", function () {

                it("User can't check balance staking token if he is not the Owner Creator Ad", async () => {
                    await expectRevert(instance.getBalanceStakingTokenByAds(new BN(2), {from: owner}), "Wrong account for this action");
                });

                it("User who create ads can show his balance staking ads", async () => {
                    await instance.paymentAds(ads,rwd, {from: third, value: new BN("1000000000000000000000", 10)});
                    const idAd = await instance.counterId.call();
                    const storedData = await instance.getBalanceStakingTokenByAds(new BN(idAd).sub(new BN(1)), {from: third});
                    expect(storedData).to.be.bignumber.not.equal(new BN(0));
                });

                it("User who is not owner ad can't see earned balance token Blopol by Ad", async () => {
                    await expectRevert(instance.getBalanceRewardBlopolByAds(new BN(0), {from: second}), "Wrong account for this action");
                });

                it("User owner ads can see earned balance token Blopol by Ad", async () => {
                    const storedData = await instance.getBalanceRewardBlopolByAds(new BN(0), {from: third});
                    expect(storedData).to.be.bignumber.not.equal(new BN(0));
                });

                it("User who is not owner ad can't ask to get reward Token Blopol", async () => {
                    await expectRevert(instance.getReward(new BN(0), {from: second}), "Wrong account for this action");
                });

                it("User owner ads can get reward token Blopol by Ad", async () => {
                    const blopolRewarEarned = await instance.getBalanceRewardBlopolByAds(new BN(0), {from: third});
                    await instance.getReward(new BN(0), {from: third});
                    const storedData = await instance.getBlopolBalance({from: third});
                    expect(blopolRewarEarned.toString()).to.be.bignumber.equal(storedData.toString());
                });

                
            })

            context("Withdraw function for creator who decide un-staking part token by ads", function () {

                it("User can't withdraw he is not the Owner Creator Ad", async () => {
                    await expectRevert(instance.withdraw(new BN(0), {from: owner}), "Wrong account for this action");
                });

                it("User can't ask for withdraw he is not the Owner Creator Ad", async () => {
                    await expectRevert(instance.CanWithdrawNow(new BN(0), {from: owner}), "Wrong account for this action");
                });

                it("User owner ads ask for withdraw (NO softCap block)- Example Ads 0 | deposit > 48 days | amount staked for Ads < SoftCap", async () => {
                    const storedData = await instance.CanWithdrawNow(new BN(0), {from: third});
                    expect(storedData.toString()).to.be.equal(new BN(0));
                });

                it("User owner ads ask for withdraw (ads2 - STEP_0_7_DAYS) - Example new Ads 7 | deposit > Now | amount staked for Ads > SoftCap", async () => {
                    const count = await instance.counterId.call();
                    await instance.paymentAds(ads2,rwd, {from: third, value: new BN("320000000000000000000", 10)});
                    await instance.paymentAds(ads2,rwd, {from: third, value: new BN("320000000000000000000", 10)});
                    await expectRevert(instance.withdraw(new BN(7), {from: third}), "Withdraw not possible at this moment");
                });

                it.skip("User owner ads ask for withdraw (ads3 - STEP_8_15_DAYS) - Example new Ads 8 | deposit > Now | amount staked for Ads > SoftCap", async () => {
                    await instance.paymentAds(ads3,rwd, {from: owner, value: new BN("320000000000000000000", 10)});
                    await instance.paymentAds(ads3,rwd, {from: owner, value: new BN("320000000000000000000", 10)});
                    const storedData = await instance.getAdsById(new BN(8));
                    console.log(storedData[1].toString());
                    console.log(storedData[2].toString());
                    //await instance.paymentAds(ads3,rwd, {from: third, value: new BN("320000000000000000000", 10)});
                    await expectRevert(instance.withdraw(new BN(9), {from: third}), "Withdraw not possible at this moment");
                });
            })    

        })

        
    })     
})
