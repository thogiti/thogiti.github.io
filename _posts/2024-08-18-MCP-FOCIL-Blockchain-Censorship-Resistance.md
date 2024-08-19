---
title: 	How MCP and FOCIL Could Transform Blockchain Censorship Resistance
tags: Ethereum Rollups Multiple-concurrent-proposers censorship-resistance ethereum-roadmap focil inclusion-lists blockchain-security blockchain-censorship-resistance 
---

![Ethereum MCP](/assets/images/20240801/ethereum-mcp.jpg)

_Figure: Multiple Concurrent Proposers in Ethereum_ 

In this article we study the strengths, weaknesses, and implementation challenges of **Multiple Concurrent Block Proposers (MCP)**[^1] and **Fork-Choice Enforced Inclusion Lists (FOCIL)**[^2], with a particular focus on the BRAID MCP model as discussed in the recent Paradigm Research Workshop[^3]. The primary goal of ths article is to provide a comprehensive understanding of how these mechanisms can enhance censorship resistance (CR) in blockchain systems.

_Note that both MCP and FOCIL are recent topics in the blockchain research and not much has been written or published about these topics apart from few high level presentations and articles. It is too early in the research to critically argue about their technical specifications and design decisions._


## [Understanding Censorship Resistance in Blockchain Systems](#understanding-censorship-resistance-in-blockchain-systems)

As blockchain technology continues to evolve, the need for robust censorship resistance mechanisms will only grow. MCP and FOCIL represent two promising approaches to addressing this challenge, each with its strengths and weaknesses.

### [Fundamental Concepts](#fundamental-concepts)

**Censorship resistance** is a critical property of blockchain systems, ensuring that transactions cannot be arbitrarily excluded from the blockchain. This property is essential for maintaining a trustless, decentralized system where no single entity holds the power to control or manipulate which transactions are included in a block.

### [Problems in Single-Proposer Models](#problems-in-single-proposer-models)

In traditional single-proposer systems (most blockchains to date), the leader of each block (often selected by a consensus algorithm) has significant control over transaction inclusion. This centralization of power can lead to **censorship vulnerabilities**, where the proposer can exclude transactions, reorder them, or extract rents through mechanisms like **Maximal Extractable Value (MEV)**. Such centralization undermines the decentralized ethos of blockchain systems and poses a significant threat to their integrity.

### [Definitions of MCP and FOCIL](#definitions-of-mcp-and-focil)

**Multiple Concurrent Proposers (MCP)** and **Fork-Choice Enforced Inclusion Lists (FOCIL)** represent two approaches to mitigating these issues:

- **MCP** decentralizes block production across multiple proposers, making it significantly more costly and challenging for an adversary to censor transactions.
- **FOCIL** enhances censorship resistance by requiring a committee to enforce transaction inclusion before the proposer constructs the block, thus distributing the power over inclusion decisions.

MCP as it is proposed would remove the need for several components in Ethereum's "the Scourge" roadmap such as [ePBS](https://thogiti.github.io/2024/04/18/A-Deep-dive-into-ePBS-Design-Specs.html), [PEPC](https://thogiti.github.io/2024/04/26/Ethereum-Beats-PBS-MEV-ePBS-ASP-PEPC.html), [FOCIL](https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870), [preconfs](https://thogiti.github.io/2024/04/07/Based-Preconfirmations.html), etc. in the Ethereum's "the scourge" roadmap.


## [Mathematical and Game-Theoretic Foundations](#mathematical-and-game-theoretic-foundations)

### [Formalizing Censorship Resistance](#formalizing-censorship-resistance)

Censorship resistance can be quantified using a function $\phi(t)$, where $t$ is the tip offered by a transaction $tx$. The function $\phi(t)$ represents the minimum cost an adversary must pay to prevent the inclusion of $tx$ in a block[^4].

**Single-Proposer Model:** 

$$\phi_{\text{single}}(t) = t$$

In this model, the adversary only needs to bribe the single proposer an amount equal to the transaction's tip.

