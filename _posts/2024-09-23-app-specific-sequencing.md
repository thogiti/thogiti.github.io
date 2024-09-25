---
title: 	A Deep Dive into Application Specific Sequencing
tags: Ethereum Rollups Application-Specific-Sequencing app-sequencing Espresso shared-sequencing decentralized-sequencing shared-sequencing-marketplaces shared-sequencing-mechanism-design shared-sequencing-auctions
---

## WIP - WORK IN PROGRESS

## Introduction

As blockchain technology matures, decentralized applications (Dapps) face increasing challenges in managing transaction sequencing to optimize user experience, value retention, and security. Traditional blockchain architectures often leave Dapps at the mercy of external actors—such as miners, validators, MEV (Miner Extractable Value) extractors and rollup sequencers—who control transaction ordering and inclusion. This lack of control can lead to value leakage, unfair user outcomes, and vulnerabilities to malicious behaviors like frontrunning or sandwich attacks.

Application-Specific Sequencing (ASS) emerges as a important shift, granting Dapps greater control over the inclusion and ordering of transactions affecting their state. By customizing sequencing mechanisms to their specific needs, Dapps can mitigate negative externalities, internalize value, and enhance overall system efficiency. However, implementing ASS introduces complex trade-offs, particularly between composability and value capture, and raises critical questions about infrastructure design, incentive structures, and the expansive design space.

This article explores the details of ASS, synthesizing insights from current projects and exploring the relationships and trade-offs inherent in this design space. I aim to provide a comprehensive view for researchers and developers to further investigate and optimize ASS mechanisms.

Before, we get deep into the application specific sequencing, let us briefly understand the fundamental concepts around sequencing and the vast design spectrum of sequencing, decentralized sequencing and shared sequencing.

## Background - Sequencing Spectrum

### Motivation -  Importance of Transaction Sequencing

In blockchain networks, transaction sequencing—the process of determining which transactions are included in a block and in what order—is fundamental to the operation of Dapps. The sequence directly impacts:

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

### Based Sequencing
- Definition: Base Sequencing is a model where the sequencing of transactions for an L2 rollup is integrated directly with the L1 blockchain's proposer or validator set. In this setup, L1 validators are responsible for both proposing blocks on the main chain and sequencing transactions on the rollup. 
- Advantages: 
  - Leverage existing infrastructure: The primary benefit is to leverage the existing security and decentralization of the L1 network to benefit the L2 rollup.
  - Censorship resistance: Since the sequencing is performed by the entire set of L1 validators, it becomes significantly harder for any single entity to censor transactions on the rollup.
  - Enhanced liveness: The rollup benefits from the L1's liveness properties, ensuring that transactions are processed promptly as long as the L1 network remains operational.
  - Security guarantees: By relying on the L1 validators, the rollup inherits the economic security provided by the staked assets or computational work securing the L1 chain.
  - Atomic composability: It can facilitate transactions that are atomically composable across L1 and L2, enabling complex interactions and seamless cross-layer functionality.
- Disadvantages:
  - Incentive misalignment: In the Base Sequencing model, execution revenue—including transaction fees and MEV—flows to the L1 validators rather than to the rollup itself. This diversion of revenue can undermine the economic sustainability of the rollup.
  - Reduced decentralization in practice: To address the incentive misalignment, some Base rollup designs introduce an execution ticket mechanism.  In this system, (i) L1 validators can choose to participate in sequencing for the rollup by purchasing execution tickets and (ii) only the validators who opt-in and run the necessary software become part of the rollup's sequencer set. This approach means that the rollup does not utilize the entire L1 validator set but instead relies on a subset of validators. Consequently, the rollup's censorship resistance and liveness are tied to this smaller group, reducing the decentralization benefits that were initially sought.
  - Increased complexity and operational overhead: L1 validators must operate additional nodes or software components to handle L2 sequencing tasks. Participation may involve purchasing and managing execution tickets, adding to the operational burden. Sequencing L2 transactions may require processing and storing more data, potentially increasing resource requirements.
- Economic and security implications: The dependence on a subset of L1 validators who have economic incentives tied to both the L1 and L2 layers introduces complex dynamics:
  - Incentive compatibility: L1 Validators may prioritize activities that maximize their revenue on the L1 chain, potentially neglecting optimal sequencing on the L2 rollup.
  - Security risks: If the subset of L1 validators is small, the network may become vulnerable to collusion or attacks that could compromise the rollup's integrity.


### Incentives and Challenges for Dapps

**Desire for isolated fee markets**

One of the primary incentives for Dapps is the control over their own fee markets. Applications often prefer isolated fee markets to:

- Prevent congestion spillover: Avoid being affected by unrelated spikes in network activity that could increase transaction fees for their users.
- Maintain predictable costs: Ensure that transaction fees remain stable and predictable and aligned with the value provided by the application.


In a shared sequencing environment, fee markets can become merged. This merging means that high demand in one application can lead to increased fees across all applications sharing the sequencer. For example, if a popular game on a shared chain experiences a surge in activity, it could inadvertently raise transaction costs for a DEX operating on the same chain.

**Capturing execution revenue and MEV** 

Dapps are increasingly interested in capturing a portion of the execution revenue and MEV generated by their platforms. In the context of rollups, Dapps are looking for two main things:

- MEV Leakage: Without control over sequencing, external entities can extract MEV, reducing the revenue potential for the dApp itself.
- Desire for revenue sharing: Dapps seek mechanisms to receive a share of the fees and MEV generated by their users' transactions or their user's interactions with the applications.


Shared sequencing complicates this revenue capture because:

