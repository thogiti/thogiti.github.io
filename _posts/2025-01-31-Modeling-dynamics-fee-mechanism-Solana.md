---
title: Exploring Dynamic Base Fees for Solana’s Parallel Fee Markets
tags: Solana fee-mechanism local-fee-markets solana-local-fee-markets dynamics-base-fees solana-fee-markets 
---

# Overview

Solana’s blockchain model is known for its parallel execution and local fee markets, which enable high throughput and low latency at scale. However, static fee structures can fall short when network usage surges, as they lack an automated mechanism to adjust transaction costs in real time. In this post, we explore dynamic base fees—inspired by Ethereum’s EIP-1559 but adapted to a multi-threaded environment—showing how Solana could implement global congestion signaling to:

- Keep fees low when usage is sparse,  
- Deter spam when blocks near capacity, and  
- Ensure fair cost distribution in proportion to each transaction’s resource usage.

Below, we outline the state of fee models in Solana vs. Ethereum, highlight the motivations for dynamic fees, and then propose a simple mathematical framework for how Solana might incorporate a base-fee multiplier for global congestion management.

---

# Why Dynamic Base Fees for Solana?
There are several reasons why dynamic base fees are important for Solana:

- Spam Deterrence under High Load  
   If usage is low, the base fee remains minimal—no harm done. But as block capacity edges toward the limit (e.g., 48M compute units per block), the fee multiplier automatically rises. This discourages spam or low-value transactions from clogging the network.

- Resource-Proportional Pricing  
   In a dynamic model, each transaction’s cost aligns with how many CUs it consumes (rather than a fixed signature fee for all). This offers a fairer distribution of costs and incentivizes developers to optimize their on-chain programs.

- Deflationary Effects & Validator Rewards  
   As with EIP-1559, a portion (or all) of the base fee can be burned. This reduces token supply during heavy usage, benefiting long-term token holders. Validators still earn priority tips from users who need urgent inclusion.

- Preserving Parallelism & Scalability  
   Even with a global fee, Solana’s concurrency model remains intact. Users contending on the same account can outbid one another locally, while a global base fee ensures the entire network doesn’t get spammed cheaply.

---

# Background: Fee Models in Current Blockchains

## The Solana Model Today

Currently, Solana charges a fixed base fee (e.g., 5,000 lamports per signature), supplemented by local fee prioritization for heavily contended accounts. While local fee bidding can help in “hot” account scenarios, there is no globally enforced dynamic mechanism to raise or lower the baseline cost of transactions when overall network usage surges. The main downsides are:

- Spam Vulnerability: Even if the network is near full capacity, the base signature fee stays constant. Malicious or low-value transactions can occupy block space cheaply.  
- Static Cost: Transactions pay roughly the same fee, irrespective of how many compute units (CUs) they consume, leaving minimal economic incentive to optimize resource usage.

## EIP-1559 in Ethereum: Detailed Overview and Its Base-Fee Update Rule

Ethereum’s EIP-1559 introduced a global base fee that adjusts block by block, targeting a certain gas usage threshold (commonly 50%). It includes:

- Adaptive: If the previous block exceeds the target gas usage, the next block’s base fee rises; if it’s under the target, the base fee falls.  
- Single-Thread Execution: Ethereum executes transactions sequentially; the global base fee is a straightforward congestion signal.  
- Tips: Users can add “priority fees” to outbid others, while the base fee itself is typically burned, creating a partially deflationary token model.


### Base‐Fee Computation

At its core, the Ethereum protocol compares each block’s size (gas usage) to a target block size $s^\*$. If the previous block used more gas than the target, the base fee goes up; if it used less, the base fee goes down. Formally, if $b[i - 1]$ is the base fee in the previous block $i-1$ and $s[i - 1]$ is the measured gas usage in that block, then the new block’s base fee $b[i]$ is:

$$
b[i]
\;=\;
b[i - 1]
\;\cdot\;
\Bigl(
  1 \;+\;\phi
  \,\frac{s[i - 1] - s^*}{\,s^*\,}
\Bigr),
$$

where:

- $s^\*$ = the target block size, e.g., half of the maximum allowed block size ($2s^\*$).  
- $\phi$ = an adjustment parameter controlling how sensitively the base fee responds to over/under‐target block usage (on Ethereum mainnet, $\phi$ is typically $1/8$).  

For example, if $s[i-1]$ is larger than $s^\*$, indicating high demand, $b[i]$ grows proportionally to $\frac{s[i - 1] - s^\*}{s^\*}$. Conversely, if the block used fewer gas units than $s^\*$, the base fee decreases.

> Initial Conditions: In Ethereum, $b[0]$ was set to 1 Gwei, and the block size could expand up to $2s^\*$. Solana or other blockchains adopting a similar model could choose a different starting fee or block‐size parameters.

### Transaction Fee Cap & Tip

Under EIP‐1559, when a user creates a transaction, they specify two key parameters in addition to the gas limit:

