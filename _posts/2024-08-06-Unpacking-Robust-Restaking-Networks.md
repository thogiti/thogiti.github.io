---
title: 	Unpacking Robust Restaking Networks - Cascading Attacks and Validator Security
tags: Ethereum Restaking Eigenlabs Eigenlayer Securing-Multi-Service-Validators Validator-Security Robust-Restaking-Networks Validator-Reuse-Risks Cascading-Attacks Cryptoeconomic-security
---

## WIP - Work in Progress

## [Overview](#Overview)

In this blog post, we will unpack and review the key insights and contributions of  the paper [Robust Restaking Networks](https://doi.org/10.48550/arXiv.2407.21785). We will explore the innovative models and conditions proposed by Durvasula and Roughgarden, aimed at ensuring that restaking networks remain secure even in the face of potential attacks. From the importance of overcollateralization to the mathematical characterization of robust security, we will break down the complex concepts of cryptoeconomic security in restaking networks and understand the significance of this research in the context of blockchain security.

## [Citation of the Paper](#citation-of-the-paper)
Robust Restaking Networks by Naveen Durvasula, and Tim Roughgarden, arXiv:2407.21785 [cs.GT]
[https://doi.org/10.48550/arXiv.2407.21785](https://doi.org/10.48550/arXiv.2407.21785)

## [Definitions and Notations - Key Concepts](#definitions-and-notations---key-concepts)

To understand the "Robust Restaking Networks" paper, we need to first lay down a solid foundation. These definitions and notations are your toolkit for understanding. Let’s break it down.

### Validators and Services: The Backbone of the Network
- **Validators $V$**: Validators are the unsung heroes of blockchain—they validate transactions, maintain network integrity, and keep things running smoothly. Each validator $v$ stakes a certain amount of cryptocurrency $\sigma_v$ (like ETH in Ethereum) as collateral. If they act maliciously, they risk losing this stake, which is why it’s crucial.

- **Services $S$**: These are the tasks or applications that validators support. Think of services as different jobs that validators can take on—everything from running the core consensus protocol to ensuring data availability. Each service $s$ has a corruption profit $\pi_s$, which is basically the bounty an attacker could earn by compromising it.

### The Restaking Graph: Mapping the Network
- **Restaking Graph $G$**: Imagine a map of the network, with validators and services as the landmarks. The restaking graph $G = (S, V, E, \pi, \sigma, \alpha)$ connects these landmarks:
  - **$S$**: The services.
  - **$V$**: The validators.
  - **$E$**: The edges that show which validators are supporting which services.
  - **$\pi_s$**: The potential profit from corrupting service $s$.
  - **$\sigma_v$**: The stake each validator $v$ has on the line.
  - **$\alpha_s$**: The fraction of total stake needed to corrupt a service $s$.

- **Neighbors $N_G(A)$**: Neighbors in this graph are the direct connections. If you’re looking at a service $s$, $N_G(s)$ tells you which validators are backing it. If you’re focusing on validators, $N_G(v)$ shows you the services they support.

### Attack Dynamics: How Validators and Services Clash
- **Attacking Coalition $(A, B)$**: When validators decide to team up and go rogue, they form an attacking coalition. Here’s what that means:
  - **$A$**: The set of services under attack.
  - **$B$**: The validators carrying out the attack.
  - This coalition is effective if:
    - Validators in $B$ control enough stake to overpower the services in $A$:
      
      $\sum_{v \in B \cap N_G(s)} \sigma_v \geq \alpha_s \sum_{v \in N_G(s)} \sigma_v \quad \forall s \in A$
      
    - The profit from attacking $A$ is greater than the total stake $B$ could lose:
      
      $\sum_{s \in A} \pi_s > \sum_{v \in B} \sigma_v$
      

- **Valid Attack**: This is an attack that checks both boxes: the validators have enough power, and the attack is financially worthwhile.

### Restaking Graph After an Attack $G \downarrow B$: The Aftermath
- **Graph After Attack $G \downarrow B$**: After an attack, the network isn’t the same. $G \downarrow B$ represents the state of the network after the validators in $B$ have been slashed. It’s like a map showing what’s left after a battle—some validators are gone, and the network has to carry on with the remaining ones.

### Stable Attack: Keeping It Solid
- **Stable Attack**: Not all attacks are stable—some are more like fleeting opportunities. A stable attack ensures every validator in the coalition $B$ is contributing meaningfully. It’s not just about having enough stake; it’s about making sure there’s no free riding. Mathematically, this is enforced by:
  $\sum_{v \in B \setminus B'} \sigma_v < \sum_{s \in A \setminus A'} \pi_s$
  for any subsets $A' \subseteq A$ and $B' \subseteq B$. This guarantees that every validator in $B$ is necessary for the attack's success, making the coalition solid and stable.

### Cascading Attacks: When One Attack Isn’t Enough
- **Cascading Attack**: Imagine a situation where a small attack or a problem in a network doesn’t just stay small—it grows and spreads, causing much bigger issues. That’s what the authors call a **cascading attack**.

Here’s how it works:

- **The Initial Spark**: It all starts with a minor attack or shock—maybe a few validators (the ones who keep the network secure) lose their stake due to some problem (e.g. a software error).  
- **Chain Reaction**: This initial problem weakens the network just enough that another, bigger problem can happen. Because the network is now slightly less secure, it’s easier for the next attack to occur. This new attack weakens the network further, setting the stage for yet another attack, and so on. 
- **A Cascading Attack**: We call this sequence of events a cascading attack. Each step in the sequence makes the next one more likely, leading to a chain reaction that can ultimately cause a significant loss in the network.

In technical terms, if you have a restaking graph $G$, which maps out how validators are connected to services, each step in a cascading attack sequence $(A_1, B_1), (A_2, B_2), \dots, (A_T, B_T)$ is valid if it’s effective on the network that’s already been weakened by previous steps. $(A_t, B_t) \text{ is valid on } G \downarrow \bigcup_{i=1}^{t-1} B_i$
  
Here, $G \downarrow B$ represents the network after some validators have been slashed and removed.

### Worst-Case Stake Loss: Preparing for the Worst
- **Worst-Case Stake Loss $R_\psi(G)$**: Now, let’s talk about the worst-case stake loss. This concept is all about understanding the absolute worst thing that could happen if cascading attacks were to occur.

Here’s the idea:

- **Starting with a Small Shock**: Let’s say something bad happens—a small group of validators loses their stake. This is the initial shock, represented by  $\psi$.
- **Exploring All Possibilities**: We then look at all possible groups of validators who could be part of this initial shock. We’re essentially asking: What’s the worst group of validators that could be hit first?
- **Impact on the Network**: Once these validators are out of the game, the network changes—it’s not as strong as it was before. We use the notation $G \downarrow D$ to represent the network after this initial group $D$ of validators has been slashed or removed.
- **The Worst-Case Loss**: Now, we calculate the worst-case stake loss $R_\psi(G)$. This is a way of estimating the maximum amount of stake that could be lost as a result of cascading attacks that follow the initial shock. In other words, we’re trying to foresee how bad things could get if one bad event sets off a chain reaction of worse events.

This metric is crucial because it helps us understand how vulnerable the network might be to a series of failures, and it’s a key tool in designing systems that can withstand even the worst possible scenarios. It is calculated as:
  
  $R_\psi(G) = \psi + \max_{D \in D_\psi(G)} \max_{(A_1, B_1), \dots, (A_T, B_T) \in C(G \downarrow D)} \frac{\sigma_{\bigcup_{t=1}^{T} B_t}}{\sigma_V}$

  Here, $\psi$ is the initial shock to the system (a small stake loss), and $\sigma_{\bigcup_{t=1}^{T} B_t}$ is the total stake lost through all the cascading attacks.

### EigenLayer Sufficient Conditions: The Security Check
- **EigenLayer Sufficient Conditions**: To ensure the network is secure, the EigenLayer team developed a set of conditions[^1] that act as a quick security check. A validator $v$ is considered secure if:
  $\sum_{s \in N_G(v)} \frac{\sigma_v}{\sigma_{N_G(s)}} \cdot \frac{\pi_s}{\alpha_s} \leq \sigma_v$
  If all validators in the network satisfy this condition, it means the network is safe from any potential attacks.

Let's unpack this in bit more details. This is also **Claim 1** in the paper. 

Claim 1 in the paper states that a restaking graph $G$ is secure if for each validator $v \in V$, the following inequality holds:

$\sum_{s \in N_G(v)} \frac{\sigma_v}{\sigma_{N_G(s)}} \cdot \frac{\pi_s}{\alpha_s} \leq \sigma_v$

This claim is significant because it provides a sufficient condition for ensuring that the restaking network is secure, meaning that no valid attacks exist under the given conditions. Let's break down the claim step by step to understand it.

**Decomposing the Inequality**

The inequality in Claim 1 can be interpreted as follows:

- **Left Side**: $\sum_{s \in N_G(v)} \frac{\sigma_v}{\sigma_{N_G(s)}} \cdot \frac{\pi_s}{\alpha_s}$
  
  - $\sigma_{N_G(s)}$ is the total stake committed by all validators that support service $s$.
  - $\frac{\sigma_v}{\sigma_{N_G(s)}}$ represents the fraction of the total stake for service $s$ that validator $v$ contributes.
  - $\frac{\pi_s}{\alpha_s}$ is the "cost-benefit ratio" for attacking service $s$, representing the profit relative to the security threshold.

  This sum considers the aggregate influence of validator $v$ across all services it participates in, weighted by the potential profit from attacking each service.

- **Right Side**: $\sigma_v$
  
  - This is the total stake that validator $v$ has at risk.

The inequality suggests that for the network to be secure, the weighted sum of the potential attack profits (adjusted for the validator's stake in each service) should not exceed the validator's total stake. 

### Reference Depth of Cascading Attacks: How Deep Does the Rabbit Hole Go?
- **Reference Depth**: In a sequence of cascading attacks, the reference depth measures how far back each attack is influenced by the validators slashed in earlier attacks. It’s a way to understand the ripple effects across the network and gauge how interconnected these failures are.

**Definition: Multiplicative Slack.**  
We say that a restaking graph $G$ is secure with $\gamma$-slack if for all attacking coalitions $(A, B)$ on $G$,

$$(1 + \gamma) \cdot \pi_A \leq \sigma_B $$ where

Total profit from corrupting $A$ = $\pi_A$ and Total stake owned by validators $B$ = $\sigma_B$ (Equation 11)

## [Overcollateralization Provides Robust Security](#overcollateralization-provides-robust-security)

### [Lemma 1](#lemma-1)

**Statement:** Let $G = (S, V, E, \pi, \sigma, \alpha)$ be an arbitrary restaking graph, and further suppose that $(A, B)$ is an attacking coalition on $G \downarrow D$, where $D \subseteq V$. Then, $(A, B \cup D)$ is an attacking coalition on $G$.
   
**Explanation**: We want to prove that if a set of validators $B$ can attack a set of services $A$ in a subgraph where some validators $D$ are removed, then the combined set $B \cup D$ can also attack $A$ in the original graph $G$.
   
#### Understanding the Components

We have a restaking graph $G$, representing the interaction between validators and services.

Subgraph $G \downarrow D$: This is the graph $G$ but with the validators in $D \subseteq V$ removed or slashed. The attack condition is checked in this reduced graph.
   
**Attack Condition**

For $(A, B)$ to be an attacking coalition on the subgraph $G \downarrow D$, the validators in $B$ must control enough stake to meet the attack threshold for each service in $A$. Mathematically, this means:
   
   $\sigma_{B \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s) \setminus D} \quad \forall s \in A$
   
Here:
   - $\sigma_{B \cap N_G(s)}$ is the total stake of validators in $B$ that are connected to service $s$.
   - $\sigma_{N_G(s) \setminus D}$ is the total stake of validators connected to $s$ excluding those in $D$.
   
#### The Proof   

**Given Information**:
   
We know that $(A, B)$ is an attacking coalition in the subgraph $G \downarrow D$. This means for each service $s \in A$:

$\sigma_{B \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s) \setminus D}$

This is the starting assumption.
   
**Goal**:   

We need to show that the coalition $(A, B \cup D)$ is also an attacking coalition in the original graph $G$. Specifically, we want to prove:

$\sigma_{(B \cup D) \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s)} \quad \forall s \in A$

