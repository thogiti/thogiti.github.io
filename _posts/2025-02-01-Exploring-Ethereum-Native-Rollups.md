---
title: Exploring Ethereum Native Rollups - The Convergence of L1 and L2
tags: Ethereum Native-rollups Rollups Based-Rollups L2 Layer-2 Ethereum-Alignment Interoperability Cross-Rollup-Interactions Execution-sharding enshrined-execution-rollups
---

# WIP - WORK IN PROGRESS



---

# Introduction: The Convergence of L1 and L2

Over the last several years, the Ethereum community has embraced rollups—layer-two solutions that bundle transactions and post data to Ethereum—transforming Ethereum from a single “global computer” into a network of specialized execution environments. Yet every major rollup struggles with re-implementing the EVM, bridging logic, and staying synchronized with L1 upgrades.  

What if we could unify L1 and L2 so thoroughly that the rollup’s EVM is literally the same as Ethereum’s, removing the complexity of separate verification? Enter native rollups—an emerging proposal to let L1 “natively” verify L2 state transitions, potentially delivering trustlessness and seamless upgrades, without each rollup implementing its own on-chain verification logic.

Native rollups aim to recast rollup execution as simply an additional function of the L1’s own EVM logic, invoked via a proposed `EXECUTE` precompile (or opcode). By leveraging the exact same EVM engine used by mainnet—rather than replicating it in a fraud- or validity-proof contract—these rollups automatically track L1 changes, remove large swaths of governance overhead, and potentially deliver “instant” or “one-slot” finality. But how does this actually work in practice, and how does it compare to traditional rollup designs?

This post dives into the deep technical details: from the proposed `EXECUTE` precompile to re-execution vs. zk-proofs, bridging logic, overhead considerations, and why many developers see native rollups as the next frontier for uniting L1 security with L2 scalability.

---

# Background and Motivation

## The Standard L2 Ecosystem Challenges

Current L2 solutions—Arbitrum, Optimism, zkSync, StarkNet, etc.—re-implement the Ethereum Virtual Machine in a separate environment:

- Optimistic Rollups rely on fraud proofs. They require a robust “bisection game” or multi-step dispute process that implements the EVM in a special contract. Any bug there can undermine security.
- zk-Rollups rely on zero-knowledge circuits that must replicate the entire EVM. If the circuit lags behind an L1 upgrade (e.g. a new opcode), the L2 might break. Typically, there is also a “governance multi-sig” to handle emergencies.

Result: Each rollup invests thousands of engineering hours re-building EVM logic, bridging, upgrade processes, watchers, etc. They also must quickly handle each Ethereum fork that modifies EVM opcodes or gas rules.

## The Native Rollup Hypothesis

The native rollup idea is that Ethereum’s own EVM can directly verify L2 transactions. Rather than an EVM implementation inside a contract, an L2 simply calls an `EXECUTE` precompile:

> “Given a `pre_state_root`, a `post_state_root`, and a batch of transactions plus stateless witnesses, run the real EVM to confirm that going from `pre` to `post` is valid.”

By hooking directly into L1’s consensus logic, a native rollup no longer requires a re-implementation of the EVM, removing entire classes of potential bugs. If the L1 hard-forks to add a new opcode, that opcode is automatically recognized by the rollup—no multi-sig toggles or governance overhead.

Potential Gains:

- Eliminate separate EVM re-implementation – no custom verifier or circuit to mirror the L1 EVM exactly.  
- Instant up-to-date equivalence – The rollup is always consistent with Ethereum’s latest fork/opcodes.  
- Remove security councils – No special bridging logic upgrades or fallback committees.  
- Possibility of synchronous settlement – If re-execution or proof verification can happen each slot, L2 finality can approach single-slot finality.

---

# The EXECUTE Precompile / Opcode

At the heart of native rollups is a new L1 “opcode” or “precompile” called `EXECUTE`, with a signature like:

```
EXECUTE(
    pre_state_root,
    post_state_root,
    trace,
    gas_used
) -> returns (bool)
```

- `trace`: A list of L2 transactions and the associated “stateless” Merkle proofs for each storage read or write.  
- The EVM verifies that applying these transactions to `pre_state_root` yields `post_state_root` using the L1’s own EVM logic.  
- If correct, it returns `true`; otherwise reverts or returns `false`.

