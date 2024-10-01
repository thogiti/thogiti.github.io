---
title:  A Deep Dive into Application Specific Sequencing
tags: Ethereum Rollups Application-Specific-Sequencing app-sequencing shared-sequencing decentralized-sequencing shared-sequencing-marketplaces shared-sequencing-mechanism-design shared-sequencing-auctions
---

## Introduction

As blockchain technology matures, decentralized applications (Dapps) face increasing challenges in managing transaction sequencing to optimize user experience, value retention, and security. Traditional blockchain architectures often leave Dapps at the mercy of external actors—such as miners, validators, MEV (Miner Extractable Value) extractors and rollup sequencers—who control transaction ordering and inclusion. This lack of control can lead to value leakage, unfair user outcomes, and vulnerabilities to malicious behaviors like frontrunning or sandwich attacks.

Application-Specific Sequencing (ASS) emerges as an important shift, granting Dapps greater control over the inclusion and ordering of transactions affecting their state. By customizing sequencing mechanisms to their specific needs, Dapps can mitigate negative externalities, internalize value, and enhance overall system efficiency. However, implementing ASS introduces complex trade-offs, particularly between composability and value capture, and raises critical questions about infrastructure design, incentive structures, and the expansive design space.

This article explores the details of ASS, synthesizing insights from current projects and exploring the relationships and trade-offs inherent in this design space. I aim to provide a comprehensive view for researchers and developers to further investigate and optimize ASS mechanisms.

Before we get deep into the application specific sequencing, let us briefly understand the fundamental concepts around sequencing and the vast design spectrum of sequencing, decentralized sequencing and shared sequencing.

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

MEV extraction often comes at the expense of users and LPs of passive AMMs (or users who are providing liquidity at stale prices), leading to value leakage from the dApp ecosystem and undermining user trust.

### What is Sequencing in Rollups?
Sequencing refers to the process of ordering transactions before they are executed and committed to the blockchain. In rollups, a sequencer is responsible for:

- Ordering transactions: Determining the sequence in which transactions are processed.
- Batching transactions: Grouping multiple transactions into batches to be posted to the main chain (Layer 1).
- Improving performance: Enhancing throughput and reducing latency by efficiently managing transaction flow.

### Centralized Sequencing
- Definition: A single entity or a tightly controlled group manages the sequencing process.
- Advantages:
 - High performance: Reduced coordination overhead leads to consensus overhead.
 - Simplicity: Easier to implement and maintain.
- Special preferences: Can enforce sequencer operator's preference of transaction ordering that can prevent MEV extraction (FCFS).
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
- Centralization risks: Execution Tickets and Execution Auctions dramatically increase centralization in the market for block proposals, even without multi-block MEV concerns.

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
- Definition: In Based Sequencing, L2 rollup transactions are sequenced by the L1 blockchain’s validators or proposers. L1 validators handle both L1 block proposals and L2 transaction sequencing.
  
- Advantages:
  - Leverage L1 security: Uses L1’s existing security and decentralization for the rollup.
  - Censorship resistance: Sequencing is distributed across L1 validators, reducing censorship risk.
  - Liveness: Inherits L1 liveness, ensuring consistent transaction processing.
  - Security: Benefits from the economic security of L1 validators.
  - Atomic composability: Enables cross-layer composability between L1 and L2.

- Disadvantages**:
  - Incentive misalignment: Revenue from fees and MEV flows to L1, not the rollup.
  - Reduced decentralization: Only a subset of validators may opt into sequencing, weakening decentralization.
  - Complexity: L1 validators must run additional software, increasing operational overhead.

- Risks**:
  - Incentive conflicts: Validators may prioritize L1 revenue over optimal L2 sequencing.
  - Security vulnerabilities: A smaller validator subset increases the risk of collusion or attacks.


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
- Custom ordering logic: A transaction ordering solution using decentralized oracle networks (DON) to mitigate the detrimental effects of MEV, like Themis [].

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

Sorella Labs is pioneering an innovative approach to these MEV challenges with Angstrom, a fully permissionless hook that introduces Application Specific Sequencing as a service. By treating LPs and uninformed swappers as first-class citizens, Angstrom redirects value from builders and proposers—who traditionally benefit from MEV—back to the parties adversely affected by MEV extraction. Central to this vision is the implementation of Application Specific Sequencing, empowering dApps to control their transaction ordering and state management independently.