This means that when we include the validators from $D$, the total stake of $B \cup D$ must still meet the attack threshold for each service $s \in A$.

**The Stake Calculation**:

For each service $s \in A$, the total stake of validators in $B \cup D$ that are connected to $s$ is:
  
  $\sigma_{(B \cup D) \cap N_G(s)} = \sigma_{B \cap N_G(s)} + \sigma_{D \cap N_G(s)}$
  
  - $\sigma_{B \cap N_G(s)}$: Stake of validators in $B$ connected to $s$.
  - $\sigma_{D \cap N_G(s)}$: Stake of validators in $D$ connected to $s$.
   
**Incorporating the Attack Condition**:
   
Since $\sigma_{B \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s) \setminus D}$ (from the assumption), we can plug this into the equation:

$\sigma_{(B \cup D) \cap N_G(s)} = \sigma_{B \cap N_G(s)} + \sigma_{D \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s) \setminus D} + \sigma_{D \cap N_G(s)}$

Notice that $\sigma_{N_G(s)} = \sigma_{N_G(s) \setminus D} + \sigma_{D \cap N_G(s)}$.
   
**Simplifying the Expression**:
   
The above inequality can be rewritten as:

$\sigma_{(B \cup D) \cap N_G(s)} \geq \alpha_s \cdot (\sigma_{N_G(s)} - \sigma_{D \cap N_G(s)}) + \sigma_{D \cap N_G(s)}$

