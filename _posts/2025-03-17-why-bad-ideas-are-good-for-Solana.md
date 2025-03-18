---
title: Why "Bad" Ideas are Good for Solana - A Journey Through Transaction Prioritization 
tags: Solana fee-markets solana-fee-markets solana-transaction-prioritization solana-priority-fees simd-253 transaction-stuffing solana-mechanisms
---

# WIP - WORK IN PROGRESS


# Why Explore “Bad” Ideas?

In the world of high-throughput blockchain design—especially on Solana—people often focus on polished final solutions that “just work.” But that mindset can stifle creativity and blind us to alternative approaches. What if we took a fearless dive into the entire design space, including half-baked or experimental ideas? Sure, many of them won’t survive deeper scrutiny—some might even be called “bad.” Yet every attempt, success or failure, helps us uncover hidden constraints, new angles, and why certain mechanisms succeed under pressure.

This post embraces the spirit of open exploration. By presenting multiple mechanisms—some plausible, some purely speculative—we see how different models of transaction processing and spam prevention fit (or clash) with Solana’s architecture. The real value lies in discovering *where* and *why* they break, and gleaning insights for the next iteration. So whether these ideas ever become production-ready or remain thought experiments, the learning we gain is priceless—and it might just spark the next big breakthrough.

## Background: Fikumni’s Proposal and Toly’s Concern

