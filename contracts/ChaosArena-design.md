# ChaosArena — Smart Contract Design Doc

**Status:** Draft  
**Target Chain:** Arc Testnet (EVM-compatible, USDC as native gas token)  
**Language / Toolchain:** Solidity 0.8.x, Foundry (Forge)  
**EVM Hardfork Target:** Paris (`evm_version = "paris"`)  

**Review Tracker:**
- [ ] Design Review
- [ ] Security Review
- [ ] Ops Review

---

## Action Items (living)

- Updated voting threshold from 1 USDC to 0.10 USDC (balance check only, no transfer).
- Added voter reward split: correct voters share a small % of settled dare bounty.
- Added 30-day auto-expiry on unclaimed dares (creator can also manually cancel before claim).
- Added 2% platform fee across all three games, sent to treasury wallet at settlement time.

---

## 1. Goals / Non-Goals

### Goals
- Combine three onchain mini-games into one shared platform contract.
- **Onchain Dare**: anyone locks USDC with a dare description; others submit proof links/text; community votes majority-wins to release bounty to a claimed address.
- **Museum of Bad Decisions**: anyone pays a USDC entry fee to permanently mint an ERC-721 NFT recording their worst financial decision; the NFT is theirs, the story is public forever.
- **Last Person Wins**: a shared USDC pool resets a 5-minute timer on every deposit; whoever is the last depositor when the timer expires wins the entire pool.
- All USDC flows handled via ERC-20 `transferFrom` / `transfer` (Arc Testnet USDC ERC-20 address).
- Immutable, no upgrades — fun/game contract, not a DeFi protocol.
- Single deployer-owner can pause/unpause all three games for emergency use.

### Non-Goals
- No yield, staking, or lending mechanics.
- No oracle integration — proof validity is entirely social/vote-based.
- No cross-chain functionality.
- No upgradeable proxy — intentionally immutable.
- No fiat onramp.
- No governance token.
- Treasury address is set at deploy; owner can update it but cannot withdraw from the contract directly — fees are pushed to treasury at settlement time only.

---

## 2. Requirements

### Functional
- **Dare**: Creator deposits a USDC bounty (min 1 USDC). Dare has a text description and a creator-defined "what counts as proof" statement. Any address can submit a claim (proof URL or text + claimant address). Voting: any address holding ≥ 0.10 USDC (100,000 in 6-decimal units) on Arc can cast one YES or NO vote per dare per wallet — balance checked at vote time, USDC stays in voter's wallet. After a 24-hour voting window (from first vote), if YES > NO: 90% of bounty goes to claimant, 10% is split equally among YES voters (claimable via `claimVoterReward(dareId)` — pull pattern). On NO or tie: 100% returns to creator, no voter rewards. Dare auto-expires after 30 days with no claim submitted — anyone can call `expireDare(dareId)` to return bounty to creator.
- **Museum**: A flat USDC entry fee (configurable at deploy, e.g. 0.5 USDC). Payer submits a text string (their bad decision, max 500 chars). Contract mints them an ERC-721 NFT with on-chain metadata encoding the text + timestamp + sequential token ID. Fees accumulate in contract (not extractable by owner).
- **Last Person Wins**: Any address deposits between a minimum (e.g. 0.1 USDC) and maximum (e.g. 100 USDC) per transaction. Each deposit resets the countdown to 5 minutes from `block.timestamp`. After the timer expires, the last depositor calls `claimLastWins()` to receive the entire pool balance. If no claim within 30 days after expiry, a new game can be manually started (resetting state) — guards against permanent lock.

### Security
- No path lets a non-last-depositor claim the Last Wins pool before timer expiry.
- No path lets a non-winner claim a Dare bounty without a majority YES vote after the voting window closes.
- No path lets a voter claim a reward more than once per dare.
- Voter reward split (10%) is distributed only to YES voters and only on a won dare.
- Dare auto-expires after 30 days with no claim; bounty returns to creator via `expireDare()`.
- No path lets the owner extract user funds from any of the three games.
- No path allows reentrancy to drain funds.
- USDC transfer failures revert the whole transaction.
- Voting: one vote per dare per address; vote cannot be changed once cast.
- Museum fee cannot be set to 0 once non-zero tokens exist (prevents NFT minting being free after the fact).