Since $\alpha_s \cdot \sigma_{N_G(s)} \geq \alpha_s \cdot \sigma_{D \cap N_G(s)}$, adding $\sigma_{D \cap N_G(s)}$ on both sides ensures:
        
$\sigma_{(B \cup D) \cap N_G(s)} \geq \alpha_s \cdot \sigma_{N_G(s)}$
        
This confirms that the total stake of $B \cup D$ meets the threshold required to attack $s$.
   
**Conclusion**:

Therefore, the set $B \cup D$ can successfully attack $A$ in the original graph $G$.

The lemma is thus proved, as $(A, B \cup D)$ is indeed an attacking coalition on $G$.
   

### [Corollary 1](#corollary-1)

**Statement:** Let $G = (S, V, E, \pi, \sigma, \alpha)$ be an arbitrary restaking graph, and further suppose that $(A_1, B_1), \dots, (A_T, B_T) \in \mathcal{C}(G)$ is a valid sequence of cascading attacks on $G$. Then, 
$$\left( \bigcup_{t=1}^{T} A_t, \bigcup_{t=1}^{T} B_t \right)$$
is also a valid attack on $G$.

**Explanation**:
This corollary is trying to prove that if we have a series of successful attacks on a network, then we can combine all these attacks into a single, larger attack, and it will still be successful. Essentially, it shows that a series of smaller attacks can be combined into one big attack without losing the validity of the attack conditions.

