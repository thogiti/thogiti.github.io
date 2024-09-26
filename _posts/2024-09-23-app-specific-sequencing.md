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
_Figure: Fastlane's ASS framework, source: Fastlane_


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

Transactions are segmented into phases:

- Intake Phase: $T_{\text{intake}}$
- Processing Phase: $T_{\text{process}}$
- Settlement Phase: $T_{\text{settle}}$

Interactions with other dApps occur only during $T_{\text{settle}}$.

#### Low composability end of the spectrum

At this end, Dapps focus on internalizing value and optimizing operations, often at the expense of interacting with other applications.

**No Direct Calls, Consensus-Level Solutions**

- Characteristics: Dapps rely on protocol-level mechanisms rather than direct interactions with other applications. Composability is achieved through consensus processes, which may be less efficient.

- Advantages:
  - Maximum control over sequencing: Dapps can fully manage transaction ordering, internalizing MEV.
  - Enhanced security: Reduced exposure to external manipulation and MEV extraction.

- Trade-Offs:
  - Limited interoperability: Difficulty in integrating with other Dapps, potentially isolating the application.
  - User experience challenges: May require users to navigate additional steps or processes.

#### Implications for Value Capture

As dApps move along the spectrum toward reduced composability, they gain increased capacity to internalize value.

**Internalizing Endogenous MEV**

- Definition: Capturing value generated within the dApp itself, such as profits from transaction sequencing that directly affect the application's operations.

- Mechanisms:
  - Backrunning: Executing transactions that capitalize on changes caused by prior transactions within the dApp.
  - Oracle extractable value (OEV): Profiting from timely access to updated external data sources (e.g., price feeds).

- Benefits:
  - Revenue generation: Directly increases the dApp's profitability.
  - User protection: Can be designed to mitigate negative impacts on users, such as frontrunning.

Mathematically, the dApp aims to maximize endogenous MEV:

$$\max_{\sigma} V_{\text{MEV}}^{\text{endo}}(\sigma)$$

where:

- $\sigma$ is the transaction sequencing.
- $V_{\text{MEV}}^{\text{endo}}$ represents endogenous MEV.

**Internalizing Exogenous MEV**

- Definition: Capturing value from actions not sequenced by the dApp, including opportunities arising from interactions with external markets or applications.

- Mechanisms:
  - Top-of-block arbitrage: Exploiting price discrepancies at the beginning of a block.
  - CEX-DEX arbitrage: Capitalizing on price differences between centralized and decentralized exchanges.

- Benefits:
  - Expanded profit sources: Access to a broader range of MEV opportunities.
  - Increased competitiveness: Ability to engage in strategies that external actors might otherwise exploit.

The dApp seeks to capture exogenous MEV:

$$V_{\text{MEV}}^{\text{exo}} = V_{\text{arbitrage}} + V_{\text{liquidation}} + \ldots$$


#### Gas Fee Reduction Strategies
Further along the spectrum, dApps can implement methods to reduce operational costs associated with gas fees.

**Partial Gas Fee Reduction**
- Approach:

  - Atomic viewing and locking: The dApp atomically locks the necessary state on the network.
  - Off-Network processing: Executes transactions in a separate domain.
  - Result settlement: Finalizes the outcome back on the main network.

- Advantages:

  - Cost savings: Reduces gas fees associated with on-chain execution.
  - Maintained security: Atomic locking ensures state consistency.

- Trade-Offs:

  - Complexity: Requires additional infrastructure and coordination.
  - Latency: Off-network processing may introduce delays.

**Significant Gas Fee Reduction and Full Integration**

- Approach:

  - Non-Atomic locking: Locks the state in a non-atomic manner, allowing for greater flexibility.
  - Off-Network Execution: Processes transactions entirely off-chain.
  - Result settlement: Settles outcomes back on the network, potentially batching multiple transactions.

Advantages:

  - Maximum cost efficiency: Significantly lowers gas expenses.
  - Operational efficiency: Optimizes resource usage.

- Trade-Offs:

  - Increased risk: Non-atomic operations may expose the dApp to state inconsistencies or security vulnerabilities.
  - Reduced transparency: Off-chain execution is less visible to users and auditors.

