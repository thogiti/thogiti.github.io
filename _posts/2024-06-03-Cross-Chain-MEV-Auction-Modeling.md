---
title: Cross-Chain MEV Auctions - Modeling Proposer Revenue Maximization
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-price-sealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue vickrey-auctions Proposer-Revenue-Maximization cross-chain-mev cross-chain-mev-auctions
---

## WIP - WORK IN PROGRESS 

## Introduction

In the evolving landscape of multi-chain world, one of the key components to unlocking the full potential of cross-chain interactions is through maximizing the value extracted from miner-extractable value, or MEV. This article will explore how we can develop mathematical models and optimize auction mechanisms to maximize proposer revenues.

We'll start by exploring a foundational model presented by Ed Felten in the recent [Arbitrum research forum](https://research.arbitrum.io/t/do-shared-mev-auctions-actually-increase-revenue/9606) [^1], which breaks down the basics of separate and joint MEV auctions. This model serves as a baseline to understand not just the mechanics, but also the broader implications of choosing one auction method over another in a multi-chain environment. By examining this model, we set the stage for a deeper investigation into more complex scenarios that reflect the real-world dynamics of cross-chain MEV interactions.

Before we proceed, a quick note: If you're unfamiliar with the concepts of [MEV](https://barnabe.substack.com/p/pbs)[^2][^3], sealed bid auctions, or simply wish for a refresher, I recommend visiting [Sealed Bid Auctions in Ethereum’s PBS](https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html)[^3]. It’s essential groundwork that will enrich your understanding of the discussions that lie ahead.


# EdFelten's Basic Model - Separate vs Joint Auctions for MEV Rights

Let us first review and understand the basic model by Ed Felten to analyze separate vs join auctions for MEV rights [^1]. 

### Separate Auctions
- **Valuation Model**:
   $V_{A,i} = V_A^* + A_i$. Each chain has a base unknown true valuation $V^*_A$ for chain A, augmented by a builder-specific estimation error $A_i$, which follows a normal distribution $N(0, \sigma^2)$. This introduces variability in individual valuations based on bidder perceptions and information.

- **Revenue Model**:
   The revenue for MEV rights on a single chain in a sealed-bid, second-price auction is determined by the second-highest bid. Mathematically, this is represented as:
   $R_A = V^*_A + \sigma \cdot \alpha(n)$.
   Here, $\alpha(n)$ is the expected value of the second-largest of $n$ normal samples, scaling the estimation error by bidder number to adjust for competition intensity.

For two chains $A$ and $B$, the total separate proposer revenue $R_{sep}$ is the sum of revenues from both chains:
$R_\mathrm{sep} = V_A^* + V_B^* + 2\sigma\cdot\alpha(n)$

### Joint Auction

**Assumptions**:
1. **Valuation Model**:
   $V_{AB, i} = V_A^* + V_B^* + C_i + M$. When MEV rights for chains $A$ and $B$ are bundled, the combined valuation $V_{AB, i}$ includes the sum of their base valuations plus a synergistic value $M$, which accounts for the additional value derived from controlling MEV across multiple chains. The error term $C_i$ aggregates the individual errors $A_i$ and $B_i$, resulting in a new distribution $N(0, 2\sigma^2)$.

2. **Revenue Model**:
   The revenue for the joint MEV rights follows the format of a sealed-bid, second-price auction:
   $R_\mathrm{joint} = V_A^* +V_B^* + M + \sqrt{2} \sigma \cdot \alpha(n)$
   The synergistic value $M$ due to cross-chain MEV and the increased error term adjust the base revenue potential upward, reflecting the combined value proposition.

### Comparative Analysis

Comparing the revenues from the separate and joint auctions reveals the core financial dynamics:
$R_{joint} - R_{sep} = M - (2 - \sqrt{2}) \sigma \cdot \alpha(n)$
This formula illustrates the necessary conditions under which the joint auction becomes more profitable to the proposer: the synergistic value $M$ must outweigh the adjusted error term $(2 - \sqrt{2}) \sigma \cdot \alpha(n)$ influenced by the number of bidders and their variance.

### Generalizing to $K$ Chains

Extending the analysis to $K$ chains, we can develop the auction models as below:
- **Separate Auctions**:
  $$R_{sep} = \sum_{j=1}^{K} V^*_j + K \sigma \cdot \alpha(n)$$
  
- **Joint Auction**:
  $$R_{joint} = \sum_{j=1}^{K} V^*_j + M + \sqrt{K} \sigma \cdot \alpha(n)$$

The resulting revenue difference becomes:
$R_{joint} - R_{sep} = M - (K - \sqrt{K}) \sigma \cdot \alpha(n)$

### Insights and Practical Implications

**Revenue Comparison**:
The decision between conducting separate or joint auctions hinges on the balance between the inherent synergistic value $M$ and $(K - \sqrt{K}) \sigma \cdot \alpha(n)$, the cumulative impact of bidder estimation errors across multiple chains. 

**Synergistic Value**:
A significant $M$ suggests joint auctions may provide more proposer revenue, particularly when cross-chain interactions significantly enhance the overall MEV.

**Separate Auction Advantage**:
Conversely, lower $M$ values or high bidder variability make separate auctions more appealing, ensuring each chain's MEV rights are maximized based on individual chain dynamics.



## References
[^1]: https://research.arbitrum.io/t/do-shared-mev-auctions-actually-increase-revenue/9606
[^2]: https://barnabe.substack.com/p/pbs 
[^3]: https://thogiti.github.io/2024/03/28/ePBS.html