My friend, and a deeply insightful thinker on Solana, [Fikumni](https://x.com/fikunmi_ap/), recently [proposed an approach to dynamic fees on Solana](https://x.com/fikunmi_ap/status/1901657108967244086) ([SIMD-253](https://www.eclipselabs.io/blogs/improving-the-svms-fee-markets)) to address Solana’s fee estimation and prioritization challenges. The idea was to let priority fees play a stronger role in transaction ordering, potentially aligning cost with demand more effectively.

However, [Toly](https://x.com/aeyakovenko) (Anatoly Yakovenko, Solana’s co-founder) [pointed out](https://x.com/aeyakovenko/status/1901691229739663622) an important security vulnerability that arises if Solana were to prioritize transactions by priority fees *before* verifying the fee payer. In such a scenario, a malicious attacker could stuff the pipeline with transactions claiming high priority fees, *even though* the fee payer is invalid. This would overwhelm validator resources—similar to a spam or DDoS attack—since the pipeline would be busy processing these bogus, high-fee transactions until they eventually fail validation.

Toly suggested limiting early prioritization to stake-weighted connections as a way to penalize or disconnect staked senders who push invalid fee payers. This approach fits well with Solana’s proof-of-stake design—staked validators have an economic incentive to avoid malicious spam that could risk their stake or connection.

From this conversation, it became clear that transaction prioritization is an even broader topic than just dynamic fees. Many potential ideas—from partial verifications to specialized auctions—could surface if we’re open to exploring them, *even* if some prove unwieldy or incomplete. Hence, this article: an exploration into alternative mechanisms, from trivial to “out there,” to see what might spark new insights or next-gen solutions.

## A Note of Encouragement

If you’re someone with ideas—maybe you’re new to crypto, or just afraid your ideas or proposals will be dismissed—don’t let the fear of being judged stop you from sharing. Even “bad” ideas can foster invaluable discussions and highlight important edge cases. Every exploration, no matter how offbeat, helps you (and the community) understand the domain better. With every iteration and every “failed” approach, we refine our mental models and get closer to the solutions that truly make a difference.

Let's explore some "bad" ideas bravely.

---

# 1. Early-Stage Filtering with “Deferred Verification” Layers

## Brief Description
This approach aims to quickly weed out blatantly invalid transactions (like a fee payer with zero balance or a totally incorrect signature) before they can flood the pipeline. By doing a cheap, *shallow* verification step early, the system prevents these invalid transactions from occupying resources, while still deferring the full verification to later stages to preserve performance.

## How It May Work
- Stage 1: Shallow Check  
  - At Ingress or SigVerify, run minimal verification (e.g., signature presence, basic lamport check for the fee payer).  
  - Mark passing transactions as “provisionally valid,” assigning a *tentative priority* based on their declared fees.  
- Stage 2: Detailed Check  
  - Occurs in the Banking Stage or a specialized sub-stage.  
  - Performs advanced checks (precise account balances after concurrency, program-specific constraints, etc.).  
  - Transactions that fail here are discarded, albeit after they’ve already consumed some resources.

**Advantages**
- Reduced Spam: Quick rejects for obviously invalid fee payers.  
- Earlier Prioritization: Transactions that pass the shallow check can be scheduled by priority earlier.  
- Lower Overhead vs. running a full in-depth verification step on every single transaction at high TPS.

**Challenges**
- Incomplete: Some invalid transactions might still slip through Stage 1, clogging resources in Stage 2.  
- Implementation Complexity: Defining “shallow” checks that are cheap yet effective isn’t trivial.  
- Adaptive Attackers: Attackers could craft borderline valid fee payers to pass Stage 1 but fail deeper checks.

**Implementation Details & Issues**
- Must carefully tune what the shallow check includes (e.g., quick lamport check, basic signature presence).  
- The validator code changes need concurrency-safe reads at high speeds.  
- A fallback mechanism is necessary if shallow-check logic stalls under load (e.g., caching, batch reading).

---

# 2. “Reversible Batches” with Automated Rollbacks

## Brief Description
Here, the pipeline optimistically schedules batches of high-fee transactions, assuming they’re valid. If any transaction later fails deeper checks, the system rolls back the invalid one (or the entire batch), freeing the slot for another queued transaction. This keeps throughput high while allowing the protocol to correct invalid or spammy transactions *retroactively*.

## How It May Work
- Batch Scheduling  
  - Group transactions by priority (fee size), then execute them in a batch.  
- Conditional Execution  
  - If a transaction fails deeper checks (like insufficient funds or concurrency conflicts), revert that transaction’s state changes (or revert the entire batch), and replace it with a fallback transaction.

**Advantages**
- Optimistic Throughput: The chain quickly runs high-fee transactions without preemptive checks.  
- Spam Deterrence: Invalid transactions get booted mid-flight, limiting their impact.  
- Resource Utilization: Encourages full block usage by initially scheduling all top-priority txs.

**Challenges**
- Rollback Complexity: Keeping partial or full snapshots for each batch is non-trivial under parallel execution.  
- Performance Overheads: If rollbacks happen often, repeated replays can drag down throughput.  
- Potential Attack: Attackers might cause deliberate rollbacks to consume validator resources.

**Implementation Details & Issues**  
- Could store a “pre-batch state checkpoint” to revert to if needed.  
- Must handle concurrency carefully, ensuring some transactions remain valid while only invalid ones revert.  
- Overheads must be minimal to preserve Solana’s sub-second finality.

---

# 3. “Auction Windows” Aligned with Solana Slots

## Brief Description
Rather than a continuous transaction flow, each Solana slot (or sub-slot) becomes a mini auction for block space. Users place fee bids, the protocol calculates a clearing price, and only valid, high-enough bids get in. This provides structured price discovery while letting the network adapt to demand changes slot by slot.

## How It May Work
- Discrete Auction Period  
  - During a slot, transactions arrive, bidding for space. At slot end, the system picks a clearing fee.  
- Fee Payer Validation  
  - Invalid payers fail. Valid transactions that meet or exceed the clearing fee get included in the next block.

**Advantages**
- Clear Price Discovery: Bidders see a definitive “market price” each slot.  
- Spam Control: Invalid or fake bids pay nothing if they can’t pass final checks.  
- Stability: Frequent auctions adapt to changing demand.

**Challenges**
- Latency Bump: Users wait for the slot’s auction conclusion before seeing if they’re included.  
- Implementation Overhaul: Solana’s pipeline is built for continuous flow, so slot-by-slot auctions require major scheduling changes.  
- Potential Exploits: Sealed-bid or second-price auctions can be gamed if not carefully designed.

**Implementation Details & Issues** 
- Could integrate with SIMD-253 for a recommended base fee, then layer an auction premium on top.  
- Requires consensus among validators on the clearing price each slot.

---

# 4. Layer-0 Reputation via Cryptographic Attestation

## Brief Description
Users or RPC nodes can build a public record of valid, honest transactions, earning a cryptographically verifiable “reputation score.” That score grants them a baseline priority bump, bypassing the need to rely entirely on stake size. This encourages consistent good behavior and dissuades spam from new or shady accounts.

## How It May Work
- Reputation Accumulation  
  - Each valid transaction adds to the user’s “score.” Spam or invalid txs reduce it.  
- Attestation  
  - Each transaction includes a proof of the user’s updated reputation. The scheduler sees this and boosts priority if the score is high enough.

**Advantages**
- Broad Incentives: Non-staked but reputable addresses can gain priority.  
- Spam Deterrence: Attackers can’t easily maintain good rep if they spam the network.  
- Scalable: If done with minimal proof overhead (like partial ZK), verifying rep is quick.

**Challenges**
- Complex Calculation: Defining how many “good transactions” is enough for trust is tricky.  
- Exploit Patterns: An attacker might farm a good reputation with trivial valid txs, then do a big spam wave.  
- Implementation Overhead: Storing, updating, verifying rep on-chain can be expensive if not carefully optimized.

**Implementation Details & Issues**
- Might store rep data in a stateful contract updated by validators each epoch.  
- Could require partial stake binding to avoid cheap reputation farming.

---

# 5. Resource Tokenization (“Multi-Token Fees”)

## Brief Description
Rather than a single “lamport” fee, the network mints resource-specific tokens (CPU tokens, MEM tokens, etc.) each slot. Users must hold the right mix to cover the resources their transactions demand. If memory usage spikes, MEM tokens become pricier, ensuring cost reflects real constraints.

## How It May Work
- Dimension-Specific Tokens  
  - E.g., `CPU_Token`, `MEM_Token`, `IO_Token`, each minted in proportion to the available capacity.  
- Transaction Payment  
  - A transaction must attach enough tokens for each dimension it uses.  
  - If memory is heavily congested, you need more MEM tokens, which drives up its price in secondary markets.

**Advantages**
- Fine-Grained Fairness: Precisely charges for whichever resource is the real bottleneck.  
- Strong Anti-Spam: Attackers need large amounts of each resource token to saturate the chain.  
- Market-Driven: A resource-specific token’s price reflects usage, no global aggregator needed.

**Challenges**
- User Complexity: Holding multiple resource tokens is confusing unless wallets handle it seamlessly.  
- Implementation: Mint/burn logic each slot can be heavy-lift; a big shift from the standard lamport fee.  
- Market Volatility: Resource token prices could swing wildly, complicating user expectations.

**Implementation Details & Issues**
- Could unify CPU + I/O into one “CU token.”  
- Potential synergy with SIMD-253 so that recommended fees incorporate the resource-token cost.

---

# 6. “Spare Capacity” Auctions on a Secondary Layer

## Brief Description
If a block isn’t filled after the main scheduling pass, the leftover “spare” capacity is sold in a quick micro-auction. High-bidding transactions can jump in at the last second, preventing wasted block space and offering a second chance for those who initially bid too low or arrived late.

## How It May Work
- Primary Flow  
  - Normal pipeline (fee-based or stake-weighted).  
- Detect Spare Capacity  
  - Near the slot’s end, check if usage is below some target threshold.  
- Micro-Auction  
  - Remaining transactions bid for leftover resources, top bids get placed if valid.

**Advantages**
- High Utilization: Minimizes unused block space.  
- Additional Market: Latecomers or low bidders can pay extra if there’s leftover capacity.  
- Light Touch: Doesn’t replace the entire fee model—just a finishing pass.

**Challenges**
- Timing Criticality: Very short window for the micro-auction—could favor specialized bots.  
- Potential Attack: If leftover capacity detection is gamed or spammed, confusion ensues at slot end.  
- Implementation Complexity: Must integrate well with final block commits to avoid reorg issues.

**Implementation Details & Issues**
- Possibly an off-chain aggregator signals a spare-capacity price.  
- Must ensure concurrency correctness and stable finalization even when last-second txs slip in.

---

# 7. Predictive Scheduling with Slack Reservations

## Brief Description
Here, the network reserves some capacity for known, steady flows (e.g., major DeFi protocols) based on historical usage. This ensures these “predictable” transactions aren’t starved by random demand spikes, while the rest of the block space remains for the open market.

## How It May Work
- Usage Prediction  
  - Track major addresses/programs with stable usage.  
  - Reserve a fraction of each block for them.  
- Slack & Reallocation  
  - If they don’t use their reservation, leftover capacity flows back into the normal fee market.

**Advantages**
- Resistant to Spikes: Big, stable flows stay consistent even if new mania (e.g. NFT) arises.  
- Better UX for Key Protocols: Vital dApps or exchanges get baseline throughput.  
- Less Volatility: The normal fee market only competes for unreserved space.

**Challenges**
- Favoritism: Deciding who gets a “reservation” can concentrate power.  
- Possible Waste: If reservations aren’t used, capacity might sit idle unless swiftly returned to the general pool.  
- Governance Overhead: Protocol-level or off-chain committees might decide on reservations.

**Implementation Details & Issues**
- Could be integrated as a protocol upgrade, or specialized for whitelisted addresses.  
- Must handle potential gaming, e.g., inflating usage to lock in bigger reservations.

---

# 8. NFT Ticketing or “Time Window” Approaches

## Brief Description
Large events (like NFT mints or token launches) often trigger transaction floods that overwhelm Solana’s pipeline. A ticketing or “time-window” system can smooth these spikes by allocating specific slots or transaction “tickets” to participants in advance, minimizing real-time chaos.

## How It May Work
- Pre-Event Ticket Distribution  
  - The event host or protocol issues “mint tickets,” each guaranteeing priority for a given slot/time window.

- During the Event  
  - Ticket holders submit transactions with guaranteed top priority.  
  - If there’s leftover capacity, normal transactions fill the gap.

Advantages  
- Prevents Stampedes: Fewer network meltdowns when thousands of users rush in simultaneously.  
- Predictable: Ticket holders know they won’t get outbid by bots during the event.  
- Chain Stability: Shifts mania into a structured queue.

**Challenges**
- Secondary Scalping: Tickets might be resold at inflated prices, introducing new speculation.  
- Exclusion: Without a ticket, you’re locked out of priority.  
- Implementation Overhead: The network or dApp must handle ticket tracking/enforcement.

**Implementation Details & Issues**
- Often used by launchpad dApps or specialized frameworks.  
- Might require deeper integration with Solana’s validator client to override normal fee-based scheduling for ticket holders.

---

## Conclusion

Each of these eight mechanisms features distinct advantages, trade-offs, and implementation considerations:

1. Early-Stage Filtering: Quick shallow checks for glaringly invalid txs.
2. Reversible Batches: Optimistic scheduling with rollback if transactions fail deeper checks.
3. Auction Windows: Slot-based auctions for structured fee discovery.
4. Layer-0 Reputation: Reward consistent good actors with built-in priority.
5. Resource Tokenization: A multi-dimensional fee model for CPU/memory usage.
6. Spare Capacity Auctions: Sell leftover block space right before slot finalization.
7. Predictive Scheduling: Reserve capacity for stable or high-usage protocols.
8. NFT Ticketing: Pre-allocate throughput for major events, smoothing out spikes.

In practice, Solana—or any high-throughput chain—might combine several ideas: for instance, shallow checks plus partial rollback logic, or recommended fees (like SIMD-253) plus a stake-weighted fix for early prioritization. While each approach adds complexity, they provide a rich design space to address the ever-present challenge of balancing scale with robust, spam-resistant transaction processing.

As Toly’s and Fikumni’s exchange on SIMD-253 shows, even a promising fee mechanism can be undermined if malicious attackers exploit pre-verification vulnerabilities. By fearlessly exploring these (and other) “incomplete” ideas, we gain valuable lessons about what does—and doesn’t—work under Solana’s extreme throughput requirements. And sometimes, that’s precisely how good ideas are born.