In a single-proposer model with burn $b$, this is quantified as:

$$\phi_{\text{single}}(t) = max(t-b,0)$$


**Multiple Concurrent Proposers (MCP):** 

$$\phi_{\text{MCP}}(t) = n \times t$$

Here, $n$ denotes the number of concurrent proposers. The adversary must bribe all $n$ proposers, making censorship $n$ times more expensive than in the single-proposer model.

**Fork-Choice Enforced Inclusion Lists (FOCIL):** 

$$\phi_{\text{FOCIL}}(t) = \Delta \times t$$

$\Delta$ represents the overlap parameter that dictates the degree of enforcement by the committee. A higher $\Delta$ implies stronger censorship resistance, approaching that of MCP, though typically $\Delta < n$, making FOCIL somewhat less resistant than MCP.

### [Game-Theoretic Considerations](#game-theoretic-considerations)

In MCP, each proposer $i$ faces a decision between including a transaction (INC) or accepting a bribe (BC) to exclude it. The utility functions for each proposer are defined as:


$$U_i(\text{INC}) = \frac{t}{n}$$

$$U_i(\text{BC}) = B_i$$

where $B_i$ is the bribe offered by the adversary. The Nash equilibrium is reached when all proposers choose INC, provided that $B_i < \frac{t}{n}$. This setup shows that MCP significantly increases the cost of censorship due to the need to bribe multiple proposers.

In contrast, FOCIL's censorship resistance depends on the committee’s overlap parameter $\Delta$. The proposer $p$ and committee members $i$ have the following utilities:


$$U_p(\text{INC}) = t$$


$$U_p(\text{BC}) = B_p + \sum_{i=1}^{\Delta} B_i$$


Here, $B_p$ is the bribe to the proposer, and $B_i$ are the bribes to committee members. FOCIL’s censorship resistance is generally robust but not as high as MCP unless $\Delta$ approaches $n$.

## [Key Design Features and Challenges of MCP](#key-design-features-and-challenges-of-mcp)

Two protocols are designed to implement MCP, one by Duality Labs[^5], and one by Neuder and Resnick[^1]. In Duality Labs’ protocol, one of the producers is the leader and holds more power than the others, whereas in Neuder and Resnick’s protocol, all producers have equal power.

Duality Labs’ protocol: Each honest validator within the committee sends his signed bundle of transactions to the leader. To form a valid block, the leader must incorporate at least two-thirds (weighted by stake) of received bundles, and then send the block for attestation.

BRAID is the MCP proposal built on the work of Neuder and Resnick. In this article, we mainly focus on BRAID MCP proposal.

### [Overview of the BRAID Approach](#overview-of-the-braid-approach)

**BRAID** represents a straightforward yet powerful implementation of MCP[^3]. The key idea is to run multiple parallel chains, each with its own proposer. These chains are then finalized together by merging all transactions from the parallel chains into a single execution block. This design aims to distribute the power of block production across multiple chains, thereby enhancing censorship resistance.

- **Simultaneous Release:** A critical aspect of BRAID is **simultaneous release**. All proposers release their transactions at the same time, preventing any single proposer from gaining an information advantage by observing others' transactions first. This simultaneous release is crucial for avoiding **timing games** where a proposer could exploit the order of transaction releases to engage in strategies like sandwich attacks.
  
- **Delayed Execution:** **Delayed execution** is another feature that complements the parallel chain design. By delaying the execution of transactions to the next block, the system ensures consistency and prevents conflicts that might arise from multiple proposers independently updating the state.

### [Challenges: Timing Games and Cryptographic Solutions](#challenges-timing-games-and-cryptographic-solutions)

**Timing games** are a significant challenge in MCP when proposers do not release their transactions simultaneously. The last proposer to release their transactions could exploit information asymmetry, leveraging strategies such as sandwich attacks or penny bids in auctions. This risk is particularly problematic because it centralizes power among more sophisticated or well-resourced validators.