The goal is to minimize total gas costs:

$$\min_{C_{\text{gas}}} \left( C_{\text{on-chain}} + C_{\text{off-chain}} \right)$$


#### Specific Use Cases Illustrating the Spectrum

**Backrun Arbitrage and OEV**

- Context: dApps capture value from transaction sequences within their own operations, such as executing a trade immediately after a significant price-impacting transaction.

- Implementation:

  - Sequencing Control: The dApp orders transactions to position itself favorably.
  - User Protection: By internalizing MEV, the dApp can prevent external actors from extracting value at the users' expense.

- Benefits:

  - Enhanced Revenue: The dApp retains profits from MEV opportunities.
  - Improved User Experience: Reduces the likelihood of users being adversely affected by MEV extraction.
  - Position on Spectrum: Leans toward internalizing endogenous MEV while maintaining some composability.

- **Mathematical Formulation**

Expected value from backrun arbitrage:

$$E[V_{\text{backrun}}] = \sum_{i} P_{i} \cdot \Delta_{\text{price}, i} \cdot V_{\text{trade}, i}$$

where:

- $P_{i}$: Probability of a profitable backrun opportunity.
- $\Delta_{\text{price}, i}$: Price impact of transaction $i$.
- $V_{\text{trade}, i}$: Volume of the trade.


**Rollup-Based Solutions**

- Context: dApps leverage layer 2 solutions or app-specific chains to optimize performance and reduce costs.

- Implementation:

  - Custom Execution Environment: The dApp operates on a rollup or L2 tailored to its needs.
  - State Settlement: Periodically settles state back to the main network.

- Benefits:

  - Significant gas fee reduction: Offloads execution from the main chain, lowering costs.
  - Operational control: Gains extensive control over sequencing and execution parameters.

- Trade-Offs:

  - Isolation: Limited direct interaction with dApps on the main network.
  - Security considerations: Must ensure the security of the rollup or L2 environment.
  - Position on spectrum: Occupies the far end, prioritizing value capture and operational efficiency over composability.

- **Mathematical Considerations**

Cost reduction:


$$C_{\text{total}} = C_{\text{rollup}} + C_{\text{settlement}}$$

where $C_{\text{rollup}}$ is significantly less than $C_{\text{on-chain}}$ execution costs.

Security model requires ensuring:

$$P_{\text{security breach}} \ll \epsilon$$

where $\epsilon$ is an acceptably low probability threshold.


**Anti-LVR Auctions**

- LVR Explained: LPs suffer losses when arbitrageurs exploit stale prices in AMMs. LVR quantifies this loss compared to an optimally rebalanced portfolio.
- Objective: Implement mechanisms to mitigate LVR, protecting LPs from value extraction.

- Implementation

  - Auction mechanism: dApps conduct auctions to determine transaction ordering that minimizes LVR.
  - Smart Contract updates: Modifications are required to support auction logic and enforce sequencing rules.

- **Mathematical Formulation**

Minimizing LVR:

$$\min_{\sigma} L_{\text{LVR}}(\sigma)$$

where $L_{\text{LVR}}$ is the loss due to LVR, and $\sigma$ represents the sequencing strategy.

- **Model Components**

- **Price Discrepancy**:

   $$\Delta P = P_{\text{external}} - P_{\text{AMM}}$$
   
- **Arbitrage Volume**:
   
   $$Q_{\text{arb}} = f(\Delta P)$$
   
   Where $f$ is a function representing how arbitrage volume responds to price discrepancies.

- **LVR Calculation**:
   
   $$L_{\text{LVR}} = Q_{\text{arb}} \cdot \Delta P$$
   
- **Impact of Batching**:

   By batching, $\Delta P$ is reduced as the AMM's price is updated less frequently, and the clearing price better reflects $P_{\text{external}}$.


#### Strategic Considerations for dApp Developers
When evaluating where to position your applications on the ASS spectrum, developers must consider:

**Application Goals**