#### The Mechanics of MEV

As you already know that MEV arises from the ability of miners or validators or block builders to manipulate transaction ordering within a block for profit. Two prevalent forms of MEV extraction are:

**Sandwich Attacks**

A sandwich attack involves an attacker front-running and back-running a user's transaction on a DEX:

- Frontrun: The attacker observes a pending large buy order and places their own buy order ahead of it, increasing the asset's price.
- User's transaction: The user's transaction executes at a higher price due to the attacker's prior purchase.
- Back run: The attacker sells the asset immediately after the user's transaction, profiting from the price difference.
- Impact: The user experiences slippage, receiving fewer assets than expected, while the attacker profits from the price manipulation.

**Just-In-Time (JIT) Arbitrage (CEX-DEX Arbitrage)**

JIT arbitrage exploits price discrepancies between CEXs and DEXs:

- Price movement on CEX: A significant trade on a CEX moves the price of an asset.
- Information asymmetry: There's a delay before this price change is reflected on-chain.
- Arbitrage opportunity: Arbitrageurs quickly trade on the DEX at stale prices before the on-chain price updates, profiting from the discrepancy.
- Impact: Liquidity providers on the DEX incur LVR, as they provide liquidity at unfavorable prices, effectively subsidizing the arbitrageurs' profits.

#### The LP Dilemma

LPs provide liquidity to DEXs, enabling users to trade assets. However, they often face:

- Adverse selection: LPs are unaware of real-time CEX prices and provide quotes that may be stale, making them vulnerable to arbitrage.
- LVR losses: LPs incur losses when arbitrageurs exploit price discrepancies between the DEX and CEX.

#### The Attribution Problem in MEV

The attribution problem refers to the difficulty in identifying the specific parties affected by MEV extraction and ensuring they are appropriately compensated. Current blockchain architectures lack the granularity to:

- Trace MEV sources: Pinpoint which users or LPs are adversely affected.
- Redistribute value fairly: Allocate MEV profits back to those who incurred losses.

- Consequences:

 - Misaligned incentives: Users inadvertently fund the MEV extraction mechanisms through fees, even as they are victimized by them.
 - Centralization: MEV profits concentrate among sophisticated actors (searchers, builders, proposers), leading to centralization of power and resources.
 - User distrust: Persistent exploitation can erode user confidence in DeFi platforms.

### Sorella's Vision: Sovereign Applications and Application-Specific Sequencing

To address these challenges, Sorella Labs advocates for the development of sovereign applications that are both attributable and sovereign, utilizing application-specific sequencing to enhance control and fairness.

#### Attributable Applications

Definition: Applications capable of uniquely identifying all participating entities and their strategies, allowing for precise value attribution and redistribution based on the outcomes of their interactions.

**Key Characteristics**:

- Granular control: Ability to monitor and record individual actions within the application.
- Fair redistribution: Mechanisms to compensate adversely affected parties, such as users and LPs.

Here are some Examples:

- Uniform Clearing Batch Auctions:

  - Mechanism: Aggregates all buy and sell orders within a time interval and executes them at a single, uniform clearing price.
  - Benefits:
    - Eliminates price slippage for users.
    - Reduces MEV opportunities by preventing front-running and sandwich attacks.
    - Encourages competitive pricing from market makers.

- MEV Taxes:

  - Mechanism: Imposes a tax on transaction priority fees paid by actors seeking favorable ordering (e.g., front-runners).
  - Redistribution: Collected taxes are redistributed to the adversely affected parties, such as LPs or users who experienced slippage.
  - Outcome: Deters malicious ordering practices and compensates victims of MEV extraction.

#### Sovereign Applications

Definition: Applications that maintain exclusive control over their state and transaction ordering, preventing external entities from interfering or composing transactions with them.

Key Characteristics:

- State isolation: The application's state is locked and cannot be accessed or modified by external transactions during execution.
- Non-composability: Transactions within the application cannot be atomically composed with transactions from other applications.
- Internal ordering control: The application dictates the ordering of transactions according to its own rules and logic.

Layer 2 Solutions like rollups are sovereign in that they process transactions independently before committing a batch to the main chain.


#### Overview of Angstrom

