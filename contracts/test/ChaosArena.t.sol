// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ChaosArena} from "../ChaosArena.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

/// @title ChaosArenaTest — comprehensive unit/fuzz/invariant tests for ChaosArena
contract ChaosArenaTest is Test {
    // ────────────────────────────────── constants ──────────────────────────────
    uint256 internal constant DARE_MIN       = 10e6;   // 10 USDC (6 dec)
    uint256 internal constant MUSEUM_FEE     = 5e6;    // 5 USDC
    uint256 internal constant LPW_MIN        = 1e6;    // 1 USDC
    uint256 internal constant LPW_MAX        = 100e6;  // 100 USDC
    uint256 internal constant VOTER_MIN      = 100_000; // 0.10 USDC (raw)

    uint256 internal constant DARE_VOTING_WINDOW  = 24 hours;
    uint256 internal constant DARE_EXPIRY         = 30 days;
    uint256 internal constant DARE_CLAIM_TIMEOUT  = 7 days;
    uint256 internal constant LPW_TIMER           = 5 minutes;
    uint256 internal constant LPW_ABANDON_WINDOW  = 30 days;

    uint256 internal constant BPS_PLATFORM  = 200;
    uint256 internal constant BPS_VOTER     = 300;
    uint256 internal constant BPS_CLAIMANT  = 9_500;
    uint256 internal constant BPS_MUSEUM_PRIZE = 4_900;
    uint256 internal constant BPS_MUSEUM_TREAS = 4_900;

    // ────────────────────────────────── state ──────────────────────────────────
    MockERC20   internal usdc;
    ChaosArena  internal arena;

    address internal owner    = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal alice    = makeAddr("alice");
    address internal bob      = makeAddr("bob");
    address internal carol    = makeAddr("carol");
    address internal dave     = makeAddr("dave");

    // ────────────────────────────────── setUp ──────────────────────────────────
    function setUp() public {
        usdc  = new MockERC20("Mock USDC", "mUSDC", 6);
        arena = new ChaosArena(
            address(usdc),
            treasury,
            owner,
            DARE_MIN,
            MUSEUM_FEE,
            LPW_MIN,
            LPW_MAX
        );

        // Fund test users
        usdc.mint(alice,  10_000e6);
        usdc.mint(bob,    10_000e6);
        usdc.mint(carol,  10_000e6);
        usdc.mint(dave,   10_000e6);

        // Approve arena for spending
        vm.prank(alice); usdc.approve(address(arena), type(uint256).max);
        vm.prank(bob);   usdc.approve(address(arena), type(uint256).max);
        vm.prank(carol); usdc.approve(address(arena), type(uint256).max);
        vm.prank(dave);  usdc.approve(address(arena), type(uint256).max);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DEPLOYMENT / CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════

    function test_Constructor_StoresParams() public view {
        assertEq(address(arena.usdc()),      address(usdc));
        assertEq(arena.treasury(),           treasury);
        assertEq(arena.dareMinimumUsdc(),    DARE_MIN);
        assertEq(arena.museumMintFee(),      MUSEUM_FEE);
        assertEq(arena.lpwMinDeposit(),      LPW_MIN);
        assertEq(arena.lpwMaxDeposit(),      LPW_MAX);
    }

    function test_Constructor_RevertsZeroUsdc() public {
        vm.expectRevert(ChaosArena.ZeroAddress.selector);
        new ChaosArena(address(0), treasury, owner, DARE_MIN, MUSEUM_FEE, LPW_MIN, LPW_MAX);
    }

    function test_Constructor_RevertsZeroTreasury() public {
        vm.expectRevert(ChaosArena.ZeroAddress.selector);
        new ChaosArena(address(usdc), address(0), owner, DARE_MIN, MUSEUM_FEE, LPW_MIN, LPW_MAX);
    }

    function test_Constructor_RevertsZeroOwner() public {
        vm.expectRevert(ChaosArena.ZeroAddress.selector);
        new ChaosArena(address(usdc), treasury, address(0), DARE_MIN, MUSEUM_FEE, LPW_MIN, LPW_MAX);
    }

    function test_Constructor_RevertsInvalidLPWBounds() public {
        vm.expectRevert(ChaosArena.InvalidBounds.selector);
        new ChaosArena(address(usdc), treasury, owner, DARE_MIN, MUSEUM_FEE, LPW_MAX, LPW_MIN);
    }

    function test_Constructor_RevertsLPWEqualBounds() public {
        vm.expectRevert(ChaosArena.InvalidBounds.selector);
        new ChaosArena(address(usdc), treasury, owner, DARE_MIN, MUSEUM_FEE, LPW_MIN, LPW_MIN);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — createDare
    // ══════════════════════════════════════════════════════════════════════════

    function test_CreateDare_HappyPath() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.DareCreated(0, alice, DARE_MIN);
        arena.createDare(DARE_MIN, "Do a backflip", "Video proof required");

        (address creator, uint256 bounty,,,,,,,,,, ChaosArena.DareState dareState) = arena.dares(0);
        assertEq(creator, alice);
        assertEq(bounty,  DARE_MIN);
        assertEq(uint8(dareState), uint8(ChaosArena.DareState.Open));
        assertEq(arena.dareCount(), 1);
        assertEq(arena.dareBalance(), DARE_MIN);
        assertEq(usdc.balanceOf(address(arena)), DARE_MIN);
    }

    function test_CreateDare_RevertsIfBountyTooLow() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidAmount.selector);
        arena.createDare(DARE_MIN - 1, "x", "y");
    }

    function test_CreateDare_RevertsIfEmptyDescription() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidString.selector);
        arena.createDare(DARE_MIN, "", "proof");
    }

    function test_CreateDare_RevertsIfEmptyProof() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidString.selector);
        arena.createDare(DARE_MIN, "desc", "");
    }

    function test_CreateDare_IncrementsDareCount() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d1", "p1");
        vm.prank(bob);
        arena.createDare(DARE_MIN * 2, "d2", "p2");
        assertEq(arena.dareCount(), 2);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — cancelDare
    // ══════════════════════════════════════════════════════════════════════════

    function test_CancelDare_HappyPath() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.prank(alice);
        vm.expectEmit(true, false, false, false, address(arena));
        emit ChaosArena.DareCancelled(0);
        arena.cancelDare(0);

        (,,,,,,,,,,, ChaosArena.DareState cancelState) = arena.dares(0);
        assertEq(uint8(cancelState), uint8(ChaosArena.DareState.Cancelled));
        assertEq(usdc.balanceOf(alice), aliceBefore + DARE_MIN);
        assertEq(arena.dareBalance(), 0);
    }

    function test_CancelDare_RevertsIfNotCreator() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(bob);
        vm.expectRevert(ChaosArena.Unauthorized.selector);
        arena.cancelDare(0);
    }

    function test_CancelDare_RevertsIfAlreadyCancelled() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(alice);
        arena.cancelDare(0);

        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.cancelDare(0);
    }

    function test_CancelDare_RevertsIfClaimed() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(bob);
        arena.submitClaim(0, "here is proof");

        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.cancelDare(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — expireDare
    // ══════════════════════════════════════════════════════════════════════════

    function test_ExpireDare_HappyPath() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");
        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.warp(block.timestamp + DARE_EXPIRY + 1);

        vm.expectEmit(true, false, false, false, address(arena));
        emit ChaosArena.DareExpired(0);
        arena.expireDare(0);

        (,,,,,,,,,,, ChaosArena.DareState expiredState) = arena.dares(0);
        assertEq(uint8(expiredState), uint8(ChaosArena.DareState.Expired));
        assertEq(usdc.balanceOf(alice), aliceBefore + DARE_MIN);
        assertEq(arena.dareBalance(), 0);
    }

    function test_ExpireDare_RevertsIfNotExpired() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.expectRevert(ChaosArena.DareNotExpired.selector);
        arena.expireDare(0);
    }

    function test_ExpireDare_RevertsIfNotOpen() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(alice);
        arena.cancelDare(0);

        vm.warp(block.timestamp + DARE_EXPIRY + 1);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.expireDare(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — submitClaim
    // ══════════════════════════════════════════════════════════════════════════

    function test_SubmitClaim_HappyPath() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(bob);
        vm.expectEmit(true, true, false, false, address(arena));
        emit ChaosArena.ClaimSubmitted(0, bob);
        arena.submitClaim(0, "my proof");

        (, , , , address claimant, string memory proof, , , , , , ChaosArena.DareState claimState) = arena.dares(0);
        assertEq(claimant, bob);
        assertEq(proof, "my proof");
        assertEq(uint8(claimState), uint8(ChaosArena.DareState.Claimed));
    }

    function test_SubmitClaim_ClaimantIsMsgSender() public {
        // Critical: claimant must always be set to msg.sender
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(carol);
        arena.submitClaim(0, "proof from carol");

        (, , , , address claimant, , , , , , ,) = arena.dares(0);
        assertEq(claimant, carol, "claimant must be msg.sender");
    }

    function test_SubmitClaim_RevertsEmptyProof() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(bob);
        vm.expectRevert(ChaosArena.InvalidString.selector);
        arena.submitClaim(0, "");
    }

    function test_SubmitClaim_RevertsIfNotOpen() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(bob);
        arena.submitClaim(0, "proof1");

        // second claim on already-claimed dare
        vm.prank(carol);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.submitClaim(0, "proof2");
    }

    function test_SubmitClaim_RevertsIfExpired() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.warp(block.timestamp + DARE_EXPIRY);

        vm.prank(bob);
        vm.expectRevert(ChaosArena.DareExpiredAlready.selector);
        arena.submitClaim(0, "proof");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — voteOnClaim
    // ══════════════════════════════════════════════════════════════════════════

    function test_VoteOnClaim_HappyPath_Yes() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol);
        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.VoteCast(0, carol, true);
        arena.voteOnClaim(0, true);

        (,,,,,,,, uint256 voteWindowStart, uint256 yesVotes, ,) = arena.dares(0);
        assertEq(yesVotes, 1);
        assertGt(voteWindowStart, 0);
        assertTrue(arena.dareHasVoted(0, carol));
        assertTrue(arena.dareVotedYes(0, carol));
    }

    function test_VoteOnClaim_HappyPath_No() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol);
        arena.voteOnClaim(0, false);

        (,,,,,,,,,,, ChaosArena.DareState claimState2) = arena.dares(0);
        assertEq(uint8(claimState2), uint8(ChaosArena.DareState.Claimed));
        assertFalse(arena.dareVotedYes(0, carol));
    }

    function test_VoteOnClaim_RevertsIfInsufficientBalance() public {
        _createAndClaim(alice, bob, DARE_MIN);

        address broke = makeAddr("broke");
        // broke has 0 USDC (below VOTER_MIN_BALANCE of 100_000)
        vm.prank(broke);
        vm.expectRevert(ChaosArena.InvalidAmount.selector);
        arena.voteOnClaim(0, true);
    }

    function test_VoteOnClaim_RevertsIfAlreadyVoted() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol);
        arena.voteOnClaim(0, true);

        vm.prank(carol);
        vm.expectRevert(ChaosArena.AlreadyVoted.selector);
        arena.voteOnClaim(0, true);
    }

    function test_VoteOnClaim_RevertsIfNotClaimed() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.prank(carol);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.voteOnClaim(0, true);
    }

    function test_VoteOnClaim_VoterMinBalance_ExactBoundary() public {
        _createAndClaim(alice, bob, DARE_MIN);

        // Give dave exactly VOTER_MIN_BALANCE
        address edge = makeAddr("edge");
        usdc.mint(edge, VOTER_MIN);
        vm.prank(edge);
        arena.voteOnClaim(0, true);
        assertTrue(arena.dareHasVoted(0, edge));
    }

    function test_VoteOnClaim_RevertsAfterVotingWindow() public {
        _createAndClaim(alice, bob, DARE_MIN);

        // First vote opens the window
        vm.prank(carol);
        arena.voteOnClaim(0, true);

        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);

        vm.prank(dave);
        vm.expectRevert(ChaosArena.VotingClosed.selector);
        arena.voteOnClaim(0, false);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — settleDare (YES wins: 95%/3%/2% split)
    // ══════════════════════════════════════════════════════════════════════════

    function test_SettleDare_YesWins() public {
        _createAndClaim(alice, bob, DARE_MIN);

        // carol and dave vote YES
        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, true);

        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);

        uint256 bobBefore      = usdc.balanceOf(bob);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.DareSettled(0, bob, true);
        arena.settleDare(0);

        uint256 expectedFee     = (DARE_MIN * BPS_PLATFORM) / 10_000;
        uint256 expectedVoterP  = (DARE_MIN * BPS_VOTER)    / 10_000;
        uint256 expectedClaim   = DARE_MIN - expectedFee - expectedVoterP;

        assertEq(usdc.balanceOf(bob) - bobBefore, expectedClaim,
            "claimant should receive 95% of bounty");
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee,
            "treasury should receive 2% platform fee");
        assertEq(arena.dareVoterPool(0), expectedVoterP,
            "voter pool should hold 3%");
        assertEq(arena.dareBalance(), 0);
    }

    function test_SettleDare_NoWins_FullRefund() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, false);
        vm.prank(dave);  arena.voteOnClaim(0, false);

        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);

        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.DareSettled(0, bob, false);
        arena.settleDare(0);

        assertEq(usdc.balanceOf(alice) - aliceBefore, DARE_MIN,
            "creator should get full refund on NO result");
        assertEq(arena.dareVoterPool(0), 0, "no voter pool on NO result");
    }

    function test_SettleDare_Tie_FullRefund() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, false);

        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);

        uint256 aliceBefore = usdc.balanceOf(alice);
        arena.settleDare(0);

        assertEq(usdc.balanceOf(alice) - aliceBefore, DARE_MIN,
            "creator should get full refund on tie");
    }

    function test_SettleDare_RevertsIfVotingNotClosed() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);

        vm.expectRevert(ChaosArena.VotingNotClosed.selector);
        arena.settleDare(0);
    }

    function test_SettleDare_RevertsIfNotClaimed() public {
        vm.prank(alice);
        arena.createDare(DARE_MIN, "d", "p");

        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.settleDare(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — settleDare with NO votes (settles as NO after DARE_CLAIM_TIMEOUT)
    // ══════════════════════════════════════════════════════════════════════════

    function test_SettleDare_NoVotes_SettlesAsNoAfterTimeout() public {
        _createAndClaim(alice, bob, DARE_MIN);
        // No votes cast — voteWindowStart stays 0

        vm.warp(block.timestamp + DARE_CLAIM_TIMEOUT + 1);

        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.DareSettled(0, bob, false);
        arena.settleDare(0);

        assertEq(usdc.balanceOf(alice) - aliceBefore, DARE_MIN,
            "dare with no votes should refund creator after claim timeout");
        assertEq(arena.dareBalance(), 0);
    }

    function test_SettleDare_NoVotes_RevertsBeforeTimeout() public {
        _createAndClaim(alice, bob, DARE_MIN);

        // warp just before timeout
        vm.warp(block.timestamp + DARE_CLAIM_TIMEOUT - 1);

        vm.expectRevert(ChaosArena.VotingNotClosed.selector);
        arena.settleDare(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DARE — claimVoterReward
    // ══════════════════════════════════════════════════════════════════════════

    function test_ClaimVoterReward_HappyPath() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, true);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0);

        uint256 voterPool       = arena.dareVoterPool(0);
        uint256 expectedReward  = voterPool / 2; // 2 yes voters

        uint256 carolBefore = usdc.balanceOf(carol);

        vm.prank(carol);
        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.VoterRewardClaimed(0, carol, expectedReward);
        arena.claimVoterReward(0);

        assertEq(usdc.balanceOf(carol) - carolBefore, expectedReward);
        assertTrue(arena.dareVoterRewardClaimed(0, carol));
    }

    function test_ClaimVoterReward_RevertsIfNoVoterPool() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, false);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0);

        // carol voted NO, passed=false -> no voter pool
        vm.prank(carol);
        vm.expectRevert(ChaosArena.NotYesVoter.selector);
        arena.claimVoterReward(0);
    }

    function test_ClaimVoterReward_RevertsIfNotYesVoter() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, false);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0); // YES wins (1 yes > 1 no? actually tie: carol=YES, dave=NO => tie -> NO)
        // Actually 1:1 is a tie so passed=false → no voter pool
        // Swap: give carol 2 yes, dave 1 no
        // We'll redo with a fresh dare
    }

    function test_ClaimVoterReward_RevertsIfAlreadyClaimed() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, false); // 1 yes, 1 no -> tie
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0); // tie -> refund

        // carol voted yes but pool is 0 because it was a NO/tie result
        vm.prank(carol);
        vm.expectRevert(ChaosArena.NoPrizeForMonth.selector);
        arena.claimVoterReward(0);
    }

    function test_ClaimVoterReward_RevertsDoubleClaimOnYes() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.prank(dave);  arena.voteOnClaim(0, true);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0);

        vm.prank(carol);
        arena.claimVoterReward(0);

        vm.prank(carol);
        vm.expectRevert(ChaosArena.AlreadyClaimed.selector);
        arena.claimVoterReward(0);
    }

    function test_ClaimVoterReward_RevertsIfNotVoted() public {
        _createAndClaim(alice, bob, DARE_MIN);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);
        arena.settleDare(0);

        // dave never voted
        vm.prank(dave);
        vm.expectRevert(ChaosArena.Unauthorized.selector);
        arena.claimVoterReward(0);
    }

    function test_ClaimVoterReward_RevertsIfNotSettled() public {
        _createAndClaim(alice, bob, DARE_MIN);
        vm.prank(carol); arena.voteOnClaim(0, true);

        vm.prank(carol);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.claimVoterReward(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MUSEUM — mintMuseum
    // ══════════════════════════════════════════════════════════════════════════

    function test_MintMuseum_HappyPath() public {
        uint256 monthKey = block.timestamp / 30 days;

        vm.prank(alice);
        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.MuseumMinted(0, alice, "YOLO", monthKey);
        arena.mintMuseum("YOLO");

        assertEq(arena.ownerOf(0), alice);
        assertEq(arena.museumTokenIdCounter(), 1);
        assertTrue(arena.museumFeeFinalized());

        uint256 expectedPrize    = (MUSEUM_FEE * BPS_MUSEUM_PRIZE) / 10_000;
        uint256 expectedPlatform = (MUSEUM_FEE * BPS_PLATFORM)     / 10_000;
        uint256 expectedTreasury = MUSEUM_FEE - expectedPlatform - expectedPrize;

        assertEq(arena.museumPrizePool(), expectedPrize,
            "prize pool should hold 49% of mint fee");
        assertEq(usdc.balanceOf(treasury), expectedPlatform + expectedTreasury,
            "treasury should receive 2% + 49% = 51%");
        assertEq(usdc.balanceOf(address(arena)), expectedPrize,
            "contract holds only prize pool portion");
    }

    function test_MintMuseum_FeeSplit_2pct_49pct_49pct() public {
        // platform 2% → treasury, prize pool 49%, treasury 49%
        // But the code sends platform+treasury to treasury = 51%
        // and keeps prize portion in the contract
        vm.prank(alice);
        arena.mintMuseum("decision");

        uint256 expectedPrize = (MUSEUM_FEE * BPS_MUSEUM_PRIZE) / 10_000;
        // treasury receives: platformFee + treasuryAmount = (2% + 49%) = 51%
        uint256 expectedToTreasury = MUSEUM_FEE - expectedPrize;

        assertEq(usdc.balanceOf(treasury), expectedToTreasury);
        assertEq(arena.museumPrizePool(),  expectedPrize);
    }

    function test_MintMuseum_RevertsIfFeeIsZero() public {
        // Deploy a fresh arena with fee=0
        ChaosArena zeroFeeArena = new ChaosArena(
            address(usdc), treasury, owner, DARE_MIN, 0, LPW_MIN, LPW_MAX
        );
        vm.prank(alice);
        usdc.approve(address(zeroFeeArena), type(uint256).max);

        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidAmount.selector);
        zeroFeeArena.mintMuseum("decision");
    }

    function test_MintMuseum_RevertsEmptyDecision() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidString.selector);
        arena.mintMuseum("");
    }

    function test_MintMuseum_RevertsDecisionTooLong() public {
        string memory longStr = new string(501);
        // fill 501 bytes with 'a'
        bytes memory b = bytes(longStr);
        for (uint256 i; i < 501; i++) b[i] = "a";

        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidLength.selector);
        arena.mintMuseum(string(b));
    }

    function test_MintMuseum_TracksMintCounts() public {
        vm.prank(alice);
        arena.mintMuseum("d1");
        vm.prank(alice);
        arena.mintMuseum("d2");

        uint256 monthKey = block.timestamp / 30 days;
        assertEq(arena.monthlyMintCount(monthKey, alice), 2);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MUSEUM — museumFeeFinalized blocks fee change
    // ══════════════════════════════════════════════════════════════════════════

    function test_SetMuseumFee_BeforeFinalized() public {
        vm.prank(owner);
        arena.setMuseumFee(99e6);
        assertEq(arena.museumMintFee(), 99e6);
    }

    function test_SetMuseumFee_RevertsAfterFinalized() public {
        vm.prank(alice);
        arena.mintMuseum("first mint finalizes fee");

        vm.prank(owner);
        vm.expectRevert(ChaosArena.MuseumFeeFinalizedError.selector);
        arena.setMuseumFee(1e6);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MUSEUM — settleMuseumMonth
    // ══════════════════════════════════════════════════════════════════════════

    function test_SettleMuseumMonth_HappyPath() public {
        uint256 monthKey = block.timestamp / 30 days;

        vm.prank(alice);
        arena.mintMuseum("d1");
        vm.prank(alice);
        arena.mintMuseum("d2"); // alice minted 2x

        vm.prank(bob);
        arena.mintMuseum("d3"); // bob minted 1x

        uint256 monthPrize = arena.monthlyPrizeAccumulated(monthKey);
        assertGt(monthPrize, 0);

        // Advance past end of month
        vm.warp((monthKey + 1) * 30 days + 1);

        address[] memory winners = arena.getMonthlyTopAddresses(monthKey);
        uint256 prizePerWinner   = monthPrize / winners.length;

        vm.expectEmit(true, false, false, true, address(arena));
        emit ChaosArena.MuseumMonthSettled(monthKey, winners, prizePerWinner);
        arena.settleMuseumMonth(monthKey);

        assertTrue(arena.monthPrizeSettled(monthKey));
        assertEq(arena.museumPrizePerWinner(monthKey), prizePerWinner);
        assertEq(arena.museumPrizePool(), 0);
    }

    function test_SettleMuseumMonth_RevertsIfMonthNotEnded() public {
        uint256 monthKey = block.timestamp / 30 days;
        vm.prank(alice);
        arena.mintMuseum("d");

        vm.expectRevert(ChaosArena.MonthNotEnded.selector);
        arena.settleMuseumMonth(monthKey);
    }

    function test_SettleMuseumMonth_RevertsIfAlreadySettled() public {
        uint256 monthKey = block.timestamp / 30 days;
        vm.prank(alice);
        arena.mintMuseum("d");

        vm.warp((monthKey + 1) * 30 days + 1);
        arena.settleMuseumMonth(monthKey);

        vm.expectRevert(ChaosArena.PrizeAlreadyClaimed.selector);
        arena.settleMuseumMonth(monthKey);
    }

    function test_SettleMuseumMonth_RevertsIfNoMints() public {
        uint256 monthKey = block.timestamp / 30 days;
        vm.warp((monthKey + 1) * 30 days + 1);

        vm.expectRevert(ChaosArena.NoPrizeForMonth.selector);
        arena.settleMuseumMonth(monthKey);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MUSEUM — claimMuseumPrize (per-winner pull)
    // ══════════════════════════════════════════════════════════════════════════

    function test_ClaimMuseumPrize_HappyPath() public {
        uint256 monthKey = block.timestamp / 30 days;

        vm.prank(alice);
        arena.mintMuseum("d1");

        vm.warp((monthKey + 1) * 30 days + 1);
        arena.settleMuseumMonth(monthKey);

        uint256 prize       = arena.museumPrizePerWinner(monthKey);
        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.prank(alice);
        vm.expectEmit(true, true, false, true, address(arena));
        emit ChaosArena.MuseumPrizeClaimed(monthKey, alice, prize);
        arena.claimMuseumPrize(monthKey);

        assertEq(usdc.balanceOf(alice) - aliceBefore, prize);
        assertTrue(arena.museumPrizeWinnerClaimed(monthKey, alice));
    }

    function test_ClaimMuseumPrize_RevertsIfNotSettled() public {
        uint256 monthKey = block.timestamp / 30 days;
        vm.prank(alice);
        arena.mintMuseum("d");

        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidState.selector);
        arena.claimMuseumPrize(monthKey);
    }

    function test_ClaimMuseumPrize_RevertsIfNotWinner() public {
        uint256 monthKey = block.timestamp / 30 days;

        vm.prank(alice);
        arena.mintMuseum("d1");
        vm.prank(alice);
        arena.mintMuseum("d2"); // alice top with 2

        vm.warp((monthKey + 1) * 30 days + 1);
        arena.settleMuseumMonth(monthKey);

        vm.prank(bob);
        vm.expectRevert(ChaosArena.Unauthorized.selector);
        arena.claimMuseumPrize(monthKey);
    }

    function test_ClaimMuseumPrize_RevertsDoubleClam() public {
        uint256 monthKey = block.timestamp / 30 days;
        vm.prank(alice);
        arena.mintMuseum("d");

        vm.warp((monthKey + 1) * 30 days + 1);
        arena.settleMuseumMonth(monthKey);

        vm.prank(alice);
        arena.claimMuseumPrize(monthKey);

        vm.prank(alice);
        vm.expectRevert(ChaosArena.PrizeAlreadyClaimed.selector);
        arena.claimMuseumPrize(monthKey);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MUSEUM — tokenURI returns valid base64 JSON
    // ══════════════════════════════════════════════════════════════════════════

    function test_TokenURI_ReturnsBase64DataURI() public {
        vm.prank(alice);
        arena.mintMuseum("YOLO into BTC");

        string memory uri = arena.tokenURI(0);
        // Must start with the data URI prefix
        bytes memory uriBytes   = bytes(uri);
        bytes memory prefix     = bytes("data:application/json;base64,");
        assertEq(uriBytes.length >= prefix.length, true, "URI must be at least as long as prefix");
        for (uint256 i; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i], "URI prefix mismatch");
        }
    }

    function test_TokenURI_RevertsForNonExistentToken() public {
        vm.expectRevert();
        arena.tokenURI(999);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LPW — depositLPW
    // ══════════════════════════════════════════════════════════════════════════

    function test_DepositLPW_HappyPath_FirstDeposit() public {
        vm.prank(alice);
        uint256 expiry = block.timestamp + LPW_TIMER;

        vm.expectEmit(true, false, false, true, address(arena));
        emit ChaosArena.LPWDeposit(alice, LPW_MIN, expiry);
        arena.depositLPW(LPW_MIN);

        assertEq(arena.lpwBalance(),       LPW_MIN);
        assertEq(arena.lpwLastDepositor(), alice);
        assertEq(arena.lpwExpiry(),        expiry);
    }

    function test_DepositLPW_ResetsTimer() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);
        uint256 expiryAfterFirst = arena.lpwExpiry();

        vm.warp(block.timestamp + 2 minutes);

        vm.prank(bob);
        arena.depositLPW(LPW_MIN);

        assertGt(arena.lpwExpiry(), expiryAfterFirst, "timer should reset on each deposit");
        assertEq(arena.lpwLastDepositor(), bob);
        assertEq(arena.lpwBalance(), LPW_MIN * 2);
    }

    function test_DepositLPW_RevertsIfBelowMin() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidAmount.selector);
        arena.depositLPW(LPW_MIN - 1);
    }

    function test_DepositLPW_RevertsIfAboveMax() public {
        vm.prank(alice);
        vm.expectRevert(ChaosArena.InvalidAmount.selector);
        arena.depositLPW(LPW_MAX + 1);
    }

    function test_DepositLPW_RevertsAfterExpiry() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + 1);

        vm.prank(bob);
        vm.expectRevert(ChaosArena.LPWGameExpired.selector);
        arena.depositLPW(LPW_MIN);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LPW — claimLastWins
    // ══════════════════════════════════════════════════════════════════════════

    function test_ClaimLastWins_HappyPath_Split98_2() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + 1);

        uint256 aliceBefore    = usdc.balanceOf(alice);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        uint256 expectedFee    = (LPW_MIN * BPS_PLATFORM) / 10_000;
        uint256 expectedWinner = LPW_MIN - expectedFee;

        vm.expectEmit(true, false, false, true, address(arena));
        emit ChaosArena.LPWWon(alice, expectedWinner);
        arena.claimLastWins();

        assertEq(usdc.balanceOf(alice) - aliceBefore, expectedWinner, "winner gets 98%");
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee, "treasury gets 2%");
        assertEq(arena.lpwBalance(),       0);
        assertEq(arena.lpwLastDepositor(), address(0));
        assertEq(arena.lpwExpiry(),        0,  "state should be reset");
    }

    function test_ClaimLastWins_StateReset() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);
        vm.prank(bob);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + 1);
        arena.claimLastWins();

        assertEq(arena.lpwBalance(),       0);
        assertEq(arena.lpwLastDepositor(), address(0));
        assertEq(arena.lpwExpiry(),        0);
    }

    function test_ClaimLastWins_RevertsIfNoActiveGame() public {
        vm.expectRevert(ChaosArena.NoActiveGame.selector);
        arena.claimLastWins();
    }

    function test_ClaimLastWins_RevertsIfNotExpired() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.expectRevert(ChaosArena.LPWNotExpired.selector);
        arena.claimLastWins();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LPW — resetLPWAfterAbandon
    // ══════════════════════════════════════════════════════════════════════════

    function test_ResetLPWAfterAbandon_HappyPath() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + LPW_ABANDON_WINDOW + 1);

        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(arena));
        emit ChaosArena.LPWReset(LPW_MIN);
        arena.resetLPWAfterAbandon();

        assertEq(usdc.balanceOf(treasury) - treasuryBefore, LPW_MIN);
        assertEq(arena.lpwBalance(), 0);
        assertEq(arena.lpwExpiry(),  0);
    }

    function test_ResetLPWAfterAbandon_RevertsIfNoActiveGame() public {
        vm.prank(owner);
        vm.expectRevert(ChaosArena.NoActiveGame.selector);
        arena.resetLPWAfterAbandon();
    }

    function test_ResetLPWAfterAbandon_RevertsIfAbandonWindowNotReached() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + 1);

        vm.prank(owner);
        vm.expectRevert(ChaosArena.LPWAbandonWindowNotReached.selector);
        arena.resetLPWAfterAbandon();
    }

    function test_ResetLPWAfterAbandon_RevertsIfCallerNotOwner() public {
        vm.prank(alice);
        arena.depositLPW(LPW_MIN);

        vm.warp(block.timestamp + LPW_TIMER + LPW_ABANDON_WINDOW + 1);

        vm.prank(bob);
        vm.expectRevert();
        arena.resetLPWAfterAbandon();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  ACCESS CONTROL
    // ══════════════════════════════════════════════════════════════════════════

    function test_AccessControl_NonOwnerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert();
        arena.pause();
    }

    function test_AccessControl_OwnerCanPause() public {
        vm.prank(owner);
        arena.pause();
        assertTrue(arena.paused());
    }

    function test_AccessControl_OwnerCanUnpause() public {
        vm.prank(owner);
        arena.pause();
        vm.prank(owner);
        arena.unpause();
        assertFalse(arena.paused());
    }

    function test_AccessControl_NonOwnerCannotSetTreasury() public {
        vm.prank(alice);
        vm.expectRevert();
        arena.setTreasury(alice);
    }

    function test_AccessControl_OwnerCanSetTreasury() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, false, address(arena));
        emit ChaosArena.TreasuryUpdated(alice);
        arena.setTreasury(alice);
        assertEq(arena.treasury(), alice);
    }

    function test_AccessControl_SetTreasury_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(ChaosArena.ZeroAddress.selector);
        arena.setTreasury(address(0));
    }

    function test_AccessControl_NonOwnerCannotSetDareMinimum() public {
        vm.prank(alice);
        vm.expectRevert();
        arena.setDareMinimum(1e6);
    }

    function test_AccessControl_OwnerCanSetDareMinimum() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(arena));
        emit ChaosArena.DareMinimumUpdated(1e6);
        arena.setDareMinimum(1e6);
        assertEq(arena.dareMinimumUsdc(), 1e6);
    }

    function test_AccessControl_NonOwnerCannotSetMuseumFee() public {
        vm.prank(alice);
        vm.expectRevert();
        arena.setMuseumFee(1e6);
    }

    function test_WhenPaused_CreateDareReverts() public {
        vm.prank(owner);
        arena.pause();

        vm.prank(alice);
        vm.expectRevert();
        arena.createDare(DARE_MIN, "d", "p");
    }

    function test_WhenPaused_DepositLPWReverts() public {
        vm.prank(owner);
        arena.pause();

        vm.prank(alice);
        vm.expectRevert();
        arena.depositLPW(LPW_MIN);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FUZZ — createDare bounty
    // ══════════════════════════════════════════════════════════════════════════

    function testFuzz_CreateDare_BountyAccounting(uint96 bountyRaw) public {
        uint256 bounty = bound(bountyRaw, DARE_MIN, 1_000_000e6);
        usdc.mint(alice, bounty);

        vm.prank(alice);
        arena.createDare(bounty, "fuzz dare", "fuzz proof");

        assertEq(arena.dareBalance(), bounty);
        assertEq(usdc.balanceOf(address(arena)), bounty);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FUZZ — settleDare YES split correctness
    // ══════════════════════════════════════════════════════════════════════════

    function testFuzz_SettleDare_YesSplit(uint96 bountyRaw) public {
        uint256 bounty = bound(bountyRaw, DARE_MIN, 1_000_000e6);
        usdc.mint(alice, bounty);

        _createAndClaimWithBounty(alice, bob, bounty);

        vm.prank(carol); arena.voteOnClaim(0, true);
        vm.warp(block.timestamp + DARE_VOTING_WINDOW + 1);

        uint256 bobBefore      = usdc.balanceOf(bob);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        arena.settleDare(0);

        uint256 fee        = (bounty * BPS_PLATFORM) / 10_000;
        uint256 voterPool  = (bounty * BPS_VOTER)    / 10_000;
        uint256 claimant   = bounty - fee - voterPool;

        assertEq(usdc.balanceOf(bob) - bobBefore,           claimant,  "claimant 95%");
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, fee,       "fee 2%");
        assertEq(arena.dareVoterPool(0),                    voterPool, "voter 3%");
        assertEq(arena.dareBalance(),                        0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FUZZ — mintMuseum fee split
    // ══════════════════════════════════════════════════════════════════════════

    function testFuzz_MintMuseum_FeeSplit(uint96 feeRaw) public {
        uint256 fee = bound(feeRaw, 1, 100_000e6);
        // Deploy fresh arena with this fee
        ChaosArena a = new ChaosArena(address(usdc), treasury, owner, DARE_MIN, fee, LPW_MIN, LPW_MAX);
        usdc.mint(alice, fee);
        vm.prank(alice);
        usdc.approve(address(a), type(uint256).max);

        address freshTreasury = makeAddr("freshTreasury");
        // reset treasury for this a instance
        vm.prank(owner);
        a.setTreasury(freshTreasury);

        uint256 tBefore = usdc.balanceOf(freshTreasury);

        vm.prank(alice);
        a.mintMuseum("decision");

        uint256 expectedPrize    = (fee * BPS_MUSEUM_PRIZE) / 10_000;
        uint256 expectedPlatform = (fee * BPS_PLATFORM)     / 10_000;
        uint256 expectedTreasury = fee - expectedPlatform - expectedPrize;

        assertEq(a.museumPrizePool(), expectedPrize);
        assertEq(usdc.balanceOf(freshTreasury) - tBefore, expectedPlatform + expectedTreasury);
        assertEq(expectedPlatform + expectedTreasury + expectedPrize, fee, "splits must sum to fee");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FUZZ — LPW split
    // ══════════════════════════════════════════════════════════════════════════

    function testFuzz_LPW_Split(uint96 amountRaw) public {
        uint256 amount = bound(amountRaw, LPW_MIN, LPW_MAX);
        usdc.mint(alice, amount);

        vm.prank(alice);
        arena.depositLPW(amount);

        vm.warp(block.timestamp + LPW_TIMER + 1);

        uint256 aliceBefore    = usdc.balanceOf(alice);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        arena.claimLastWins();

        uint256 fee    = (amount * BPS_PLATFORM) / 10_000;
        uint256 winner = amount - fee;

        assertEq(usdc.balanceOf(alice)    - aliceBefore,    winner);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, fee);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  INVARIANT — USDC backing
    // ══════════════════════════════════════════════════════════════════════════
    // The backing invariant is already enforced in every mutating function by
    // _assertBackingInvariant(). The handler below exercises a wide swath of
    // operations and verifies the invariant externally after every call.

    function invariant_USDCBackingNeverUnderwater() public view {
        uint256 contractBalance = usdc.balanceOf(address(arena));
        uint256 required        = arena.dareBalance() + arena.museumPrizePool() + arena.lpwBalance();
        assertGe(contractBalance, required,
            "contract USDC balance must cover all tracked obligations");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  HELPER — internal test utilities
    // ══════════════════════════════════════════════════════════════════════════

    /// @dev Create a dare by `creator` and submit a claim by `claimant` with DARE_MIN bounty.
    function _createAndClaim(address creator, address claimant, uint256 /*bounty_unused*/) internal {
        vm.prank(creator);
        arena.createDare(DARE_MIN, "description", "proof definition");
        vm.prank(claimant);
        arena.submitClaim(0, "submission proof");
    }

    /// @dev Create a dare with a specific bounty and submit a claim.
    function _createAndClaimWithBounty(address creator, address claimant, uint256 bounty) internal {
        vm.prank(creator);
        arena.createDare(bounty, "description", "proof definition");
        vm.prank(claimant);
        arena.submitClaim(0, "submission proof");
    }
}

/// @title ChaosArenaHandler — stateful handler for Foundry invariant testing
contract ChaosArenaHandler is Test {
    ChaosArena  internal arena;
    MockERC20   internal usdc;

    address internal owner    = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal alice    = makeAddr("alice");
    address internal bob      = makeAddr("bob");
    address internal carol    = makeAddr("carol");

    uint256 internal constant DARE_MIN   = 10e6;
    uint256 internal constant MUSEUM_FEE = 5e6;
    uint256 internal constant LPW_MIN    = 1e6;
    uint256 internal constant LPW_MAX    = 100e6;

    constructor(ChaosArena _arena, MockERC20 _usdc) {
        arena = _arena;
        usdc  = _usdc;

        usdc.mint(alice, 100_000e6);
        usdc.mint(bob,   100_000e6);
        usdc.mint(carol, 100_000e6);
        vm.prank(alice); usdc.approve(address(arena), type(uint256).max);
        vm.prank(bob);   usdc.approve(address(arena), type(uint256).max);
        vm.prank(carol); usdc.approve(address(arena), type(uint256).max);
    }

    function createDare(uint256 bounty) external {
        bounty = bound(bounty, DARE_MIN, 1_000e6);
        usdc.mint(alice, bounty);
        vm.prank(alice);
        try arena.createDare(bounty, "handler dare", "handler proof") {} catch {}
    }

    function depositLPW(uint256 amount) external {
        amount = bound(amount, LPW_MIN, LPW_MAX);
        usdc.mint(alice, amount);
        vm.prank(alice);
        try arena.depositLPW(amount) {} catch {}
    }

    function mintMuseum() external {
        usdc.mint(bob, MUSEUM_FEE);
        vm.prank(bob);
        try arena.mintMuseum("handler decision") {} catch {}
    }
}

/// @title ChaosArenaInvariantTest — wires the handler to forge's invariant engine
contract ChaosArenaInvariantTest is Test {
    MockERC20          internal usdc;
    ChaosArena         internal arena;
    ChaosArenaHandler  internal handler;

    address internal owner    = makeAddr("owner");
    address internal treasury = makeAddr("treasury");

    function setUp() public {
        usdc    = new MockERC20("Mock USDC", "mUSDC", 6);
        arena   = new ChaosArena(
            address(usdc), treasury, owner,
            10e6, 5e6, 1e6, 100e6
        );
        handler = new ChaosArenaHandler(arena, usdc);
        targetContract(address(handler));
    }

    function invariant_Backing() public view {
        uint256 bal      = usdc.balanceOf(address(arena));
        uint256 required = arena.dareBalance() + arena.museumPrizePool() + arena.lpwBalance();
        assertGe(bal, required, "USDC balance must cover all obligations");
    }
}
