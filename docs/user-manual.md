# ChaosArena — User Manual

**ChaosArena** is an onchain game platform built on Arc Testnet. It combines three games into one contract. Every action is a real blockchain transaction. Every outcome is enforced by code, not by a platform.

USDC is the only currency. On Arc, USDC is also the gas token — so one balance covers both gameplay and transaction fees.

---

## Before You Start

### 1. Get a wallet

You need a browser wallet that supports custom EVM chains. MetaMask works. Any injected wallet (Rabby, Frame, Coinbase Wallet) works too.

### 2. Add Arc Testnet to your wallet

| Field | Value |
|---|---|
| Network name | Arc Testnet |
| RPC URL | `https://rpc.testnet.arc.io` |
| Chain ID | `5042002` |
| Currency symbol | `USDC` |
| Explorer | `https://explorer.testnet.arc.io` |

Most wallets let you add a custom network in Settings → Networks → Add Network.

### 3. Get test USDC

Click **Get test USDC** in the Arc Studio sidebar. It drips test USDC directly to your connected wallet on Arc Testnet. No external faucet needed.

Test USDC has no real value. You cannot transfer it to mainnet.

### 4. Connect your wallet

Click **Connect Wallet** in the top-right corner of ChaosArena. Select your wallet. Approve the connection. The app will show your address and USDC balance once connected.

If you are on the wrong network, your wallet will ask to switch. Approve it.

---

## The Three Games

---

## Game 1 — Onchain Dare

### What it is

You lock a USDC bounty and attach a dare to it. Anyone who believes they completed the dare submits proof. The community votes. If YES wins, the claimant collects the bounty. If NO wins, you get your money back.

### How to post a dare

1. Click the **Dare** tab.
2. Click **Post a Dare**.
3. Fill in three fields:
   - **Dare** — what you are challenging someone to do. Keep it specific.
   - **What counts as proof** — this is the most important field. Write exactly what proof you will accept. Example: "A publicly posted video of you eating a full raw onion without cutting it. Posted on a public social account you own."
   - **Bounty** — how much USDC to lock. Minimum 1 USDC.
4. Click **Lock Bounty & Post Dare**.
5. Approve the USDC spend in your wallet (first time only per session).
6. Confirm the transaction.

The dare is now live. It appears in the dare list for anyone to see and claim.

You can cancel a dare and reclaim your bounty at any time **before someone submits a claim**, as long as the dare has not expired (30-day limit).

### How to claim a dare

1. Browse the dare list. Find one you can do.
2. Read the proof definition carefully. The creator wrote exactly what they will accept.
3. Do the dare. Get your proof ready (a URL, a link, a written description — whatever the proof definition requires).
4. Click **Claim** on the dare.
5. Paste your proof into the field.
6. Confirm the transaction.

Your wallet address is now the claimant. You cannot change it. Only one claim per dare is accepted — first come, first served.

Once your claim is submitted, the dare moves to "Claimed" state. The 24-hour voting window does not start until the first vote is cast.

### How voting works

- Any wallet holding at least **0.10 USDC** on Arc can vote.
- One vote per wallet per dare.
- Votes are free — no USDC is transferred to vote. The balance check is just a spam filter.
- The voting window is **24 hours, starting from the moment the first vote is cast** — not from when the claim was submitted. If nobody votes for days, the window has not started yet.
- Vote YES if you think the proof satisfies the proof definition. Vote NO if it does not.
- There is no appeal. The numbers are the law.
- The proof definition is plain text with no onchain enforcement. The contract only counts votes — it cannot verify whether the proof is real. Social pressure is the only enforcement.

### Settlement

After the 24-hour voting window closes, anyone can call **Settle**. The contract checks the totals:

| Result | What happens |
|---|---|
| YES votes > NO votes | 95% of bounty to claimant, 3% split among YES voters, 2% to platform treasury |
| NO votes ≥ YES votes (including tie) | 100% bounty returned to dare creator, no fee |
| Zero votes after 7 days | Treated as tie, full refund to creator |

### Claiming your voter reward

If you voted YES and the dare passed, you earned a share of the 3% voter pool.

1. Find the settled dare in the list.
2. Click **Claim Voter Reward**.
3. Confirm the transaction.

The reward is split equally among all YES voters. It is not automatically sent — you must claim it yourself.

### Dare expiry

A dare with no claim submitted after **30 days** can be expired by anyone — the creator, or any other wallet. Nothing happens automatically. Someone must call **Expire Dare** to trigger the refund. Once called, the full bounty returns to the creator with no fee.

---

## Game 2 — Museum of Bad Decisions

### What it is

Pay 0.50 USDC to mint an ERC-721 NFT containing your worst financial decision. It is written into the blockchain forever. You cannot edit or delete it. The museum grows over time. Every 30 days, whoever has minted the most entries that month wins the monthly prize pool.

### How to mint a bad decision

1. Click the **Museum** tab.
2. Read the current prize pool and this month's leader board.
3. Click **Add My Bad Decision**.
4. Write your worst financial decision in the text field. Maximum 500 characters. Be specific — vague entries are less fun.
5. Click **Mint to Museum (0.50 USDC)**.
6. Approve the USDC spend (first time only per session).
7. Confirm the transaction.

Your NFT is minted. It appears in the museum list with your wallet address (truncated), the decision text, and the timestamp.

The NFT is real. It is in your wallet. You can transfer it. It will appear in any NFT viewer that supports Arc Testnet.

### The monthly prize

