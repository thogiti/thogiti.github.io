---
title: Columbia CryptoEconomics Workshop 2024 - Personal Notes and Inquiries
date: 2025-01-05
author: Nagu Thogiti
tags: Ethereum block-building decentralized-block-building PBS flashbot flashbot rollups rollup-economics sequencers sequencing preconfirmations l2-sequencing cryptoeconomics columbia-cec the-forum-columbia ethereum-north-star  ethereum-end-game mev maximal-extracted-value block-rewards transaction-fees transaction-fee-mechanism  
---

# WORK IN PROGRESS

# Overview

These are some personal notes and inquiries from the recent [Columbia CryptoEconomics Workshop 2024](http://columbiacryptoeconomics.org/) at Columbia University in New York. You can find the full program agenda at [the official website](http://columbiacryptoeconomics.org/). The recorded sessions are published [here](https://www.youtube.com/playlist?list=PLpktWkixc1gXuGS_C31RlPQMiHFgFBrcA).

# Priority is All You Need - Dan Robinson
Dan Robinson of Paradigm argued that Layer 2 sequencers should not capture MEV for themselves. Instead, they should enable applications and users to capture their own MEV through mechanisms like priority fees and MEV taxes. This approach not only improves the user experience but also fosters innovation by allowing applications to design their own value-capture mechanisms.

Direct L2 capture of MEV is detrimental to user experience, reduces application capabilities, and ultimately results in deadweight loss for the platform.

Allowing applications to capture their own MEV reduces the incentive for them to launch their own separate chains and helps maintain the benefits of using an L2.

Priority ordering of transactions (ordering based on fees) is a key mechanism used by many L2s already. It can be leveraged to program MEV capture at the application layer.

MEv taxes is a method for applications to capture MEV, this is achieved by implementing a "tax" on transactions. This tax redirects MEV from sequencers/validators to the application or its users. This is done by smart contracts charging an additional fee based on a transaction's priority bid. It doesn't change Searcher profitability but decreases the amount sequencers make from MEV.

Applications using MEV taxes:
- AMMs capturing "loss-vs-rebalancing" MEV for liquidity providers.
- DEX routers like Uniswap X, enabling on-chain auctions for order fulfillment.
- Oracles capturing value from their updates.
- Smart wallets capturing user MEV from backrunning.

Pros: This approach aligns incentives between users, applications, and sequencers, reducing the negative impact of MEV on user experience.

Cons: Implementing trustless mechanisms for priority ordering and MEV taxes is challenging, especially in decentralized systems. Sequencers may still find ways to extract value, undermining the system’s fairness.

Application-Specific Sequencing: Priority ordering makes transaction sequencing programmable at the application layer, enabling applications to define specific lanes within a block.
- Challenges: Priority ordering is not incentive compatible for the sequencer, and requires trustless mechanisms to avoid manipulation. Currently, L2 sequencers are trusted to order transactions properly.
- Reverted Transactions: Using auctions can lead to a higher number of reverted transactions on some L2s.
Low Priority Fees: Applications using MEV taxes may have very low priority fees, making them vulnerable to censorship during high congestion periods.
- Multi-Application Interaction: Potential for complex equilibria in MEV distribution when multiple applications interact.

Trustless Priority Ordering: Achieving this is considered crucial for the future of decentralized sequencing. But it requires:
- Censorship Resistance: The ability to force transactions into a block, perhaps using inclusion lists or multiple concurrent proposers. It requires "same-block censorship resistance".
- Pre-Transaction Privacy: Preventing sequencers from "peeking" at transactions to construct their own exploitative trades, possibly using fold encryption, TEEs, commit-reveal schemes, or time-lock encryption.
- Reduced Timing Advantage: Minimizing the ability of sequencers or other special parties to delay user transactions or gain a timing advantage, which may require consensus changes.

Some questions to think about:

How can decentralized sequencers enforce priority ordering without introducing new attack vectors?

What are the trade-offs between MEV taxes and other MEV mitigation strategies, such as encrypted mempools or fair ordering protocols?

How might dynamic MEV taxes adapt to network congestion and fluctuating transaction volumes?

# Lazy Sequencing Rules for Rollups - Itamar

Itamar from Astria introduced the concept of lazy sequencing, where consensus is reached on data availability, and execution is deferred to rollup nodes. This approach contrasts with the current rollups (e.g., Arbitrum), where transactions are executed and finalized by the sequencer before consensus. This allows for processing many rollups simultaneously.

Lazy Blockchains: Separate consensus from execution, enabling faster and more modular architectures.

Astria’s System: Combines a BFT sequencing network with Celestia’s data availability layer, allowing rollups to implement custom sequencing rules and auctions.

The "right path" involves users sending transactions to rollups, which then serialize these transactions into bundles. These bundles are then sent to the sequencer, which creates blocks of namespaced blobs, and later batches these sequenced blocks onto the DA layer.

Bundles are vectors of serialized rollup transactions, namespaced by rollup ID, and can contain multiple rollups at the same time. The sequencer supports basic functionality like transfers.

Block Auctions: Rollups can auction off specific parts of the block (e.g., top-of-block bundles), enabling domain-specific sequencing rules like priority fees or liquidation auctions.

Pros: Lazy sequencing reduces the computational burden on sequencers, enabling faster block times and greater scalability. It also allows rollups to implement custom sequencing rules without relying on the sequencer.

Cons: The system’s reliance on data availability sampling introduces new complexities, such as ensuring censorship resistance and handling network partitions.

Some questions to think about:

How does lazy sequencing compare to other rollup architectures, such as optimistic rollups or zk-rollups, in terms of scalability and security?

What are the potential risks of relying on data availability sampling for consensus, and how can they be mitigated?

How might cross-rollup auctions impact the composability and interoperability of decentralized applications (dApps)?