1. Fee Cap $\bigl(c\bigr)$. This is the maximum amount (in Gwei per gas) they are willing to pay overall (base fee + tip).  
2. Tip $\bigl(\varepsilon\bigr)$. Sometimes referred to as the “priority fee,” this is what the user voluntarily pays the miner (or validator) on top of the base fee in order to get local priority.

Let the actual gas consumed by the transaction be $\tilde{g} \le g$. Then the effective gas price is:

$$
\min\{\,b + \varepsilon,\, c\},
$$

and the total paid by the user is $\tilde{g}\,\times\,\min\{b + \varepsilon,\,c\}$.

### Burning and Miner Rewards

Of the user’s total payment:

- A portion $\tilde{g}\,\times\,b$ (the base fee times the gas used) is burned—removed from circulation—which has a deflationary effect when usage is high.  
- The remainder, $\tilde{g}\,\times\,(\min\{b + \varepsilon,\,c\} - b)$, is collected as the tip, incentivizing block producers to include transactions quickly.

### Practical Impact

- Automated Fee Adjustment: Because $b[i]$ updates every block to reflect whether the previous block was over or under the target, users no longer need to guess a gas price from scratch. In stable conditions, the base fee converges near an equilibrium, functioning like a “posted price” for the network.  
- Mitigating Spam: If spam or bots fill the block above $s^\*$, then $b[i]$ rises, making spam increasingly expensive and eventually forcing spam transactions out.  
- Priority Tipping: High‐value or latency‐sensitive users can ensure inclusion by raising the tip $\varepsilon$. This local mechanism coexists with the global base‐fee logic.
- Burning a significant portion of base fees will also avoid malicious behavior such as block stuffing by the block proposers to generate fake demand and thus raise base fees even in the absence of congestion. 


### Implications for a Parallel, Solana‐Style Environment

In a parallel or “multi‐threaded” blockchain like Solana, a direct EIP‐1559 approach may need adjustments:

- Block Size vs. Compute Units: Instead of measuring gas usage $s[i-1]$, Solana’s runtime might track “compute unit usage” across all threads.  
- Target vs. Maximum: Just as Ethereum sets $s^\*$ at half the maximum block size, Solana could define a target compute usage to allow ephemeral bursts up to 2X that target.  
- Local vs. Global: Solana’s local fee markets for “hot” accounts remain relevant for fine‐grained prioritization, while a global EIP‐1559‐style base fee can protect the entire system from block‐wide congestion or spam.

Nevertheless, the equation for updating the base fee, the notion of fee cap $\bigl(c\bigr)$, and the tip $\bigl(\varepsilon\bigr)$ carry over directly, provided the chain implements an on‐chain logic to measure each block’s usage relative to a desired target.

By burning the base fee, the network gains a deflationary lever during high usage, while validators still benefit from tips. This synergy of a global “posted price” plus local “tipping” stands as a potentially powerful approach to sustainably manage transaction demand in high‐throughput, concurrent blockchains like Solana.


## Merging Concurrency With Dynamic Base Fees

To adapt EIP-1559-like mechanics to Solana’s parallel environment, we consider a hybrid model:  
- Keep Solana’s thread-level concurrency (where different threads handle different subsets of accounts).  
- Introduce a global dynamic base fee that scales up or down with overall resource usage.  

This way, local fees handle micro-level contention, and global fees protect the system from large-scale spam or demand shocks.


---

# A Simple Dynamic Fee Mechanism for Solana

## Parallel Execution & Local Prioritization

Solana’s thread-level concurrency would remain—multiple threads each process sets of accounts. If a user wants to ensure fast processing on a hot thread, they add a priority tip that influences local ordering. By itself, however, this does not handle global congestion.

## Introducing a Global Base-Fee Multiplier

We add a congestion signal that updates block to block:

- Block Capacity, $B$: Suppose we define a per-block maximum of 48M compute units (CUs).  
- Usage, $u_n$: Track the total number of CUs used in block $n$.  
- Fill Ratio, $\phi_n$: $\phi_n = u_n / B$.  
- Base-Fee Multiplier, $M_n$: A single parameter for block $n$. The cost for a transaction $\tau$ is:

  $$
    \text{BaseFee}(\tau,n) 
    = 
    \text{CU}(\tau) \,\times\, M_n
    \quad+\quad
    \text{(optional tip)}.
  $$

## Updating the Base Fee

Inspired by EIP-1559, we adjust $M_{n+1}$ using:

$$
  M_{n+1}
  \;=\;
  M_n \times \exp\!\Bigl(\alpha \,(\,\phi_n - \phi^*)\Bigr),
$$

- $\phi^\*$ is the target fill ratio (e.g., 50% or 90%).  
- $\alpha$ is a sensitivity parameter controlling how fast fees respond to usage.  
- If $\phi_n > \phi^\*$, fees rise; if $\phi_n < \phi^\*$, fees fall.

## Accounting for Parallel Threads

