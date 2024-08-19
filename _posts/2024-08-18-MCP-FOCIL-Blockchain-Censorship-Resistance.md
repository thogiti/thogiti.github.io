---
title: 	How MCP and FOCIL Could Transform Blockchain Censorship Resistance
tags: Ethereum Rollups Multiple-concurrent-proposers censorship-resistance ethereum-roadmap focil inclusion-lists blockchain-security blockchain-censorship-resistance 
---

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



## [References](#references)
[^1]: https://ethresear.ch/t/concurrent-block-proposers-in-ethereum/18777
[^2]: https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870
[^3]: https://www.youtube.com/watch?v=mJLERWmQ2uw
[^4]: https://www.mechanism.org/spec/01 
[^5]: https://blog.duality.xyz/introducing-multiplicity/