#### Understanding the Components

- **Restaking graph $G = (S, V, E, \pi, \sigma, \alpha)$**.

- **Cascading Attacks**:
  - A sequence of cascading attacks $(A_1, B_1), \dots, (A_T, B_T)$ refers to a sequence where each $(A_t, B_t)$ is an attack at step $t$, potentially enabled by the preceding attacks.

- **Union of Sets**:
  - $\bigcup_{t=1}^T A_t$ denotes the union of all services attacked across the sequence.
  - $\bigcup_{t=1}^T B_t$ denotes the union of all validators involved in these attacks.

#### What Needs to Be Proved?

The goal is to show that the combined set of all services and all validators involved in the cascading attacks also forms a valid attack on the original graph $G$. Specifically, this means showing:

- **Stake Condition**: The combined stake of the validators in $\bigcup_{t=1}^T B_t$ must be sufficient to attack the combined set of services $\bigcup_{t=1}^T A_t$.
- **Profit Condition**: The total profit from attacking $\bigcup_{t=1}^T A_t$ must exceed the total stake of the validators in $\bigcup_{t=1}^T B_t$.

#### Proof Breakdown

- **Applying Lemma 1**:
   - By repeatedly applying Lemma 1, the proof shows that each step in the sequence $(A_t, \bigcup_{i=1}^t B_i)$ is an attacking coalition on $G$. This is because as we progress through each attack $t$, the validators in $\bigcup_{i=1}^t B_i$ (those involved up to and including step $t$) are sufficient to attack the services in $A_t$.