## Gas Accounting for EXECUTE
Because verifying a whole L2 block can be expensive, the `EXECUTE` call has its own gas-limit or pricing mechanism, possibly a separate EIP-1559–style “cumulative gas target.” It prevents the L1 from being overloaded by re-executing massive L2 blocks:

- `EXECUTE_CUMULATIVE_GAS_LIMIT` – The total gas available for all `EXECUTE` calls in a single L1 block.
- A base fee or separate “rollup gas” can be introduced for these calls, potentially merging with L1 fees only once “stateless Ethereum” arrives.

---

# Two Modes of Enforcement

## Naive Re-Execution

L1 nodes literally re-run L2 transactions for each `EXECUTE` call, using stateless Merkle witnesses posted in calldata or data blobs.

- Pros: 
  - Conceptually simple—just use the real EVM. 
  - Possible single-block or single-slot finality, if the overhead is small.
- Cons:
  - Potential large overhead if the L2 block is big (you must post all state proofs). 
  - Must keep a tight “EXECUTE” gas limit. 
  - Could “spam” calldata with huge Merkle proofs if not carefully regulated.

## ZK Proofs with Off-Chain Distribution

Each L1 node obtains a zero-knowledge proof that the `EXECUTE` call is correct, skipping re-execution on-chain. The proof is never posted in a contract, but is gossiped among nodes or integrated directly into the client code:

- Pros:
  - Large L2 blocks can be verified quickly if the ZK prover is trusted or can be run locally.
  - Great for scaling or high throughput.
- Cons:
  - Requires advanced proof generation; if the circuit breaks, the entire chain may accept invalid blocks.
  - Must ensure clients can handle multiple proof types or concurrency.

---

# Bridging, Custom Logic, and “Wrapper STFs”

Many existing rollups rely on specialized bridging logic—for example, depositing ETH from L1 to L2 automatically, or “retryable tickets.” If `EXECUTE` is purely standard EVM logic, how does bridging happen?

- Wrapper Approach  
   - An L1 contract calls `EXECUTE` but also handles bridging before/after the main EVM transitions. E.g., it updates certain accounts’ balances (“`state.AddBalance`”) for deposits.  
   - This splits the rollup’s STF into “depositSTF” + “evmSTF,” each potentially verified in distinct ways.

- System Transactions  
   - The L2 can define special “system transactions” that do bridging or deposit logic. But that reintroduces partial custom logic at L1 or an upgrade pathway.

Outcome: If you want zero governance overhead and pure L1 EVM usage, you must keep bridging or “depositTx” logic extremely minimal. More advanced bridging reintroduces partial governance, because that logic differs from the L1 EVM.

---

# Data and Execution Overheads

## Data Overhead for Stateless Traces
Naive re-execution demands full state-access proofs in calldata or blobs. This can balloon data usage by a factor of 2–5 relative to custom compression or specialized proofs. 

Mitigation:
- Single-Round Fraud Proof: L2 is “optimistic,” but if there’s a dispute, the challenger calls `EXECUTE` on a small chunk. 
- Small Gas Limit: Only allow modest L2 chunk sizes to keep overhead manageable.

## Real-Time zk Verification
If a ZK circuit can be updated in near real-time, you can skip big data overhead. But that shifts complexity to off-chain ZK hardware or multi-prover markets. Also, ensuring a robust fallback (like naive re-execution or multi-proof approach) is valuable if circuits are found unsound.

---

# Governance and Upgrades

## Automatic EVM Upgrades
Major benefit: Because the L2 uses the L1’s actual EVM logic, it automatically gains the new opcodes or gas rules from L1 forks. No special multi-sig or security council needed to sync L2 with L1 changes.

## L2 Innovation vs. Lockstep
Trade-off: Some L2s want advanced features (e.g. custom fee accounting, bridging precompiles, signature-less Tx, etc.). That might require partial “wrapper code” or an extended environment. 

Thus, “fully native” is best for strictly EVM-equivalent designs. Once you deviate heavily from the L1 EVM rules, you either give up “pure nativeness” or maintain partial governance.

---