---

## 3. Terminology & Actors

| Term | Definition |
|---|---|
| Dare | A challenge struct: bounty, description, proof definition, claimant, votes, state |
| Claimant | Address that submitted proof for a Dare and will receive bounty if vote passes |
| Museum Entry | An ERC-721 NFT encoding one "bad financial decision" string |
| LPW (Last Person Wins) | The rolling pool + timer game |
| Voting window | 24-hour period from the first vote on a Dare claim, during which votes are accepted |

| Actor | On/Off-chain | Trust Level | Capabilities |
|---|---|---|---|
| Owner (deployer) | On-chain | Trusted | Pause/unpause, set dare minimum, set museum fee (before first mint), no fund access |
| Dare Creator | On-chain | Untrusted | Create dare with USDC deposit, cancel before claim submitted |
| Dare Claimant | On-chain | Untrusted | Submit proof once per dare; receives bounty if vote passes |
| Voter | On-chain | Untrusted | Cast one YES/NO vote per dare; must hold ≥ 1 USDC (ERC-20 balance check at vote time) |
| LPW Depositor | On-chain | Untrusted | Deposit USDC into the pool, reset the timer; last depositor before expiry wins |
| Museum Minter | On-chain | Untrusted | Pay fee + submit text; receives ERC-721 NFT |
| Anyone | On-chain | Untrusted | `claimLastWins()` on behalf of last depositor after expiry; read any public state |

---

## 4. Language / Runtime

- **Solidity 0.8.28** — checked arithmetic by default; explicit `unchecked` only in provably safe counters.
- **Foundry (Forge)** for compile, test, deploy.
- **Paris EVM** (`evm_version = "paris"`) — no Cancun opcodes (`mcopy`, transient storage, `BLOBHASH`).
- **OpenZeppelin 5.1.0** (already pinned in sandbox) — `ERC721`, `Ownable2Step`, `Pausable`, `ReentrancyGuard`, `SafeERC20`.
- No proxy, no upgrade mechanism.

---

## 5. Transaction & Execution Model

All state is committed or reverted atomically per transaction. CEI (Checks-Effects-Interactions) is enforced at every external call site:

1. Validate inputs and state (checks).
2. Update contract state (effects).
3. Transfer USDC or mint NFT (interactions).

`ReentrancyGuard` (`nonReentrant`) applied to all USDC-moving functions. `SafeERC20.safeTransfer` / `safeTransferFrom` used throughout — reverts on non-standard return values or transfer failures.

---

## 6. Chain Standards & Interfaces

| Standard | Usage |
|---|---|
| ERC-20 (USDC) | `IERC20` for balance checks; `SafeERC20` for transfers |
| ERC-721 | Museum NFTs — `ERC721` base, `tokenURI` returns base64-encoded on-chain JSON metadata |
| EIP-165 | Inherited via OZ `ERC721` |

No EIP-712 signatures, no Permit2, no cross-chain interfaces.

---

## 7. Architecture Overview

### Component Diagram

```mermaid
graph TD
    User -->|createDare / submitClaim / vote / claimDare| ChaosArena
    User -->|mintMuseum| ChaosArena
    User -->|depositLPW / claimLastWins| ChaosArena
    ChaosArena -->|safeTransferFrom| USDC[Arc USDC ERC-20]
    ChaosArena -->|safeTransfer| Winner[Winner/Creator/Claimant]
    ChaosArena -->|_mint| MuseumNFT[ERC-721 Museum NFT\n(same contract)]
```

### Flow of Funds

