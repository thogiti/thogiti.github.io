---
title: Harnessing AI in Ethereum - Pioneering a New Era of Agentic Systems for Blockchains
tags: Ethereum PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture AI-Agents-MEV AI-Crypto AI-Blind-Auctions AI-Block-Building AI-MEV-Supply-Chain-Management
---

## WIP: DRAFT MODE


Public blockchains like Ethereum provide an ideal infrastructure for the development and operation of AI agents, due to their distinctive features that align perfectly with the needs of decentralized, autonomous systems. These platforms not only support but enhance the capabilities of AI agents, fostering a new era of technological integration that could reshape societal and economic structures. Let’s explore why blockchains are the prime stage for AI's evolution and the profound benefits they offer.

Davide Crapis wrote an [excellent article](https://davidecrapis.notion.site/The-Internet-of-Agents-23aa09799b9c4620a1a287926bcfd6af) on the role of AI agents in blockchain[^1]. I will refer the user to follow this article for a more non-technical introduction to the topic. 

In this article I will develop some ideas on how to explore this design space of AI agents and their orchestration mechanism and how these AI agents can be designed in the current Miner Extractable Value (MEV) supply chain architecture to bring out the true potential of AI in Ethereum blockchain infrastructure. 

I have written about PBS and MEV in my [ePBS article(https://thogiti.github.io/2024/03/28/ePBS.html)]. If you are new to this topic, you may want to start [here](https://thogiti.github.io/2024/03/28/ePBS.html).

## Strategic Benefits of AI in Blockchains

The convergence of blockchain technology and AI is paving the way for advanced, decentralized systems that promise to revolutionize digital interactions. Here are the unique characteristics of blockchains that make them an excellent platform for AI agents and the transformative benefits this integration offers for societal, economic, and technological advancements.

- **Decentralization:** Blockchains like Ethereum are inherently decentralized, preventing any single entity from controlling the network, ideal for unbiased AI operations.
- **Incentives:** Blockchains support complex incentive structures with native assets and smart contracts, enabling diverse economic models for AI interactions.
- **Openness and Composability:** Anyone can participate and develop applications on blockchain platforms, allowing seamless interaction between applications.
- **Cryptographic Guarantees:** Advanced cryptography ensures unparalleled security and privacy for AI operations, from transaction security to privacy-preserving computations.
- **Alignment:** Blockchain's transparency helps align AI behaviors with human values through trackable and visible activities.
- **Safety:** The secure nature of blockchains is suited for deploying AI in high-risk environments, ensuring reliability.
- **Discovery:** The openness of blockchain allows AI agents to be discoverable and utilized based on reliable reputations, documented immutably.
- **Efficiency:** Blockchains reduce the need for intermediaries, enabling autonomous agents to perform transactions and interactions swiftly and cost-effectively.
- **Control and Programmable Privacy:** Individuals can control their AI agents and personal data securely through blockchain's cryptographic solutions.
- **Ownership and Fairness:** Blockchains facilitate new forms of collective ownership and governance, such as DAOs, promoting democratic decision-making and fair value distribution.
- **Future Integration:** Advanced stages of AI and blockchain integration will likely lead to sophisticated AI marketplaces and operational frameworks, enhancing service efficiency and effectiveness.
- **Scalable Models for Governance:** Models like direct ownership and DAOs offer flexible and inclusive ways to manage AI systems, ensuring fair governance and distribution.

## Revolutionizing AI Agents in MEV Supply Chain Management

![MEV-Supply-Chain-PBS](/assets/images/20240501/MEV-supply-chain-in-PBS.png)

_Figure: MEV supply chain in the PBS. Credit by Sen Yang, arXiv:2405.01329 [cs.CR]_ 

By integrating AI into Ethereum blockchain environments, particularly in managing the MEV supply chain in the current PBS scheme, we can address complex challenges and enhance the efficiency and security of blockchain operations. Here's a detailed exploration of some innovative AI-driven applications designed to optimize the blockchain landscape.

In this artile I will explore deep into Privacy-Preserving Real-Time Auction System for block space allocation. I will also give an high level overview of similar problems in the MEV supply chain architecture and how to build such AI agents. In next few articles, I will develop these problems understand their design space, mechanism designs, value creation, AI methodlogy and implementation details. 

- **Privacy-Preserving Real-Time Auction System:** In blockchain auctions for block space, maintaining bidder privacy is crucial. AI agents using Secure Multi-Party Computation (SMPC) or FHE can manage encrypted bids to prevent exposure and manipulative behaviors. These AI systems ensure that only the auction system knows the true bid values, enhancing both the privacy and fairness of auctions.

- **AI-Coordinated Block Construction within Fixed Time Slots:** AI agents can dramatically improve how transactions are selected and ordered within Ethereum’s 12-second block time. By analyzing pending transactions in the mempool, these agents maximize network fees and optimize block space utilization, boosting overall network throughput.

- **Integration of Real-Time Off-Chain Data for Enhanced On-Chain Decision Making:** Incorporating off-chain data like market trends and economic indicators can significantly enhance on-chain decision-making. AI-driven systems process this real-time data, allowing smart contracts to dynamically adjust strategies based on external economic conditions.

- **Off-Chain Computation for On-Chain Efficiency:** AI can also reduce the computational load on the blockchain. By performing complex calculations off-chain and then integrating the results back on-chain using cryptographic proofs and cryptoeconomic ecurity mechanisms like EigenLayer[^2] and Ritual[^3], we reduce transaction costs and enhance overall network performance.

- **Dynamic Trade Routing in MEV Scenarios:** During periods where MEV is detectable, AI agents can route transactions through optimal pathways to minimize costs and slippage. By continuously learning from the network state, these agents adapt and optimize the routes in real time.

- **AI-Powered MEV Supply Chain Management:** Streamlining the MEV supply chain involves managing the flow of transactions efficiently from wallets to proposers. AI agents orchestrate this flow, ensuring that transactions are bundled appropriately and sent to the most suitable builders based on current network conditions.

- **Privacy-Enhanced Channel Management for Secure Transaction Handling:** To secure private transaction channels, AI is used to manage and monitor operations, utilizing advanced encryption and anomaly detection to protect data against unauthorized access and potential leaks.

- **AI-Driven Block Building Simulation for Optimal Proposal Strategies:** AI can simulate various block-building strategies in a virtual environment. This allows for testing and optimization of strategies without risking live network stability, leading to more effective and efficient blockchain operations.

- **NLP and LLM for Simplified MEV Interaction:** Implementing natural language processing (NLP) and Large Language Model (LLM) systems can make interacting with Ethereum more accessible. Users can input commands in natural language, which are then translated into actionable functions or structured queries, simplifying the user experience.

- **Decentralized AI Marketplaces for Dynamic MEV Strategies:** Creating decentralized marketplaces for AI-driven MEV strategies can foster a robust trading environment. Here, strategies are tokenized and traded securely, with smart contracts ensuring transaction integrity and compliance.

## Privacy-Preserving Real-Time Auction System for Block Building

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
Encrypted bids for the block, blockchain transaction data for verification post-auction.

**Evaluation Criteria:**  
- Bid privacy preservation.
- Auction fairness and transparency.
- Time to finalize auction results.

**Optimization Potential:**  
Refine cryptographic techniques to reduce computational overhead and improve auction performance.

### Motivation and Market Forces

Private order flows account for over 60% of the Miner Extractable Value (MEV) in more than half of the daily blocks since July 2023[^4]. These private flows are controlled by providers who often require builders to meet certain market share thresholds. This requirement can cost new builders up to 1.4 ETH in subsidies to enter the market. On the other hand the private order flows are becoming a significant part of builder revenue.

The current MEV-Boost design favors builders, creating a dynamic where malicious builders can exploit providers through tactics like sandwich attacks and imitation. Consequently, providers tend to share their order flows only with builders who have established reputations, although this method of protection remains relatively weak. The trust issues inherent in this system create high entry barriers, stifling market decentralization. Addressing and potentially removing these trust barriers is crucial to fostering a more decentralized builder market.

### Private Auction Design with Two-Party MPC

### Double Auction Mechanism using TFHE

### UX of AI Agents and LLM Scripts for Solo Builders


## References
[^1]: https://davidecrapis.notion.site/The-Internet-of-Agents-23aa09799b9c4620a1a287926bcfd6af
[^2]: https://docs.eigenlayer.xyz/eigenlayer/overview/
[^3]: https://ritual.net/
[^4]: https://arxiv.org/pdf/2405.01329 