Angstrom from Sorella is a fully permissionless hook designed to:

- Treat LPs and uninformed swappers as first-class citizens: Redirecting value back to those adversely affected by MEV.
- Implement Application Specific Sequencing: Allowing the DEX to be agnostic to block position and transaction ordering.
- Create a market for LVR: Enabling LPs to recover losses from adverse selection.

#### How Angstrom Addresses the LP Dilemma and MEV Problems

- **Competitive LVR Auctions**: Searchers compete in permissionless auctions to capture CEX-DEX arbitrage opportunities, with the value directed back to LPs.
- **Batch Auction Mechanism**: Offers swappers reliable settlement guarantees at a uniform clearing price, ensuring MEV protection.
- **Integration of Searchers**: Sophisticated players who previously profited at LPs' expense now compete to provide value back to LPs.

#### How Angstrom Works

**Players and Incentives**

- Liquidity Providers (LPs):

  - Role: Provide liquidity to the DEX.
  - Incentives:
    - Repayment of LVR losses: LPs are compensated for adverse selection.
    - Trading fees: Earn fees from uninformed flow and searcher limit orders.
    - Composable liquidity positions: Ability to create custom tick ranges and utilize concentrated liquidity features.

- Swappers:

- Role: Users who execute trades on the DEX.
- Incentives:
  - Guaranteed execution: Transactions execute at specified limit prices or better.
  - Lower gas fees: More efficient transaction processing.
  - Complete MEV protection: Atomic transaction structure prevents MEV exploitation.
  - Execution near true price: Trades execute close to the centralized exchange price.

- Searchers:

  - Role: Arbitrageurs and sophisticated traders.
  - Incentives:
    - Access to arbitrage opportunities: Continue extracting CEX-DEX arbitrage profits without paying excessive bribes to builders.
    - Compete to fill large orders: Provide better execution prices for large user orders.
    - Contribute to LP compensation: Their bids in the LVR auction redirect value back to LPs.

- Angstrom Nodes:

  - Role: Nodes that construct optimal bundles and determine auction winners.
  - Incentives:
    - Earn protocol fees: Receive rewards for staking and running the node.
    - Participate in a decentralized network: Contribute to the network's censorship resistance and efficiency.

**The LVR Auction Mechanism**

The LVR auction ensures:

- Competitive bidding: searchers compete to capture arbitrage opportunities, bidding value back to LPs.
- Guaranteed arbitrage opportunities: Construction of the DEX ensures arbitrage exists in every block when there's a price delta.
- Repayment to LPs: The value extracted from arbitrage is redirected to compensate LPs for their losses.

**Settlement Timeline**

1. Order submission: Users send swap orders via the Angstrom frontend or compatible interfaces.
2. Transaction relay: Orders are relayed to Angstrom nodes' specialized mempools.
3. Deterministic settlement: Nodes deterministically settle transactions at a uniform clearing price.
4. Searcher participation: Searchers submit their arbitrage transactions and bids to the Angstrom network.
5. Bundle construction: Angstrom nodes construct the optimal bundle, including user and searcher orders.
6. Bundle inclusion: The builder includes the bundle in the block, often with minimal fees due to the bundle's block position agnosticism.
7. Trade settlement: Users' and searchers' trades are settled, completing the transaction cycle.

**Bundle Exclusivity and Preventing Value Leakage**

- Exclusive bundles: Angstrom's atomic bundles are executed in a specific order, making them agnostic to their position within a block.
- Preventing value leakage: This structure eliminates the need for searchers to pay large bribes to builders and proposers, ensuring that value is directed back to LPs and users.
- Censorship resistance: By reducing the economic incentives for builders and proposers to censor transactions, Angstrom promotes a more decentralized and fair network.

#### Technical Details

**Ensuring Existence of CEX-DEX Arbitrage Opportunities**

- Guaranteed arbitrage: Angstrom's construction ensures that arbitrage opportunities exist whenever there's a price delta between the DEX and CEX.
- Searchers' strategy: Searchers can always profit from small price movements, ensuring continuous competition and value redirection to LPs.
- Competitive auctions: Searchers' bids in the LVR auction converge to the value of the arbitrage opportunity minus their costs, maximizing LP compensation.

**Limit Orders and Uniform Clearing Price**

