---
title: Solving the Messopotamia - The Curious World of Sealed Bid Auctions in Ethereum’s PBS
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-price-sealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue
---

## WIP - Work in progress

## Introduction

In this post, we explore the intriguing world of edge cases within First Price Sealed Bid Auction (FPSBA) and Second Price Sealed Bid Auction (SPSBA) in Ethereum’s Proposer Builder Separation (PBS) scheme, where traditional auction theories meet the cutting-edge challenges of blockchain technology. 

Before we proceed, a quick note: If you're unfamiliar with the concepts of [PBS](https://barnabe.substack.com/p/pbs)[^1[^2]], FPSBA, or SPSBA, or simply wish for a refresher, I recommend visiting [Sealed Bid Auctions in Ethereum’s PBS](https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html)[^3]. It’s essential groundwork that will enrich your understanding of the discussions that lie ahead.

In this exploration, we meditate on the scenarios that deviate from the norm—where honesty and transparency are compromised, the system’s integrity is put to the test and the participants in the network exploiting less understood concepts that could compromise auction efficiency and fairness. These aren’t just theoretical curiosities; they bear significant, tangible implications for the design and execution of auctions on the Ethereum network. For each case, we’ll dissect the problem, propose methodologies for modeling these complexities, and discuss strategic modifications to the auction and mechanism designs that could help mitigate these issues.

So, let’s start our journey, working together to better understand Ethereum’s auction mechanics and find practical solutions for its challenging scenarios.





## References
[^1]: https://barnabe.substack.com/p/pbs 
[^2]: https://thogiti.github.io/2024/03/28/ePBS.html
[^3]: https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html