If Solana uses, say, $T$ parallel threads, let $u_n^{(t)}$ be the usage for thread $t$. The total usage is $u_n = \sum_t u_n^{(t)}$, yielding a global fill ratio $\phi_n$. Alternatively, to highlight “hot threads,” you might define:

$$
  \phi_n 
  = 
  \max_{t} \Bigl\{ u_n^{(t)} / B_t \Bigr\},
$$

where $B_t$ is each thread’s capacity. Either approach ensures $M_{n+1}$ reflects peak or aggregate resource usage across threads.

---

# Mathematical Formalization

Let’s define a minimal set of equations to describe the system:

- Block Capacity: $B$ (e.g., 48M compute units).  
- Usage: $u_n = \sum_{t=1}^{T} u_n^{(t)} \le B$.  
- Fill Ratio: $\phi_n = u_n / B$.  
- Base-Fee Multiplier: $M_n$.  
- Target Fill Ratio: $\phi^\*$ (e.g., 0.9 if we aim for 90% usage).  
- Update Rule:

$$
  M_{n+1}
  \;=\;
  M_n \,\times\,
  \exp\!\Bigl(\alpha\,(\phi_n - \phi^*)\Bigr).
$$

- Transaction Cost for a user’s transaction $\tau$ in block $n$:

$$
  \text{Cost}(\tau,n)
  \;=\;
  \text{CU}(\tau) \,\times\, M_n 
  \;+\;
  \text{tip}(\tau).
$$

- Fee Burn (optional): The chain may burn all or part of $\text{CU}(\tau)\times M_n$, distributing the tip($\tau$) to validators. This can have a deflationary effect when usage is high.

---

# Benefits for Solana

There are several benefits to this approach:

- Flexibility Under High Load  
   As usage approaches maximum capacity, the exponential rule quickly elevates the base fee. Low-value spamming becomes uneconomical, preserving resources for high-value transactions.

- Fair Resource Accounting  
   Transactions that use more compute time or heavier operations pay more, deterring non-optimized programs from hogging the network.

- Preserves Parallel Efficiency  
   The local fee market (priority tips) still governs micro-level contention. The global base-fee layer simply ensures that system-wide usage remains at or near the target $\phi^\*$.

- Fee Stability  
   If $\alpha$ is tuned appropriately, the base fee adjusts smoothly over multiple blocks, minimizing wild fee fluctuations while still responding to rising or falling demand.

---

# Potential Challenges & Next Steps

There are some potential challenges with this approach:

- Local vs. Global Congestion  
   Threads can face localized hotspots; a single global base fee might not reflect each thread’s usage perfectly. We might need a “thread weighting” scheme or local surcharges for extremely hot accounts.

- Oscillation  
   If $\alpha$ is set too high, the fee could spike and dip rapidly. Empirical testing is needed to find stable parameters.

- Implementation Complexity  
   Updating a base-fee multiplier each block and enforcing it in parallel threads can require deeper changes to the Solana runtime. The payoff is a robust, automated, and fairer fee market.

- Defining the Target Fill Ratio  
   Setting $\phi^\*$ at 50% leaves “headroom” for demand surges, but might underutilize the chain. Setting $\phi^\*$ at 90% yields near-maximum usage but less buffer for sudden spikes. Governance or developer consensus is required for an optimal choice.

---

# Conclusion

A dynamic base-fee mechanism on Solana would combine:

- Parallel execution (threads, local fee markets)  
- Adaptive global pricing (EIP-1559 style multiplier)  
- Compute-based transaction costs (charging proportionally to CUs)  

This hybrid approach could address some persistent issues:

- Global spam when usage is high but fees stay low,  
- Inequitable or unoptimized usage,  
- Inability to quickly respond to surges in demand.

Ultimately, adopting a base fee that rises with block fill ensures that legitimate, high-value transactions can outbid spam while daily usage remains affordable in normal conditions. As Solana continues to scale—potentially handling many hundreds of thousands of transactions per second—dynamic base fees offer a future-proof, user-friendly, and congestion-responsive path forward.

---

# Further Reading & References

1. EIP-1559 – [Ethereum Improvement Proposal 1559 Documentation](https://eips.ethereum.org/EIPS/eip-1559).  
2. Solana Official Docs – [Solana Documentation](https://docs.solana.com/). 
3. [Fees on Solana](https://solana.com/docs/core/fees)
4. Tim Roughgarden’s Paper – [Transaction Fee Mechanism Design for the Ethereum Blockchain: An Economic Analysis of EIP-1559.](https://arxiv.org/abs/2106.01340)
5. [Block-STM vs. Sealevel: A Comparison of Parallel Execution Engines](https://hackernoon.com/block-stm-vs-sealevel-a-comparison-of-parallel-execution-engines)
6. [Solana Fees in Theory and Practice](https://www.helius.dev/blog/solana-fees-in-theory-and-practice)
7. [The Truth about Solana Local Fee Markets](https://www.helius.dev/blog/solana-local-fee-markets)