# Composability and Cross-L2 Interop

- Based vs. Native  
   - “Based” means the rollup inherits L1 sequencing from Ethereum’s block builders. 
   - “Native” means the L1 execution engine enforces L2 transitions.
   - They’re orthogonal. A rollup can be both, either, or neither.

- Bridging to Non-Native  
   - A native rollup can easily interoperate with other native rollups that share the same EVM environment and bridging contract. 
   - But bridging to a “normal” rollup still needs typical cross-L2 bridging or message passing. Projects like Espresso or generalized bridging can unify these.

---

# Timelines and Next Steps

Many in the Ethereum community see 2026+ as a plausible timeline for implementing an `EXECUTE` precompile. The path might look like:

- Propose the EIP for “native execution bridging.”  
- Start with a small gas limit for naive re-execution (like proto-danksharding does with data).  
- Over time, rely on optional off-chain ZK proofs to scale beyond that small limit.

Whether major L2s will adopt “pure native” remains to be seen: the opportunity for fully trustless EVM equivalence is huge, but many L2s prefer or require custom bridging and advanced features. Regardless, native rollups are a powerful new avenue that merges L1 and L2 in ways that might drastically simplify the entire L2 ecosystem in the long run.

---

# Open-Ended Questions to Explore

Finally I want to leave you with some open-ended questions to explore:

- How strict should ‘pure’ equivalence be?  
To what extent can a native rollup introduce bridging logic, signature-less transactions, or precompiles without undermining “pure” trustlessness or reintroducing partial governance?

- Is naive re-execution sustainable for large throughput?  
If the L2 grows to thousands of transactions per second, can L1 nodes realistically handle the stateless traces needed for re-execution? Or does that push us inevitably toward off-chain ZK proofs?

- What happens if a soundness bug arises in a ZK-virtual-machine client?  
If multiple L1 nodes rely on an off-chain circuit to skip re-execution, how do we handle a catastrophic vulnerability in that circuit? Is “multi-proof diversity” feasible or necessary?

- Can we achieve single-slot finality in practice?  
In theory, naive re-execution or one-slot proof generation can finalize L2 in the same block. But does this require a specialized proving pipeline, or is a small re-execution limit enough?

- How does L1 sequencing complexity interact with the EXECUTE call?  
If “based rollups” unify L1 and L2 block building, how do we incorporate the overhead of verifying each L2 block? Could partial concurrency or parallelization mitigate resource contention?

- Bridging security for non-native rollups  
Even if native rollups seamlessly share EVM logic, bridging to normal or partial-trust rollups remains. Are there ways to unify bridging to all L2s under a single protocol without new governance?

- Wrapper logic vs. on-chain upgradability  
If a rollup uses a “wrapper STF” to do bridging or deposit logic, does that wrapper require upgradability? Could that become a single point of failure or reintroduce a security council?

- What if L1 EVM innovates more slowly than L2?  
If L2 devs want advanced features beyond standard EVM capabilities (like drastically different transaction types, new opcodes, or advanced bridging precompiles), do we lose the advantage of native rollups, or do we push for more frequent L1 upgrades?

- Is the execution overhead of full L1 verification a feature or a bug?  
Might we view it as a deliberate “throttling” of L2 to keep the system simpler and more trustless, or is it an unavoidable bottleneck? Could partial in-protocol data compression alleviate it without special circuits?

- Should Ethereum embrace an even more general ‘Execution Sharding’ approach instead?  
If the community reconsiders old Eth2 “phase 2” style execution sharding, does that naturally supersede or incorporate native rollups? How do these visions overlap or differ in practice?

These questions highlight the complexity and open design space behind native rollups. They invite deep discussion on bridging trust, governance implications, potential performance pitfalls, and how to navigate between pure EVM equivalence and the desire for greater L2 innovation.

# References

1. [ Native rollups—superpowers from L1 execution.](https://ethresear.ch/t/native-rollups-superpowers-from-l1-execution/21517)
2. [ Native Rollups Call #0.](https://www.youtube.com/watch?v=MNtzDe9Ck0c)
3. [ Ethereum Sequencing and Preconfirmations Call #17.](https://www.youtube.com/watch?v=IekfClKumx8)