- 49% of every mint fee goes into the monthly prize pool.
- The contract divides time into fixed 30-day windows. Everyone minting during the same 30-day window competes together. The window boundaries are fixed — they do not reset from the moment you first mint.
- Whoever submits the most entries in that 30-day window wins.
- If two or more wallets are tied for first place, the prize is split equally among all tied wallets.

### How to claim the monthly prize

After the 30-day window ends:

1. Go to the **Museum** tab.
2. Click **Settle This Month** (anyone can call this once the month is over).
3. If you are a winner, click **Claim Prize**.
4. Confirm the transaction.

If you are one of multiple winners, your share is the total pool divided by the number of tied winners.

### Fee breakdown

Per mint of 0.50 USDC:

| Destination | Amount |
|---|---|
| Monthly prize pool | 49% (0.245 USDC) |
| Platform treasury | 51% (0.255 USDC) |

The treasury amount is split internally as 2% platform fee + 49% direct revenue, but both go to the same treasury address in one transfer. As a user you just pay 0.50 USDC and 49% of it goes toward the prize pool.

---

## Game 3 — Last Person Wins

### What it is

A pool of USDC with a countdown timer. Every deposit resets the timer to 5 minutes. Whoever deposits last — the moment the timer hits zero — wins the entire pool minus a 2% platform fee. Pure chaos.

### How to deposit

1. Click the **Last Person Wins** tab.
2. Watch the countdown. Watch the pool size. Watch who the current last depositor is.
3. Enter a deposit amount. Minimum 0.10 USDC. Maximum 100 USDC per transaction.
4. Click **Deposit & Reset Timer**.
5. Approve the USDC spend (first time only per session).
6. Confirm the transaction.

The timer resets to 5 minutes. You are now the last depositor. If nobody else deposits before the timer hits zero, you win.

There is no limit on how many times you can deposit. Each deposit resets the timer.

### How to claim the pool

When the timer hits zero:

1. The countdown shows **EXPIRED**.
2. If you are the last depositor, a **Claim Winnings** button appears.
3. Click it and confirm the transaction.
4. You receive 98% of the total pool. 2% goes to the platform treasury.

The claim function is permissionless — anyone can call it, but the USDC always goes to the last depositor's wallet regardless of who triggers the transaction. You do not need to be the last depositor to call it. But only the last depositor receives the funds.

### What happens if nobody claims

If the pool sits unclaimed for 30 days after expiry, the platform owner can reset the pool and send the balance to the treasury as a safety valve. This is a last resort and is not expected to happen during normal play.

---

## General Notes

### Transaction states

Every action goes through the same states:

| State | What you see |
|---|---|
| Idle | Button active |
| Waiting for wallet | "Confirm in wallet..." — check your wallet extension |
| Confirming | "Waiting for confirmation..." — transaction is on chain |
| Success | Action confirmed, state refreshes |
| Error | Error message shown, your input is preserved |

Arc Testnet confirms in under 15 seconds in most cases.

### Approvals

The first time you interact with each game in a session, your wallet will ask you to approve USDC spending. This is a standard ERC-20 approval. You approve once and all subsequent transactions in that session do not ask again. If you revoke approval in your wallet, you will need to approve again.

### Reading your USDC balance

The balance shown in the app is your ERC-20 USDC balance on Arc Testnet. On Arc, USDC and the gas token are the same asset, so you do not need a separate ETH balance for gas.

### Explorer links

Every settled transaction links to the Arc Testnet explorer at `https://explorer.testnet.arc.io`. You can verify every payout, every vote, every mint, and every deposit there. Nothing is hidden.

### Contract address

The ChaosArena contract is deployed at:

```
0x068b59e118a2de15e5a00e8e09e9a3d4508a3774
```

on Arc Testnet. You can read and verify the full source code in the `contracts/ChaosArena.sol` file in this project.

---

## Common Questions

**Can I cancel a dare after someone claims it?**
No. Once a claim is submitted, the dare moves to voting and cannot be cancelled.

**What if the voting window ends and nobody calls Settle?**
The dare stays in the "voting closed" state until anyone calls Settle. There is no deadline for settlement after the window closes — the funds are not at risk.

**Can I vote on my own dare?**
Yes, if you hold 0.10 USDC. The contract does not block the creator from voting.

**Can I vote on a dare I claimed?**
Yes. The claimant can vote YES on their own claim if they hold 0.10 USDC. The contract does not block this. Community norms apply.

**What if my Museum NFT decision is longer than 500 characters?**
The transaction will revert. Shorten it to 500 characters or fewer.

**Can I win the Museum prize with one mint?**
Yes, if nobody else mints that month. One mint is enough if you are the sole entrant.

**What happens to the LPW pool if the game has been running for a long time with no winner?**
The timer only reaches zero if nobody deposits for 5 full minutes. In active play this is unlikely. If the game sits completely idle and expires, the winner just needs to call Claim. The funds are safe in the contract.

**Is this real money?**
On Arc Testnet, no. Test USDC has no real value. On Arc Mainnet, it would be real USDC. This deployment is testnet only.

---

## Security Notes

This contract has been through a full security review before deployment. Key protections:

- The platform owner cannot withdraw player funds under any circumstances.
- All USDC movements follow a strict checks-effects-interactions pattern to prevent reentrancy attacks.
- The dare claimant address is always the wallet that submits the claim — it cannot be redirected.
- Museum prize payouts are pull-based: each winner claims individually, so one blocked wallet cannot prevent others from receiving their share.
- A dare with no votes automatically resolves in the creator's favor after 7 days — bounties cannot be locked permanently.

This is testnet software. It has not been audited by a third-party security firm. Do not use it with real funds.