- Fee redistribution is complex: Distributing fees and MEV back to individual applications in a fair and enforceable manner is challenging.
- Incentive misalignment: Sequencers in a shared environment may prioritize their own revenue over the interests of specific Dapps or users.

### Application-Specific Sequencing as an Alternative
To address these challenges, some applications are exploring application-specific sequencing. This model involves:

- Dedicated sequencers: The application runs its own sequencer or has greater control over the sequencing process.
- Custom fee structures: Ability to implement custom fee mechanisms that align with the application's economic model.
- Direct revenue capture: Enhanced capability to retain fees and MEV within the application.

By controlling sequencing, Dapps can:

- Mitigate MEV risks: Reduce unwanted MEV extraction by external parties.
- Optimize user experience: Provide more predictable and stable transaction fees to users.
- Align incentives: Ensure that sequencer behavior is directly aligned with the application's goals.
- Offer protection from external congestion: The application is insulated from network congestion caused by unrelated activities on other platforms.

By customizing the sequencing infrastructure, applications can achieve:

- Higher throughput: Optimize for the specific transaction patterns and volumes of the application.
- Lower latency: Reduce delays by fine-tuning the sequencing process to the application's needs.
- Specialized features: Implement custom functionalities, such as local fee markets, MEV redistribution, advanced cryptographic techniques or state access optimizations.


## Application-Specific Sequencing Frameworks

The design space for Application-Specific Sequencing is very vast. In this article we will review two such frameworks:
- Fastlane's composability VS value capture trade off framework
- Astria's infrastructure options framework



### Fastlane' ASS Framework

![Fastlane's ASS framework](/assets/images/20240901/ASS-Spectrum-MEV-composability-landscape.jpg)
_Figure: Fastlane's ASS framework, source: Fastlane


Fastlane's ASS Spectrum framework provides a nuanced perspective on the balance of optimizing both composability and value capture, illustrating how different sequencing approaches impact an application's ability to interact with others (composability) and to internalize value (such as MEV). So, lets unpack the details of Fastlane's framework, exploring the trade-offs inherent in various ASS strategies and examining specific use cases that exemplify these concepts.

Before diving into the framework, it's important to understand the fundamental elements at play in teh framework:

- Composability: The degree to which a dApp can interact with other applications within the blockchain network. High composability enables seamless integration and atomic transactions involving multiple Dapps.
- Value capture: The ability of a dApp to internalize value generated within its operations, particularly MEV. This includes profits from transaction ordering, arbitrage opportunities, and other forms of value that can be extracted from the transaction flow.

#### High composability end of the spectrum

At this end, Dapps are designed to maximize interaction with other applications, encouraging a highly interconnected ecosystem.

**Bidirectional, Full Execution**

- Characteristics: Dapps can both call and be called by other applications on the same blockchain or rollup. Transactions are executed atomically, ensuring that complex multi-dApp operations either occur entirely or not at all.

- Advantages:
  - Seamless integration: Users can interact with multiple Dapps in a single transaction.
  - Shared liquidity and resources: Access to broader pools of assets and functionalities.
  - Enhanced user experience: Simplifies complex operations, reducing friction.

- Trade-Offs:
  - Limited control over sequencing: Dapps relinquish some control over transaction ordering, potentially exposing them to MEV extraction by external actors.
  - Value leakage: Profits from MEV opportunities may not be internalized, reducing potential revenue.

**Unidirectional, Full Execution**

- Characteristics: Dapps can initiate calls to other applications but may not be callable in the same manner.

- Advantages:
  - Controlled interactions: Maintains some level of composability while allowing Dapps to manage outgoing calls.
  - Reduced exposure: Slightly more control over sequencing compared to bidirectional execution.

- Trade-Offs:
  - Partial Composability: Limited in how other Dapps can interact, potentially reducing integration opportunities.
  - Continued value leakage: External MEV extraction remains a concern.

#### Middle of the spectrum: Reduced Composability

Here, Dapps begin to limit their interactions with others to specific phases or conditions.

**Limited Callouts**

- Characteristics: Dapps can interact with others during defined phases, such as intake or settlement periods. This interaction is unidirectional and not necessarily atomic.

- Advantages:
  - Increased control: Greater ability to manage transaction sequencing within the dApp.
  - Targeted Composability: Interactions are strategic, occurring when most beneficial.

- Trade-Offs:
  - Reduced flexibility: Users may need to perform multiple transactions to achieve complex operations.
  - Potential user friction: Less seamless experience compared to full composability.

#### Low composability end of the spectrum

At this end, Dapps focus on internalizing value and optimizing operations, often at the expense of interacting with other applications.

**No Direct Calls, Consensus-Level Solutions**

- Characteristics: Dapps rely on protocol-level mechanisms rather than direct interactions with other applications. Composability is achieved through consensus processes, which may be less efficient.

- Advantages**:
  - Maximum control over sequencing: Dapps can fully manage transaction ordering, internalizing MEV.
  - Enhanced security: Reduced exposure to external manipulation and MEV extraction.

- Trade-Offs:
  - Limited interoperability: Difficulty in integrating with other Dapps, potentially isolating the application.
  - User experience challenges: May require users to navigate additional steps or processes.



### Astria' ASS Framework



## Application-Specific Sequencing - Current Landscape

### Fastlane


### Sorella


### Vertex


### Semantic 


### Astria


### Penumbra


## References

Sorella Labs https://www.youtube.com/watch?v=fw5Qu400ySY
https://x.com/ThogardPvP/status/1829331564029005924
App Specific Sequencing Infrastructure Tradeoffs - Lily Johnson  https://www.youtube.com/watch?v=lLR_6tnKL2I 