- User experience: Is seamless integration with other dApps essential for your users?
- Revenue objectives: How critical is internalizing MEV to your business model?
- Security priorities: Do you need heightened control over transaction sequencing to mitigate risks?

**Technical Constraints**

- Infrastructure availability: Are the necessary tools and platforms available to implement your desired sequencing strategy?
- Development resources: Do you have the expertise and capacity to build and maintain more complex sequencing mechanisms?

**Ecosystem Dynamics**

- Market expectations: How will your positioning affect user adoption and trust?
- Competitive landscape: Are other dApps offering similar features with different sequencing approaches?

**Regulatory and Compliance Factors**

- Transparency requirements: Off-chain execution and reduced composability may impact compliance obligations.
- Risk management: Consider potential vulnerabilities introduced by non-standard sequencing methods.


### Astria' ASS Framework



## Application-Specific Sequencing - Current Landscape

### Fastlane's Atlas Protocol

Fastlane's Atlas Protocol is a generalized execution abstraction designed to facilitate programmable MEV mitigation at the application layer. Atlas simplifies the deployment of custom Order Flow Auctions (OFAs), enabling developers to implement application-specific sequencing with greater ease and flexibility. By leveraging Execution Abstraction (EA), a subset of Account Abstraction (AA), Atlas replaces the need for certain guarantees from block builders, setting the way for permissionless order flow and decentralized MEV mitigation strategies across any EVM chain.

#### The Motivation Behind Atlas

**Challenges in DeFi Trade Execution**

DeFi has revolutionized financial services by providing decentralized alternatives to traditional finance. However, it faces significant challenges:

- Liquidity fragmentation: Liquidity is scattered across various platforms and protocols, making it difficult for users to achieve optimal trade execution.
- Complex transaction paths: Users often need to specify the full computational path of a transaction, which can lead to inefficiencies and errors.
- MEV exploitation: Users are vulnerable to MEV attacks like frontrunning and sandwich attacks, where malicious actors extract value by manipulating transaction ordering.

**Centralization Risks in Existing OFAs**

OFAs like UniswapX, 1inch Fusion, and CowSwap have gained traction by implementing MEV-aware execution. However, they present new challenges:

- Solver centralization: A few solvers dominate these platforms, leading to potential rent-seeking behavior and reduced competition.
- Opaque MEV supply chain: Centralization can lead to less transparency, increasing the risk of censorship and manipulation by block builders or validators.

**The Need for Default MEV Protection**

Current MEV protection solutions often require users to change their RPC endpoints, introducing:

- Security risks: Switching RPCs can expose users to malicious nodes.
- Trust assumptions: Users must place trust in new entities, which may not align with decentralization principles.

Atlas addresses these issues by enabling default MEV protection without requiring users to change their RPC settings, targeting unsophisticated users who need protection the most.

#### Atlas Architecture Overview

At its core, Atlas provides a modular and customizable framework that allows dApps to define their own transaction sequencing logic. The key components include:

- Atlas `EntryPoint` contract: The central smart contract that orchestrates the execution of user and solver operations.
- Atlas SDK: A software development kit that simplifies integration with the Atlas Protocol.
- Key roles: Originator, Auctioneer, Operations Relay (OR), Bundler, and Solver.
- Execution environment (EE): A secure environment for executing operations.
- atlETH: A wrapped ETH token used within Atlas for value transfer and gas fee management.
- DAppControl contracts (Atlas Modules): Customizable modules where developers define application-specific logic and parameters.

![Atlas Transaction Lifecycle](/assets/images/20240901/Atlas-transaction-lifecycle.png)

*Figure: A high-level overview of the Atlas transaction lifecycle. Source*

#### Key Roles in Atlas

**Originator**

- Role: Initiates the Atlas process by generating a `UserOperation`, an EIP-712 signed message representing the user's intent.
- Flexibility: Can be an end-user, smart contract, or any entity capable of verification by the Atlas `EntryPoint` contract.
- Impact: Sets the parameters and initial conditions for the transaction, influencing downstream execution.

**Auctioneer**

