---
title: 	A Deep Dive into Application Specific Sequencing
tags: Ethereum Rollups Application-Specific-Sequencing app-sequencing Espresso shared-sequencing decentralized-sequencing shared-sequencing-marketplaces shared-sequencing-mechanism-design shared-sequencing-auctions
---

## WIP - WORK IN PROGRESS

## Introduction

As blockchain technology matures, decentralized applications (dApps) face increasing challenges in managing transaction sequencing to optimize user experience, value retention, and security. Traditional blockchain architectures often leave dApps at the mercy of external actors—such as miners, validators, MEV (Miner Extractable Value) extractors and rollup sequencers—who control transaction ordering and inclusion. This lack of control can lead to value leakage, unfair user outcomes, and vulnerabilities to malicious behaviors like frontrunning or sandwich attacks.

Application-Specific Sequencing (ASS) emerges as a important shift, granting dApps greater control over the inclusion and ordering of transactions affecting their state. By customizing sequencing mechanisms to their specific needs, dApps can mitigate negative externalities, internalize value, and enhance overall system efficiency. However, implementing ASS introduces complex trade-offs, particularly between composability and value capture, and raises critical questions about infrastructure design, incentive structures, and the expansive design space.

This article explores the details of ASS, synthesizing insights from current projects and exploring the relationships and trade-offs inherent in this design space. I aim to provide a comprehensive view for researchers and developers to further investigate and optimize ASS mechanisms.

Before, we get deep into the application specific sequencing, let us briefly understand the fundamental concepts around sequencing and the vast design spectrum of sequencing, decentralized sequencing and shared sequencing.

## Background - Sequencing Spectrum

### Motivation -  Importance of Transaction Sequencing

In blockchain networks, transaction sequencing—the process of determining which transactions are included in a block and in what order—is fundamental to the operation of dApps. The sequence directly impacts:

- Value ownership and flow: Determines how assets are transferred and who gains control over them.
- User experience: Affects transaction confirmation times, fees, and the predictability of outcomes.
- Security and fairness: Influences vulnerability to MEV extraction and manipulative practices like frontrunning and sandwich attacks.

### The Role of MEV in Transaction Sequencing

MEV refers to the profit miners or validators can make by reordering, including, or excluding transactions within the blocks they produce. MEV can manifest in various forms:

- Arbitrage MEV: Exploiting price differences across exchanges.
- Liquidation MEV: Profiting from liquidating under-collateralized positions.
- Sandwich MEV: Placing transactions before and after a target transaction to manipulate prices.
- Time-Bandit MEV: Reorganizing past blocks to extract additional value.

MEV extraction often comes at the expense of users and liquidity providers (LPs), leading to value leakage from the dApp ecosystem and undermining user trust.

### What is Sequencing in Rollups?
Sequencing refers to the process of ordering transactions before they are executed and committed to the blockchain. In rollups, a sequencer is responsible for:

- Ordering transactions: Determining the sequence in which transactions are processed.
- Batching transactions: Grouping multiple transactions into batches to be posted to the main chain (Layer 1).
- Improving performance: Enhancing throughput and reducing latency by efficiently managing transaction flow.

### Centralized Sequencing
- Definition: A single entity or a tightly controlled group manages the sequencing process.
- Advantages:
  - High performance: Reduced coordination overhead leads to faster transaction processing.
  - Simplicity: Easier to implement and maintain.
- Disadvantages:
  - Censorship risk: A central sequencer can censor or reorder transactions unfairly.
  - Liveness issues: If the sequencer fails or becomes malicious, the entire system can halt.
  - Trust concerns: Users must trust the sequencer's integrity and reliability.

### Decentralized Sequencing
- Definition: Multiple independent entities participate in sequencing through a consensus mechanism.
- Advantages:
  - Censorship resistance: Harder for any single entity to censor transactions.
  - Improved liveness: The system remains operational even if some sequencers fail.
  - Enhanced security: Distributed control reduces the risk of attacks.
- Disadvantages:
  - Increased complexity: More complex to implement due to coordination among sequencers.
  - Potential performance Trade-offs: Consensus mechanisms can introduce latency.
  - Economic incentive challenges: Aligning incentives among participants can be difficult.

### Shared Sequencing
- Definition: Shared sequencing involves multiple rollups or chains utilizing a common set of sequencers. Instead of each rollup having its own sequencers, they share sequencing infrastructure. They share a decentralized network of sequencers.
- Advantages:
  - Resource efficiency: Reduces duplication of infrastructure across rollups.
  - Facilitated interoperability: Easier cross-rollup communication and composability.
  - Enhanced security: Shared security model across participating rollups.
- Disadvantages:
  - Coordination complexity: Managing sequencing across diverse rollups with different requirements.
  - Incentive misalignment: Different rollups may have conflicting economic incentives.
  - Risk propagation: Issues in one rollup could affect others sharing the sequencers.

### Incentives and Challenges for Dapps

**Desire for isolated fee markets**

One of the primary incentives for dApps is the control over their own fee markets. Applications often prefer isolated fee markets to:

- Prevent congestion spillover: Avoid being affected by unrelated spikes in network activity that could increase transaction fees for their users.
- Maintain predictable costs: Ensure that transaction fees remain stable and predictable and aligned with the value provided by the application.


In a shared sequencing environment, fee markets can become merged. This merging means that high demand in one application can lead to increased fees across all applications sharing the sequencer. For example, if a popular game on a shared chain experiences a surge in activity, it could inadvertently raise transaction costs for a DEX operating on the same chain.

**Capturing execution revenue and MEV** 

Dapps are increasingly interested in capturing a portion of the execution revenue and MEV generated by their platforms. In the context of rollups, dapps are looking for two main things:

- MEV Leakage: Without control over sequencing, external entities can extract MEV, reducing the revenue potential for the dApp itself.
- Desire for revenue sharing: dApps seek mechanisms to receive a share of the fees and MEV generated by their users' transactions or their user's interactions with the applications.


Shared sequencing complicates this revenue capture because:

- Fee redistribution is complex: Distributing fees and MEV back to individual applications in a fair and enforceable manner is challenging.
- Incentive misalignment: Sequencers in a shared environment may prioritize their own revenue over the interests of specific dApps or users.

### Application-Specific Sequencing as an Alternative
To address these challenges, some applications are exploring application-specific sequencing. This model involves:

- Dedicated sequencers: The application runs its own sequencer or has greater control over the sequencing process.
- Custom fee structures: Ability to implement custom fee mechanisms that align with the application's economic model.
- Direct revenue capture: Enhanced capability to retain fees and MEV within the application.

By controlling sequencing, dApps can:

- Mitigate MEV risks: Reduce unwanted MEV extraction by external parties.
- Optimize user experience: Provide more predictable and stable transaction fees to users.
- Align incentives: Ensure that sequencer behavior is directly aligned with the application's goals.

## Application-Specific Sequencing - Current Landscape


## References

Sorella Labs https://www.youtube.com/watch?v=fw5Qu400ySY