- Transient limit orders: Both users and searchers submit transient limit orders that are partially fillable and last one block.
- Uniform clearing price: Orders are executed at a single price that clears the market, minimizing slippage and ensuring fair execution.
- Benefits:
  - Prevents market order attacks: Mitigates the risk of searchers exploiting large user orders.
  - Enhances user execution quality: Searchers compete to offer the best prices, improving outcomes for users.

**Market Order Attack Vector and Solution**

- Attack vector: In a market-order-only system, searchers could manipulate execution prices by immediately matching large user orders and moving the price unfavorably.
- Solution: Implementing transient limit orders and a uniform clearing price prevents this by ensuring all orders are executed fairly, regardless of submission timing.

**Uniform Clearing Price: In-Depth Overview**

- Mechanism: The intersection of supply and demand curves from limit orders and underlying pool liquidity determines the clearing price.
- Result:
  - Fairness: All participants transact at the same price.
  - Incentivizes competition: Market makers and searchers compete to improve the clearing price.

#### Angstrom Network Architecture

**Overview of Angstrom Network and Nodes**

- Angstrom network: A decentralized transaction ordering network aligning the incentives of searchers, swappers, and LPs.
- Angstrom nodes:
  - Role: Gossip, cache, verify orders, and construct optimal bundles.
  - Operation: Run a lightweight sidecar module to the Rust Ethereum execution client (Reth).
  - Staking: Operators stake $STROM tokens and restaked ETH via EigenLayer to participate and secure the network.

**Bundle Lifecycle**

- Gossip Phase:
   - Nodes broadcast valid orders across the network.
   - Ensure all nodes share the same view of incoming orders.

- Pre-Proposal Phase:
   - Nodes form a global view by combining orders received.
   - Sign and send their views to the leader node.

- Submit Phase:
   - The leader constructs the final bundle from at least 2/3+1 of the signed views.
   - The bundle is submitted to block builders for inclusion.

**Protocol Incentives and Tokenomics**

- Incentive Design:
  - Competition among searchers: Drives the value back to LPs.
  - Node rewards: Nodes earn $STROM tokens and protocol fees for their participation.
- Slashing Mechanisms:
  - Ensuring honest behavior: Nodes can be slashed for submitting suboptimal bundles or dishonest actions.
  - Redistribution: Slashed funds are redistributed to affected parties.

#### Benefits and Impact

**Democratizing Arbitrage and Curtailing Censorship**

- Empowering neutral builders: By moving CEX-DEX arbitrage auctions to the application layer, Angstrom reduces the undue influence of HFT builders.
- Reducing economic incentives for censorship: The diminished need for large bribes to builders and proposers makes censorship less economically viable.
- Encouraging a competitive landscape: Opens block building to a more diverse set of participants, promoting decentralization.

**Neutralizing Proposer Timing Games**

- Eliminating timing advantages: The bundle's block position agnosticism removes the incentive for proposers to strategically delay actions.
- Simplifying consensus: Reduces unnecessary latency and complexity in block production.

**Benefits for Stakeholders**

- Liquidity Providers

  - Fair compensation: Recover losses from adverse selection through LVR auctions.
  - Incentivized participation: Increased rewards encourage more liquidity provision.

 - Swappers

  - Guaranteed execution: Fair prices and reduced slippage.
  - MEV protection: Transactions are protected from exploitation.

- Searchers

  - Continued profit opportunities: Access to arbitrage without excessive bribes.
  - Competitive fairness: Level playing field encourages innovation and efficiency.

- Angstrom Nodes

  - Economic rewards: Earn tokens and fees for participating in the network.
  - Contribute to decentralization: Help build a censorship-resistant transaction ordering network.


### Vertex

#### Overview

Vertex Protocol is a vertically integrated DEX that unifies spot trading, perpetual futures, and money market operations into a single platform. Deployed on Arbitrum, Vertex combines a central limit order book (CLOB) with an integrated AMM to offer a hybrid liquidity solution. This design enhances trading efficiency and capital utilization, providing users with:

- Lightning-fast performance: Achieving order-matching latency between 5 to 15 milliseconds, rivaling top-tier CEXs.
- Universal cross-margining: Allowing users to manage multiple positions across different markets from a single account.
- Self-custody: Ensuring users retain control over their assets through a non-custodial architecture.
- Application-Specific Sequencing: Utilizing an off-chain sequencer to optimize performance and minimize MEV risks.