| Step | Who | Action | Invariant |
|---|---|---|---|
| Dare created | Creator → contract | `safeTransferFrom(creator, contract, bounty)` | `contract.dareBalance += bounty` |
| Dare cancelled | contract → creator | `safeTransfer(creator, bounty)` | dare is `Cancelled`; `dareBalance -= bounty` |
| Dare claim voted YES | contract → claimant | `safeTransfer(claimant, bounty)` after window | dare is `Settled`; `dareBalance -= bounty` |
| Museum fee paid | minter → contract | `safeTransferFrom(minter, contract, fee)` | `museumBalance += fee`; NFT minted |
| LPW deposit | depositor → contract | `safeTransferFrom(depositor, contract, amount)` | `lpwBalance += amount`; timer reset |
| LPW claim | contract → winner | `safeTransfer(lastDepositor, lpwBalance)` | `lpwBalance == 0`; game resets |

**Resting-state invariant:** `USDC.balanceOf(contract) == dareBalance + museumBalance + lpwBalance` at all times. Museum balance is never extractable; dare balance only flows to creator (cancel) or claimant (settled vote); LPW balance only flows to last depositor on expiry.

---

## 8. Contract Design

### Roles

| Role | Holder | Permissions | Blast Radius if Compromised |
|---|---|---|---|
| `owner` (`Ownable2Step`) | Deployer | Pause/unpause, set dare minimum, set museum fee pre-first-mint | Pause the platform; cannot steal funds |
| Anyone | Any EOA/contract | Play all three games | None — untrusted by design |

### Storage Layout

```
// Dare game
mapping(uint256 => Dare) public dares;
uint256 public dareCount;
uint256 public dareMinimumUsdc;           // in USDC decimals (6)
uint256 public dareVotingWindowSeconds;   // default 86400 (24h)

// Museum
uint256 public museumFee;                 // in USDC decimals (6)
uint256 public museumTokenIdCounter;      // ERC-721 sequential ID
mapping(uint256 => MuseumEntry) public museumEntries; // tokenId => entry
bool public museumFeeFinalized;           // true after first mint

// LPW
uint256 public lpwMinDeposit;             // in USDC decimals (6)
uint256 public lpwMaxDeposit;             // in USDC decimals (6)
uint256 public lpwTimerSeconds;           // 300 (5 min)
uint256 public lpwExpiry;                 // block.timestamp of last deposit + timer
address public lpwLastDepositor;          // winner when timer expires
uint256 public lpwPool;                   // running balance
uint256 public lpwAbandonAfterSeconds;    // 30 days — reset safety valve

// Accounting
uint256 public dareBalance;
uint256 public museumBalance;
uint256 public lpwBalance;

address public immutable usdc;            // Arc USDC ERC-20 address
```

### Structs

```solidity
struct Dare {
    address creator;
    uint256 bounty;                          // USDC amount locked
    string description;                      // dare text
    string proofDefinition;                  // what counts as proof
    address claimant;                        // address that submitted proof (address(0) if none)
    string proofSubmission;                  // claimant's proof text/URL
    uint256 expiresAt;                       // timestamp: open dare expires if unclaimed
    uint256 voteWindowStart;                 // timestamp of first vote
    uint256 yesVotes;
    uint256 noVotes;
    uint256 voterRewardPerHead;              // per YES voter share after Won settlement
    mapping(address => bool) hasVoted;
    mapping(address => bool) votedYes;       // to check eligibility for reward
    mapping(address => bool) rewardClaimed;  // to prevent double-claim
    DareState state;
}

enum DareState { Open, Claimed, Won, Lost, Expired }

struct MuseumEntry {
    address minter;
    string decision;   // the bad financial decision text
    uint256 timestamp;
}
```

### Key Write Functions

