---
title: Solving the Messopotamia - The Curious World of Sealed Bid Auctions in Ethereum’s PBS
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-price-sealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue
---

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
- $\alpha$: Proportion of dishonest builders.
- $\beta$: Dishonesty factor reducing the bid.
- $\gamma$: Proportion of builders involved in collusion.
- $N$: Total number of builders.
- $V_i$: Valuation of builder $i$.
- $B_i$: Bid of builder $i$.

#### Mathematical Formulation
For FPSBA:
- Honest builders' bid strategy: $B_i = \frac{N-1}{N} \cdot V_i$.
- Dishonest builders' adjusted bid: $B_i = (1 - \beta) \cdot \frac{N-1}{N} \cdot V_i$.

Expected payment to the proposer based on the revenue equivalence theorem, considering dishonest bids:
$P(\alpha, \beta) = \text{Average of second-highest bids}$

For SPSBA:
- Honest builders' strategy: $B_i = V_i$.
- Dishonest builders' bid: $B_i = (1 - \beta) \cdot V_i$.

Similar to FPSBA, the expected proposer payment is:
$P(\alpha, \beta) = \text{Average of second-highest bids}$

#### Sensitivity Analysis
Exploring how changes in $\alpha$ and $\beta$ influence proposer payments helps understand the auction's resilience to dishonest behavior:
$\frac{\partial P}{\partial \alpha} \quad \text{and} \quad \frac{\partial P}{\partial \beta}$
These derivatives are crucial for revealing the sensitivity of proposer earnings to changes in the proportion of dishonest builders and their bid reduction strategy.

### Collusion Modeling Using $\gamma$
Collusion introduces another layer of complexity, as it involves coordinated bid reductions among a subset of builders:
- Colluding builders may adopt a bid: $B_i = (1 - \beta) \cdot V_i$.
- The factor $\gamma$ reflects the extent of collusion among builders.

### Methodological Approach and Special Considerations
- **Bayesian Nash Equilibrium**: Identifying the Bayesian Nash Equilibrium for both FPSBA and SPSBA in the presence of dishonesty and collusion provides insights into the stable strategies that builders and proposers might adopt.
- **Optimal Bidding Strategies**: Understanding how honest and dishonest builders alter their bids under different scenarios helps in formulating strategies that could mitigate risks associated with dishonest behavior.
- **Auction Efficiency and Welfare Analysis**: Assessing how dishonesty and collusion affect the overall efficiency of the auction and whether any changes result in welfare losses or Pareto improvements.
- **Simulation and Empirical Analysis**: Conducting simulations to observe the behavior of the auction under various configurations of $\alpha$, $\beta$, and $\gamma$. Empirical analysis could involve historical data from similar auction environments to validate the model's predictions.


## Dishonest Proposer – Bid Leakage

![bid-leakage-evil-kermit-meme](/assets/images/20240501/bid-leakage-evil-kermit-meme.jpg)

### Description
In this specific analysis, we study scenarios where an honest builder faces a dishonest proposer who leaks bid information. This case primarily focuses on the implications of such bid leaks, whether certain or probabilistic, on the integrity of the auction process and strategic bidding behaviors.

### Problem Highlight
Bid leakage fundamentally undermines the integrity of the bidding process by exposing confidential bid information. This exposure skews the competitive nature of auctions, potentially leading to altered bid strategies and unfair advantages, which can decrease the overall health and fairness of the auction environment.

### Detailed Study on Bid Leakage in FPSBA and SPSBA

To thoroughly investigate the impact of bid leakage, we consider scenarios of certain leakage (where the probability $p = 1$) and probabilistic leakage (where $0 < p < 1$), analyzing how builders adjust their strategies in response to the leaked information and the subsequent effects on auction outcomes and equilibria.

### Scenarios for Bid Leakage

1. **Certain Bid Leakage ($p = 1$)**
   - **Description**: The first bid submitted is leaked with certainty.
   - **Impact**: Subsequent builders adjust their strategies knowing the first bid, which might lead them to either outbid the leaked bid or strategically position their bid in a way that maximizes their utility based on the leaked information.

2. **Probabilistic Bid Leakage ($0 < p < 1$)**
   - **Description**: The first bid submitted is leaked with a probability $p$.
   - **Impact**: Subsequent builders adjust their strategies based on the likelihood of the leakage, which introduces a layer of uncertainty and complexity into their bidding strategies.

3. **Leaking Only the Maximum Bid Up to the Current Time**

	- **Description:** At an arbitrary time $t$ during the auction, the current maximum bid $B_{\text{max}}$ is leaked.
	- **Impact:** Builders who have not yet bid, or those considering revising their bids, adjust their strategies based on the leaked $B_{\text{max}}$.

Note: The scenario 3 looks analogous to 1 because $B_1$ is the max bid when the first bid is submitted. We need to further analyze this scenario.

### Modeling and Analysis

#### Key Parameters:
- **Leak Probability ($p$)**: Defines the likelihood that the first or highest bid is leaked.
- **Builder's Valuation ($V_i$)**: The intrinsic valuation of the builder for the slot, informing their maximum willing bid.
- **Number of Builders ($N$)**: Total participants in the auction affecting the dynamics of bid adjustments.

#### Impact on Bidding Strategies and Auction Outcomes

**FPSBA**:
- **Honest Bidders**:
  - The first bid $B_1$ is submitted and leaked.
  - Subsequent builders adjust their bids knowing $B_1$:
        $B_i = \max$ { $B_1, \frac{N-1}{N} \cdot V_i$ } $\quad \text{for } i > 1$
  - Upon leakage of $B_{\text{max}}$, subsequent builders adjust their bids to either match or exceed $B_{\text{max}}$ depending on their valuations:
        $B_i = \max$ { $B_{\text{max}}, \frac{N-1}{N} \cdot V_i$ } $\quad \text{for } i > 1$

**SPSBA**:
- **Honest Bidders**:
  - The first bid $B_1$ is submitted and leaked.
  - Subsequent builders adjust their bids knowing $B_1$:
        $B_i = \min$ { $B_1 + \epsilon, V_i$ } $\quad \text{for } i > 1$

  where $\epsilon$ is a small increment to slightly outbid $B_1$, aiming to win without overpaying.

  - Builders adjust their bids to slightly outbid the leaked $B_{\text{max}}$ if it benefits them, considering their true valuation:
        $B_i = \min$ { $B_{\text{max}} + \epsilon, V_i$ } $\quad \text{for } i > 1$

where $\epsilon$ is a small increment to ensure the highest possible but sensible bid.


#### Simulation of Auction Outcomes

- **Steps**:
  - Define the bid leakage scenario: Set $p$ for certain or probabilistic leakage.
  - Simulate the auction process for FPSBA and SPSBA:
     - Generate valuations $V_i$ for $N$ builders.
     - Submit and possibly leak the first bid $B_1$.
     - Adjust subsequent bids based on the leakage information.
  - Calculate proposer payments and analyze the changes in bidding strategies and the overall auction efficiency.

#### Equilibrium Analysis

- **Bayesian Nash Equilibrium**: Determine the new equilibrium under bid leakage scenarios for FPSBA and SPSBA, where builders integrate the leaked information into their bidding strategy, potentially altering the traditional equilibrium outcomes.


## References
[^1]: https://barnabe.substack.com/p/pbs 
[^2]: https://thogiti.github.io/2024/03/28/ePBS.html
[^3]: https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html