- **Cryptographic Solutions:** While techniques such as **threshold encryption** or **timelock encryption** are proposed as potential solutions to enforce simultaneous release and prevent information leakage, these methods are speculative and unproven in this context. Their implementation could introduce new complexities and vulnerabilities that must be carefully considered.

- **Penalties:** Introducing **missed slot penalties** is another proposed strategy to deter proposers from delaying their transaction releases. However, the effectiveness of these penalties in a decentralized and adversarial environment remains to be fully explored.


## [Practical Considerations and Implementation Challenges](#practical-considerations-and-implementation-challenges)

### [Complexity and Resource Requirements](#complexity-and-resource-requirements)

Implementing MCP, particularly the BRAID approach, involves several significant challenges:

- **Communication Overhead:** MCP requires sophisticated management of communication complexity. In BRAID, a single vote that includes all chains can reduce the communication burden, but the size of these messages could still grow significantly, especially as the number of chains increases.

- **State Management:** Managing a single global state across multiple chains is inherently complex. In BRAID, all chains contribute to a single execution block, ordered by the execution layer. This centralized state management is critical for ensuring consistency and preventing issues like the **free DA problem** (free data availability).

- **Finality Gadget:** The finality gadget used in BRAID finalizes the union of transactions from all chains. While it ensures eventual consensus, the complexity of merging transactions and resolving conflicts could impact system performance.

### [Trade-offs Between Decentralization and Efficiency](#trade-offs-between-decentralization-and-efficiency)

The BRAID approach, while enhancing censorship resistance, necessitates trade-offs between decentralization and efficiency:

- **Networking and Storage:** Running multiple parallel chains increases the demands on network bandwidth and storage, as validators need to handle more data. This could lead to higher costs and make the system more resource-intensive compared to simpler models like FOCIL.

- **Forks and State Inconsistencies:** The potential for forks and state inconsistencies is greater in MCP due to the parallel chain design. Ensuring that all chains are synchronized and that transactions are executed in a consistent order across chains presents a non-trivial challenge.

## [FOCIL as a Lightweight Alternative](#focil-as-a-lightweight-alternative)

In contrast to MCP, **FOCIL** offers a more lightweight and practical solution for enhancing censorship resistance:

- **Committee-Based Inclusion:** By enforcing inclusion lists via a committee, FOCIL reduces the risk of censorship without the overhead of running multiple parallel chains. This makes it easier to implement and more compatible with existing blockchain protocols.

- **Single-Proposer Simplicity:** FOCIL retains the single-proposer model, avoiding the complexities associated with managing multiple chains and ensuring that transaction ordering remains straightforward. This simplicity makes FOCIL an attractive option for systems that prioritize efficiency and lower resource consumption.

FOCIL is built in three simple steps:

- In each slot, a group of validators is chosen to form the Inclusion List (IL) committee. Each committee member then broadcasts a local inclusion list based on their individual view of the mempool.
- The block proposer gathers and consolidates these local inclusion lists into a single aggregate list, which is then included in the block.
- The attesters review the accuracy of the aggregate list by comparing it with their own view of the gossiped local lists, ensuring the block proposer has faithfully represented the available lists.

The aggregation of transactions in FOCIL is done through a union, making it resemble MCP in that each IL committee member functions similarly to a proposer. However, the key difference is that the block proposer retains exclusive control over other transactions and their ordering. FOCIL specifically targets the issue of censorship resistance, without addressing the broader problem of proposer monopolies over transaction ordering.

## [Impact on Existing and Future Protocols](#impact-on-existing-and-future-protocols)

### [Impact on Existing Protocols (e.g., Ethereum)](#impact-on-existing-protocols-eg-ethereum)

