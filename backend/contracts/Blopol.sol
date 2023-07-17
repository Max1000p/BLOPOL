// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./BokkyPooBahsDateTimeLibrary.sol";

/// @title A decentralized solution for stolen or lost products
/// @author PAREJA Cyril
contract Blopol is Ownable, ReentrancyGuard {
    
    using BokkyPooBahsDateTimeLibrary for uint;
    using SafeMath for uint256;      
    IERC20 public immutable rewardsToken;

    /// @notice Duration of rewards to be paid out (in seconds)
    uint public duration;
    /// @notice Timestamp of when the rewards finish
    uint public finishAt;
    //// @notice Minimum of last updated time and reward finish time
    uint public updatedAt;
    /// @notice Reward to be paid out per second
    uint public rewardRate;
    //// @notice Sum of (reward rate * dt * 1e18 / total supply)
    uint public rewardPerTokenStored;
    /// @notice Counter for AD
    uint counterId;
    /// @notice Counter for Category
    uint counterCat;
    /// @notice Total staked
    uint public totalSupply;
    /// @notice Amount minimum for rewards
    uint private _softCap;
    /// @notice Amount for deposit a Ad 
    uint private _fees;

    /// @notice Constant for Withdraw rules and ads reward user
    uint private constant STEP_0_7_DAYS = 7;
    uint private constant STEP_8_15_DAYS = 8;
    uint private constant STEP_16_30_DAYS = 16;
    uint private constant STEP_31_90_DAYS = 31;
    uint private constant STEP_91_180_DAYS = 90;
    uint private constant STEP_181_DAYS = 181;

    uint private constant RATE_INF_6_MONTH = 20;
    uint private constant RATE_SUP_6_MONTH = 10;

    /// @notice store for ads
    /// @dev Array solution storage for ads 
    struct Ads {
        uint idAds;
        address ownerAds;
        uint depositAds;
        string titleAds;
        uint idcatAds;
        string geolocAds;
    }

    /// @notice store for contents
    /// @dev Mapping solution storage for ads 
    struct ContentAds {
        uint idAdsC;
        uint dateAndTimeAds;
        bool complaintAds;
        string productNameAds;
        string estimatedValueAds;
        string serialNumberAds;
        string contentAds;
    }

    struct Category {
        uint idCategory;
        string nameCategory;
    }

    struct ImageAds {
        uint idImageAds;
        string linkImage;
    }

    struct Comments {
        uint commentDate;
        address helpers;
        string information;
        bool flag;
    }

    struct RewardAds {
        uint idAds;
        uint amountReward;
    }

    struct WithdrawAds {
        uint idAd;
        uint dateWithdraw;
        uint amountWithdraw;
        uint stepWithdraw;
        bool doneWDA;
    }

    /// @notice Data structure and storage for Ads
    Ads[] public adsArray;
    mapping(uint => ContentAds) public cads;
    Category[] catArray;
    mapping(uint => ImageAds[]) public imgArray;
    mapping(uint => RewardAds) public rwd;
    mapping (address => uint[]) adsOwner;
    
    /// @notice Data struture and storage for Comments
    mapping(uint => Comments[]) public comments;
    mapping(address => uint[]) helpersAds;

    WithdrawAds[] public withdrawArray;
    

    ///@notice Control Address and check if identifier Ads exists
    modifier checkAdsRecord(uint _idAds){
        require(msg.sender != address(0), "Wrong address");
        require(_idAdsExistsForAccount(msg.sender, _idAds), "Ads not exists");
        _;
    }

    /*-----------------------------------------------------------------------*/
    /// @notice Staking structure
    struct StakingToken {
        address walletAdAddress;
        uint256 amount;
    }
    
    /// Wallet pour récupérer les fees
    mapping(address => uint) public blopolsWallet;
    /// Un wallet de staking par annonce
    mapping(address => mapping(uint256 => StakingToken)) public stakingtokens;

    // User address => rewardPerTokenStored
    mapping(address => mapping(uint => uint)) public userRewardPerTokenPaid;
    // User address => rewards to be claimed
    mapping(address => mapping(uint => uint)) public rewards;
    
    /* ----------------  EVENTS ------------------- */
    event CreateAds(address indexed ownerAds, uint idAds, uint depositAds, string titleAds, string geolocAds);
    event CreateContentAds(uint indexed idAds, uint dateAndTimeAds);
    event AddImage(uint indexed idAds,uint indexed idImageAds, string linkImage);
    event AddReward(uint indexed idAds, uint ammountReward);
    event AddComment(uint indexed idAds,address account);
    event PaymentReceived(address indexed from, uint256 idAds, uint256 amount);
    event RewardReceived(uint indexed idAds, address indexed account, uint256 amount);
    event WithdrawReceived(uint indexed idAds, address indexed account, uint256 amount);
    event CancelAdd(uint indexed idAds, address indexed account, uint256 amount);

    constructor(address _rewardToken) {
        rewardsToken = IERC20(_rewardToken);
    }

    /*------------ADS Managment -------------*/
    /// @notice Access list Ads per user, add a user for an ADs
    /// @param _account et _idAds
    function _addOwnerAds(address _account, uint _idAds) private {
        require(_account != address(0), "user address not exists");
        require(_idAds >= 0, "bad ads identifier");
        adsOwner[_account].push(_idAds);
    }

    /// @notice Control if an Ad exist for an account creator
    /// @dev control if a user have got an Ads
    /// @param _account, _idAds
    /// @return Bool
    function _idAdsExistsForAccount(address _account, uint _idAds) private view returns (bool) {
        require(_account != address(0), "user address not exists");
        for (uint i = 0; i < adsOwner[_account].length; i++) {
            if (adsOwner[_account][i] == _idAds) {
                return true;
            }
        }
        return false;
    }

    /// @notice store information like an index for optimize Onchain search
    /// @param  _idAd identifier Ads
    /// @return deposit date of Ads
    function _getAdsDepositDate(uint _idAd) private view returns(uint){
        for (uint i = 0; i < adsArray.length; i++) {
            if (adsArray[i].idAds == _idAd) {
                return adsArray[i].depositAds;
            }
        }
        return 0;
    }

    /// @notice Create a new ads in array, loop usage in App
    /// @dev Adding an Ads in array adsArray
    /// @param _currentCounter for unique identifier, _depositAds date depositAs, _titleAds title Ads, _idcatAds Id category, _geolocAds geolocalization
    function _createAds(uint _currentCounter,uint _depositAds,string calldata _titleAds,uint _idcatAds, string calldata _geolocAds) private {
        Ads memory ads;
        ads.idAds = _currentCounter;
        ads.ownerAds = msg.sender;
        ads.depositAds = _depositAds;
        ads.titleAds = _titleAds;
        ads.idcatAds = _idcatAds;
        ads.geolocAds = _geolocAds;
        adsArray.push(ads);
        
        _addOwnerAds(msg.sender, _currentCounter);
        
        emit CreateAds(msg.sender, _currentCounter, _depositAds, _titleAds, _geolocAds);
    }
    
    /// @notice Create data content Ads, mapping structure
    /// @dev content of Ads added in mapping
    function _createContentAds(uint _idAdsC,uint _dateAndTimeAds,bool _complaintAds,string calldata _productNameAds,string calldata _estimatedValueAds,
                              string calldata _serialNumberAds,string calldata _contentAds) private checkAdsRecord(_idAdsC){
        cads[_idAdsC].idAdsC = _idAdsC;
        cads[_idAdsC].dateAndTimeAds = _dateAndTimeAds;
        cads[_idAdsC].complaintAds = _complaintAds;
        cads[_idAdsC].complaintAds = _complaintAds;
        cads[_idAdsC].productNameAds = _productNameAds;
        cads[_idAdsC].estimatedValueAds = _estimatedValueAds;
        cads[_idAdsC].serialNumberAds = _serialNumberAds;
        cads[_idAdsC].contentAds = _contentAds;
        
        emit CreateContentAds(_idAdsC,_dateAndTimeAds);
    } 

    /// @notice Add an image on Ads, mapping and array structure
    function _addImage(uint _id, uint _idImageAds, string memory _linkImage) private {
        ImageAds memory newImage = ImageAds(_idImageAds, _linkImage);
        imgArray[_id].push(newImage);
        emit AddImage(_id,_idImageAds,_linkImage);
    }

    /// @notice Add Reward in Ads, mapping structure
    /// @dev reward is calculated when user pay to store his Ads
    /// @param _idAds Identifier Ads, _amountReward important to calculate range reward percentage
    function _addRewardAds(uint _idAds,uint _amountReward) private checkAdsRecord(_idAds){
        rwd[_idAds].idAds = _idAds;
        rwd[_idAds].amountReward = _amountReward;
        
        emit AddReward(_idAds,_amountReward);
    }


    /// @notice Add a comment by user if ads exist
    /// @dev mapping helperAds to display all this comment for Ads in platform
    function addComment(uint _idAds,uint _commentDate,string calldata _information) external payable {
        require(msg.sender != address(0), "Wrong address");
        require(cads[_idAds].idAdsC == _idAds, "Ads not exist");
        Comments memory newComment = Comments(_commentDate,msg.sender,_information,false);
        comments[_idAds].push(newComment);
        helpersAds[msg.sender].push(_idAds);
        emit AddComment(_idAds,msg.sender);
    }

    /// @notice function to calculate how much percentage reward can be sent to helpers
    /// @return percentage by period
    function _percentRewardHelperByAd(uint _idAd) private view returns(uint){
        
        uint nbDepositDay = getDiffDayAd(_getAdsDepositDate(_idAd));

            if( nbDepositDay < STEP_0_7_DAYS){
                return RATE_INF_6_MONTH * 5;
            } else if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_16_30_DAYS ){
                return RATE_INF_6_MONTH * 4;
            } else if ( nbDepositDay > STEP_16_30_DAYS && nbDepositDay < STEP_31_90_DAYS ){
                return RATE_INF_6_MONTH * 3;
            } else if ( nbDepositDay > STEP_31_90_DAYS && nbDepositDay < STEP_91_180_DAYS ){
                 return RATE_INF_6_MONTH * 2;
            } else if ( nbDepositDay > STEP_91_180_DAYS && nbDepositDay < STEP_181_DAYS){
                 return RATE_INF_6_MONTH;
            } else if ( nbDepositDay > STEP_181_DAYS){
                 return 10;
            }
            return 0;
    }

    /// @notice function to calculate amount of reward for a Ad
    /// @dev useful for frontend app indication
    /// @return Amount 
    function _calculRewardForAd(uint _idAd) private view returns(uint){
        require(rwd[_idAd].idAds == _idAd, "Ads number error");
        uint r = _percentRewardHelperByAd(_idAd) * 10**18;
        return _calculatePercentage(rwd[_idAd].amountReward,r);
    }

    /// @notice display reward amount for helpers
    /// @param _idAd Identifier Ads
    /// @return amount of reward
    function getRewardForAd(uint _idAd) external view returns(uint){
        return _calculRewardForAd(_idAd);
    }

    /// @notice Give a reward when information is helpful
    /// @notice amount reward depend Ads time
    /// @notice send reward to helpers
    /// @dev See percent rules rewarding user and reajust balance staking ads
    /// @param _idAd Unique identifier Ads, _index Value in array for comment
    function giveRewardComment(uint _idAd, uint _index) external checkAdsRecord(_idAd) payable nonReentrant{
        uint amount = _calculRewardForAd(_idAd);
        require(rwd[_idAd].amountReward > 0, "Reward already send");
        require(stakingtokens[msg.sender][_idAd].amount >= amount, "not enough funds");
        require(amount > 0, "not possible");
        comments[_idAd][_index].flag = true;

        stakingtokens[msg.sender][_idAd].amount -= amount;
        totalSupply -= amount;

        rwd[_idAd].amountReward = 0;

        // Fonction de remboursement et non de transfert
        (bool success, ) = comments[_idAd][_index].helpers.call{value: amount}("");
        require(success);
        emit RewardReceived(_idAd,comments[_idAd][_index].helpers,amount);

    }

    /*------------ STAKING Managment -------------*/

    /// @notice get balance Blopol msg.sender token
     function BolpolBalance() external view returns(uint){
        return rewardsToken.balanceOf(msg.sender);
    } 

    /// @notice compare if Now < timestamp finish
    /// @return Now if < else return finishAt
    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(block.timestamp, finishAt);
    }
    
    /// @notice call function to return reward per token with totalSupply sum 
    /// @return reward per Token stored
    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        // rewardRate
        return rewardPerTokenStored + (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) / totalSupply;
    }

    /// @notice Calcul Fees = 5$ in MATIC value + minimum 10$ reward Staking in MATIC Value
    /// @dev useful in frontend to display minimum amount for deposit
    /// @return Total amount minimum, user can add more for rewards 
    function displayAmountForDepositAd() external view returns(uint){
        uint amountFees = _fees * priceFeed().mul(10**10);
        uint amountSoftCap = _softCap * priceFeed().mul(10**10);
        return amountFees + amountSoftCap;
    }


    /// @notice Payment function deposit Ads in Wallet Staking
    /// @notice Split payment with fees amount (blopolsWallet) and reward amount, store information in staking(stakingtokens) wallet by Ad
    /// @notice Stake amount for calcul reward for staker
    /// @dev principal function to store Ads onchain
    function paymentAds(uint _amount,Ads calldata ads, ContentAds calldata cads, ImageAds calldata img,RewardAds calldata rwd) external payable {
        
        uint feesInTime = _fees * priceFeed().mul(10**10);
        uint rewardStaking = _amount - feesInTime;

        uint currentCounter = counterId;
        _createAds(currentCounter,ads.depositAds, ads.titleAds, ads.idcatAds, ads.geolocAds);
        _createContentAds(currentCounter, cads.dateAndTimeAds, cads.complaintAds, cads.productNameAds, cads.estimatedValueAds, cads.serialNumberAds, cads.contentAds);
        _addImage(currentCounter, img.idImageAds, img.linkImage);
        _addRewardAds(currentCounter, rwd.amountReward);

        StakingToken storage data = stakingtokens[msg.sender][currentCounter];
        if (data.walletAdAddress == address(0)){
             data.walletAdAddress = msg.sender;
        }
        // ToDo add payment Split > Calcul Fees plateforme en Matic
        blopolsWallet[owner()] += feesInTime;
        _stake(rewardStaking, currentCounter, msg.sender);
        emit PaymentReceived(msg.sender, currentCounter, rewardStaking);
        
        ++counterId;
    }
    
    receive() external payable{}
    fallback() external payable{}

    /// @notice For each action in staking, update reward and parameters to calculate staking value
    /// @param _walletAdAddress Address Staker, _idAd Slot staking ads
    function _updateReward(address _walletAdAddress, uint256 _idAd) private {
        // Traitement de cette données
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_walletAdAddress != address(0)) {
            rewards[_walletAdAddress][_idAd] = earned(_walletAdAddress,_idAd);
            userRewardPerTokenPaid[_walletAdAddress][_idAd] = rewardPerTokenStored;
        }
    }

    /// @notice Stake amount for user and Ads
    /// @dev multiple slot for staking, one Ads One slot, user can withdraw by Ad
    function _stake(uint _amount, uint256 _idAd, address _walletAdAddress) private nonReentrant {
        require(_amount > 0, "amount = 0");
        // TODo stakingToken.transferFrom(msg.sender, address(this), _amount);
        // fonction de transfert des jetons payable vers le Wallet
        StakingToken storage data = stakingtokens[_walletAdAddress][_idAd];
        data.amount += _amount;
        totalSupply += _amount;
        // On Update les reward avec UpdateReward
        _updateReward(_walletAdAddress, _idAd);
    }

    /// @notice Get balance by Ads only for Ads Owner
    /// @param _idAd Identifier Ad
    /// return amount staked by Ads
    function getBalanceStakingTokenByAds(uint _idAd) checkAdsRecord(_idAd) external view returns(uint){
        return stakingtokens[msg.sender][_idAd].amount;
    }


    /// @notice Call Chainlink Oracle for price feed
    /// @dev ToDo in deployed Project 
    function priceFeed() public pure returns(uint){
        return 81703768;
    }

    /// @notice use Booky Librairie to calculate Ads days since deposit start
    /// @return day number 
    function getDiffDayAd(uint _from) public view returns(uint){
       return BokkyPooBahsDateTimeLibrary.diffDays(_from,block.timestamp);
    } 



    /// @notice Give authorized withdraw percent with last withdraw and date now in range
    /// @param _idAd Identifier Ads
    /// @return percentage
    function _percentAuthorizeWithdrawByAd(uint _idAd) private view returns(uint){

        uint countWithdrawal;
        uint lastDeposit;
        uint stepWithdraw;
        for (uint i = 0; i < withdrawArray.length; i++) {
            if (withdrawArray[i].idAd == _idAd) {
                ++countWithdrawal;
                lastDeposit = withdrawArray[i].dateWithdraw;
                stepWithdraw += withdrawArray[i].stepWithdraw;
            }
        }
        
        uint nbDepositDay = getDiffDayAd(_getAdsDepositDate(_idAd));

        if (countWithdrawal == 0){

            if( nbDepositDay < STEP_0_7_DAYS){
                return 0;
            } else if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_16_30_DAYS ){
                return RATE_INF_6_MONTH;
            } else if ( nbDepositDay > STEP_16_30_DAYS && nbDepositDay < STEP_31_90_DAYS ){
                return RATE_INF_6_MONTH * 2;
            } else if ( nbDepositDay > STEP_31_90_DAYS && nbDepositDay < STEP_91_180_DAYS ){
                 return RATE_INF_6_MONTH * 3;
            } else if ( nbDepositDay > STEP_91_180_DAYS && nbDepositDay < STEP_181_DAYS){
                 return RATE_INF_6_MONTH * 4;
            } else if ( nbDepositDay > STEP_181_DAYS){
                 return RATE_INF_6_MONTH * 4 + 10;
            }

        } else {

            if ( stepWithdraw == 20 ) {
                if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_16_30_DAYS ){
                    return 0;
                } else if ( nbDepositDay > STEP_16_30_DAYS && nbDepositDay < STEP_31_90_DAYS ){
                    return RATE_INF_6_MONTH;
                } else if ( nbDepositDay > STEP_31_90_DAYS && nbDepositDay < STEP_91_180_DAYS ){
                    return RATE_INF_6_MONTH * 2;
                } else if ( nbDepositDay > STEP_91_180_DAYS && nbDepositDay < STEP_181_DAYS){
                    return RATE_INF_6_MONTH * 3;
                } else if ( nbDepositDay > STEP_181_DAYS){
                    return RATE_INF_6_MONTH * 3 + 10;
                }      
                    
            } else if ( stepWithdraw == 40 ){
                
                if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_31_90_DAYS ){
                    return 0;
                } else if ( nbDepositDay > STEP_31_90_DAYS && nbDepositDay < STEP_91_180_DAYS ){
                    return RATE_INF_6_MONTH;
                } else if ( nbDepositDay > STEP_91_180_DAYS && nbDepositDay < STEP_181_DAYS){
                    return RATE_INF_6_MONTH * 2;
                } else if ( nbDepositDay > STEP_181_DAYS){
                    return RATE_INF_6_MONTH * 2 + 10;
                }      

            } else if ( stepWithdraw == 60 ){
                
                if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_91_180_DAYS ){
                    return 0;
                } else if ( nbDepositDay > STEP_91_180_DAYS && nbDepositDay < STEP_181_DAYS){
                    return RATE_INF_6_MONTH;
                } else if ( nbDepositDay > STEP_181_DAYS){
                    return RATE_INF_6_MONTH + 10;
                }      
                
            } else if ( stepWithdraw == 80 ){
                
                if ( nbDepositDay > STEP_8_15_DAYS && nbDepositDay < STEP_181_DAYS ){
                    return 0;
                } else if ( nbDepositDay > STEP_181_DAYS){
                    return RATE_INF_6_MONTH + 10;
                }      
            }
        }
        return 0;
    }

    /// @notice calculate percentage function
    /// @dev percentage entry value need to be multiplicate bu 10**10
    /// @param _value, _percentage
    function _calculatePercentage(uint256 _value, uint256 _percentage) private pure returns (uint256) {
        return _value.mul(_percentage).div(10**20);
    }

    /// @notice Get SoftCap price minimum for reward
    /// @dev Can sub Total - Softcap for value fees
    /// @return price
    function getPriceFeedSoft() public view returns(uint){
        return _softCap * priceFeed().mul(10**10);
    }
    
    /// @notice function to calcul if withdraw by Ads is possible for user
    /// @notice depend range and SoftCap
    /// @return amount withdraw if criteria time and sofcap are good
    function _calcWithdrawAmountPossible(uint _idAd) checkAdsRecord(_idAd) private view returns(uint){

        uint rate = _percentAuthorizeWithdrawByAd(_idAd) * 10**18;
        if (rate > 0){
            if ( (rwd[_idAd].amountReward - _calculatePercentage(rwd[_idAd].amountReward,rate) ) <  (_softCap * priceFeed().mul(10**10)) ){
                return 0; 
            } else { 
                return _calculatePercentage(rwd[_idAd].amountReward,rate); 
            }  
        }
        return 0;
    }
    
    /// @notice Call by user to know if it's possible to withdraw
    /// @dev useful for Frontend
    function CanWithdrawNow(uint _idAd) external checkAdsRecord(_idAd) view returns(uint){
        return _calcWithdrawAmountPossible(_idAd);
    }

    /// @notice Add logs withdrawal to calculate next withdraw for user
    function _addWithdrawHistory(uint _idAd,uint _amount) private {
        WithdrawAds memory wd;
        wd.idAd = _idAd;
        wd.dateWithdraw = block.timestamp;
        wd.amountWithdraw = _amount;
        wd.stepWithdraw = _percentAuthorizeWithdrawByAd(_idAd);
        wd.doneWDA = true;
        withdrawArray.push(wd);
    }

    /// @notice Withdraw for owner ads if Rules days permit operation
    /// @notice Send withdraw for owner
    /// @dev using BokkyPooBahsDateTimeLibrary to calc deposit days to now
    /// @dev all mecanism staking and withdrawal
    function withdraw(uint256 _idAd) external payable checkAdsRecord(_idAd) nonReentrant {
        uint _amount = _calcWithdrawAmountPossible(_idAd);
        require(_amount != 0, "Withdraw not possible at this moment");
        require(stakingtokens[msg.sender][_idAd].amount >= _amount, "not enough funds");
        stakingtokens[msg.sender][_idAd].amount -= _amount;
        totalSupply -= _amount;
        _addWithdrawHistory(_idAd,_amount);

        _updateReward(msg.sender, _idAd);
        // Fonction de remboursement et non de transfert
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success);
        emit WithdrawReceived(_idAd,msg.sender,_amount);
    }
    
    /// @notice Delete an Ads, delete all data for this Ads
    /// @dev TODO remove all entry to clean storage
    function cancelMyAds(uint _idAd) external payable checkAdsRecord(_idAd) nonReentrant{
        require(stakingtokens[msg.sender][_idAd].amount >= 0, "no funds to Withdraw");
        uint amount = stakingtokens[msg.sender][_idAd].amount;
        stakingtokens[msg.sender][_idAd].amount -= amount;
        totalSupply -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        emit CancelAdd(_idAd, msg.sender, amount);
    }

    /// @notice function to compute Ads reward wallet and show amount earned by user
    /// @param _walletAdAddress Address owner earned, _idAd Identifier Ad
    /// @return amount earned calculate by staking function 
    function earned(address _walletAdAddress, uint256 _idAd) private view returns (uint256) {
        return  (stakingtokens[_walletAdAddress][_idAd].amount * 
                (rewardPerToken() - userRewardPerTokenPaid[_walletAdAddress][_idAd])) / 1e18 + 
                rewards[_walletAdAddress][_idAd];
    }

    /// @notice reward token Blopol for staker and per Ads
    /// @dev TokenBlopol utility DAO later
    /// @dev Update reward for user 
    function getReward(uint256 _idAd) external nonReentrant {
        uint reward = rewards[msg.sender][_idAd];
        if (reward > 0) {
            rewards[msg.sender][_idAd] = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
        _updateReward(msg.sender, _idAd);
    }

    /// @notice Set duration for staking reward in seconds
    /// @dev indispensable to calculate Rate per token
    function setRewardsDuration(uint _duration) external onlyOwner {
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    /// @notice initilise rate for staking
    /// @dev init timestamp updated and finishAt
    function notifyRewardAmount(uint _amount) external onlyOwner {
        _updateReward(address(0), 0);
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint remainingRewards = (finishAt - block.timestamp);
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(rewardRate * duration <= rewardsToken.balanceOf(address(this)),"reward amount > balance");

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    ///@dev Math to give x or y by operator
    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }

    /*------------ ADMIN FUNCTIONS ------------------------------*/
    /// @dev setter Sofcap
    function setSoftCap(uint _amount) external onlyOwner {
        require(_amount > 0, "Value not correct");
        _softCap = _amount;
    }

    /// @dev Getter SoftCap in parameters
    function getSoftCap() external onlyOwner view returns(uint){
        return _softCap;
    }

    ///@dev fees minimum for platform
    function setFees (uint _amount) external onlyOwner {
        require(_amount > 0, "Value not correct");
        _fees = _amount;
    }

    /// @dev getter Fees
    function getFees() external onlyOwner view returns(uint){
        return _fees;
    }

    /// @dev experimental to test range and percentage
    function modifyAds(uint _id, uint _date) external onlyOwner {
        adsArray[0].idAds = _id;
        adsArray[0].depositAds = _date;

    }

    /// @notice add category for Ads
    function addCategory(string calldata _name) external onlyOwner{
        require(bytes(_name).length > 0, "Category name required");
        Category memory cat;
        cat.idCategory = counterCat;
        cat.nameCategory = _name;
        catArray.push(cat);
        ++counterCat;
    }

    /// @notice Withdrawal smartContract security owner
    function withdrawal() external payable onlyOwner {
        require(address(this).balance > 0, "No cash in SmartContract");
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success);
    }
    /*------------ ADMIN FUNCTIONS ------------------------------*/

}