- Role: Aggregates `UserOperations` with `SolverOperations`, sorts them using a bid valuation function defined in the `DAppControl` module, and ensures the correct execution order.
- Assignment: Often the originator or a trusted entity designated by the application.
- Impact: Determines the priority of solver bids, directly affecting the transaction sequencing.

**Operations Relay (OR)**

- Role: Facilitates communication between originators, auctioneers, and solvers.
- Customization: Applications choose an OR based on their needs—prioritizing decentralization, latency, or privacy.
- Impact: Transmits operations efficiently while potentially mitigating frontrunning and censorship.

**Bundler**

- Role: Packages the full Atlas transaction and submits it to the network for inclusion in a block.
- Configurations:
  - Permissionless: Any entity can act as a bundler.
  - Designated: Specific, trusted entities or decentralized solutions handle bundling.
- Impact: Ensures transactions are included on-chain without altering the execution order, due to the `CallChainHash` mechanism.

**Solver**

- Role: Competes to provide the best execution for a given `UserOperation`, potentially capturing MEV for the benefit of users or applications.
- Impact: Enhances execution quality and efficiency by finding optimal transaction paths or backrun opportunities.

#### Technical Mechanisms Enabling Application-Specific Sequencing

**Atlas EntryPoint Contract**

The Atlas `EntryPoint` contract is the backbone of the protocol:

- Central coordination: Manages the execution flow of `UserOperations` and `SolverOperations`.
- Execution Abstraction: Uses Account Abstraction to allow applications to define custom execution logic.
- `CallChainHash` verification: Ensures the prescribed sequence of operations is preserved, preventing tampering by any intermediary.

**CallChainHash**

- Definition: A cryptographic hash representing the ordered sequence of operations in an Atlas transaction.
- Function: Guarantees the integrity and order of operations, making the transaction sequence immutable once signed.
- Generation: Created using the `getCallChainHash(SolverOperations[])` function and signed by the auctioneer.

**Execution Environment (EE)**

- Purpose: Provides a secure, trust-minimized environment for executing operations via `delegateCall`.
- Permit69: A specialized token permittance function that enhances security by verifying token transfer origins, preventing unauthorized transfers.
- Impact: Ensures that application-specific logic is executed securely and as intended.

**atlETH**

- Definition: A wrapped ETH token used within Atlas.
- Functions:
  - Gas fee escrow: Solvers pre-fund gas fees, ensuring they cover the cost of their operations.
  - Value transfer: Facilitates secure and efficient value transfer within transactions.
- Cross-operation flash loans: Enables complex financial operations by allowing temporary borrowing of atlETH within a transaction.

**Native Bundling**

- Concept: Aggregating multiple operations into a single transaction, leveraging AA to simplify execution and gas fee management.
- Benefits:
  - Permissionless execution: Removes dependency on block builders for transaction inclusion guarantees.
  - Atomicity: Ensures all operations execute as a unit, maintaining the integrity of the transaction sequence.
  - MEV mitigation: Allows applications to capture and redistribute MEV according to their own policies.

#### How Atlas Achieves Application-Specific Sequencing

Atlas empowers applications to control transaction sequencing through several mechanisms:

- Custom execution logic: Developers define execution parameters and sequencing rules in the `DAppControl` module.
- Immutable sequencing with allChainHash: The signed `CallChainHash` locks the sequence of operations, preventing any alterations.
- Execution Abstraction: Users submit intents rather than full transaction paths, allowing applications to interpret and execute as per their logic.
- Solver competition: Solvers submit `SolverOperations`, and applications decide their execution order based on custom bid valuation functions.
- Native bundling and atomic execution: Operations are bundled and executed atomically, ensuring adherence to the application's sequencing.
- Cross-chain compatibility: Atlas does not rely on specific block builder guarantees, making it adaptable to any EVM-compatible chain.

#### Handling MEV and Backrun Auctions

**Intent-Centric Auctions**

- Process: Users submit intents (desired outcomes), and solvers compete to fulfill them efficiently.
- MEV Capture: Potential MEV generated is captured and can be shared with users or allocated according to application policies.
- Application Control: Full control over how intents are processed and how value is distributed.

**Backrun Auctions**