#### Challenges in DeFi Trading

Despite the advantages of decentralization, DeFi platforms face several obstacles:

- High latency: On-chain order matching leads to slower trade execution.
- Fragmented liquidity: Isolated liquidity pools across different platforms and chains.
- Poor user experience: Complex interfaces and lack of advanced trading features.
- Capital inefficiency: Isolated margin accounts increase collateral requirements.
- MEV vulnerabilities: On-chain transactions are susceptible to front-running and sandwich attacks.

Vertex Protocol addresses these challenges through its innovative architecture and design choices.


#### The Hybrid Liquidity Model

At the core of Vertex's innovation is its hybrid liquidity model, which combines the strengths of a CLOB with an integrated AMM. The CLOB operates off-chain through an application-specific sequencer known as the Vertex Sequencer. This off-chain operation enables high-speed order matching with latency comparable to top-tier CEXs, aggregating liquidity from both manual traders and automated strategies via APIs.

The integrated AMM, deployed on-chain within Arbitrum's smart contracts, acts as a fallback mechanism—termed "Slo-Mo Mode"—ensuring continuous operation even if the off-chain sequencer encounters issues. The AMM provides baseline liquidity and functions as an additional market maker, enhancing the depth of the order book.

By combining these two models, Vertex offers enhanced liquidity utilization. The hybrid approach allows for flexibility, catering to different trading strategies and user preferences. It ensures resilience by maintaining on-chain liquidity provision through the AMM, even when the off-chain components are not accessible.

#### Application-Specific Sequencing

The Vertex Sequencer plays a pivotal role in achieving high-performance trading while preserving the principles of decentralization. Operating off-chain, the sequencer handles order intake, matching, and execution. It achieves order-matching latency between 5 to 15 milliseconds, enabling real-time trading experiences that are essential for high-frequency traders and market makers.

The sequencer maintains synchronization with the on-chain state by regularly committing batches of transactions to the Arbitrum network. This batching reduces the frequency of on-chain transactions, lowering gas costs for users. By handling the majority of operations off-chain, the sequencer minimizes MEV exposure. Front-running and sandwich attacks, common in on-chain DEXs, become significantly more difficult to execute against Vertex's architecture.

Technically, the sequencer nodes run a custom implementation of the EVM in Rust, optimized for parallel processing and high throughput. The state management employs a sharded approach, allowing the sequencer to handle multiple chains concurrently in the Vertex Edge extension.

#### Universal Cross-Margining

Vertex introduces a universal cross-margining system that enhances capital efficiency for traders. Users manage all positions and balances from a single trading account, allowing them to offset positions across different markets. This approach reduces the total margin required, enabling traders to take larger positions or diversify their strategies without additional capital.

Automatic portfolio health calculations help users maintain adequate margin levels, providing real-time insights into their risk exposure. This system supports complex trading strategies like basis trades and hedging, offering greater strategic flexibility. By sharing collateral across positions, users can optimize their capital usage and enhance potential returns.

Mathematically, the portfolio margin is calculated as the sum of each position's size multiplied by its price and a risk factor. The available margin is determined by subtracting the portfolio margin from the total collateral. This formula ensures that the risk associated with each position is appropriately accounted for, maintaining the integrity of the trading system.

#### Vertex Edge: Synchronous Cross-Chain Liquidity

Vertex Edge is an extension of the protocol that unifies liquidity across different blockchain networks, addressing the issue of liquidity fragmentation. By connecting various Vertex instances on multiple chains, such as Arbitrum, Blast, Sui, and Mantle, Vertex Edge aggregates liquidity pools into a single, synchronous order book.

The Vertex Sequencer operates across these chains, sharing liquidity through a sharded state approach. Orders from one chain are cloned and matched against liquidity from all supported chains. This means that a user on one chain can trade against the combined liquidity of multiple chains without the need to switch networks or bridge assets.

Trades are settled on the user's origin chain, maintaining network activity and security. For example, if Alice on Chain A wants to buy ETH and Bob on Chain B wants to sell ETH, the Vertex Sequencer matches their orders. Alice receives ETH on Chain A, and Bob receives payment on Chain B, with the sequencer balancing positions across chains to maintain neutrality.

