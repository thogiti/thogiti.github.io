---
title: Sealed Bids in Ethereum's PBS - Impact on Proposer-Builder Dynamics
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-pricesealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue
---

## WIP: DRAFT MODE

## Introduction and Motivation

### Introduction

Ethereum's shift to a Proof of Stake (PoS) consensus mechanism introduces a clear division of roles in block proposal and construction through the Proposer-Builder Separation (PBS) [^1][^2]. This structure not only improves operational efficiency but also sets the stage for complex economic interactions between proposers and builders. Central to these interactions is the auction-based system enabled by MEV-Boost, which plays a crucial role in this ecosystem.

### Motivation

![MEV-Supply-Chain-PBS](/assets/images/20240501/MEV-supply-chain-in-PBS.png)

_Figure: MEV supply chain in the PBS. Credit by Sen Yang, arXiv:2405.01329 [cs.CR]_ 

Understanding Maximum Extractable Value (MEV) and its distribution within Ethereum is essential for grasping the economic incentives that motivate proposers and builders. Recent data shows that private order flows—transactions that bypass the public mempool and are directly sent to builders—now influence over 60% of the daily blocks[^3]. These private transactions are a significant source of revenue for builders and a competitive battlefield.

The current MEV-Boost setup, although beneficial in several ways, tends to favor established builders, potentially leading to harmful practices like sandwich attacks and centralization. This situation creates a marketplace where trust issues are rampant, and new entrants are discouraged by high barriers due to the need for reputation and the substantial costs involved in market entry. This condition threatens the decentralized nature of the Ethereum network.

It’s also worth noting that there are active proposals aimed at enshrining PBS (ePBS) [^4][^5] within the Ethereum protocol and evolving the Builder role to be recognized as a validator through an in-protocol mechanism, which would reduce the role of relayers. These developments could significantly alter the dynamics of PBS, introducing new auction mechanisms and changing the interplay between proposers and builders. We will discuss the potential impacts of transitioning from out-protocol to in-protocol PBS and its relationship to sealed bid auctions in future discussions. Currently, MEV-Boost operates under an open bid first-price auction mechanism.

In this blog, we focus on how sealed bid auction mechanisms—both First Price (FPSB) and Second Price (SPSB)—affect the economics of the Ethereum network. We will examine their impact on proposer payments and builder strategies, and how these auctions might be optimized to promote fairness and efficiency. Through simulations of these auction types with different valuation distributions, we aim to offer insights into strategic adjustments and their effects on network operation and equity.

A deep understanding of these mechanisms is crucial not only for those actively participating in the market but also for the broader Ethereum community as it continues to refine its consensus processes. This analysis aims to enrich the conversation about how Ethereum can maintain a balance between efficiency, profitability, and decentralization in its auction mechanics.

## Sealed Bid Auction Theory Foundations

### First Price Sealed Bid Auction (FPSBA)

![First Price Sealed Bid Auction (FPSBA)](/assets/images/20240501/FPSB-bandwidth-auction.png)
_Figure: First-price sealed-bid auction for bandwidth resource trading market. Credit by Niyato D, Luong NC, Wang P, Han Z. Auction Theory for Computer Networks. Cambridge University Press; 2020._ 


The **First Price Sealed Bid Auction (FPSBA)** requires each builder to submit a single, confidential bid without knowledge of the other bids. The highest bidder wins but pays exactly the amount they bid. This model encourages strategic bidding, where builders must carefully balance their bid to win without overpaying. However, FPSBA can lead to a phenomenon known as the **winner's curse**, where the winning bidder realizes they have overpaid relative to the actual value of the block[^8]. This often occurs when bidders estimate and act on incomplete information about the block's value.

### Second Price Sealed Bid Auction (SPSBA)

![Second Price Sealed Bid Auction (FPSBA)](/assets/images/20240501/SPSB-bandwidth-auction.png)
_Figure: Second-price sealed-bid auction for bandwidth resource trading market. Credit by Niyato D, Luong NC, Wang P, Han Z. Auction Theory for Computer Networks. Cambridge University Press; 2020._ 


Conversely, the **Second Price Sealed Bid Auction (SPSBA)**, often called the Vickrey Auction, also involves builders submitting a single, hidden bid. However, unlike FPSBA, the highest bidder wins but pays the amount of the second-highest bid. This setup theoretically encourages bidders to bid their true valuation of the block, as the winning price depends on the next highest bid, not their own, mitigating the risk of the winner's curse.