- Process: Users specify full transaction paths, and solvers attach backruns to extract MEV.
- Integration: The backrun is natively included in the transaction, ensuring users benefit from MEV capture.
- Application Control: Applications define the conditions and parameters for backruns, including value allocation.

#### Security and Trust Minimization

**Permit69 and Execution Environment**

- Enhanced security: Permit69 prevents unauthorized token transfers by verifying the source of transfer requests within the EE.
- `DelegateCall` Execution: Ensures that operations affect the intended contracts and adhere to application logic.

**Solver Accountability with atlETH**

- Gas fee coverage: Solvers escrow atlETH to cover gas fees, preventing them from imposing costs on others if their operations fail.
- Spam prevention: Limits solvers to one operation per block per address and requires sufficient atlETH balance.

**Trust Minimization Strategies**

- Immutable Sequencing: CallChainHash prevents bundlers or validators from altering the transaction sequence.
- Permissionless solvers: Encourages a decentralized solver market, reducing the risk of centralization.
- Simplified bundler role: Bundlers cannot interfere with execution order, minimizing the trust required in them.

#### Gas Costs and Efficiency Considerations

While Atlas introduces additional gas costs due to its checks and verifications, these are often offset by the benefits:

- Solver responsibility: Solvers typically absorb extra gas costs as they benefit from successful executions.
- Cost-Benefit analysis: Applications can assess whether MEV capture and improved execution justify the additional costs.
- Fallback options: If no solver accepts the gas cost, users can proceed with standard transactions outside of Atlas.

#### Integration Steps for Applications

Integrating Atlas into an application involves three steps:

1. Embed the Atlas SDK: Incorporate the SDK into the application's interface to interact with Atlas.
2. Create and publish a DAppControl module: Define custom logic, hooks, and parameters in a smart contract specific to the application.
3. Initialize the DAppControl contract: Interact with the Atlas EntryPoint contract to link the module and configure settings.

**DAppControl Modules and Hooks**

- BidFormat: Specifies the currencies accepted in bids.
- BidValue: Defines how bids are evaluated and ranked.
- AllocateValue: Determines how captured MEV is distributed.
- Hooks:
  - PreOps: Executes before the user's operation.
  - PreSolver: Executes before each solver's operation.
  - PostSolver: Executes after a solver's operation.
  - PostOps: Executes after all solver operations and value allocation.

#### Practical Example: Fastlane Online On-Chain Flow

Consider a user initiating a token swap using Atlas:

1. Token Permit: The user approves the FastLaneControl contract to transfer tokens.
2. Solver Registration: Solvers register their **SolverOperations** with the **FastLaneControl**.
3. Swap Initiation: The user calls the `fastOnlineSwap(UserOperation)` function.
4. Token Transfer: Tokens are moved from the user to the control contract.
5. Atlas Metacall: The `FastLaneControl` calls `metacall(Bundle)` on the Atlas contract.
6. Execution Sequence:
   - The Execution Environment processes the `UserOperation`.
   - Solvers' operations are attempted in order, based on bids.
   - If a solver succeeds, tokens are exchanged accordingly.
7. Value allocation: The `allocateValue` function distributes any captured MEV as defined by the application.
8. Fallback mechanism: If all solvers fail, a baseline swap can be executed using the `PostOps` hook.
9. Completion: The user receives the desired tokens, and the transaction concludes successfully.

![Fastlane Online On-Chain Flow](/assets/images/20240901/fastlane-online-onchain.png)

*Figure: A detailed flowchart illustrating the on-chain transaction process using Atlas. Source[]*


### Sorella


### EIP-7727 


### Vertex


### Semantic 


### Astria


### Penumbra



## References

Sorella Labs https://www.youtube.com/watch?v=fw5Qu400ySY
https://x.com/ThogardPvP/status/1829331564029005924
https://github.com/FastLane-Labs/atlas/tree/main
App Specific Sequencing Infrastructure Tradeoffs - Lily Johnson  https://www.youtube.com/watch?v=lLR_6tnKL2I 
https://ethereum-magicians.org/t/eip-7727-evm-transaction-bundles/20322