**Impact on Core Products**

Vertex Edge enhances the core products of the platform in several ways:

- Spot trading: Users can trade native assets across different chains without bridging. The unified order book provides enhanced market depth and reduces slippage, improving the trading experience.

- Perpetual futures: Interchain funding rates are standardized, preventing arbitrage discrepancies and enabling efficient basis trading opportunities. Traders can exploit price differences across chains more effectively.

- Money markets: Multi-chain collateral support allows users to deposit collateral on one chain and borrow on another. Unified interest rates across chains optimize capital allocation, ensuring that passive capital receives optimized yields while traders benefit from cheap loans.

**Technical Challenges and Solutions**

Latency and synchronization are critical challenges in cross-chain operations. The sequencer's architecture ensures minimal latency despite handling operations across multiple chains. Security considerations are addressed through local settlement and robust risk management protocols, mitigating cross-chain risks associated with asset transfers and transaction finality.

#### Capturing Value for Users

Vertex Protocol captures value for users through several key mechanisms:

- Performance: High-speed trading improves execution quality, reducing the likelihood of slippage and unfavorable price movements.
- Capital efficiency: Universal cross-margining lowers collateral requirements, allowing users to deploy their capital more effectively.
- Cost savings: Reduced gas fees and minimized MEV exposure enhance net returns for traders.
- Access to liquidity: Vertex Edge provides deeper liquidity pools by aggregating across chains, reducing market impact for large trades.
- Flexibility: Integrated services reduce the need to navigate multiple platforms, streamlining the user experience and simplifying complex strategies.

Quantitatively, users benefit from reduced slippage due to aggregated liquidity, higher leverage opportunities through efficient margining, and optimized yields on idle assets via the integrated money markets.

#### Alignment Between Protocol and Base Layers

Vertex Protocol aligns incentives between the application layer and the underlying base layer networks. By settling all trades on the user's origin chain, Vertex increases network activity and blockspace demand, benefiting miners and validators. This approach avoids the liquidity drain often associated with DEXs built on application-specific chains that siphon activity away from general-purpose base layers.

Vertex Edge fosters a positive-sum relationship among connected networks. Increased usage on one chain benefits others through shared liquidity and activity, promoting collaborative growth rather than competition for liquidity and users. This alignment ensures that the success of the protocol translates to success for the base layers, strengthening the overall ecosystem.


### Semantic Layer

Semantic Layer's approach to Application-Specific Sequencing centers around enabling dApps to implement Verifiable Sequencing Rules (VSR) and Verifiable Aggregation Rules (VAR). VSRs are meta smart contracts that allow developers to specify how transactions interacting with their dApps should be ordered and executed, effectively giving them control over transaction sequencing. VARs define how transactions should be aggregated before execution, optimizing processing and enabling batch operations. 

By integrating VSR and VAR, Semantic Layer empowers dApps to observe user transactions before they are executed, enforce custom execution policies, and autonomously execute functions without relying on external triggers. This not only mitigates issues like MEV leakage and poor transaction readability but also opens the door for innovative dApp designs that can implement real-time circuit breakers, intercept malicious transactions, and achieve execution layer independence.



## References

- Sorella Labs https://www.youtube.com/watch?v=fw5Qu400ySY
- https://x.com/ThogardPvP/status/1829331564029005924
- https://github.com/FastLane-Labs/atlas/tree/main
- App Specific Sequencing Infrastructure Tradeoffs - Lily Johnson  https://www.youtube.com/watch?v=lLR_6tnKL2I
- https://ethereum-magicians.org/t/eip-7727-evm-transaction-bundles/20322
- Centralization in Attester-Proposer Separation, https://arxiv.org/abs/2408.03116
- https://www.youtube.com/watch?v=tHpAazIFDtQ 
- https://x.com/0x94305/status/1580169706413051904 
- https://chain.link/education-hub/maximal-extractable-value-mev 
- https://research.chain.link/whitepaper-v2.pdf
- https://blog.chain.link/chainlink-fair-sequencing-services-enabling-a-provably-fair-defi-ecosystem/
- https://docs.vertexprotocol.com/getting-started/vertex-edge 
- https://eprint.iacr.org/2021/1465
- https://www.youtube.com/watch?v=6jWf8zuBg2g

