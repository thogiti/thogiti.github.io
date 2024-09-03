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


## Generalizing N50-Based Metrics for Blockchain Networks

In genomics, [N50-based metrics](https://en.wikipedia.org/wiki/N50,_L50,_and_related_statistics) are widely used to evaluate the quality of genome assemblies by measuring the distribution of sequence lengths. These information theoretic concepts can be adapted to cryptoeconomics to provide a structured way of assessing decentralization, safety, and concentration in both PoW and PoS blockchain networks. By generalizing these metrics, we can create a unified framework to measure how resources, power, and influence are distributed among network participants, offering deeper insights into network resilience, fairness, and security.

### Decentralization Metrics

**Network Resource Share Metric (DN50):**

- **Definition:** The Network Resource Share Metric, $DN(p)$, measures the minimum cumulative share of resources (e.g., hashing power in PoW or stake in PoS) held by the smallest subset of participants (such as miners, validators, or stakers) that collectively control $p\%$ of the total network resources.
  
Mathematically, $DN(p)$ can be defined as:

Let $R_1 \geq R_2 \geq \cdots \geq R_N$ be the ordered resource shares of participants, where $R_i$ is the resource share of the $i$-th participant and $N$ is the total number of participants.

Define $k$ as the smallest integer such that:
  
$$\sum_{i=1}^{k} R_i \geq \frac{p}{100} \times \sum_{i=1}^{N} R_i$$
  
Then, the Network Resource Share Metric is:

  
$$DN(p) = \sum_{i=1}^{k} R_i$$

- **For example:**
  - $DN(50)$ represents the minimum cumulative resource held by the smallest number of participants who control 50\% of the network’s total resources.
  - A high $DN(50)$ suggests a decentralized network where many participants are needed to control 50\% of resources.
  - A low $DN(50)$ indicates centralization, where few participants dominate.

**Network Participant Count Metric (DL50):**

- **Definition:** The Network Participant Count Metric, $DL(p)$, is the smallest number of participants needed to control $p\%$ of the total network resources.

Mathematically, $DL(p)$ can be defined as follows:

$$DL(p) = \min \lbrace k : \sum_{i=1}^{k} R_i \geq \frac{p}{100} \times \sum_{i=1}^{N} R_i \rbrace$$

- **For example:**
  - $DL(50)$ represents the minimum number of participants required to control 50\% of the network’s resources.
  - A smaller $DL(50)$ indicates centralization.
  - A larger $DL(50)$ indicates decentralization.

**Example Clarification:**

Suppose we have a network with resource shares R = [40%, 30%, 10%, 10%, 5%, 5%]:

- For $DN(50)$:
  - The smallest group controlling at least 50% is the first two participants (40% + 30% = 70%).
  - Therefore, $DN(50) = 70\%$.

- For $DL(50)$:
  - The smallest number of participants controlling at least 50% is also the first two participants.
  - Therefore, $DL(50) = 2$.

**Target Resource Share Metric (NG50):**

- **Definition:** The Target Resource Share Metric, $NG(p)$, measures the minimum cumulative share of resources required to reach $p\%$ of a predefined target resource distribution, often based on an ideal decentralized model.

Mathematically, $NG(p)$ can be defined as follows:

$$NG(p) = \min \lbrace k : \sum_{i=1}^{k} R_i \geq \frac{p}{100} \times \text{Target Resource} \rbrace$$


- **For example:**
  - $NG(50)$ represents the minimum cumulative resource needed to reach 50\% of an ideal target distribution. If the target is 50 participants, but the network achieves this with only 20, then $NG(50) = 20$.

### Safety Fault Tolerance Metrics

**Safety Fault Tolerance Metric (SFN50):**

- **Definition:** The Safety Fault Tolerance Metric, $SFN(p)$, measures the cumulative security capacity (e.g., the ability to detect and mitigate attacks) of the smallest group of participants that together provide $p\%$ of the network’s total fault tolerance.

Mathematically, $SFN(p)$ can be defined as follows:

Let $S_1 \geq S_2 \geq \cdots \geq S_N$ be the ordered fault tolerance capacities of participants, where $S_i$ is the fault tolerance capacity of the $i$-th participant, and $N$ is the total number of participants.

Define $k$ as the smallest integer such that:

$$\sum_{i=1}^{k} S_i \geq \frac{p}{100} \times \sum_{i=1}^{N} S_i$$

Then, the Safety Fault Tolerance Metric is:

$$SFN(p) = \sum_{i=1}^{k} S_i$$
  

This metric calculates the total fault tolerance capacity controlled by the smallest number of participants whose cumulative capacity meets or exceeds $p\%$ of the total network fault tolerance.

- **For example:**
  - $SFN(50)$ represents the smallest group of participants whose combined security capacity accounts for 50\% of the total network security.
  - A higher $SFN(50)$ suggests that the network’s fault tolerance is well-distributed, making it more resilient.
  - A lower $SFN(50)$ indicates that fault tolerance is concentrated, which could be a vulnerability.

**Safety Participant Count Metric (SFL50):**

- **Definition:** The Safety Participant Count Metric, $SFL(p)$, is the minimum number of participants needed to provide $p\%$ of the network’s fault tolerance capacity.

Mathematically, $SFL(p)$ can be defined as follows:

$$SFL(p) = \min \lbrace k : \sum_{i=1}^{k} S_i \geq \frac{p}{100} \times \sum_{i=1}^{N} S_i \rbrace$$


This metric identifies the smallest number of participants $k$ whose cumulative fault tolerance capacity meets or exceeds $p \%$ of the total network fault tolerance.

- **For example:**
  - $SFL(50)$ represents the number of participants required to account for 50\% of the network’s fault tolerance.
  - A smaller $SFL(50)$ suggests centralization of fault tolerance.
  - A larger $SFL(50)$ indicates distributed fault tolerance, enhancing network resilience.

**Example Clarification:**

Suppose we have a network with fault tolerance capacities S = [50%, 30%, 10%, 5%, 5%]:

- For $SFN(50)$:
  - The smallest group controlling at least 50% of fault tolerance is the first participant alone (50%).
  - Therefore, $SFN(50) = 50\%$.

- For $SFL(50)$:
  - The smallest number of participants controlling at least 50% of fault tolerance is the first participant.
  - Therefore, $SFL(50) = 1$.
 

**Target Fault Tolerance Metric (UG50):**

- **Definition:** The Target Fault Tolerance Metric, $UG(p)$, measures the minimum cumulative fault tolerance required to reach $p\%$ of a predefined safety target, based on an ideal model.

Mathematically, $UG(p)$ can be defined as follows:

$$UG(p) = \min \lbrace k : \sum_{i=1}^{k} S_i \geq \frac{p}{100} \times \text{Target Fault Tolerance} \rbrace$$

- **For example:**
  - $UG(50)$ represents the smallest group of participants required to meet 50\% of the safety target. If the target is met with 12 participants instead of 25, $UG(50) = 12$.

### Centralization and Concentration Metrics

**Concentration Influence Metric (CN50):**

- **Definition:** The Concentration Influence Metric, $CN(p)$, measures the minimum influence (e.g., voting power or transaction validation) held by the smallest subset of participants that control $p\%$ of the network’s total influence.

Mathematically, $CN(p)$ can be defined as follows:

Let $W_1 \geq W_2 \geq \cdots \geq W_N$ be the ordered influence shares of participants, where $W_i$ is the influence (e.g., voting power) of the $i$-th participant, and $N$ is the total number of participants.

Define $k$ as the smallest integer such that:

$$\sum_{i=1}^{k} W_i \geq \frac{p}{100} \times \sum_{i=1}^{N} W_i$$

Then, the Concentration Influence Metric is:

$$CN(p) = \sum_{i=1}^{k} W_i$$


This metric calculates the total influence controlled by the smallest group of participants whose combined influence meets or exceeds $p \%$ of the total network influence.
  
- **For example:**
  - $CN(50)$ represents the minimum cumulative voting power held by the smallest number of participants controlling 50\% of the network’s influence.
  - A high $CN(50)$ suggests decentralized influence.
  - A low $CN(50)$ indicates concentrated power.


**Influence Participant Count Metric (CL50):**

- **Definition:** The Influence Participant Count Metric, $CL(p)$, is the minimum number of participants necessary to control $p\%$ of the network’s total influence.

Mathematically, $CL(p)$ can be defined as follows:

$$CL(p) = \min \lbrace k : \sum_{i=1}^{k} W_i \geq \frac{p}{100} \times \sum_{i=1}^{N} W_i \rbrace$$

This metric identifies the smallest number of participants $k$ whose cumulative influence meets or exceeds $p\%$ of the total network influence.

- **For example:**
    - $CL(50)$ represents the minimum number of participants controlling 50\% of the network’s influence.
    - A smaller $CL(50)$ indicates centralization.
    - A larger $CL(50)$ reflects greater decentralization.

**Example Clarification**

Suppose we have a network with influence shares V = [45%, 35%, 10%, 5%, 5%]:

- For $CN(50)$:
  - The smallest group controlling at least 50\% of influence consists of the first participant alone (45\%) and a portion of the second (5\% from 35\%).
  - Therefore, $CN(50) = 50\%$.

- For $CL(50)$:
  - The smallest number of participants controlling at least 50\% of influence is the first two participants.
  - Therefore, $CL(50) = 2$.


**Target Influence Metric (UG50):**

- **Definition:** The Target Influence Metric, $UG(p)$, measures the minimum cumulative influence required to reach $p\%$ of a predefined influence distribution target, based on an ideal governance model.

Mathematically, $UG(p)$ can be defined as follows:

$$UG(p) = \min \lbrace k : \sum_{i=1}^{k} V_i \geq \frac{p}{100} \times \text{Target Influence Distribution} \rbrace$$

- **For example:**
  - $UG(50)$ represents the smallest group of participants needed to reach 50\%\ of the target influence. If the target is met with 15 participants instead of 30, $UG(50) = 15$.




## References
- STAKESURE - Proof of Stake Mechanisms with Strong Cryptoeconomic Safety by Soubhik Deb, Robert Raynor, Sreeram Kannan,     
https://doi.org/10.48550/arXiv.2401.05797
- The Economic Limits of Permissionless Consensus by Eric Budish, Andrew Lewis-Pye, Tim Roughgarden,     
https://doi.org/10.48550/arXiv.2405.09173
- Robust Restaking Networks by Naveen Durvasula, Tim Roughgarden,     
https://doi.org/10.48550/arXiv.2407.21785
- https://en.wikipedia.org/wiki/N50,_L50,_and_related_statistics