### Distribution Models for Builder Valuations

To simulate these auctions accurately, we utilize two primary distribution models for the valuations builders place on block proposals: **uniform** and **chi-squared distributions**. The uniform distribution assumes that the value builders assign to a block is evenly distributed across a range, providing a baseline for understanding bidding behavior. In contrast, the chi-squared distribution is better suited for scenarios where values vary more significantly—typical in environments where builders have access to private order flows. Builders with exclusive information can more accurately assess the MEV and the value of a block, giving them an advantage over competitors without such insights. This distribution model more accurately approximates the valuation scenarios faced by builders with access to private order flows or other information that gives them deeper insight into MEV.

### Revenue Equivalence Theorem and Bayesian Nash Equilibrium

The **Revenue Equivalence Theorem (RET)** is a fundamental concept in auction theory [^6] that states under certain conditions (such as risk-neutral bidders, independent private values, and symmetric bidders), all standard auction formats will yield the same expected revenue to the seller. In the context of Ethereum, this theorem helps us understand that different auction types might, under ideal conditions, lead to similar revenue outcomes for proposers.

Alongside RET, the concept of **Bayesian Nash Equilibrium (BNE)** is pivotal [^7]. In BNE, each bidder's strategy maximizes their expected utility, given their beliefs about other bidders’ strategies. In Ethereum's sealed bid auctions, BNE can guide builders on how much to bid based on their estimation of others' valuations and the auction format. 

### Bayesian Game Dynamics in FPSBA

Determining the optimal bid in a FPSBA poses significant challenges due to the private nature of the bidding process. Unlike an English auction where bidders can gauge others' valuations through their dropping-out decisions, FPSBA keeps each bidder's valuation and strategy hidden. This scenario aligns more closely with the Dutch auction, where participants also bid without knowing others' decisions, yet can strategize based on the known distribution of all users' values.

FPSBAs are essentially Bayesian games, characterized by incomplete information where each player (bidder) lacks knowledge about the strategies and payoffs of others. However, each bidder possesses beliefs about the other players' valuations based on a known probability distribution. In this setting, the Nash equilibrium used to determine each player's best response is specifically a Bayesian-Nash Equilibrium (BNE). This form of equilibrium accounts for the players' strategies that maximize their expected utility, under the assumption that they understand the distribution of others' valuations, even if they don't know the specific bids being placed.

To address the winner's curse in FPSBA, bidders may employ **bid shading**, where they intentionally lower their bids to mitigate the risk of overpaying. This strategic move balances the desire to win the auction with the need to avoid unfavorable payoff outcomes.

This Bayesian game framework is essential for explaining why and how bidders in a FPSBA attempt to optimize their bids in the face of significant uncertainties about competitors' actions and intentions. 

The following table compares FPSBA to SPSBA in which the valuations of the $n$ builders are drawn independently and uniformly at random from $[0,1]$:

```markdown
| Auction      | First-price                  | Second-price                     |
|--------------|------------------------------|----------------------------------|
| Winner       | Agent with highest bid       | Agent with highest bid           |
| Winner pays  | Winner's bid                 | Second-highest bid               |
| Loser pays   | 0                            | 0                                |
| Dominant strategy | No dominant strategy     | Bidding truthfully is dominant strategy |
| Bayesian Nash equilibrium | Bidder i bids $\frac{n - 1}{n} v_i$ | Bidder i truthfully bids $v_i$ |
| Auctioneer's revenue | $\frac{n - 1}{n + 1}$ | $\frac{n - 1}{n + 1}$        |
```



## References
[^1]: https://barnabe.substack.com/p/pbs 
[^2]: https://thogiti.github.io/2024/03/28/ePBS.html
[^3]: https://arxiv.org/pdf/2405.01329 
[^4]: https://hackmd.io/@potuz/rJ9GCnT1C
[^5]: https://thogiti.github.io/2024/04/18/A-Deep-dive-into-ePBS-Design-Specs.html
[^6]: https://en.wikipedia.org/wiki/Revenue_equivalence
[^7]: 
[^8]: https://en.wikipedia.org/wiki/Winner%27s_curse

