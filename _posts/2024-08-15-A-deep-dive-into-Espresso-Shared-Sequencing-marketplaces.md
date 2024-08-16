---
title: 	A Deep Dive into Espresson Shared Sequencing Marketplaces
tags: Ethereum Rollups Espresso shared-sequencing combinatorial-auctions auctions shared-sequencing-marketplaces shared-sequencing-mechanism-design shared-sequencing-auctions
---

## WIP - WORK IN PROGRESS

In this article I will present some thoughts and meditations on the Espresso shared sequencing marketplace design and some challenges related to this design space. You can read the original Espresso's article on their design at [https://hackmd.io/@EspressoSystems/market-design](https://hackmd.io/@EspressoSystems/market-design).

_Note: Many thanks to  Terry @ EclipseLabs for sharing his notes on the Espresso. My analysis is largely inspired from a discussion with him._

## [Espresso Shared Sequencing Market Design](#espresso-shared-sequencing-market-design)

The [Espresso Market design](https://hackmd.io/@EspressoSystems/market-design) is a sophisticated mechanism designed to facilitate a marketplace where rollups can sell sequencing timeslots to sequencers (proposers). This marketplace design leverages concepts from auction theory, combinatorial optimization, and economic incentives to achieve efficient, decentralized, and stable sequencing of rollup blocks. Here’s a high level overview of the mathematical model and key components involved.

### Combinatorial Auction Model
   - **Overview**: The core of the Espresso Market design is a combinatorial auction where sequencers bid for the rights to sequence multiple rollups during specific timeslots. The auction is designed to allow sequencers to bid on bundles of rollups, treating them as complements, which means that the value of sequencing multiple rollups together is greater than sequencing them individually.
   - **Auction Phases**:
     - **Bidding Phase**: Sequencers submit bids for different bundles of rollups, with all bids being public and upfront payments required. This setup ensures that bids are credible and that the sequencers have the necessary funds to back their bids.
     - **Assignment Phase**: The auction outcome is determined by selecting the set of bundles that maximizes the total bid value. Mathematically, this involves finding the partition of rollups into bundles that maximizes the sum of the highest bids for each bundle, subject to the constraint that each rollup is included in exactly one bundle.
     - **Sequencing Phase**: The winning sequencers for each bundle are then granted the right to sequence the corresponding rollups during the specified timeslot.

   - **Mathematical Formulation**:
     - Let $n$ be the number of rollups.
     - Each rollup $i$ has a reserve price $r_i$.
     - For any bundle $B \subseteq [n]$ of rollups, let $b(B)$ be the highest bid for that bundle.
     - The auction seeks to find a partition $\Pi = \{B_1, \dots, B_k\}$ of the rollups that maximizes the total bid value:
       
       $\Pi^* = \arg\max_{\Pi} \sum_{B \in \Pi} v(B)$
       
       where $v(B)$ for a bundle $B$ is defined as:
       
       $v(B) = \max(b(B), r_i) \quad \text{if } B = \{i\} \text{ (singleton bundle)}$
       
       and
       
       

       $v(B) = b(B) \quad \text{if }$ | $B$ | $\geq 2$
       

   - **Challenges**: The problem of finding the optimal partition is combinatorial and can be computationally inefficient in general cases. However, in practical settings, only a limited subset of bundles may be economically viable, which can simplify the problem.

### Lottery Mechanism to Mitigate Monopolization
   - **Problem with Auctions**: A potential downside of pure combinatorial auctions is that a single bidder could dominate the market by consistently winning, leading to monopolization.
   - **Lottery Introduction**: To counter this, Espresso introduces a lottery mechanism where instead of a single bid, sequencers buy lottery tickets for each bundle. The winner for each bundle is then randomly chosen from the pool of ticket holders, with the probability of winning proportional to the number of tickets purchased.
   - **Mathematical Model**:
     - Let $t_{\text{max}}$ be the maximum number of tickets sold for a bundle.
     - The price per ticket $p_B$ is dynamically adjusted based on the demand in previous iterations, similar to the EIP-1559 mechanism in Ethereum. If demand is high, ticket prices increase in the next round; if demand is low, prices decrease.
     - The expected revenue for each sequencer in the lottery is given by their proportional share of tickets:
       
       $\text{Expected Revenue} = \frac{\text{Tickets Purchased}}{\text{Total Tickets Sold}} \times \text{Bundle Value}$
       
   - **Stability**: The lottery mechanism helps in achieving a more diverse distribution of sequencing rights, reducing the risk of monopolization and ensuring a more decentralized market structure.

### Revenue Allocation
   - **Objective**: Ensure that rollups are better off participating in the marketplace than sequencing independently.
   - **Revenue Splitting**: If a rollup is included in a bundle, it receives at least the highest bid for its singleton bundle. Additional revenue from shared sequencing (i.e., when the rollup is part of a bundle) is distributed proportionally based on the value of singleton bids.

   - **Mathematical Model**:
     - If rollup $i$ is part of a winning bundle $B$, its payment is:
       
       $\text{Payment to Rollup } i = \max(b_i, r_i) + \frac{b(B) - \sum_{j \in B} b_j}{\sum_{j \in B} b_j} \times b_i$
       
     - Here, $b_i$ is the highest bid for the singleton bundle containing only rollup $i$, and $b(B)$ is the highest bid for the entire bundle $B$.

### Incentive Compatibility and Efficiency
   - **Incentive Compatibility**: The Espresso market does not claim to be fully incentive-compatible, as achieving both DSIC (dominant strategy incentive compatible) and efficiency in complex combinatorial settings can be challenging. The design, however, aims to be sufficiently close to efficient by leveraging repeated interactions and smooth price adjustments.
   - **Efficiency**: The design attempts to ensure that sequencing rights are allocated to those who value them the most, which is typically aligned with achieving efficient outcomes.

### Anti-Monopolization and Censorship Resistance
   - The lottery design, combined with the repeated nature of the market, aims to prevent any single sequencer from dominating the market. The random allocation of sequencing rights, even among high bidders, introduces unpredictability and diversity in the selection process, promoting decentralization and resistance to censorship.

