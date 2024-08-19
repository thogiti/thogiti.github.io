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


## [References](#references)
[^1]: https://ethresear.ch/t/concurrent-block-proposers-in-ethereum/18777
[^2]: https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870
[^3]: https://www.youtube.com/watch?v=mJLERWmQ2uw
[^4]: https://www.mechanism.org/spec/01 
[^5]: https://blog.duality.xyz/introducing-multiplicity/