| Function | Caller | State Changed | Events | Revert Conditions |
|---|---|---|---|---|
| `createDare(bounty, desc, proofDef)` | Anyone | New `Dare` in `dares[dareCount++]`; `dareBalance += bounty`; `dare.expiresAt = now + 30 days` | `DareCreated(id, creator, bounty)` | Bounty < minimum; USDC transfer fails; paused |
| `expireDare(dareId)` | Anyone | `dare.state = Expired`; `safeTransfer(creator, bounty)`; `dareBalance -= bounty` | `DareExpired(id)` | State != Open; `block.timestamp < dare.expiresAt`; paused |
| `submitClaim(dareId, proof)` | Anyone | `dare.claimant = msg.sender`; `dare.proofSubmission = proof`; `dare.state = Claimed` | `ClaimSubmitted(id, claimant)` | State != Open; dare expired; paused |
| `voteOnClaim(dareId, yes)` | Anyone holding ≥ 0.10 USDC | `dare.yesVotes++` or `dare.noVotes++`; `hasVoted[msg.sender] = true`; records voter side; sets `voteWindowStart` on first vote | `VoteCast(id, voter, yes)` | State != Claimed; already voted; USDC balance < 0.10; voting window closed; paused |
| `settleDare(dareId)` | Anyone | YES > NO: `safeTransfer(claimant, bounty*90/100)`; store `voterRewardPerHead = bounty*10/100 / yesVotes`; `state = Won`; else: `safeTransfer(creator, bounty)`; `state = Lost`; `dareBalance -= bounty` (90% portion) | `DareSettled(id, claimant, passed)` | State != Claimed; voting window not closed yet; paused |
| `claimVoterReward(dareId)` | YES voter on a Won dare | `safeTransfer(msg.sender, voterRewardPerHead)`; mark reward claimed; `dareBalance -= voterRewardPerHead` | `VoterRewardClaimed(id, voter, amount)` | Dare not Won; caller not a YES voter; already claimed; paused |
| `mintMuseum(decision)` | Anyone | Mint ERC-721 to `msg.sender`; store `MuseumEntry`; `museumBalance += fee`; `museumFeeFinalized = true` | `MuseumMinted(tokenId, minter)`; ERC-721 `Transfer` | Decision empty or > 500 chars; USDC transfer fails; paused |
| `depositLPW(amount)` | Anyone | `lpwPool += amount`; `lpwBalance += amount`; `lpwLastDepositor = msg.sender`; `lpwExpiry = now + timer` | `LPWDeposit(depositor, amount, newExpiry)` | Amount out of [min,max] range; USDC transfer fails; paused |
| `claimLastWins()` | Anyone | `safeTransfer(lpwLastDepositor, lpwPool)`; resets `lpwPool`, `lpwLastDepositor`, `lpwExpiry`, `lpwBalance = 0` | `LPWWon(winner, amount)` | Timer not expired; pool == 0; paused |
| `resetLPWAfterAbandon()` | Owner | Resets LPW state after `lpwAbandonAfterSeconds` past expiry | `LPWReset()` | Timer not expired; not past abandon window |
| `setDareMinimum(amount)` | Owner | `dareMinimumUsdc = amount` | — | Not owner |
| `setMuseumFee(fee)` | Owner | `museumFee = fee` | — | Not owner; `museumFeeFinalized == true` |
| `pause()` / `unpause()` | Owner | OZ `Pausable` state | `Paused` / `Unpaused` | Not owner |

### Events

| Event | Params | When |
|---|---|---|
| `DareCreated` | `uint256 id, address creator, uint256 bounty` | New dare created |
| `DareExpired` | `uint256 id` | Unclaimed dare expired after 30 days |
| `ClaimSubmitted` | `uint256 id, address claimant` | Proof submitted for a dare |
| `VoteCast` | `uint256 id, address voter, bool yes` | Vote cast on a dare claim |
| `DareSettled` | `uint256 id, address claimant, bool passed` | Vote window closed, bounty disbursed |
| `VoterRewardClaimed` | `uint256 id, address voter, uint256 amount` | YES voter pulls their reward share |
| `MuseumMinted` | `uint256 tokenId, address minter` | Museum NFT minted |
| `LPWDeposit` | `address depositor, uint256 amount, uint256 newExpiry` | LPW deposit received |
| `LPWWon` | `address winner, uint256 amount` | LPW pool claimed by winner |
| `LPWReset` | — | Owner resets abandoned LPW game |