- **Inspection of the Attack Condition (Eq. 1)**:
   - Since each $(A_t, \bigcup_{i=1}^t B_i)$ is an attacking coalition, by the attack condition in Eq. 1, we can say that the combined stake of validators across these steps is sufficient to attack their respective services.

- **Disjointness of the Sets**:
   - The services $A_t$ and the validators $B_t$ are considered to be disjoint across different $t$. This disjointness is key to combining the attack sets without overlap.
   - Specifically, the disjointness ensures that the combined attack over all steps meets the necessary conditions for a valid attack when considering the entire sequence.

- **Profit vs. Stake (Eq. 2)**:
   - For the combined set to be a valid attack, it must hold that:
     
     $$\sum_{t=1}^T \pi_{A_t} > \sum_{t=1}^T \sigma_{B_t}$$
     
   - This means the total profit from attacking all the services in the sequence must exceed the total stake of the validators involved in the attacks.

   - Since each individual step $(A_t, B_t)$ satisfies this condition (by the assumption that these are valid attacks), the sum of the profits will necessarily exceed the sum of the stakes across all steps.

   - Therefore, the combined attack $\left( \bigcup_{t=1}^T A_t, \bigcup_{t=1}^T B_t \right)$ is a valid attack on the original graph $G$, satisfying both the stake and profit conditions. This concludes the proof.

### [Theorem 1](#theorem-1)

**Statement:**  
Suppose that a restaking graph $G = (S, V, E, \pi, \sigma, \alpha)$ is secure with $\gamma$-slack for some $\gamma > 0$. Then, for any $\psi > 0$,

$$R_\psi(G) < \left(1 + \frac{1}{\gamma}\right) \psi.$$


**Explanation:**  
The theorem aims to show that if a restaking network is secure with multiplicative slack, then the maximum possible loss in stake due to an initial shock $\psi$, including any cascading effects, is strictly controlled. Specifically, the worst-case loss, $R_\psi(G)$, will be at most $\left(1 + \frac{1}{\gamma}\right)\psi$. This means that the network's security ensures that even if a small portion of the stake is initially lost, the total loss won't grow uncontrollably.

####  Understanding the Components

- **Restaking graph $G = (S, V, E, \pi, \sigma, \alpha)$**.

#### What Needs to Be Proved?

- **Multiplicative Slack $\gamma$**: The graph is considered secure with $\gamma$-slack if, for any potential attack coalition $(A, B)$ (where $A$ is a set of targeted services and $B$ is a set of validators attempting to attack), the following condition holds:
   
   $$(1 + \gamma) \cdot \pi_A \leq \sigma_B$$
   
   This means that the total stake controlled by the validators $B$ must be greater than the profit $\pi_A$ from attacking the services $A$, scaled by the factor $1 + \gamma$. The $\gamma$ term acts as a safety margin, ensuring validators have significantly more stake than the attack's potential profit.

#### Proof Breakdown

**The Initial Shock $\psi$:**
- **Initial Shock $\psi$**: Imagine that an event occurs, causing a fraction $\psi$ of the total stake $\sigma_V$ to be lost suddenly. This shock could represent anything from a validator malfunction to an external attack.
- The challenge is to assess how this initial loss might propagate through the network, potentially causing further losses—a process known as cascading failures.

