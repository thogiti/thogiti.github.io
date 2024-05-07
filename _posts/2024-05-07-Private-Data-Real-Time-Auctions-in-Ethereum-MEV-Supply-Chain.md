---
title: Privacy-Preserving Real-Time Auction System for Ethereum Block Building in MEV Supply Chain 
tags: Ethereum PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture AI-Agents-MEV AI-Crypto AI-Blind-Auctions AI-Block-Building AI-MEV-Supply-Chain-Management
---

## WIP: DRAFT MODE

## Motivation and Market Forces

![MEV-Supply-Chain-PBS](/assets/images/20240501/MEV-supply-chain-in-PBS.png)

_Figure: MEV supply chain in the PBS. Credit by Sen Yang, arXiv:2405.01329 [cs.CR]_ 

Private order flows account for over 60% of the Miner Extractable Value (MEV) in more than half of the daily blocks since July 2023[^1]. These private flows are controlled by providers who often require builders to meet certain market share thresholds. This requirement can cost new builders up to 1.4 ETH in subsidies to enter the market. On the other hand the private order flows are becoming a significant part of builder revenue.

The current MEV-Boost design favors builders, creating a dynamic where malicious builders can exploit providers through tactics like sandwich attacks and imitation. Consequently, providers tend to share their order flows only with builders who have established reputations, although this method of protection remains relatively weak. The trust issues inherent in this system create high entry barriers, stifling market decentralization. Addressing and potentially removing these trust barriers is crucial to fostering a more decentralized builder market.

Let us briefly define the full problem space and then improve upon the details through exploration.

**Problem Statement:**  
Securely conducting auctions for a block space allocation without exposing sensitive bid information to maintain bidder privacy and prevent manipulative behaviors.

**Technical Approach:**  
Deploy AI agents that utilize Secure Multi-Party Computation (SMPC) or FHE to handle bids. AI algorithms process encrypted bids, ensuring that bid values are only revealed to the auction system (in the worst case) and not to other bidders.

**Mechanism Design:**
- $B = ${ $b_1, b_2, ..., b_n$ } represents a set of bids.
- AI agents compute $max(B)$ in a privacy-preserving manner.
- Ensure that  $\forall b_i \in B$, data is encrypted and secure.

**Data Required:**  
Encrypted bids for the block, Relay APIs auction data, Ethereum transaction data for verification post-auction.

**Evaluation Criteria:**  
- Bid privacy preservation.
- Auction fairness and transparency.
- Time to finalize auction results.

**Optimization Potential:**  
Refine cryptographic techniques and multi-round auction mechanism designs to reduce computational overhead and improve auction performance.


### Private Auction Design with Two-Party MPC

### Double Auction Mechanism using TFHE

### UX of AI Agents and LLM Scripts for Solo Builders


## References
[^1]: https://arxiv.org/pdf/2405.01329 
