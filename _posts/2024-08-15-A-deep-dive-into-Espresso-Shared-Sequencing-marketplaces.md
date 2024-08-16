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
       
       
       $v(B) = b(B) \quad \text{if } \|B\| \geq 2$.
       

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


## “Last Look” and Auction Settlement

The strategic bidding problem associated with the “last look” in auctions can severely undermine the efficiency and fairness of the auction process. Sequential auctions, or those that allow bids to be revealed before finalization, are particularly vulnerable to such manipulation. Using **sealed-bid auctions** or implementing a **VCG mechanism** are effective ways to counteract these issues. Both methods encourage honest bidding, prevent strategic late bids, and ensure that auction outcomes are socially efficient, maximizing both revenue and welfare.

Let's study an example and understand how the "last look" works and how to mitigate its implications.

### Strategic Bidding in Sequential Auctions

Let's consider a scenario described below. We have three items (e.g. rollup blocks) up for auction: $A$, $B$, and $A+B$ (the combination of A and B). The bids placed on these items are denoted by $b_A$, $b_B$, and $b_{A+B}$ respectively.

Suppose the auction is sequential or allows for bids to be revealed during the process (as described in Espresso market design document). This creates an environment where a participant with a “last look” can adjust their bid strategically based on the information they gain from other participants' bids. This form of bidding is highly strategic and can lead to several inefficiencies:

**Scenario Setup**:

- Bidder 1 places a bid $b_A = 10$ for item $A$.
- Bidder 2 places a bid $b_B = 8$ for item $B$.
- Bidder 3 places a bid $b_{A+B} = 25$ for the combination $A+B$.

**Strategic Last Bid**:

- Suppose another bidder, Bidder 4, has the ability to observe these bids before placing their own bid. Knowing that $b_{A+B} = 25$ for the combination, Bidder 4 might place a new bid $b'_B = 14.9$ for item $B$.
- The goal of Bidder 4 is to just outbid Bidder 2 for $B$, but not so much as to surpass the value that would make it better to win $A+B$ outright.

**Outcome**:
    
- **For Bidder 4**: By bidding $b'_B = 14.9$, Bidder 4 wins $B$ without outbidding the $A+B$ combination. The surplus captured is maximized for Bidder 4 since they have paid just enough to outbid Bidder 2 but less than the marginal increase from $A+B$.
    
- **For Other Bidders**: Bidder 1 may underbid in future auctions, knowing they can be outbid strategically, and Bidder 3 may also adjust their strategy or avoid participating altogether, reducing overall auction revenue and efficiency.

**Mathematical Representation**:
- Let’s define the marginal benefit of $B$ as $\Delta B$, which represents the increase in value when $B$ is added to the combination. We can express it as:
      

$\Delta B = b_{A+B} - b_A$
      
In the example, $\Delta B = 25 - 10 = 15$. If Bidder 4 strategically bids $b'_B = 14.9$, they effectively capture the entire surplus $\Delta B - b_B$ by just outbidding $b_B$ without hitting the combination threshold.

**Implications**:

- **Reduced Revenue**: The auctioneer collects less revenue because strategic bidding reduces competition and results in bids that just clear the second-highest value.
- **Inefficiency**: The allocation may not be socially efficient since participants adjust their strategies based on what they think others will bid, rather than their true valuations.

### Sealed-Bid Auction Solution

To counteract the issues of strategic bidding with “last look,” one effective approach is to implement a **sealed-bid auction**. In this format, all bids are submitted simultaneously without any participant knowing the others’ bids. After all bids are submitted, they are revealed, and the highest bid wins.

**Sealed-Bid Auction Mechanics**:

- Each bidder submits their bid $b_i$ for the item they are interested in without knowing the bids of others.
- The winner is the bidder with the highest bid, but the bids are revealed only after submission.

**Mathematical Representation**:

- Suppose there are $n$ bidders. The winning bid $b^*$ for item $A$ is given by:
      
$b_A^* = \arg \max_{b_i} b_i$
      
The same applies for $B$ and $A+B$.

**Advantages**:

- **No Strategic Adjustments**: Since all bids are submitted simultaneously and without knowledge of others, bidders cannot adjust their bids strategically at the last minute. This tends to lead to more honest bidding, reflecting true valuations.
- **Increased Revenue**: The sealed-bid format typically results in higher revenue for the auctioneer because bidders tend to bid closer to their true valuations, knowing they cannot outbid others strategically.

**Social Welfare Maximization**:

- The sealed-bid auction is more likely to result in socially efficient outcomes because bidders are encouraged to reveal their true valuations without concern for being outmaneuvered by others.

### VCG (Vickrey-Clarke-Groves) Auction

The VCG auction mechanism is another approach that can solve the issues identified in sequential or last-look auctions.

**Mechanics of VCG**:

- In a VCG auction, each bidder submits a sealed bid, and the highest bidder wins. However, the winning bidder pays the opportunity cost they impose on other bidders rather than their own bid. This payment structure ensures that bidders have an incentive to bid their true valuations.

**Mathematical Representation**:

- Suppose Bidder $i$ wins the auction with a bid $b_i$. The price they pay $p_i$ is determined by the sum of the highest bids that would have won if Bidder $i$ had not participated:

$p_i = \sum_{j \neq i} b_j^{\text{second-best}}$

For example, if Bidder 1 wins with $b_1 = 25$ for $A+B$, but the next highest combined bids were $b_A = 10$ and $b_B = 14.9$, then Bidder 1 pays $p_1 = 24.9$.

**Benefits**:

- **Incentive Compatibility**: The VCG mechanism is **dominant strategy incentive compatible (DSIC)**, meaning that bidding your true valuation is the best strategy regardless of what others do.
- **Social Efficiency**: By ensuring bidders pay the opportunity cost, the auction encourages socially efficient outcomes where goods are allocated to those who value them most.

**Mitigation of Strategic Manipulation**:

- **No Advantage in Last Look**: Since bidders are incentivized to bid truthfully, the “last look” advantage is neutralized. Even if a bidder could see others’ bids, it would not benefit them to underbid or overbid relative to their true valuation.