**Defining the Subgraph and Cascading Attacks:**
- To analyze the effect of the initial shock, consider the subgraph $G \downarrow D$, where $D$ is the set of validators that lost their stake due to the initial shock. Thus, $G \downarrow D$ is the graph after removing these validators.
- **Cascading Attacks**: A sequence of attacks $(A_1, B_1), \dots, (A_T, B_T)$ could occur in this subgraph. These attacks represent possible successive failures or attacks that might happen after the initial shock.

**Using Corollary 1 to Aggregate Attacks:**
- According to **Corollary 1**, we can combine all these cascading attacks into a single, larger attack on the original graph $G$. Define:
   
   $$A := \bigcup_{t=1}^T A_t \quad \text{and} \quad B := \bigcup_{t=1}^T B_t$$
   
   This aggregated set $(A, B)$ represents an overall attack on the graph after considering all cascading effects.

**Understanding the Attack Condition:**
- For $(A, B)$ to be an effective attack in the subgraph $G \downarrow D$, the profit from attacking the services in $A$ must exceed the total stake held by validators in $B$:
   
   $$\pi_A > \sigma_B$$
   
   This inequality shows that $B$ alone cannot cover the profit potential from attacking $A$.

**Applying the $\gamma$-Slack Condition:**
- Since the original graph $G$ is secure with $\gamma$-slack, when we include the validators from the initial shock $D$ back into the equation, the slack condition should still hold:
   
   $$(1 + \gamma) \cdot \pi_A \leq \sigma_{B \cup D}$$
   
   Where $\sigma_{B \cup D} = \sigma_B + \sigma_D$ represents the combined stake of the attacking validators and those that suffered the initial shock.

**Simplifying and Analyzing the Inequality:**
- Substitute the known inequality $\pi_A > \sigma_B$ into the slack condition:
   
   $$(1 + \gamma) \cdot \sigma_B < (1 + \gamma) \cdot \pi_A \leq \sigma_B + \sigma_D$$
   
   This tells us that the total stake of validators involved in the cascading failures is not enough to meet the required stake threshold after accounting for the initial shock.

**Deriving the Bound on Worst-Case Loss:**
- Rearrange the inequality:
   
   $$\gamma \cdot \sigma_B \leq \sigma_D$$
   
   Since $\sigma_D$ represents the stake loss due to the initial shock $\psi$, express this as:
   
   $$\sigma_D = \psi \cdot \sigma_V \quad \Rightarrow \quad \gamma \cdot \sigma_B \leq \psi \cdot \sigma_V$$
   
- Normalize by dividing by $\sigma_V$ (the total stake in the network):
   
   $$\frac{\sigma_B}{\sigma_V} \leq \frac{\psi}{\gamma}$$
   
   This inequality shows that the proportion of stake lost due to cascading failures is limited by the initial shock scaled by $\frac{1}{\gamma}$.

**Summing the Losses:**
- Finally, sum the initial shock $\psi$ and the cascading loss $\frac{\sigma_B}{\sigma_V}$:
   
   $$\psi + \frac{\sigma_B}{\sigma_V} \leq \psi + \frac{\psi}{\gamma} = \left(1 + \frac{1}{\gamma}\right)\psi$$
   
   This bound on the total loss $R_\psi(G)$ ensures that no matter how severe the initial shock and subsequent cascades, the total loss remains within this predictable limit.

#### Key Insights of Theorem 1

- **Multiplicative Slack $\gamma$** provides a crucial safety buffer that limits the impact of cascading failures. By requiring that validators hold more stake than the potential profit from attacks (scaled by $1 + \gamma$), the network can absorb shocks without triggering uncontrollable losses.
- **Controlled Cascading:** The proof shows that even in the worst-case scenario, where losses cascade through the network, the total loss is bounded and predictable. This bound is crucial for network designers to ensure the resilience and stability of blockchain systems.


### [Corollary 2](#corollary-2)

**Statement:**  
Let $G$ be a restaking graph such that, for all validators $v \in V$,

