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
- **Worst-Case Stake Loss $R_\psi(G)$**: Let’s imagine the worst-case scenario—a series of cascading attacks that snowballs into something catastrophic. The worst-case stake loss is a measure of how much damage these attacks could cause, calculated as:
  
  $R_\psi(G) = \psi + \max_{D \in D_\psi(G)} \max_{(A_1, B_1), \dots, (A_T, B_T) \in C(G \downarrow D)} \frac{\sigma_{\bigcup_{t=1}^{T} B_t}}{\sigma_V}$

  Here, $\psi$ is the initial shock to the system (a small stake loss), and $\sigma_{\bigcup_{t=1}^{T} B_t}$ is the total stake lost through all the cascading attacks.

### EigenLayer Sufficient Conditions: The Security Check
- **EigenLayer Sufficient Conditions**: To ensure the network is secure, the EigenLayer team developed a set of conditions that act as a quick security check. A validator $v$ is considered secure if:
  $\sum_{s \in N_G(v)} \frac{\sigma_v}{\sigma_{N_G(s)}} \cdot \frac{\pi_s}{\alpha_s} \leq \sigma_v$
  If all validators in the network satisfy this condition, it means the network is safe from any potential attacks.

### Reference Depth of Cascading Attacks: How Deep Does the Rabbit Hole Go?
- **Reference Depth**: In a sequence of cascading attacks, the reference depth measures how far back each attack is influenced by the validators slashed in earlier attacks. It’s a way to understand the ripple effects across the network and gauge how interconnected these failures are.



