---
title: Solving the Messopotamia - The Curious World of Sealed Bid Auctions in Ethereum’s PBS
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-price-sealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue
---

## WIP - Work in progress

*Note: Many thanks to [Barnabé Monnot](https://warpcast.com/barnabe) for reviewing, guidance, and providing feedback.*

## Introduction

In this post, we explore the intriguing world of edge cases within First Price Sealed Bid Auction (FPSBA) and Second Price Sealed Bid Auction (SPSBA) in Ethereum’s Proposer Builder Separation (PBS) scheme, where traditional auction theories meet the cutting-edge challenges of blockchain technology. 

Before we proceed, a quick note: If you're unfamiliar with the concepts of [PBS](https://barnabe.substack.com/p/pbs)[^1][^2], FPSBA, or SPSBA, or simply wish for a refresher, I recommend visiting [Sealed Bid Auctions in Ethereum’s PBS](https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html)[^3]. It’s essential groundwork that will enrich your understanding of the discussions that lie ahead.

In this exploration, we meditate on the scenarios that deviate from the norm—where honesty and transparency are compromised, the system’s integrity is put to the test and the participants in the network exploiting less understood concepts that could compromise auction efficiency and fairness. These aren’t just theoretical curiosities; they bear significant, tangible implications for the design and execution of auctions on the Ethereum network. For each case, we’ll dissect the problem, propose methodologies for modeling these complexities, and discuss strategic modifications to the auction and mechanism designs that could help mitigate these issues.

So, let’s start our journey, working together to better understand Ethereum’s auction mechanics and find practical solutions for its challenging scenarios.

## Dishonest Builder

![proposer-remorse-meme](/assets/images/20240501/proposer-remorse-meme.jpg)

### Description
This scenario explores the complexities when builders, participating in Ethereum's PBS auctions, submit artificially low bids or collude with each other. This dishonest behavior risks the integrity and effectiveness of the auction, affecting the proposer’s revenue and the overall fairness of the process.

### Problem Highlight
Dishonest bidding and collusion distort the true competitive nature of the auction, leading to reduced proposer payments and potentially undermining the long-term sustainability of the system. This not only affects immediate auction outcomes but could deter honest participants from engaging with the system due to perceived unfairness.

### Modeling Approach
To tackle this issue, we'll employ a mathematical model that integrates the key variables influencing builder behavior and auction outcomes:

- **Builder Dishonesty Alpha ($\alpha$)**: Proportion of dishonest builders, drawn from $\text{Uniform}(0, 1)$.
- **Builder Dishonesty Beta ($\beta_i$)**: Random uniform variable in $[0, \beta]$ representing the extent of bid shading by dishonest builders.
- **Collusion Factor ($\gamma$)**: Proportion of dishonest builders involved in collusion, drawn from $\text{Uniform}(0, 1)$.
- **Collusion Shading Factor ($\delta$)**: Additional factor by which colluding builders further drop their bids, drawn from $\text{Uniform}(0, 1)$.


### Bidding Strategies in FPSBA and SPSBA

To analyze the impact of these parameters on proposer payments, bid distributions, and equilibrium points, we need to consider both theoretical and simulation-based approaches.

- **Honest Builders**: Bid according to their valuations.
   $B_i = \text{OptimalBid}(V_i)$

- **Dishonest Non-Colluding Builders**: Shade their bids by a random $\beta_i$ drawn from $[0, \beta]$.
   $B_i = (1 - \beta_i) \text{OptimalBid}(V_i) \quad \text{where} \quad \beta_i \sim \text{Uniform}(0, \beta)$

- **Colluding Builders**: Further shade their bids by $\delta$ on top of the random $\beta_i$.
   $B_i = (1 - \beta_i) (1 - \delta) \text{OptimalBid}(V_i) \quad \text{where} \quad \beta_i \sim \text{Uniform}(0, \beta)$

### Analysis of Proposer Payments

#### FPSBA

**Proposer Payment**:
$P_{\text{FPSBA}} = \max(B_1, B_2, \ldots, B_N)$

Where:
- $B_i$ is the bid of builder $i$.

#### SPSBA 

**Proposer Payment**:
$P_{\text{SPSBA}} = \max_{i \neq j} (B_i)$

Where:
- $B_i$ is the bid of builder $i$.
- $B_j$ is the highest bid.

### Equilibrium Analysis

To understand the equilibrium behavior, we need to analyze the bidding strategies and how they are influenced by the parameters $\alpha$, $\beta$, $\gamma$, and $\delta$.

#### Honest Bidding Strategy

For honest builders, the bidding strategy is straightforward:
$B_i = \text{OptimalBid}(V_i)$

#### Dishonest Bidding Strategy

For dishonest non-colluding builders, the bidding strategy is:
$B_i = (1 - \beta_i) \text{OptimalBid}(V_i) \quad \text{where} \quad \beta_i \sim \text{Uniform}(0, \beta)$

#### Colluding Bidding Strategy

For colluding builders, the bidding strategy further reduces the bid:
$B_i = (1 - \beta_i) (1 - \delta) \text{OptimalBid}(V_i) \quad \text{where} \quad \beta_i \sim \text{Uniform}(0, \beta)$

### Impact Analysis

- **Proposer Payments**: Proposer payments are significantly influenced by the parameters $\alpha$, $\beta$, $\gamma$, and $\delta$. Higher values of $\alpha$, $\beta$, and $\gamma$ generally result in lower proposer payments, with $\delta$ further reducing payments when colluding bids are involved.
- **Bid Distributions**: The level of dishonesty and collusion among builders affects the distribution of bids. Dishonest bidding leads to a wider distribution of lower bids, while colluding bids, further reduced by $\delta$, are concentrated at lower values.
- **Equilibrium Points**: The equilibrium shifts as $\alpha$, $\beta$, $\gamma$, and $\delta$ change, influencing builders' strategies. Higher levels of dishonesty and collusion tend to push the equilibrium towards lower bid values.
- **Impact of $\alpha$ (Proportion of Dishonest Builders)**:
   - As $\alpha$ increases, the number of dishonest builders increases. This will likely lead to lower bids overall due to bid shading by $\beta_i$.
   - Higher $\alpha$ can decrease proposer payments in FPSBA because the highest bid is likely to be shaded.
   - In SPSBA, the second-highest bid is also likely to be shaded, potentially reducing proposer payments, though the effect might be less pronounced than in FPSBA.
- **Impact of $\beta$ (Extent of Bid Shading by Dishonest Builders)**:
   - As $\beta$ increases, the extent of bid shading increases. This results in lower bids from dishonest builders.
   - A higher $\beta$ will reduce proposer payments in both FPSBA and SPSBA.
   - Bid shading impacts the equilibrium by pushing the bids downwards, potentially altering the distribution of winning bids.
- **Impact of $\gamma$ (Proportion of Colluding Builders)**:
   - As $\gamma$ increases, the number of colluding builders increases. This results in coordinated bid shading by an additional factor $\delta$.
   - Higher $\gamma$ can further decrease proposer payments in FPSBA because colluding bids are additionally shaded.
   - In SPSBA, coordinated bid shading can reduce the second-highest bid, impacting proposer payments.
- **Impact of $\delta$ (Additional Shading Factor for Colluding Builders)**:
   - As $\delta$ increases, the bids of colluding builders are further reduced.
   - Higher $\delta$ results in lower proposer payments in both FPSBA and SPSBA.
   - The presence of $\delta$ can significantly alter the equilibrium by making colluding bids substantially lower than non-colluding bids.

## Dishonest Proposer – Bid Leakage

![bid-leakage-evil-kermit-meme](/assets/images/20240501/bid-leakage-evil-kermit-meme.jpg)

### Description
In this specific analysis, we study scenarios where a dishonest proposer leaks bid information (or bids are leaked by other bidders). This case primarily focuses on the implications of such bid leaks, whether certain or probabilistic, on the integrity of the auction process and strategic bidding behaviors.

### Problem statement
Bid leakage occurs when one bidder’s bid becomes known to another, potentially affecting their bidding strategy and the overall auction outcome. This analysis aims to explore the effects of bid leakage in both First-Price Auctions (FPA) and Second-Price Auctions (SPA), focusing on how different leakage probabilities influence the surpluses of first movers (FM) and second movers (SM), seller (proposer) revenue, and overall auction efficiency.

### Modeling Approach to Study on Bid Leakage in FPSBA and SPSBA

To thoroughly investigate the impact of bid leakage, we consider scenarios of certain leakage (where the probability $p = 1$) and probabilistic leakage (where $0 < p < 1$), analyzing how builders adjust their strategies in response to the leaked information and the subsequent effects on auction outcomes and equilibria.

### Scenarios for Bid Leakage

- **Certain Bid Leakage ($p = 1$)**
- **Probabilistic Bid Leakage ($0 < p < 1$)**

**Assumptions**
- Uniform Distribution: Builders’ valuations $v$ are uniformly distributed over $[0, 1]$.
- Two Builders: We consider two builders for simplicity.
- Bid Leakage Probability $p$ : Probability that the first builder’s bid is leaked to the second builder.

Without loss of generality, the analysis can be easily extended to any distribution of valuations and multiple builders.

**Definitions**

- First Mover (FM): First builder who submits a bid  $b_1(v_1)$.
- Second Mover (SM): Second builder who may see  $b_1$  with probability $p$ and then submits  $b_2(b_1, v_2)$ , or submits  $b_2(∅, v_2)$  with probability  $1 - p$ .

### Mathematical Model for First-Price Auction (FPA)

#### Equilibrium Strategies
- **First Mover (FM)**:
  - Bid function: \( b_1(v_1) = \frac{v_1}{2 - r} \), where \( r \) is the risk aversion parameter.
- **Second Mover (SM)**:
  - If \( b_1 \leq v_2 \): \( b_2(b_1, v_2) = b_1 \).
  - If \( b_1 > v_2 \): \( b_2(b_1, v_2) < b_1 \).

#### Expected Payoffs
- **FM**: \( E[\pi_{FM}] = \int_0^1 \left[ (1 - p) \left( v_1 - \frac{v_1}{2 - r} \right) + p \left( v_1 - b_2(b_1, v_2) \right) \right] f(v_1) dv_1 \)
- **SM**: \( E[\pi_{SM}] = \int_0^1 \left[ p \left( v_2 - b_1 \right) + (1 - p) \left( v_2 - \frac{v_2}{2 - r} \right) \right] f(v_2) dv_2 \)

##### **Equilibrium Bidding Strategy**
- **First Mover (FM)**: \( b_1(v_1) = \frac{v_1}{2 - r} \)
- **Second Mover (SM)**: 
  - If \( b_1 \leq v_2 \): \( b_2(b_1, v_2) = b_1 \)
  - If \( b_1 > v_2 \): \( b_2(b_1, v_2) < b_1 \)

##### **Impact of Bid Leakage**
- **With probability \( p \), SM sees FM's bid**:
  - If \( SM \) sees \( b_1 \), they can place a bid to just win if their valuation is higher, leading to \( b_2 = b_1 \).
  - If \( SM \) doesn't see \( b_1 \) (\( 1 - p \)), they place their bid based on their own valuation: \( b_2 = \frac{v_2}{2 - r} \).

##### **Expected Payoffs**
- **FM Surplus**:
  \[
  E[\pi_{FM}] = \int_0^1 \left[ (1 - p) \left( v_1 - \frac{v_1}{2 - r} \right) + p \left( v_1 - b_2(b_1, v_2) \right) \right] f(v_1) dv_1
  \]
- **SM Surplus**:
  \[
  E[\pi_{SM}] = \int_0^1 \left[ p \left( v_2 - b_1 \right) + (1 - p) \left( v_2 - \frac{v_2}{2 - r} \right) \right] f(v_2) dv_2
  \]

##### **Auction Efficiency**
- **Efficiency Loss**:
  \[
  \text{Efficiency Loss} = \int_0^1 \int_0^1 \left[ \text{Valuation of higher bidder} - \text{Winning bid} \right] dv_1 dv_2
  \]

In the FPA, the efficiency loss increases with bid leakage probability \( p \), as SM can exploit the leaked information to win with a lower bid.


### Mathematical Model for Second-Price Auction (SPA)

#### Equilibrium Strategies
- **SP-Truthful**:
  - \( b_2(b_1, v_2) = v_2 \)
- **SP-Spiteful**:
  - \( b_2(b_1, v_2) \approx b_1 \)
- **SP-Cooperative**:
  - \( b_2(b_1, v_2) = 0 \)

#### Expected Payoffs
- **FM**: Depends on the selected equilibrium (truthful, spiteful, cooperative).
- **SM**: Depends on the equilibrium selected and the bid leakage probability.


## References
[^1]: https://barnabe.substack.com/p/pbs 
[^2]: https://thogiti.github.io/2024/03/28/ePBS.html
[^3]: https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html
