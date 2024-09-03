---
title: Quantifying Decentralization and Safety of Social Consensus in Blockchains
tags: Ethereum Decentralization Social-Consensus Safety measuring-Safety measuring-Decentralization
---

## Introduction

Social consensus is often treated like a magic fix for safety faults in blockchain networks, especially in the fast-paced conversations on Crypto Twitter (CT). But if history has taught us anything—whether it's the bitter small block vs. big block debates or the Ethereum split after the DAO fork—it's that social consensus is anything but easy. It’s messy, expensive, and incredibly hard to pull off.

So when we talk about decentralization, it’s not enough to just measure it **before** we call in social consensus. We need to think about what happens **after** social consensus is invoked. How decentralized is a blockchain really, once the dust settles? To get the full picture, we need to quantify the effectiveness and the true cost of social consensus itself. The below framework provides a simple and structured approach to quantifying decentralization, safety, and the effectiveness of social consensus mechanisms in blockchain systems. 

_Note: Many thanks to  [Terry @ EclipseLabs](https://x.com/0xtaetaehoho)  for sharing his notes on the social consensus. My analysis is largely inspired from a discussion with him._


## Definitions and Notations

We define key metrics for safety and decentralization as below.

**Number of Political Entities Required for a Double Spend**

Let:
- $N_p$ be the total number of political entities (distinct validators or groups of validators) in the network.
- $C_d$ be the minimum number of political entities that must collude to enact a double spend.

The decentralization level, $D$, can be measured as the ratio of the required colluding entities to the total entities:


$$D = \frac{C_d}{N_p}$$

Where:
- $D \approx 1$ indicates a highly decentralized network, as nearly all entities would need to collude for a double spend.
- $D \ll 1$ suggests centralization, as only a small fraction of entities can enact a double spend.

This ratio effectively measures how dispersed the power to collude is within the network. A value closer to 1 implies that the network’s security depends on a wide distribution of authority, making collusion difficult. Conversely, a value closer to 0 implies centralization, where few entities control the majority of the network’s power.

**Safety Fault Detectability**

Let:
- $N_f$ be the number of full nodes.
- $N_l$ be the number of light nodes performing DAS.
- $N_c$ be the number of light clients capable of detecting safety faults.

Assuming $N_f$, $N_l$, and $N_c$ are mutually exclusive sets, we define the safety fault detectability ratio $S$ as:


$$S = \frac{N_f + N_l + N_c}{N_p}$$


Where:
- $S \gg 1$ implies high safety fault detectability, as there are more entities capable of detecting faults than those needed to enact faults.
- $S \leq 1$ implies low detectability, suggesting potential vulnerability to undetected safety faults.

If these sets $N_f$, $N_l$, and $N_c$ overlap, the interpretation of $S$ may change. For example, if some nodes serve multiple roles (e.g., a full node also acting as a light client), this could enhance fault detectability without increasing the total number of distinct nodes. It is important to consider these overlaps when interpreting $S$.


**Cost of Corruption**

The cost of corruption measures the economic barriers to collusion. 

Let:
- $C_v$ be the total cost required to corrupt $k$ validators.
- $C_s$ be the penalties (e.g., slashing) imposed after corruption is detected.
- $\pi_v$ be the profit an attacker expects from successfully corrupting these validators.

We define the net corruption cost $C_n$ as:


$$C_n = C_v + C_s - \pi_v$$


- $C_n > 0$  implies that the cost of corrupting the network exceeds the potential profit, thereby discouraging attacks.
- $C_n \leq 0$  suggests that the network is vulnerable, as attackers stand to gain more than they risk, making corruption economically viable.

This formula underscores the importance of robust economic penalties (slashing) and high corruption costs to maintain network security.
  

## Mathematical Framework for Social Consensus Evaluation

Given the metrics for safety and decentralization, we need to evaluate the robustness of social consensus mechanisms.

**Measuring Decentralization of Social Consensus**

Let:
- $N_s$ be the number of entities involved in the social consensus process.
- $W_i$ be the weight (influence) of each entity $i$ in the consensus process, $\sum_{i=1}^{N_s} W_i = 1$.

We use the Herfindahl-Hirschman Index (HHI) to measure the concentration of influence within the social consensus:

$$D_s = 1 - \sum_{i=1}^{N_s} W_i^2$$

Where:
- $D_s$ closer to 1 indicates a highly decentralized consensus, as influence is more evenly distributed among the entities.
- $D_s$ closer to 0 indicates centralization, where a few entities hold significant influence over the consensus process.


**Evaluating the Impact of Social Consensus on Safety**

We introduce a "social consensus safety factor" $\sigma_s$ to measure the effectiveness of social consensus in resolving safety faults. Let:


$$\sigma_s = \frac{\sum_{i=1}^{N_s} S_i \times W_i}{N_p \times D_s}$$


Where $S_i$ represents the fault-detecting capability of entity $i$. A higher $\sigma_s$ implies a stronger social consensus mechanism in addressing safety faults, combining both the fault-detecting capabilities of entities and the distribution of their influence.

## Practical Experiments in Production Systems

These mathematical foundations allow us to form testable hypotheses in real-world blockchain environments:

### Hardware Requirements and Decentralization

**Hypothesis:**
- Increasing hardware requirements leads to a decrease in $S$, $D$, and $D_s$, leading to lower decentralization and fault detectability.

**Mathematical Testing:**
- Track changes in $S$ and $D$ as hardware requirements increase.
- Analyze whether higher hardware requirements correlate with decreased validator participation, leading to lower decentralization metrics.

### Layer 2 Security and Censorship Resistance

**Hypothesis:**
- L2 solutions with a single sequencer have low $S$ and high $C_n$, implying higher risks of censorship and security breaches.

**Mathematical Testing:**
- Measure $S$ and $C_n$ across different L2 solutions to compare their resilience.
- Evaluate whether improvements in $S$ (e.g., by adding more sequencers) lead to enhanced security.


## References
- STAKESURE - Proof of Stake Mechanisms with Strong Cryptoeconomic Safety by Soubhik Deb, Robert Raynor, Sreeram Kannan,     
https://doi.org/10.48550/arXiv.2401.05797
- The Economic Limits of Permissionless Consensus by Eric Budish, Andrew Lewis-Pye, Tim Roughgarden,     
https://doi.org/10.48550/arXiv.2405.09173
- Robust Restaking Networks by Naveen Durvasula, Tim Roughgarden,     
https://doi.org/10.48550/arXiv.2407.21785

