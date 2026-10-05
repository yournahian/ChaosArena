// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ChaosArena is ERC721, Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum DareState {
        Open,
        Claimed,
        Settled,
        Cancelled,
        Expired
    }

    struct Dare {
        address creator;
        uint256 bounty;
        string description;
        string proofDefinition;
        address claimant;
        string proofSubmission;
        uint256 createdAt;
        uint256 claimedAt;
        uint256 voteWindowStart;
        uint256 yesVotes;
        uint256 noVotes;
        DareState state;
    }

    struct MuseumEntry {
        address minter;
        string decision;
        uint256 timestamp;
        uint256 monthKey;
    }

    error ZeroAddress();
    error InvalidAmount();
    error InvalidString();
    error InvalidLength();
    error InvalidState();
    error Unauthorized();
    error AlreadyVoted();
    error VotingClosed();
    error VotingNotClosed();
    error DareExpiredAlready();
    error DareNotExpired();
    error AlreadyClaimed();
    error NotYesVoter();
    error MuseumFeeFinalizedError();
    error MonthNotEnded();
    error PrizeAlreadyClaimed();
    error NoPrizeForMonth();
    error NoActiveGame();
    error LPWGameExpired();
    error LPWNotExpired();
    error LPWAbandonWindowNotReached();
    error InvalidBounds();
    error BackingInvariantBroken();

    event DareCreated(uint256 indexed dareId, address indexed creator, uint256 bounty);
    event DareCancelled(uint256 indexed dareId);
    event DareExpired(uint256 indexed dareId);
    event ClaimSubmitted(uint256 indexed dareId, address indexed claimant);
    event VoteCast(uint256 indexed dareId, address indexed voter, bool yes);
    event DareSettled(uint256 indexed dareId, address indexed claimant, bool passed);
    event VoterRewardClaimed(uint256 indexed dareId, address indexed voter, uint256 amount);
    event MuseumMinted(uint256 indexed tokenId, address indexed minter, string decision, uint256 monthKey);
    event MuseumMonthSettled(uint256 indexed monthKey, address[] winners, uint256 prizePerWinner);
    event MuseumPrizeClaimed(uint256 indexed monthKey, address indexed winner, uint256 amount);
    event LPWDeposit(address indexed depositor, uint256 amount, uint256 newExpiry);
    event LPWWon(address indexed winner, uint256 winnerAmount);
    event LPWReset(uint256 amountSentToTreasury);
    event TreasuryUpdated(address indexed newTreasury);
    event DareMinimumUpdated(uint256 newMinimum);

    uint256 public constant DARE_VOTING_WINDOW = 24 hours;
    uint256 public constant DARE_EXPIRY = 30 days;
    uint256 public constant DARE_CLAIM_TIMEOUT = 7 days;
    uint256 public constant VOTER_MIN_BALANCE = 100_000;
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public constant DARE_VOTER_REWARD_BPS = 300;
    uint256 public constant DARE_CLAIMANT_BPS = 9_500;

    uint256 public constant MUSEUM_PRIZE_POOL_BPS = 4_900;
    uint256 public constant MUSEUM_TREASURY_BPS = 4_900;

    uint256 public constant LPW_TIMER = 5 minutes;
    uint256 public constant LPW_ABANDON_WINDOW = 30 days;

    IERC20 public immutable usdc;
    address public treasury;

    uint256 public dareMinimumUsdc;
    uint256 public dareCount;
    mapping(uint256 => Dare) public dares;
    mapping(uint256 => mapping(address => bool)) public dareHasVoted;
    mapping(uint256 => address[]) private dareYesVoters;
    mapping(uint256 => mapping(address => bool)) public dareVoterRewardClaimed;
    mapping(uint256 => mapping(address => bool)) public dareVotedYes;
    mapping(uint256 => uint256) public dareVoterPool;

    uint256 public museumMintFee;
    bool public museumFeeFinalized;
    uint256 public museumTokenIdCounter;
    mapping(uint256 => MuseumEntry) public museumEntries;

    mapping(uint256 => mapping(address => uint256)) public monthlyMintCount;
    mapping(uint256 => uint256) public monthlyTopCount;
    mapping(uint256 => address[]) private monthlyTopAddresses;
    mapping(uint256 => mapping(address => bool)) public museumPrizeWinnerClaimed;
    mapping(uint256 => uint256) public museumPrizePerWinner;
    mapping(uint256 => bool) public monthPrizeSettled;
    mapping(uint256 => uint256) public monthlyPrizeAccumulated;
    mapping(uint256 => mapping(address => bool)) private monthlyIsTop;
    mapping(uint256 => mapping(address => uint256)) private monthlyTopRecordedCount;

    uint256 public immutable lpwMinDeposit;
    uint256 public immutable lpwMaxDeposit;
    uint256 public lpwExpiry;
    address public lpwLastDepositor;
    uint256 public lpwBalance;

    uint256 public dareBalance;
    uint256 public museumPrizePool;

    constructor(
        address _usdc,
        address _treasury,
        address _initialOwner,
        uint256 _dareMinimumUsdc,
        uint256 _museumMintFee,
        uint256 _lpwMinDeposit,
        uint256 _lpwMaxDeposit
    ) ERC721("ChaosArena Museum", "CAMUSE") Ownable(msg.sender) {
        if (_usdc == address(0) || _treasury == address(0) || _initialOwner == address(0)) {
            revert ZeroAddress();
        }
        if (_lpwMinDeposit >= _lpwMaxDeposit) {
            revert InvalidBounds();
        }
        if (PLATFORM_FEE_BPS + DARE_VOTER_REWARD_BPS + DARE_CLAIMANT_BPS != 10_000) {
            revert InvalidBounds();
        }
        if (PLATFORM_FEE_BPS + MUSEUM_PRIZE_POOL_BPS + MUSEUM_TREASURY_BPS != 10_000) {
            revert InvalidBounds();
        }

        usdc = IERC20(_usdc);
        treasury = _treasury;
        dareMinimumUsdc = _dareMinimumUsdc;
        museumMintFee = _museumMintFee;
        lpwMinDeposit = _lpwMinDeposit;
        lpwMaxDeposit = _lpwMaxDeposit;

        _transferOwnership(_initialOwner);
    }

    function createDare(
        uint256 bounty,
        string calldata description,
        string calldata proofDefinition
    ) external whenNotPaused nonReentrant {
        if (bounty < dareMinimumUsdc) revert InvalidAmount();
        if (bytes(description).length == 0 || bytes(proofDefinition).length == 0) revert InvalidString();

        uint256 dareId = dareCount;
        dareCount = dareId + 1;

        dares[dareId] = Dare({
            creator: msg.sender,
            bounty: bounty,
            description: description,
            proofDefinition: proofDefinition,
            claimant: address(0),
            proofSubmission: "",
            createdAt: block.timestamp,
            claimedAt: 0,
            voteWindowStart: 0,
            yesVotes: 0,
            noVotes: 0,
            state: DareState.Open
        });

        dareBalance += bounty;

        usdc.safeTransferFrom(msg.sender, address(this), bounty);

        _assertBackingInvariant();
        emit DareCreated(dareId, msg.sender, bounty);
    }

    function cancelDare(uint256 dareId) external whenNotPaused nonReentrant {
        Dare storage dare = dares[dareId];
        if (dare.creator != msg.sender) revert Unauthorized();
        if (dare.state != DareState.Open) revert InvalidState();
        if (dare.claimant != address(0)) revert InvalidState();

        dare.state = DareState.Cancelled;
        dareBalance -= dare.bounty;

        usdc.safeTransfer(dare.creator, dare.bounty);

        _assertBackingInvariant();
        emit DareCancelled(dareId);
    }

    function expireDare(uint256 dareId) external whenNotPaused nonReentrant {
        Dare storage dare = dares[dareId];
        if (dare.state != DareState.Open) revert InvalidState();
        if (dare.claimant != address(0)) revert InvalidState();
        if (block.timestamp < dare.createdAt + DARE_EXPIRY) revert DareNotExpired();

        dare.state = DareState.Expired;
        dareBalance -= dare.bounty;

        usdc.safeTransfer(dare.creator, dare.bounty);

        _assertBackingInvariant();
        emit DareExpired(dareId);
    }

    function submitClaim(uint256 dareId, string calldata proof) external whenNotPaused {
        Dare storage dare = dares[dareId];
        if (dare.state != DareState.Open) revert InvalidState();
        if (bytes(proof).length == 0) revert InvalidString();
        if (block.timestamp >= dare.createdAt + DARE_EXPIRY) revert DareExpiredAlready();

        dare.claimant = msg.sender;
        dare.proofSubmission = proof;
        dare.claimedAt = block.timestamp;
        dare.state = DareState.Claimed;

        emit ClaimSubmitted(dareId, msg.sender);
    }

    function voteOnClaim(uint256 dareId, bool yes) external whenNotPaused {
        Dare storage dare = dares[dareId];
        if (dare.state != DareState.Claimed) revert InvalidState();
        if (dareHasVoted[dareId][msg.sender]) revert AlreadyVoted();
        if (usdc.balanceOf(msg.sender) < VOTER_MIN_BALANCE) revert InvalidAmount();

        uint256 voteWindowStart = dare.voteWindowStart;
        if (voteWindowStart != 0 && block.timestamp > voteWindowStart + DARE_VOTING_WINDOW) revert VotingClosed();

        if (voteWindowStart == 0) {
            dare.voteWindowStart = block.timestamp;
        }

        dareHasVoted[dareId][msg.sender] = true;

        if (yes) {
            dare.yesVotes += 1;
            dareVotedYes[dareId][msg.sender] = true;
            dareYesVoters[dareId].push(msg.sender);
        } else {
            dare.noVotes += 1;
        }

        emit VoteCast(dareId, msg.sender, yes);
    }

    function settleDare(uint256 dareId) external whenNotPaused nonReentrant {
        Dare storage dare = dares[dareId];
        if (dare.state != DareState.Claimed) revert InvalidState();

        uint256 voteWindowStart = dare.voteWindowStart;
        if (voteWindowStart == 0) {
            if (dare.claimedAt == 0 || block.timestamp <= dare.claimedAt + DARE_CLAIM_TIMEOUT) revert VotingNotClosed();

            dare.state = DareState.Settled;
            dareBalance -= dare.bounty;

            usdc.safeTransfer(dare.creator, dare.bounty);

            _assertBackingInvariant();
            emit DareSettled(dareId, dare.claimant, false);
            return;
        }

        if (block.timestamp <= voteWindowStart + DARE_VOTING_WINDOW) revert VotingNotClosed();

        bool passed = dare.yesVotes > dare.noVotes;

        dare.state = DareState.Settled;
        dareBalance -= dare.bounty;

        if (passed) {
            uint256 platformFee = (dare.bounty * PLATFORM_FEE_BPS) / 10_000;
            uint256 voterPool = (dare.bounty * DARE_VOTER_REWARD_BPS) / 10_000;
            uint256 claimantAmount = dare.bounty - platformFee - voterPool;

            dareVoterPool[dareId] = voterPool;

            usdc.safeTransfer(treasury, platformFee);
            usdc.safeTransfer(dare.claimant, claimantAmount);
        } else {
            usdc.safeTransfer(dare.creator, dare.bounty);
        }

        _assertBackingInvariant();
        emit DareSettled(dareId, dare.claimant, passed);
    }

    function claimVoterReward(uint256 dareId) external whenNotPaused nonReentrant {
        Dare storage dare = dares[dareId];
        if (dare.state != DareState.Settled) revert InvalidState();
        if (!dareHasVoted[dareId][msg.sender]) revert Unauthorized();
        if (!dareVotedYes[dareId][msg.sender]) revert NotYesVoter();
        if (dareVoterRewardClaimed[dareId][msg.sender]) revert AlreadyClaimed();

        uint256 voterPool = dareVoterPool[dareId];
        if (voterPool == 0) revert NoPrizeForMonth();

        dareVoterRewardClaimed[dareId][msg.sender] = true;
        uint256 amount = voterPool / dare.yesVotes;

        usdc.safeTransfer(msg.sender, amount);

        _assertBackingInvariant();
        emit VoterRewardClaimed(dareId, msg.sender, amount);
    }

    function mintMuseum(string calldata decision) external whenNotPaused nonReentrant {
        uint256 decisionLength = bytes(decision).length;
        if (decisionLength == 0) revert InvalidString();
        if (decisionLength > 500) revert InvalidLength();
        if (museumMintFee == 0) revert InvalidAmount();

        museumFeeFinalized = true;

        uint256 tokenId = museumTokenIdCounter;
        museumTokenIdCounter = tokenId + 1;

        uint256 monthKey = block.timestamp / 30 days;

        _mint(msg.sender, tokenId);
        museumEntries[tokenId] = MuseumEntry({
            minter: msg.sender,
            decision: decision,
            timestamp: block.timestamp,
            monthKey: monthKey
        });

        uint256 newCount = monthlyMintCount[monthKey][msg.sender] + 1;
        monthlyMintCount[monthKey][msg.sender] = newCount;

        if (newCount > monthlyTopCount[monthKey]) {
            monthlyTopCount[monthKey] = newCount;
            delete monthlyTopAddresses[monthKey];
            monthlyTopAddresses[monthKey].push(msg.sender);
            monthlyIsTop[monthKey][msg.sender] = true;
            monthlyTopRecordedCount[monthKey][msg.sender] = newCount;
        } else if (newCount == monthlyTopCount[monthKey]) {
            if (!monthlyIsTop[monthKey][msg.sender] || monthlyTopRecordedCount[monthKey][msg.sender] != newCount) {
                monthlyTopAddresses[monthKey].push(msg.sender);
                monthlyIsTop[monthKey][msg.sender] = true;
                monthlyTopRecordedCount[monthKey][msg.sender] = newCount;
            }
        }

        uint256 platformFee = (museumMintFee * PLATFORM_FEE_BPS) / 10_000;
        uint256 prizeAmount = (museumMintFee * MUSEUM_PRIZE_POOL_BPS) / 10_000;
        uint256 treasuryAmount = museumMintFee - platformFee - prizeAmount;

        museumPrizePool += prizeAmount;
        monthlyPrizeAccumulated[monthKey] += prizeAmount;

        usdc.safeTransferFrom(msg.sender, address(this), museumMintFee);
        usdc.safeTransfer(treasury, platformFee + treasuryAmount);

        _assertBackingInvariant();
        emit MuseumMinted(tokenId, msg.sender, decision, monthKey);
    }

    function settleMuseumMonth(uint256 monthKey) external whenNotPaused nonReentrant {
        if (block.timestamp < (monthKey + 1) * 30 days) revert MonthNotEnded();
        if (monthPrizeSettled[monthKey]) revert PrizeAlreadyClaimed();
        if (monthlyTopCount[monthKey] == 0) revert NoPrizeForMonth();

        uint256 monthPrize = monthlyPrizeAccumulated[monthKey];
        if (monthPrize == 0) revert NoPrizeForMonth();
        if (museumPrizePool < monthPrize) revert BackingInvariantBroken();

        address[] memory winners = monthlyTopAddresses[monthKey];
        uint256 winnerCount = winners.length;
        if (winnerCount == 0) revert NoPrizeForMonth();

        uint256 prizePerWinner = monthPrize / winnerCount;

        museumPrizePerWinner[monthKey] = prizePerWinner;
        monthPrizeSettled[monthKey] = true;
        museumPrizePool -= monthPrize;

        _assertBackingInvariant();
        emit MuseumMonthSettled(monthKey, winners, prizePerWinner);
    }

    function claimMuseumPrize(uint256 monthKey) external whenNotPaused nonReentrant {
        if (!monthPrizeSettled[monthKey]) revert InvalidState();
        if (!monthlyIsTop[monthKey][msg.sender] || monthlyTopRecordedCount[monthKey][msg.sender] != monthlyTopCount[monthKey]) {
            revert Unauthorized();
        }
        if (museumPrizeWinnerClaimed[monthKey][msg.sender]) revert PrizeAlreadyClaimed();

        uint256 amount = museumPrizePerWinner[monthKey];

        museumPrizeWinnerClaimed[monthKey][msg.sender] = true;

        usdc.safeTransfer(msg.sender, amount);

        _assertBackingInvariant();
        emit MuseumPrizeClaimed(monthKey, msg.sender, amount);
    }

    function depositLPW(uint256 amount) external whenNotPaused nonReentrant {
        if (amount < lpwMinDeposit || amount > lpwMaxDeposit) revert InvalidAmount();
        if (lpwExpiry != 0 && block.timestamp > lpwExpiry) revert LPWGameExpired();

        lpwBalance += amount;
        lpwLastDepositor = msg.sender;
        lpwExpiry = block.timestamp + LPW_TIMER;

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        _assertBackingInvariant();
        emit LPWDeposit(msg.sender, amount, lpwExpiry);
    }

    function claimLastWins() external whenNotPaused nonReentrant {
        if (lpwExpiry == 0) revert NoActiveGame();
        if (block.timestamp <= lpwExpiry) revert LPWNotExpired();
        if (lpwBalance == 0 || lpwLastDepositor == address(0)) revert NoActiveGame();

        address winner = lpwLastDepositor;
        uint256 pool = lpwBalance;
        uint256 platformFee = (pool * PLATFORM_FEE_BPS) / 10_000;
        uint256 winnerAmount = pool - platformFee;

        lpwBalance = 0;
        lpwLastDepositor = address(0);
        lpwExpiry = 0;

        usdc.safeTransfer(treasury, platformFee);
        usdc.safeTransfer(winner, winnerAmount);

        _assertBackingInvariant();
        emit LPWWon(winner, winnerAmount);
    }

    function resetLPWAfterAbandon() external onlyOwner nonReentrant {
        if (lpwExpiry == 0) revert NoActiveGame();
        if (block.timestamp <= lpwExpiry + LPW_ABANDON_WINDOW) revert LPWAbandonWindowNotReached();
        if (lpwBalance == 0) revert NoActiveGame();

        uint256 amountToTreasury = lpwBalance;
        lpwBalance = 0;
        lpwLastDepositor = address(0);
        lpwExpiry = 0;

        usdc.safeTransfer(treasury, amountToTreasury);

        _assertBackingInvariant();
        emit LPWReset(amountToTreasury);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setDareMinimum(uint256 amount) external onlyOwner {
        dareMinimumUsdc = amount;
        emit DareMinimumUpdated(amount);
    }

    function setMuseumFee(uint256 fee) external onlyOwner {
        if (museumFeeFinalized) revert MuseumFeeFinalizedError();
        museumMintFee = fee;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        MuseumEntry storage entry = museumEntries[tokenId];

        string memory json = string.concat(
            '{"name":"Bad Decision #',
            Strings.toString(tokenId),
            '","description":"',
            entry.decision,
            '","attributes":[{"trait_type":"Minter","value":"',
            Strings.toHexString(uint256(uint160(entry.minter)), 20),
            '"},{"trait_type":"Date","value":"',
            Strings.toString(entry.timestamp),
            '"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    function getMonthlyTopAddresses(uint256 monthKey) external view returns (address[] memory) {
        return monthlyTopAddresses[monthKey];
    }

    function getDareYesVoters(uint256 dareId) external view returns (address[] memory) {
        return dareYesVoters[dareId];
    }

    function _assertBackingInvariant() internal view {
        uint256 requiredBacking = dareBalance + museumPrizePool + lpwBalance;
        if (usdc.balanceOf(address(this)) < requiredBacking) {
            revert BackingInvariantBroken();
        }
    }
}