---

## 9. Deployment & Initialization

Constructor args:
- `address _usdc` — Arc Testnet USDC ERC-20 address
- `uint256 _dareMinimumUsdc` — e.g. 1_000_000 (1 USDC, 6 decimals)
- `uint256 _museumFee` — e.g. 500_000 (0.5 USDC)
- `uint256 _lpwMinDeposit` — e.g. 100_000 (0.1 USDC)
- `uint256 _lpwMaxDeposit` — e.g. 100_000_000 (100 USDC)
- `address _initialOwner` — platform deployer wallet

No proxy; no `initialize()`. Constructor sets all immutable params and transfers ownership to `_initialOwner`.

---

## 10. Upgradeability

**None.** Intentionally immutable — this is a fun/game contract. If a bug is found, deploy a new address and announce migration. No user funds at rest survive a migration automatically (users would need to settle/claim before migration window).

---

## 11. Key Management & Signing

- Owner key: the platform deployer wallet (Circle SCP-managed on testnet). No off-chain signing required anywhere in the protocol.
- No EIP-712, no Permit2, no signature replay surface.

---

## 12. Security Considerations

| Vulnerability | Applicable? | Mitigation |
|---|---|---|
| Reentrancy | Yes — USDC transfers on claim/settle/cancel | CEI ordering everywhere + `nonReentrant` on all fund-moving functions |
| Access control | Yes — dare cancel, LPW abandon-reset, owner functions | `onlyOwner` via `Ownable2Step`; dare cancel checks `msg.sender == dare.creator`; no fund-extraction by owner |
| Integer overflow/underflow | Solidity 0.8.28 checked | No `unchecked` blocks except provably safe token ID counter increment |
| Unchecked external call | Yes — USDC transfer return | `SafeERC20.safeTransfer` / `safeTransferFrom` throughout |
| Fee-on-transfer tokens | No — only Arc USDC, which is standard | N/A; USDC is not fee-on-transfer |
| Signature replay | No signing in protocol | N/A |
| Front-running / MEV | LPW: last-deposit sniping is a feature, not a bug | Intentional game mechanic; documented |
| Flash-loan manipulation | No price oracle; voting weight is binary (1 USDC balance check) | Not manipulable; 1 USDC threshold low enough to be meaningless as a weight |
| Oracle manipulation | No oracle | N/A |
| DoS — vote gas exhaustion | Unbounded vote loop risk | `settleDare` does not iterate voters; only tracks totals and `hasVoted` mapping |
| DoS — dare string storage | Large strings stored on-chain cost gas | Max 500 chars enforced for Museum; dare description/proof capped at reasonable length in code |
| Delegatecall / proxy | None | N/A — immutable contract |
| Timestamp dependence | LPW timer uses `block.timestamp` | 5-minute timer; miner timestamp manipulation tolerance ±15s is acceptable for a fun game; documented |
| Approval persistence | Users approve USDC to this contract | Standard pull-transfer; no persistent max-approval required from users |
| Centralization risk | Owner can pause all games | Pause only — cannot steal funds; blast radius is temporary game halt |
| LPW pool lock | Pool locked if no claimant ever calls | `resetLPWAfterAbandon()` available to owner after 30 days; considered last resort |
| Voting sybil | Anyone can vote with 1 USDC | Intentional design — social enforcement only; documented as "no enforcement guarantee" |
| Museum fee extraction | Owner sets fee but cannot extract accumulated fees | `museumBalance` tracked separately; no withdrawal function for museum balance; fees locked in contract forever by design |

---

## 13. Trust Model & Threat Analysis