**MCP (BRAID):** MCP, particularly as implemented in BRAID, could significantly improve censorship resistance in Ethereum. It could also remove the need for several components in "the Scourge" roadmap such as [ePBS](https://thogiti.github.io/2024/04/18/A-Deep-dive-into-ePBS-Design-Specs.html), [PEPC](https://thogiti.github.io/2024/04/26/Ethereum-Beats-PBS-MEV-ePBS-ASP-PEPC.html), [FOCIL](https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870), [preconfs](https://thogiti.github.io/2024/04/07/Based-Preconfirmations.html), etc. However, its complexity and potential for timing games may limit its immediate applicability, particularly in systems where efficiency and simplicity are prioritized.

**FOCIL:** FOCIL provides a more immediate, less disruptive improvement to censorship resistance. It could be implemented in Ethereum with fewer changes to the protocol, making it a practical choice for enhancing security while maintaining existing infrastructure.

### [Relevance for Future Protocols](#relevance-for-future-protocols)

**MCP for New Protocols:** Future blockchain protocols that prioritize decentralization and censorship resistance could benefit significantly from MCP. However, the potential challenges, such as timing games and increased resource demands, must be carefully managed. MCP is particularly suitable for high-security, decentralized applications where the cost of implementation complexity can be justified by the need for robust censorship resistance.

**FOCIL for Layer 2 Solutions:** FOCIL’s simplicity and lower overhead make it an ideal candidate for Layer 2 solutions or other environments with resource constraints. Its compatibility with existing protocols and ease of integration make it well-suited for applications where maintaining efficiency and minimizing changes to the protocol are crucial.


## [Balancing Security, Complexity, and Efficiency](#balancing-security-complexity-and-efficiency)

**MCP** offers a robust and innovative solution to censorship resistance, particularly when implemented through designs like BRAID. By distributing block production across multiple proposers, MCP significantly increases the cost and difficulty of censoring transactions. However, the associated complexity, potential for timing games, and resource demands present significant challenges that may limit its applicability, particularly in protocols where efficiency and simplicity are critical.

**FOCIL**, in contrast, provides a more straightforward approach that enhances censorship resistance with minimal changes to existing protocol structures. While it may not achieve the same level of decentralization as MCP, its simplicity and efficiency make it an attractive alternative for many use cases, especially in environments where resource constraints are a concern.

View-merge protocols like MCP and FOCIL can enhance the user experience of inclusion commitments by involving multiple participants in defining the block’s contents. However, the effectiveness of this improvement depends on the specific implementation. For instance, in FOCIL, obtaining a commitment from someone other than the proposer offers only a probabilistic guarantee of inclusion. Yet, securing commitments from multiple committee members could increase that probability to nearly 100%. In MCP, as long as there is no liveness fault, obtaining an inclusion commitment from any single proposer in a slot provides the same level of assurance as a commitment from a monopolistic leader.

Ultimately, the choice between MCP and FOCIL depends on the specific requirements of the protocol. Protocol designers must carefully weigh the trade-offs between enhanced censorship resistance, the complexity of implementation, and the demands on system resources. Future research should continue to explore these trade-offs, particularly as blockchain technology evolves and new applications emerge.

**Recommendations:**

- **Consider MCP for High-Security, Decentralized Applications**: MCP is best suited for environments where censorship resistance is paramount, and the protocol can bear the costs of increased complexity and resource demands. Applications like decentralized finance (DeFi) platforms or blockchain infrastructures that prioritize trustlessness and security may find MCP particularly beneficial.

- **Adopt FOCIL for Layer 2 Solutions and Resource-Constrained Environments**: FOCIL’s lightweight and practical design makes it ideal for Layer 2 solutions, sharded blockchains, or other environments where simplicity, efficiency, and compatibility with existing protocols are crucial.

- **Explore Hybrid Approaches with Caution**: While hybrid models combining elements of MCP and FOCIL could potentially offer a balance between censorship resistance and implementation complexity, these approaches are speculative and would require extensive research and validation before being considered viable solutions.


## [References](#references)
[^1]: https://ethresear.ch/t/concurrent-block-proposers-in-ethereum/18777
[^2]: https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870
[^3]: https://www.youtube.com/watch?v=mJLERWmQ2uw
[^4]: https://www.mechanism.org/spec/01 
[^5]: https://blog.duality.xyz/introducing-multiplicity/