$$\sum_{s \in N_G(\{v\})} \frac{\sigma_v}{\sigma_{N_G(\{s\})}} \cdot \frac{(1 + \gamma)\pi_s}{\alpha_s} \leq \sigma_v$$

Then, the worst-case stake loss $R_\psi(G)$ is less than $\left(1 + \frac{1}{\gamma}\right)\psi$.

**Explanation:**  
This corollary aims to show that if every validator in the network satisfies the particular risk condition, then the entire network is secure. Specifically, this condition ensures that the potential losses due to attacks (even if magnified by the slack factor $\gamma$) are always covered by the stake of the validators. Consequently, the worst-case stake loss across the network remains bounded.

####  Understanding the Components

**Interpreting the Condition (Equation 17):**
- **Validator's Stake $\sigma_v$**: This is the total stake controlled by validator $v$.
- **Service $s$**: Each service $s$ in $N_G(\{v\})$ is directly supported by validator $v$.
- **Fraction of Stake Supporting Service $s$**: The term $\frac{\sigma_v}{\sigma_{N_G(\{s\})}}$ represents the proportion of total stake supporting service $s$ that comes from validator $v$. This is crucial because it scales the risk each validator faces based on their contribution to the service’s security.
- **Modified Profit Term $(1 + \gamma)\pi_s$**: This term reflects the potential profit from corrupting service $s$, inflated by the multiplicative slack $\gamma$. The inflation by $1 + \gamma$ means that even if the attack is more profitable (due to slack), the validator must still have enough stake to cover this increased risk.

#### What Needs to Be Proved?

- The inequality states that the sum of potential losses (accounted for by the slack-adjusted profit terms) across all services supported by a validator must not exceed the validator's own stake. If this holds for every validator, then the network is secure.

#### How Does This Condition Ensure Security?

- **Risk Containment for Each Validator:** If each validator's total stake can cover the worst-case scenario of supporting all their connected services (considering the slack), then no single validator is overexposed to risk. This containment at the validator level directly supports the global security of the network.
- **Preventing Cascades:** By ensuring that no validator is overleveraged relative to the services they support, the condition helps prevent a domino effect where the failure of one validator could trigger further losses.

#### Proof Breakdown

**Connecting to Theorem 1 and Claim 1:**

- **Theorem 1 Recap:** Theorem 1 states that if the entire network is secure with $\gamma$-slack, then the worst-case loss $R_\psi(G)$ is bounded by $\left(1 + \frac{1}{\gamma}\right)\psi$.
- **Claim 1:** This claim (not fully detailed here but referenced in the proof) likely provides a sufficient condition for the absence of valid attacks when profits are scaled by $1 + \gamma$.
- **Applying to Corollary 2:** The proof shows that if each validator satisfies the condition in Equation 17, it implies that the entire network is secure under the slack-adjusted conditions. Essentially, Equation 17 is a localized version of the global security condition in Theorem 1. By applying the condition from Claim 1, which ensures no valid attacks under the adjusted profits, the corollary concludes that the network’s worst-case loss remains bounded as stated in Theorem 1.

**Key Insights of Corollary 2:**

- If every validator satisfies the localized risk condition in Equation 17, the network as a whole is guaranteed to resist large cascading losses. The slack-adjusted potential profits from attacks are never able to overwhelm the validators' stakes, thereby ensuring the network remains robust.
- In practice, this means that network designers can ensure security by verifying this condition for all validators, which is much easier than checking the entire network's security directly.





## [Lower Bounds for Global Security](#lower-bounds-for-global-security)


## [Local Security](#local-security)


## [Local Security Condition for Stable Attacks](#local-security-condition-for-stable-attacks)


## [Lower Bounds for Local Security](#lower-bounds-for-local-security)


## [Long Cascades](#long-cascades)


## [Lower Bounds under a Bounded Profit-Stake Ratio](#lower-bounds-under-a-bounded-profit-stake-ratio)


## [References](#references)
[^1]: EigenLayer Team. Eigenlayer: The restaking collective. URL: https://docs.eigenlayer.xyz/overview/whitepaper, 2023
