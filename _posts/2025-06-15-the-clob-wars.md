---
title: The CLOB Wars — Monolithic vs. Modular in Next-Gen On-Chain Exchanges
date: 2025-06-15
author: Nagu Thogiti
tags: CLOBs CLOB-wards central-limit-order-book on-chain-liquidity Hyperliquid DEX-exploit DeFi DeFi-exploit Bullet hibachi paradex kuru-monad gte-megaeth lighter perps future-of-perps crypto-futures
---

In mid-2025, a widely [reported](https://www.coindesk.com/markets/2025/05/31/cryptos-most-watched-whale-gets-fully-liquidated-after-placing-billions-in-risky-bets) nine-figure loss on Hyperliquid was read less as a failure than as a stress-test passed: a single on-chain venue absorbed institutional-scale taker flow without halting or dislocating, signaling that CEX-grade liquidity and performance had arrived on-chain. The episode—and Hyperliquid’s rapid growth that followed—exposed a gap left by first-generation DEXs and accelerated what many now call the **CLOB Wars**.

You can read more about this event in my [previous](https://thogiti.github.io/2025/03/27/Anatomy-DEX-Exploit-Hyperliquid-Perp-JELLY.html) blog.

## Summary

On-chain trading is shifting from AMMs toward **CLOB designs** that target low-latency execution, richer order types, and institutional-grade market structure. Two architectural camps are emerging:

* **Monolithic app-chains** (e.g., Hyperliquid, dYdX chain) vertically integrate execution, consensus, and data into a single high-performance L1.
* **Modular stacks** (rollups/L3s on Ethereum or Solana) unbundle **Execution**, **Settlement & Consensus**, and **Data Availability (DA)**—often using Ethereum/Solana for settlement and providers such as Celestia or EigenDA for DA—to leverage shared security and composability.

For traders, operators, and investors, three technical differentiators dominate outcomes:

1. **Finality profile.** Modular designs provide millisecond **soft finality** (sequencer acknowledgments) for a CEX-like UX, while **hard finality** (irreversible settlement on the base layer) arrives later—typically minutes on Ethereum (though L1s can also provide similar preconfirmation guarantees). Monolithic app-chains compress this gap with sub-second block-final confirmation. The resulting *latency vs. irreversibility* window is an operational risk to price into liquidations, large orders, and bridge flows.
2. **Data availability economics and assurances.** DA often represents the majority of a rollup’s operating cost and governs exit guarantees:

   * **On-L1 DA** (Ethereum calldata/blobs) maximizes conservatism and exit properties.
   * **Modular DA** (e.g., Celestia with DAS) aims to reduce marginal cost at scale.
   * **Restaked DA committees** (e.g., EigenDA) seek higher throughput/cost wins while leaning on ETH-secured economics.
3. **Sequencer trust and user safeguards.** Centralized sequencing remains common for performance, introducing **censorship**/MEV surface and downtime risk. Robust systems provide **forced-inclusion/withdrawal** paths (“escape hatches”) using posted data; decentralized or shared sequencing is an active area of iteration.

**Performance (project-reported):**

* **Monolithic hard finality:** sovereign L1s report sub-second block-final confirmation (e.g., Hyperliquid ≈ 0.2 s median).¹
* **Rollup soft latency:** modular CLOBs report 1–5 ms soft acks (e.g., Bullet, GTE).²
* **Throughput capacity:** next-gen stacks target high scale (e.g., GTE on MegaETH ≳ 100k TPS target; Hyperliquid ≈ 200k OPS).²
* **Hybrid finality:** Solana-settled rollups inherit **\~1–2 s** hard finality, narrowing the soft→hard gap.²

The remainder of this report evaluates CLOB platforms against a standardized framework—**Execution Model → VM → Settlement/Consensus → Proof System → DA Layer → Sequencer Model → Key Differentiator**—and closes each profile with **“Why it wins / where it struggles.”**

**Footnotes**

1. Figures cited by the respective projects; treat as indicative.
2. Latency/throughput values are project-reported or testnet-observed and may vary under live conditions.
3. “ZK fraud proofs” nomenclature and performance claims are project/infra-reported and may vary by implementation.

## Introduction: “When a Loss Became a Catalyst.”

AMMs solved the cold-start problem for permissionless liquidity but impose constraints that professional flow cannot ignore:

* **Slippage from curve-based pricing.** With pricing tied to pool inventories (e.g., *x·y=k*), large trades traverse the curve and incur path-dependent slippage rather than matching against standing liquidity.
* **Capital efficiency trade-offs.** In constant-product AMMs, most capital sits away from the current price; CLMMs improve utilization but push LPs into active management and greater impermanent-loss exposure.
* **Order-type limits and execution control.** Native support for limit/stop/post-only behavior—essential to systematic and risk-managed trading—is absent or auxiliary. Public mempools and block-level latency further expose order flow to frontrunning and sandwich risk.

CLOB-based exchanges target these gaps: a price-time priority book, richer order semantics, and low-latency matching—paired with on-chain custody, verifiability, and credible exit guarantees. The competition now centers on how to deliver those properties—**monolithically** at L1 or **modularly** via rollups—while balancing finality, DA economics, and sequencer trust models.

## The Four Pillars Framework

To compare next-generation CLOB DEXs rigorously, treat each as a **stack** rather than a single application. Four architectural pillars determine performance, security, and UX: **Execution**, **Settlement & Consensus**, **Data Availability (DA)**, and **Sequencing**. The report analyses that follow apply this lens uniformly.

> **Terminology note.** We use “on-chain” in the industry sense—orders are posted as transactions on the host L1/L2/L3—and we **separately** label where the **matching engine** runs (on-chain via chain logic, or off-chain in a sequencer).

### Execution

Where the order book logic runs and how matching is performed.

* **Placement.** **On-chain books** post place/cancel/match to the ledger (max transparency, higher on-chain throughput required). **Off-chain books** keep signed orders in memory and only settle matches on-chain (very high throughput, different trust assumptions).
* **Runtime/VM.** Teams either retain **EVM** for ecosystem compatibility or use specialized runtimes (e.g., SVM, custom engines, or zk-friendly VMs) for deterministic, low-latency matching.
* **What to evaluate.** Order-event latency, cancel/modify cost, determinism of matching, and any proof/verification of off-chain matching.

### Settlement & Consensus

Who provides the canonical ledger and **finality**.

* **Monolithic/app-chain.** Integrates BFT-consensus at L1 for **fast hard finality** (sub-second to seconds).
* **Modular/rollup.** Inherits security and **hard finality** from a base L1 (e.g., Ethereum). Users often receive **soft finality** (sequencer acks in ms) first; **hard finality** arrives only when data/proofs are accepted on L1.
* **Withdrawal semantics.** Distinguish settlement finality from **withdrawal/bridge finality** (optimistic/challenge windows vs ZK proof acceptance).
* **What to evaluate.** Soft-to-hard finality window, reorg risk, bridge guarantees, and failure modes under L1 congestion.

### Data Availability (DA)

How trade and state data are published so anyone can reconstruct and verify. DA often dominates rollup cost and governs exit guarantees.

* **Options.** **On-L1 DA** (Ethereum calldata/blobs) for maximal conservatism; **modular DA** (e.g., Celestia with DAS) to reduce marginal costs at scale; **restaked DA committees** (e.g., EigenDA) to pursue throughput/cost gains while leaning on ETH-secured economics.
* **What to evaluate.** Cost per byte/event, sampling/verification model, withholding risks, and how DA choice affects forced exits and light-client verification.

### Sequencing

Who orders transactions and under what guarantees.

* **Models.** **Centralized sequencers** optimize for latency and iteration speed but introduce censorship/downtime/MEV risk. Emerging designs use **rotating or auctioned decentralized sequencing** or **shared sequencing networks**.
* **Safeguards.** Robust systems expose **forced inclusion** and **forced withdrawals** using posted data (“escape hatches”) to bound operator power.
* **What to evaluate.** Time-to-inclusion, censorship resistance, MEV policy/controls, liveness under faults, and roadmap to decentralize.

### The DEX Trilemma: Performance, Decentralization, Composability

CLOB design navigates a three-way tension:

* **Performance:** low latency (order/ack/fill times), high throughput (OPS/TPS), and low marginal costs.
* **Decentralization:** censorship resistance, absence of single-control points, credible recovery paths.
* **Composability:** seamless integration with broader DeFi (liquidity sharing, asset/bridge standards, programmatic access).

**Monolithic** designs integrate execution/consensus/DA to minimize latency and maximize throughput, often trading off cross-ecosystem composability. **Modular** designs unbundle layers to inherit base-layer security and liquidity, while accepting added complexity and typically longer hard-finality paths. This framework sets the basis for the platform-by-platform comparisons that follow.

## Architectural Camps

Next-gen CLOB DEXs follow two designs. One makes the exchange a **sovereign chain**; the other assembles it as a **modular stack** that inherits security from a base L1.

### Monolithic App-Chains — Exchange-as-a-chain

A dedicated L1 integrates execution, consensus, DA, and sequencing. Orders (txs or signed messages) are matched next to the state machine; a BFT-style consensus commits the result with **hard finality** on block commit (typically sub-second to a few seconds). DA is native—blocks propagate full state; there’s no external DA fee. Sequencing is endogenous (proposers/validators); MEV policy is enforced at protocol level. Proofs are optional; bridges define external trust.

**Wins:** tight match→commit loop, predictable tail latency, no external DA cost.

**Struggles:** weaker cross-ecosystem composability (assets not natively on Ethereum); security and exits hinge on validator-set quality and bridge design.

### Modular Stacks — Exchange-as-a-stack

Execution prioritizes speed (often an **off-chain order book** with a fast sequencer) that returns millisecond **soft acks**. Safety comes from posting data to a **DA layer** and settling on a base L1 for **hard finality**. Proofs can be **optimistic** *(fault proofs; including **ZK fraud proofs/succinct fault proofs**)* or **ZK** *(validity proofs)*. DA choices include **on-L1 (Ethereum calldata/blobs)** for maximum conservatism, **modular DA** (e.g., Celestia) for lower marginal cost, or **restaked DA committees** (e.g., EigenDA) to chase throughput/fees under ETH-anchored economics. Sequencers are commonly centralized today; credible designs expose **forced inclusion/withdrawals** on L1 and roadmap toward decentralized/shared sequencing. Hard finality timing follows the base chain (minutes on Ethereum; \~1–2 s on Solana).

**Wins:** strong composability with base-layer DeFi, credible L1 escape hatches, configurable DA economics, excellent soft-latency UX.

**Struggles:** non-zero soft→hard window (especially optimistic paths), DA as a dominant operating cost, operator-risk until sequencing decentralizes.

> **Sidebar — “ZK fraud proofs” (succinct fault proofs).** An optimistic rollup still accepts state by default, but *disputes* are resolved by a single zk-SNARK/STARK that proves a proposed transition was invalid—replacing interactive games and shrinking challenge time/cost. This keeps *optimistic semantics* (prove faults only) while using zk to compress verification. The practical effect: dispute windows can drop from days toward \~1 day (design-dependent), improving perceived settlement without switching to full validity proofs.

### Practical Takeaways

Monoliths minimize control-plane hops and deliver latency determinism; choose them for liquidation-sensitive derivatives and maker-heavy flow. Modular stacks maximize ecosystem reach; choose them when Ethereum/Solana composability and L1-anchored exits dominate. In the article sections that follow, we apply a uniform framework—**Execution Model → VM → Settlement/Consensus → Proof System → DA Layer → Sequencer Model → Key Differentiator**—and close each profile with **“why it wins / where it struggles.”**

## Finality, Censorship, and Escape Hatches

### A Tale of Two Finalities

**Soft finality — instant, but reversible.** On modular CLOBs, a fast engine/sequencer acknowledges places/cancels in milliseconds. This “soft” confirmation drives CEX-like UX but is not consensus: a faulty or crashed sequencer can roll back recent acks.

**Hard finality — delayed, but irreversible.** A trade becomes economically/canonically final when recorded on the settlement L1. For **Ethereum-settled** rollups, that means inclusion plus sufficient confirmations (economic finality typically on the order of minutes). For **Solana-settled** rollups, L1 finality is \~1–2 s, materially shrinking the soft→hard gap. **Monolithic app-chains** collapse the stages: a committed block is already hard finality (often sub-second to a few seconds, project-reported).

**Settlement vs withdrawal.** Hard finality of the *trade* is not the same as hard finality of a *withdrawal*. **Optimistic** systems add a challenge window before funds are withdrawable; **ZK** systems rely on validity proofs, typically shortening withdrawal timelines at the cost of proof overhead. In stacks adopting **ZK fraud proofs**, dispute windows can shrink substantially (implementation-dependent), improving perceived settlement speed without fully switching to validity proofs.

**Risk window.** The interval between soft and hard finality is the exposure: if the sequencer fails or withholds during this window, the system falls back to the last finalized L1 state and recent soft-confirmed actions may be dropped.

### Centralized Sequencers, Censorship Risk, and Escape Hatches

Most rollups start with a **centralized sequencer** to achieve millisecond latency, introducing a single point of censorship/downtime and MEV leverage. Two trust-minimized mechanisms are therefore non-negotiable:

* **Forced inclusion:** users (or relayers) must be able to submit a transaction directly to the base chain for inclusion of a sequencer censor.
* **Forced withdrawals:** users must be able to exit using posted data and on-chain proofs, even if the sequencer is offline or adversarial.

These guarantees rely on **data availability**—the ability to reconstruct state from posted data—and the settlement layer’s finality. Roadmaps toward **decentralized/shared sequencing** (rotation, auctions, or third-party networks) aim to reduce operator risk without sacrificing interactivity; until then, escape hatches are the effective backstop for self-custody.

**Operator checklist:** size of the soft→hard window (p50/p99), base-chain finality, DA posting and reconstruction guarantees, presence and usability of forced-inclusion/withdrawal paths, and (for optimistic paths) challenge-window implications for withdrawals.

## Data Availability: Costs, Security, and Who Uses What

**Why DA matters.** In modular designs, DA is often the dominant operating cost and the root of exit guarantees. Your DA choice determines fee curve, censorship/withholding resilience, and how easily light clients can reconstruct state.

### On-L1 Data Availability (Ethereum / Solana)

**What it is.** Post transaction/state data directly to the settlement L1 (e.g., Ethereum calldata or EIP-4844 blobs; Solana ledger entries for Solana-settled stacks). This path is **maximally conservative under the base layer’s assumptions**: exits and verification inherit the L1’s economics and fault tolerance. The trade-off is **higher data cost** and finite blockspace.

**Who uses it.**

* **Paradex** → Ethereum L1 DA.
* **Lighter (on Arbitrum)** → compressed data ultimately on Ethereum L1.
* **Bullet** → Solana L1 DA (settlement and DA coincide).

**When to choose.** Prioritize straightforward exits and widely understood verification; accept L1 data pricing.

### Modular DA Layers (Celestia with DAS)

**What it is.** A specialized DA chain publishes erasure-coded blobs that **light nodes verify via Data Availability Sampling (DAS)**. As light-node count grows, the network can safely handle larger blobs at **lower marginal cost per byte** than posting everything to Ethereum.

**Who uses it?**

* **Hibachi** → **Celestia** DA (posting **encrypted** trade/state data), with settlement on Ethereum.

**When to choose.** Optimize DA cost/throughput and unlock privacy knobs (e.g., encrypted blobs), while accepting an additional trust boundary (Celestia validators and network liveness).

### Restaked DA Committees (EigenDA)

**What it is.** **EigenDA** supplies DA as a service from operators who **restake ETH** and attest to availability. The aim is **high throughput and lower fees** than on-L1 posting, with **economic security derived from ETH** via restaking. Security rests on the **committee’s attestations and slashing**, not on base-layer consensus over the data blob itself.

**Who uses it?**

* **GTE (on MegaETH)** → **EigenDA** for DA, decoupling execution from Ethereum’s DA constraints.

**When to choose.** Push throughput/fee reductions while keeping ETH-anchored economics; model operator-set assumptions and monitoring carefully.

### Monolithic chains and DA

Sovereign/app-chain designs (e.g., Hyperliquid, dYdX chain) **internalize DA**: block propagation among validators carries the DA obligation. There’s **no external DA bill**, but exit/verification depends on the chain’s validator set and any bridge/light-client you expose to other ecosystems.

**At-a-glance:** On-L1 DA — Paradex, Lighter, Bullet; Celestia — Hibachi; EigenDA — GTE.

### What to evaluate

Evaluating DA backend primarily depends on four checks:

* **Economics**: effective cost per event after compression and expected fee volatility across blobs/Celestia/EigenDA
* **Verification path**: what a light client must do—L1 consensus, DAS, or restaked-operator attestations—and how it behaves under withholding
* **Exit guarantees**: whether posted data support forced inclusion and forced withdrawals end-to-end, and the gap between settlement and withdrawal finality
* **Operator/interop assumptions**: committee/validator incentives, monitoring and slashing where applicable, and whether downstream integrations require Ethereum-resident data or can consume Celestia/EigenDA artifacts.

## Who Benefits: Retail / Pro / Institutional

Ultimately, technology is a means to an end: serving the needs of traders and liquidity providers. The innovations in architecture, performance, and security translate into distinct advantages for different user segments.

### Retail

Retail optimizes for **low cost, smooth UX, and credible self-custody**. Many next-gen CLOBs sponsor gas or batch settlements so users mainly pay trading fees; combined with professional maker liquidity, this reduces slippage relative to legacy AMMs. Interfaces mirror CEX polish (mobile, one-click, cancel-on-disconnect). The caveat is awareness of **soft vs hard finality** on modular stacks: actions feel instant (soft acks in ms) but only become irreversible at L1 settlement; good UX surfaces that window and provides escape-hatch guidance. Monolithic venues compress the gap entirely by offering **hard finality** on commit, at the cost of leaving Ethereum’s composability unless bridged.

### Professional (MMs, prop, HFT, systematic)

Pros care about **deterministic latency**, **tail behavior under load**, and **execution integrity**. Monolithic chains minimize control-plane hops, so match→commit has no soft→hard gap to hedge. Modular stacks can match or beat **soft** latency, but teams must model the interim risk and withdrawal timelines. Fairness controls are decisive: **application-specific sequencing** (e.g., Bullet) constrains reordering at intake; **provable matching** (e.g., Lighter) cryptographically enforces price-time priority inside the book. Robust APIs and Ethereum-aligned settlement/DA enable cross-protocol strategies (e.g., hedging perps with on-chain options) without CEX silo frictions.

### Institutional (funds, treasuries, corporates)

Institutions add **custody, compliance, and audit** to performance requirements. Operationally, they expect **segregated accounts**, **MPC/HSM key management**, withdrawal **allow-lists**, and attestable logs spanning order acknowledgment to L1 inclusion. Modular venues that **settle and post DA on Ethereum** integrate cleanly with custodians and chain-analytics providers and produce auditor-friendly, replayable records for NAV/P\&L. Compliance demands include KYC/KYB gating where appropriate, sanctions screening on deposit/withdrawal paths, and exportable evidence for regulators. For information-sensitive flow, **privacy-preserving publication** (e.g., encrypted blobs on Celestia) reduces leakage while preserving L1-anchored exits—useful for minimizing signaling in large orders, though not equivalent to full dark pools. Monolithic venues can meet these bars if they expose light-client/bridge proofs, independent indexing, and enterprise custody integrations; in exchange, they deliver **immediate, irreversible settlement** that simplifies liquidation SLAs.

**Rules of thumb.**

* **Retail:** choose modular for low fees and Ethereum-native composability; monolithic for immediate finality within a single ecosystem.
* **Pros:** pick monolithic for **latency determinism**; modular with strong fairness controls and clear finality windows for **cross-protocol** strategies.
* **Institutions:** modular with ETH-aligned settlement/DA shortens diligence and custody onboarding; monolithic suits mandates that prioritize **instant hard finality** and can underwrite a sovereign validator/bridge model.

## Individual CLOB Deep Dives

Let's explore each CLOB platform in detail.

### Hyperliquid

A vertically integrated, exchange-specific L1 designed to feel CEX-fast while preserving self-custody by collapsing soft and hard finality.

* **Execution:** On-chain CLOB (orders as txs/signed msgs; deterministic matching).
* **VM:** Custom high-performance runtime.
* **Settlement/Consensus:** Sovereign L1; BFT-family commit with **hard finality** (often sub-second).
* **Proof:** None beyond L1 consensus (optional light-client/bridge attestations).
* **DA:** Native (validator propagation).
* **Sequencer:** Integrated PoS proposers/validators.
* **Key differentiator:** Tight match→commit loop with fast **hard** finality.

**Why it wins:** Deterministic latency; no soft→hard window.
**Where it struggles:** Ethereum-native composability; bridge security is the boundary.

### dYdX v4

A long-standing perp leader that moved to a sovereign app-chain to decentralize matching within the validator set.

* **Execution:** Off-chain CLOB in validator memory; deterministic, protocol-enforced matching.
* **VM:** Cosmos SDK app logic.
* **Settlement/Consensus:** dYdX chain (CometBFT family); **hard finality** at commit (*seconds)*.
* **Proof:** Economic security via validator set; IBC/light-client paths for interop.
* **DA:** Native to the chain.
* **Sequencer:** Decentralized (validator set).
* **Key differentiator:** Validator-run matching without a single trusted operator.

**Why it wins:** Low-jitter finality; exchange-specific throughput.
**Where it struggles:** ETH-native composability depends on bridge/IBC adapters.

### Bullet

A “Solana rollup” design: CEX-like interactivity plus Solana’s short L1 finality to shrink the soft→hard gap.

* **Execution:** On-chain settlement on Solana with an off-chain matching engine for low latency.
* **VM:** Solana-compatible programs; zk/optimistic proof path as specified by design (*ZK validity or optimistic fraud proofs*).
* **Settlement/Consensus:** Solana L1; hard finality ≈ 1–2 s (*network-dependent*).
* **Proof:** **ZK fraud proofs (succinct fault proofs)** — project-stated.
* **DA:** Solana L1 (settlement and DA coincide).
* **Sequencer:** Centralized (app-specific) initially; decentralization roadmap.
* **Key differentiator:** Millisecond soft acks plus short Solana finality.

**Why it wins:** CEX-like UX with a materially shorter risk window.
**Where it struggles:** Operator centralization until sequencing decentralizes; Solana-centric composability.

### Hibachi

Ethereum-aligned modular rollup that pairs fast matching with **encrypted** DA on Celestia and L1-anchored exits.

* **Execution:** Off-chain CLOB; batched L1 settlement.
* **VM:** EVM for settlement contracts; native engine off-chain.
* **Settlement/Consensus:** Ethereum L1; **hard finality** at ETH finalization.
* **Proof:** Optimistic initially / ZK on roadmap.
* **DA:** Celestia (DAS) with **encrypted blobs**.
* **Sequencer:** Centralized initially; **forced inclusion/withdrawals** on L1.
* **Key differentiator:** Privacy-aware DA on Celestia with Ethereum exits.

**Why it wins:** Lower DA cost + privacy; ETH-anchored security.
**Where it struggles:** Extra trust boundary (Celestia) and longer soft→hard window than Solana-settled paths.

### Paradex

A Starknet-aligned L3 that leans on ZK validity for settlement while keeping DA on Ethereum for straightforward exits.

* **Execution:** Off-chain CLOB; batched settlement.
* **VM:** Cairo VM (Stark-family); EVM interfaces at L1.
* **Settlement/Consensus:** Ethereum (via Starknet); **hard finality** at ETH finalization.
* **Proof:** **ZK-STARKs** (validity proofs).
* **DA:** On Ethereum L1 (calldata/blobs).
* **Sequencer:** Centralized today.
* **Key differentiator:** Deep ZK stack (L3 on Starknet) + L1 DA for exits.

**Why it wins:** Strong exit properties + ZK settlement; ETH composability.
**Where it struggles:** L1 DA cost; centralized sequencing until decentralized.

### Kuru

A full on-chain CLOB on Monad, betting that a high-throughput EVM-compatible L1 can deliver exchange-class latency.

* **Execution:** On-chain CLOB.
* **VM:** EVM (Monad execution, parallelism).
* **Settlement/Consensus:** Monad L1; **hard finality** at commit.
* **Proof:** None beyond L1 consensus.
* **DA:** Monad L1.
* **Sequencer:** Integrated L1 validators.
* **Key differentiator:** EVM-native, fully on-chain book if Monad delivers its parallel throughput targets.

**Why it wins:** Simplicity + composability within an EVM-like L1; predictable finality.
**Where it struggles:** Depends on Monad’s realized performance; external bridges for ETH ecosystem access.

### GTE (on MegaETH)

A performance-oriented stack pairing an off-chain book with EigenDA and optimistic settlement, aiming for a real-time feel at scale.

* **Execution:** On-chain settlement via MegaETH with an off-chain matching engine.
* **VM:** EVM for settlement; zk-friendliness as needed for fraud-proof monitoring.
* **Settlement/Consensus:** Ethereum L1 (via MegaETH); **hard finality** at ETH finalization.
* **Proof:** **Optimistic** fraud proofs.
* **DA:** **EigenDA** (restaked operator committees).
* **Sequencer:** Centralized.
* **Key differentiator:** MegaETH architecture + EigenDA to chase >100k TPS targets (*project-reported*).

**Why it wins:** High throughput economics with ETH-anchored security.
**Where it struggles:** Operator-set assumptions (EigenDA) and optimistic withdrawal timelines.

### Lighter

An Ethereum-settled rollup designed around **verifiable matching** to provide cryptographic fairness guarantees.

* **Execution:** **Off-chain CLOB (provable matching)**; on-chain settlement.
* **VM:** EVM settlement; matching proofs/commitments off-chain.
* **Settlement/Consensus:** Ethereum (via Arbitrum); **hard finality** at ETH finalization.
* **Proof:** Optimistic base (Arbitrum) + **ZK proofs for matching integrity**.
* **DA:** Arbitrum posting to Ethereum L1.
* **Sequencer:** Arbitrum sequencer (centralized); L1 escape hatches.
* **Key differentiator:** Cryptographic guarantees that matching follows price-time priority.

**Why it wins:** Auditable matching + simple ETH exits.
**Where it struggles:** L1 DA costs; centralized sequencing until decentralized.

## Performance Benchmarks: Latency, Finality, Throughput

The table below consolidates **soft vs hard** latencies and headline throughput claims (OPS/TPS) for each CLOB. “Soft” is the sequencer/engine acknowledgment used for interactivity; “Hard” is economic/canonical finality on the settlement chain (or app-chain). Figures are *project-reported* and depend on network conditions; treat them as indicative, not guarantees.

### Consolidated Metrics

| **Platform**      | **Soft latency (ms)**                 | **Hard finality (L1/app-chain)**     | **Throughput claim**                                     | **Notes**                                        |
| ----------------- | ------------------------------------- | ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| **Hyperliquid**   | n/a (single-stage)                    | **≈0.1–0.2 s**                       | **200k OPS**                                             | Monolithic L1; block commit is hard finality.    |
| **dYdX v4**       | sub-10 ms soft ack (validator engine) | **< \~2 s**                          | **\~2,000 TPS**                                          | App-chain (CometBFT); validator-run book.        |
| **Bullet**        | **2–3 ms**                            | **\~1–2 s (Solana L1)**              | **7,840 OPS**                                            | Solana-settled rollup; soft→hard gap is short.   |
| **Hibachi**       | **\~5–6 ms**                          | **\~13 min (Ethereum)**              | *(DA “thousands TPS” on Celestia; no single OPS figure)* | Celestia DA (encrypted) + ETH settlement.        |
| **Paradex**       | **\~200 ms (Starknet block)**         | **\~5 h** worst-case to ETH finality | **\~7,000 TPS**                                          | L3 on Starknet; hard finality depends on ETH.    |
| **Kuru (Monad)**  | n/a (single-stage)                    | **\~1 s (block/commit)**             | **\~10,000 TPS**                                         | Monolithic EVM-compatible L1.                    |
| **GTE (MegaETH)** | **1–5 ms**                            | **\~10–15 min (optimistic → ETH)**   | **\~100,000 TPS**                                        | Optimistic L2 + EigenDA; high-throughput target. |
| **Lighter**       | **<5 ms**                             | **\~10–15 min (ETH)**                | **\~10,000 TPS**                                         | ETH-settled rollup with verifiable matching.     |

Monolithic app-chains deliver the fastest hard finality (Hyperliquid sub-second; dYdX \~1–2 s), while modular stacks deliver millisecond soft acks but inherit base-chain finality—minutes on Ethereum and a few seconds on Solana (nothing prevents L1s from offering similar preconfirmations). The **soft→hard** window is the operational risk period to price into liquidations, large moves, and bridge flows.

*Notes:* Throughput figures are project-reported; real-world performance varies with network load and configuration.

## MEV & Fairness Controls

### Where MEV shows up

In CLOB-style DEXs, extractable value concentrates at two layers: (i) **ordering** (a sequencer/operator can reorder, insert, or delay flow), and (ii) **matching** (the engine can deviate from price-time priority). Centralized sequencing is performant but introduces an “invisible tax” from reordering risk; systems that add verifiable fairness reduce that cost for sophisticated flow.

### Bullet’s Application Specific Sequencing

Bullet pairs millisecond-level soft acks with **application-specific sequencing**—the sequencer enforces preset rules (e.g., favoring maker orders) to dampen toxic MEV. These rules are integral to the design rather than a best-effort policy, and the project launches with a single app-specific sequencer charged with enforcing them.

Implication: domain-specific ordering can curb certain sandwich/front-run patterns without adding user friction; the residual risk is operator centralization until sequencing decentralizes.

### Lighter’s Provable Matching

Lighter attacks MEV at the **matching** layer. Instead of proving *all* state transitions, it proves the integrity of the **matching engine** itself: ZK proofs attest that trades are matched according to price-time priority, yielding a cryptographic guarantee against operator malfeasance. For HFT and block-sensitive flow, this functions as “insurance” that execution wasn’t skewed by the operator.

Implication: verifiable matching does not remove sequencer power entirely, but it sharply narrows the space for value extraction inside the book.

### Additional Controls

* **Hide the target:** Hibachi posts **encrypted** trade/state blobs to Celestia, reducing what a sequencer or observer can exploit from order contents while keeping Ethereum settlement for exits.
* **Protocol-level fairness:** Monolithic venues can implement hard-code policies; for example, prioritizing **cancellations** over new orders in the same block protects makers from stale-quote snipes.
* **Road to decentralization:** Many rollups plan **decentralized/shared sequencing** (rotation/auctions/networks) to dilute single-operator MEV; until then, escape-hatch withdrawals limit damage from censorship or stalling.

Application-specific sequencing (Bullet) constrains *ordering* behavior; provable matching (Lighter) constrains *execution* behavior. Encrypted DA (Hibachi) reduces information leakage that fuels MEV, while protocol-level rules (e.g., cancel precedence) shape fairness for makers. The long-term unlock is decentralized sequencing; until it ships, projects that combine strict ordering rules, verifiable matching, and credible L1 exits will present the most defensible fairness profile.

## Conclusions

The AMM-to-CLOB shift has produced a spectrum rather than a single winner. Designs specialize along two axes, **Monolithic ↔ Modular** and **Matching engine on-chain ↔ Matching engine off-chain**, with each subset optimizing a different mix of latency, security assumptions, and composability.

### Concluding Remarks

* **Monolithic & Fully On-chain Execution** — **Hyperliquid, Kuru**
  Exchange-as-a-blockchain: matching and settlement share one clock; hard finality on commit; minimal soft→hard gap; weaker external composability (bridge-dependent).
* **Monolithic with Off-chain Components** — **dYdX v4**
  Sovereign app-chain with validator-run book in memory; deterministic chain-level finality; lower on-chain load than fully on-chain books.
* **Modular with On-chain Settlement** — **Bullet, Hibachi, Paradex, GTE, Lighter**
  The dominant rollup model. Utilizes an off-chain component (sequencer/matching engine) for millisecond soft acks and high performance, with final settlement and security anchored to an L1. DA and sequencing choices dominate unit economics and risk windows.
* **Latency determinism vs ecosystem reach:** Monoliths win on tail latency and simple failure modes; modular stacks win on ETH/SOL composability and auditability, accepting a soft→hard window that must be operationalized.
* **DA is the lever:** On-L1 DA simplifies exits and analytics; Celestia/EigenDA buy scale and cost; sovereign chains internalize DA but shift exit trust to validator sets and bridges.
* **Fairness surface:** Off-chain books must constrain **ordering** (application-specific sequencing) or **matching** (verifiable engines) to curb MEV; on-chain books lean on protocol scheduling and block rules.

### Mid-term Developments and How These Lines Blur

In the coming 6 to 18 months, several key developments from these CLOBs are expected to converge and redefine the CLOB landscape:

1. **Sequencing decentralization:** Migration from single operators to **rotations/auctions/shared networks** with fast-path acks and verifiable backstops; publish SLOs for inclusion/censorship and exercise forced-inclusion paths.
2. **Finality convergence:** Narrow soft→hard windows via faster settlement layers (e.g., Solana-settled paths) and proof pipelines; monoliths expose **light-client/bridge proofs** so external systems can verify commits.
3. **Multi-DA strategies:** Route critical states to L1 for exits/analytics and bulk traces to Celestia/EigenDA; improve compression/erasure coding and withholding detection.
4. **Verifiable matching as default:** Lighter-style **price-time proofs** spread broadly; even trusted engines emit attestations and public audit trails.
5. **Privacy that preserves exits:** Encrypted DA and selective disclosure reduce information leakage without breaking **forced withdrawals**.
6. **Liquidity unification:** Intent-based routing, cross-domain auctions, and solver networks reduce fragmentation across L1s/L2s/app-chains; execution quality (not chain brand) becomes the moat.

### Practical Moves between CLOB Quadrants

Moving from one CLOB quadrant to another is a deliberate rebalancing of three forces:

**1. Latency determinism** — the size (and volatility) of the soft-to-hard-finality window;
**2. Ecosystem reach** — how natively you interoperate with Ethereum, Solana, and associated tooling;
**3. Unit economics** — chiefly the cost of data availability and settlement.

A sensible migration plan starts by setting explicit KPIs on those axes: target p99 order-event→settlement latency, permissible DA cost per event, maximum withdrawal time, and the custody / DeFi integrations that must remain plug-and-play.

**Modular off-chain → Modular on-chain.** Teams make this hop when they need stronger execution fairness without abandoning Ethereum/Solana composability. The lowest-risk version migrates only *resting* liquidity, limit orders that sit for minutes or hours, onto an L2/L3 contract while leaving market-order flow in the off-chain engine. Doing so renders price-time priority verifiable on-chain and narrows the soft-to-hard gap for those orders. The price is higher on-chain load and dual-path complexity: every cancel storm must stay inside gas and inclusion budgets, and an overflow path must re-route to the off-chain engine if fees spike.

**Modular off-chain → Monolithic off-chain.** This pivot is latency-driven. If liquidation SLAs or tail-risk hedging against Ethereum’s ten-minute finality dominate your P\&L, shifting settlement to a sovereign app-chain removes the soft-to-hard window altogether. You inherit hard finality on block commit and internalize the DA bill, but you give up default ETH-native composability and must convince users that your validator set and bridge proofs are as trustworthy as L1 consensus. A staged collateral migration and a provable light-client bridge are prerequisites.

**Monolithic off-chain → Monolithic on-chain.** Once a monolithic chain’s VM and scheduler can absorb cancel-heavy traffic without p99 hiccups, folding the matching engine on-chain eliminates the operator fairness surface. Matching and settlement become the same event, MEV reduces to block-ordering rules, and external auditors can replay the book directly from chain state. The trade-off is throughput ceiling: on-chain matching must not starve the rest of the system or blow up state growth.

**Either camp → Hybrid DA.** When DA costs eclipse trading fees, routing data becomes the obvious optimisation. Pin *critical* artefacts—balance roots, withdrawal proofs, forced-inclusion payloads—to Ethereum blobs or Solana ledger, and ship high-volume traces to Celestia or EigenDA. A deterministic router (fee- and urgency-aware) plus continuous withholding monitoring preserves unconditional exits while cutting the DA bill. The extra operational surface is real, but for venues pushing hundreds of thousands of OPS it is the cleanest way to keep margins intact without watering down security guarantees.

## References

1. [https://hyperliquid.gitbook.io/hyperliquid-docs](https://hyperliquid.gitbook.io/hyperliquid-docs)
2. [https://medium.com/@tomarpari90/dydx-v4-whitepaper-the-ultimate-technical-deep-dive-4c95f499d3bc](https://medium.com/@tomarpari90/dydx-v4-whitepaper-the-ultimate-technical-deep-dive-4c95f499d3bc)
3. [https://docs.paradex.trade/getting-started/what-is-paradex](https://docs.paradex.trade/getting-started/what-is-paradex)
4. [https://l2beat.com/scaling/projects/paradex](https://l2beat.com/scaling/projects/paradex)
5. [https://docs.hibachi.xyz/hibachi-docs/about-hibachi](https://docs.hibachi.xyz/hibachi-docs/about-hibachi)
6. [https://docs.bullet.xyz/](https://docs.bullet.xyz/)
7. [https://docs.kuru.io/](https://docs.kuru.io/)
8. [https://docs.gte.xyz/home/overview/about-gte](https://docs.gte.xyz/home/overview/about-gte)
9. [https://docs.lighter.xyz/](https://docs.lighter.xyz/)
10. [https://x.com/0xJaehaerys/status/1935720081318654288](https://x.com/0xJaehaerys/status/1935720081318654288)
11. [https://messari.io/report/next-generation-clobs-rethinking-endgame-dex-design](https://messari.io/report/next-generation-clobs-rethinking-endgame-dex-design)
12. [https://messari.io/report/picking-winners-in-the-clob-wars](https://messari.io/report/picking-winners-in-the-clob-wars)
13. [https://oakresearch.io/en/analyses/innovations/clob-wars-new-dawn-for-dex-trading](https://oakresearch.io/en/analyses/innovations/clob-wars-new-dawn-for-dex-trading)