| Actor | Max damage if compromised | Mitigation | Detection |
|---|---|---|---|
| Owner key | Pause all three games indefinitely; change dare minimum and museum fee (pre-first-mint) | Cannot steal funds; pause is reversible by the same key; fee changes only affect future mints after `museumFeeFinalized` is set | Monitor `Paused` events; multi-sig upgrade path for production |
| Any player | Grief: create spam dares with minimum bounty; flood votes at 1 USDC threshold; spam LPW with minimum deposits | All actions cost USDC (spam is self-funded); minimum deposit/bounty floors prevent zero-cost grief | Off-chain monitoring; no protocol fix needed |
| Claimant | Submit frivolous proof | Voters can reject; creator gets bounty back on NO result | Social layer |

---

## 14. Emergency Response & Circuit Breakers

- `pause()` / `unpause()` via `Ownable2Step` owner — halts `createDare`, `submitClaim`, `voteOnClaim`, `settleDare`, `mintMuseum`, `depositLPW`, `claimLastWins`.
- `resetLPWAfterAbandon()` — safety valve for permanently stuck LPW pool (30-day window after expiry).
- No token rescue function — owner cannot extract funds; if USDC is accidentally sent outside the protocol's own tracked balances, it is unrecoverable by design.

---

## 15. Failure Scenarios

- **USDC `transferFrom` fails** (insufficient allowance or balance): entire tx reverts; no state changes.
- **LPW timer never expires** (constant stream of deposits): by design — last player always resets. Only terminates when deposits stop.
- **Dare voting window closes with 0 votes** (neither side wins): `settleDare` called → YES (0) <= NO (0) → bounty returned to creator. Ties go to creator.
- **Claimant address is a contract with no USDC receive logic**: `safeTransfer` still succeeds (ERC-20 transfer to any address); claimant is responsible for their own address.
- **Museum fee set then first mint triggers `museumFeeFinalized`**: owner can never lower fee to 0 after that, preventing retroactive free minting.

---

## 16. Priorities & Tradeoffs

| Decision | Tradeoff | Rationale |
|---|---|---|
| Voting weight = binary (hold 1 USDC) | No whale weighting vs. sybil resistance | Dare validation is social-only; complex weighting adds gas + complexity for a fun game |
| Museum fees locked forever | Funds unrecoverable vs. no owner extraction risk | Aligns incentive: museum grows, nobody profits, ever |
| Timestamps for LPW (not block numbers) | Miner manipulation ±15s | Acceptable for a 5-minute game; block numbers would require extra config per chain |
| Single contract for all 3 games | More surface area vs. simpler UX | Easier for users to approve USDC once; lower deploy cost |
| No upgradeability | Can't fix bugs without redeploy vs. simpler trust model | Fun game; immutability is a feature, not a liability |

---

## 17. Testing Strategy

- **Unit tests (Foundry)**: happy path + revert paths for every write function; fuzz key arithmetic (bounty sizes, deposit amounts, timer values); at least one invariant test (`USDC.balanceOf(contract) == dareBalance + museumBalance + lpwBalance`).
- **Slither static analysis**: all high + medium findings resolved.
- **Manual review**: CEI ordering, access control matrix vs. implementation.

Run: `cd /home/user/app && forge test -vv`

---

## 18. Third-Party Libraries

| Library | Version | Already a dep? | Why chosen | Security-reviewed? |
|---|---|---|---|---|
| OpenZeppelin Contracts | 5.1.0 | Yes (pinned) | ERC721, Ownable2Step, Pausable, ReentrancyGuard, SafeERC20 | Yes — industry standard |

---

## 19. Monitoring & Alerting

| Event | Threshold | Severity | Action |
|---|---|---|---|
| `Paused` | Any | High | Investigate owner key compromise |
| `LPWWon` | Any | Info | Log winner + pool size |
| `DareSettled` with `passed=false` | Any | Info | Dare bounty returned to creator |
| `LPWReset` | Any | Medium | Pool was abandoned — investigate why |
