---
title: 	A Deep Dive into Espresso Shared Sequencing Marketplaces Design
tags: Ethereum Rollups Espresso shared-sequencing combinatorial-auctions auctions shared-sequencing-marketplaces shared-sequencing-mechanism-design shared-sequencing-auctions
---


In this article I will present some thoughts and meditations on the Espresso shared sequencing marketplace design and some challenges related to this design space. You can read the original Espresso's article on their design at [https://hackmd.io/@EspressoSystems/market-design](https://hackmd.io/@EspressoSystems/market-design).

_Note: Many thanks to  Terry @ EclipseLabs for sharing his notes on the Espresso. My analysis is largely inspired from a discussion with him._

## [Espresso Shared Sequencing Market Design](#espresso-shared-sequencing-market-design)

The [Espresso Market design](https://hackmd.io/@EspressoSystems/market-design) is a sophisticated mechanism designed to facilitate a marketplace where rollups can sell sequencing timeslots to sequencers (proposers). This marketplace design leverages concepts from auction theory, combinatorial optimization, and economic incentives to achieve efficient, decentralized, and stable sequencing of rollup blocks. Here’s a high level overview of the mathematical model and key components involved.

### [Combinatorial Auction Model](#combinatorial-auction-model)
- **Overview**: The core of the Espresso Market design is a combinatorial auction where sequencers bid for the rights to sequence multiple rollups during specific timeslots. The auction is designed to allow sequencers to bid on bundles of rollups, treating them as complements, which means that the value of sequencing multiple rollups together is greater than sequencing them individually.
- **Auction Phases**:
    - **Bidding Phase**: Sequencers submit bids for different bundles of rollups, with all bids being public and upfront payments required. This setup ensures that bids are credible and that the sequencers have the necessary funds to back their bids.
    - **Assignment Phase**: The auction outcome is determined by selecting the set of bundles that maximizes the total bid value. Mathematically, this involves finding the partition of rollups into bundles that maximizes the sum of the highest bids for each bundle, subject to the constraint that each rollup is included in exactly one bundle.
    - **Sequencing Phase**: The winning sequencers for each bundle are then granted the right to sequence the corresponding rollups during the specified timeslot.

- **Mathematical Formulation**:
    - Let $n$ be the number of rollups.
    - Each rollup $i$ has a reserve price $r_i$.
    - For any bundle $B \subseteq [n]$ of rollups, let $b(B)$ be the highest bid for that bundle.
    - The auction seeks to find a partition $\Pi = \{B_1, \dots, B_k\}$ of the rollups that maximizes the total bid value:
    
$$\Pi^* = \arg\max_{\Pi} \sum_{B \in \Pi} v(B)$$
    
    where $v(B)$ for a bundle $B$ is defined as:
    
$$v(B) = \max(b(B), r_i) \quad \text{if } B = \{i\} \text{ (singleton bundle)}$$
    
    and
    
    
$$v(B) = b(B) \quad \text{if } \|B\| \geq 2$$.
       

 - **Challenges**: The problem of finding the optimal partition is combinatorial and can be computationally inefficient in general cases. However, in practical settings, only a limited subset of bundles may be economically viable, which can simplify the problem.


### [Lottery Mechanism to Mitigate Monopolization]

 - **Problem with Auctions**: A potential downside of pure combinatorial auctions is that a single bidder could dominate the market by consistently winning, leading to monopolization.
 - **Lottery Introduction**: To counter this, Espresso introduces a lottery mechanism where instead of a single bid, sequencers buy lottery tickets for each bundle. The winner for each bundle is then randomly chosen from the pool of ticket holders, with the probability of winning proportional to the number of tickets purchased.
 - **Mathematical Model**:
   - Let $t_{\text{max}}$ be the maximum number of tickets sold for a bundle.
   - The price per ticket $p_B$ is dynamically adjusted based on the demand in previous iterations, similar to the EIP-1559 mechanism in Ethereum. If demand is high, ticket prices increase in the next round; if demand is low, prices decrease.
   - The expected revenue for each sequencer in the lottery is given by their proportional share of tickets:
     
$$\text{Expected Revenue} = \frac{\text{Tickets Purchased}}{\text{Total Tickets Sold}} \times \text{Bundle Value}$$
     
 - **Stability**: The lottery mechanism helps in achieving a more diverse distribution of sequencing rights, reducing the risk of monopolization and ensuring a more decentralized market structure.

### [Revenue Allocation](#revenue-allocation)
 - **Objective**: Ensure that rollups are better off participating in the marketplace than sequencing independently.
 - **Revenue Splitting**: If a rollup is included in a bundle, it receives at least the highest bid for its singleton bundle. Additional revenue from shared sequencing (i.e., when the rollup is part of a bundle) is distributed proportionally based on the value of singleton bids.

 - **Mathematical Model**:
   - If rollup $i$ is part of a winning bundle $B$, its payment is:
     
$$\text{Payment to Rollup } i = \max(b_i, r_i) + \frac{b(B) - \sum_{j \in B} b_j}{\sum_{j \in B} b_j} \times b_i$$
     
   - Here, $b_i$ is the highest bid for the singleton bundle containing only rollup $i$, and $b(B)$ is the highest bid for the entire bundle $B$.

### [Incentive Compatibility and Efficiency](#incentive-compatibility-and-efficiency)
 - **Incentive Compatibility**: The Espresso market does not claim to be fully incentive-compatible, as achieving both DSIC (dominant strategy incentive compatible) and efficiency in complex combinatorial settings can be challenging. The design, however, aims to be sufficiently close to efficient by leveraging repeated interactions and smooth price adjustments.
 - **Efficiency**: The design attempts to ensure that sequencing rights are allocated to those who value them the most, which is typically aligned with achieving efficient outcomes.

### [Anti-Monopolization and Censorship Resistance](#anti-monopolization-and-censorship-resistance)
 - The lottery design, combined with the repeated nature of the market, aims to prevent any single sequencer from dominating the market. The random allocation of sequencing rights, even among high bidders, introduces unpredictability and diversity in the selection process, promoting decentralization and resistance to censorship.


## [Last Look and Auction Settlement](#last-look-and-auction-settlement)

The strategic bidding problem associated with the “last look” in auctions can severely undermine the efficiency and fairness of the auction process. Sequential auctions, or those that allow bids to be revealed before finalization, are particularly vulnerable to such manipulation. Using **sealed-bid auctions** or implementing a **VCG mechanism** are effective ways to counteract these issues. Both methods encourage honest bidding, prevent strategic late bids, and ensure that auction outcomes are socially efficient, maximizing both revenue and welfare.

Let's study an example and understand how the "last look" works and how to mitigate its implications.

### [Strategic Bidding in Sequential Auctions](#strategic-bidding-in-sequential-auctions)

Let's consider a scenario described below. We have three items (e.g. rollup blocks) up for auction: $A$, $B$, and $A+B$ (the combination of A and B). The bids placed on these items are denoted by $b_A$, $b_B$, and $b_{A+B}$ respectively.

Suppose the auction is sequential or allows for bids to be revealed during the process (as described in Espresso market design document). This creates an environment where a participant with a “last look” can adjust their bid strategically based on the information they gain from other participants' bids. This form of bidding is highly strategic and can lead to several inefficiencies:

**Scenario Setup**:

- Bidder 1 places a bid $b_A = 10$ for item $A$.
- Bidder 2 places a bid $b_B = 8$ for item $B$.
- Bidder 3 places a bid $b_{A+B} = 25$ for the combination $A+B$.

**Strategic Last Bid**:

- Suppose another bidder, Bidder 4, has the ability to observe these bids before placing their own bid. Knowing that $b_{A+B} = 25$ for the combination, Bidder 4 might place a new bid $b'_B = 14.9$ for item $B$.
- The goal of Bidder 4 is to just outbid Bidder 2 for $B$, but not so much as to surpass the value that would make it better to win $A+B$ outright.

**Outcome**:
    
- **For Bidder 4**: By bidding $b'_B = 14.9$, Bidder 4 wins $B$ without outbidding the $A+B$ combination. The surplus captured is maximized for Bidder 4 since they have paid just enough to outbid Bidder 2 but less than the marginal increase from $A+B$.
    
- **For Other Bidders**: Bidder 1 may underbid in future auctions, knowing they can be outbid strategically, and Bidder 3 may also adjust their strategy or avoid participating altogether, reducing overall auction revenue and efficiency.

**Mathematical Representation**:
- Let’s define the marginal benefit of $B$ as $\Delta B$, which represents the increase in value when $B$ is added to the combination. We can express it as:
      

$$\Delta B = b_{A+B} - b_A$$
      
In the example, $\Delta B = 25 - 10 = 15$. If Bidder 4 strategically bids $b'_B = 14.9$, they effectively capture the entire surplus $\Delta B - b_B$ by just outbidding $b_B$ without hitting the combination threshold.

**Implications**:

- **Reduced Revenue**: The auctioneer collects less revenue because strategic bidding reduces competition and results in bids that just clear the second-highest value.
- **Inefficiency**: The allocation may not be socially efficient since participants adjust their strategies based on what they think others will bid, rather than their true valuations.

### Sealed-Bid Auction Solution

To counteract the issues of strategic bidding with “last look,” one effective approach is to implement a **sealed-bid auction**. In this format, all bids are submitted simultaneously without any participant knowing the others’ bids. After all bids are submitted, they are revealed, and the highest bid wins.

**Sealed-Bid Auction Mechanics**:

- Each bidder submits their bid $b_i$ for the item they are interested in without knowing the bids of others.
- The winner is the bidder with the highest bid, but the bids are revealed only after submission.

**Mathematical Representation**:

- Suppose there are $n$ bidders. The winning bid $b^*$ for item $A$ is given by:
      
$$b_A^* = \arg \max_{b_i} b_i$$
      
The same applies for $B$ and $A+B$.

**Advantages**:

- **No Strategic Adjustments**: Since all bids are submitted simultaneously and without knowledge of others, bidders cannot adjust their bids strategically at the last minute. This tends to lead to more honest bidding, reflecting true valuations.
- **Increased Revenue**: The sealed-bid format typically results in higher revenue for the auctioneer because bidders tend to bid closer to their true valuations, knowing they cannot outbid others strategically.

**Social Welfare Maximization**:

- The sealed-bid auction is more likely to result in socially efficient outcomes because bidders are encouraged to reveal their true valuations without concern for being outmaneuvered by others.

### [VCG (Vickrey-Clarke-Groves) Auction](#vcg-vickrey-clarke-groves-auction)

The VCG auction mechanism is another approach that can solve the issues identified in sequential or last-look auctions.

**Mechanics of VCG**:

- In a VCG auction, each bidder submits a sealed bid, and the highest bidder wins. However, the winning bidder pays the opportunity cost they impose on other bidders rather than their own bid. This payment structure ensures that bidders have an incentive to bid their true valuations.

**Mathematical Representation**:

- Suppose Bidder $i$ wins the auction with a bid $b_i$. The price they pay $p_i$ is determined by the sum of the highest bids that would have won if Bidder $i$ had not participated:

$$p_i = \sum_{j \neq i} b_j^{\text{second-best}}$$

For example, if Bidder 1 wins with $b_1 = 25$ for $A+B$, but the next highest combined bids were $b_A = 10$ and $b_B = 14.9$, then Bidder 1 pays $p_1 = 24.9$.

**Benefits**:

- **Incentive Compatibility**: The VCG mechanism is **dominant strategy incentive compatible (DSIC)**, meaning that bidding your true valuation is the best strategy regardless of what others do.
- **Social Efficiency**: By ensuring bidders pay the opportunity cost, the auction encourages socially efficient outcomes where goods are allocated to those who value them most.

**Mitigation of Strategic Manipulation**:

- **No Advantage in Last Look**: Since bidders are incentivized to bid truthfully, the “last look” advantage is neutralized. Even if a bidder could see others’ bids, it would not benefit them to underbid or overbid relative to their true valuation.

## [Dynamic Pricing Across Combinatorial Options](#dynamic-pricing-across-combinatorial-options)

In the context of the Espresso Execution Ticket (ET) model, bidders can purchase tickets for individual items (e.g., $A$ or $B$) or combinations of items (e.g., $A+B$). The auction mechanism allows for dynamic pricing, where the price of each ticket can vary depending on demand and other factors. The challenge here is twofold:
- **Valuation Complexity**: Bidders must evaluate the value of winning individual items versus combinations.
- **Random Selection**: The selection of winning bids is random, adding a layer of probabilistic uncertainty to the decision-making process.

### [Mathematical Formulation](#mathematical-formulation)

Let:

- $p_A$, $p_B$, and $p_{A+B}$ denote the prices of tickets for $A$, $B$, and the combination $A+B$, respectively.
- $V_A$, $V_B$, and $V_{A+B}$ denote the valuations that a bidder assigns to winning $A$, $B$, and $A+B$.
- $\text{Pr}(A)$, $\text{Pr}(B)$, and $\text{Pr}(A+B)$ represent the probabilities of winning $A$, $B$, and $A+B$ when bidding on these options.

The expected utility for a bidder $i$ can be expressed as:


$$\mathbb{E}[U_A] = \text{Pr}(A) \cdot V_A - p_A$$


$$\mathbb{E}[U_B] = \text{Pr}(B) \cdot V_B - p_B$$


$$\mathbb{E}[U_{A+B}] = \text{Pr}(A+B) \cdot V_{A+B} - p_{A+B}$$


### [Valuation and Utility Calculation](#valuation-and-utility-calculation)

**Valuation of Combinations**:

The valuation $V_{A+B}$ for the combination $A+B$ is generally not additive. There could be synergy (or dissynergy) effects, where:

$$V_{A+B} \neq V_A + V_B$$

This could be due to complementarities, where $A$ and $B$ together provide more value than the sum of their parts.

**Expected Utility**:

Given the randomness in selection, the expected utility for bidding on $A$, $B$, or $A+B$ depends on both the valuation and the probability of winning. The probabilities $\text{Pr}(A)$, $\text{Pr}(B)$, and $\text{Pr}(A+B)$ are determined by the number of tickets purchased and the competition.

For instance, if a bidder buys $t_A$ tickets for $A$, the probability of winning $A$ could be modeled as:

$$\text{Pr}(A) = \frac{t_A}{T_A}$$

where $T_A$ is the total number of tickets sold for $A$. The same applies to $B$ and $A+B$.

The expected utility functions can then be rewritten as:

$$\mathbb{E}[U_A] = \frac{t_A}{T_A} \cdot V_A - p_A$$


$$\mathbb{E}[U_B] = \frac{t_B}{T_B} \cdot V_B - p_B$$


$$\mathbb{E}[U_{A+B}] = \frac{t_{A+B}}{T_{A+B}} \cdot V_{A+B} - p_{A+B}$$
   

**Dynamic Pricing**:

The prices $p_A$, $p_B$, and $p_{A+B}$ are dynamic and can change based on demand. If more tickets are purchased for $A$, the price $p_A$ might increase in the next iteration to reflect higher demand.

Mathematically, dynamic pricing could be modeled as:

$$p_A(t_A) = p_A(0) + \alpha \cdot (t_A - \bar{t}_A)$$

where $\alpha$ is a price adjustment factor, $t_A$ is the number of tickets purchased, and $\bar{t_A}$ is the target number of tickets. Similar equations would apply to $p_B$ and $p_{A+B}$.

This introduces an additional strategic layer where bidders must predict how the prices might change based on their and others’ bidding behavior.

The Espresso pricing mechanism can be modeled as a piecewise function, which adjusts the price of tickets based on the quantity sold relative to a predefined target $t$. The mechanism follows a two-phase approach:

**Constant Price Phase ($0$ to $1.5t$ tickets sold):**
- The price of a ticket remains constant for the first $1.5t$ tickets. Let the initial ticket price be $p_s$.
- Mathematically:

$$p(t) = p_s \quad \text{for} \quad 0 \leq t \leq 1.5t$$


**Linear Price Increase Phase ($1.5t$ to $2t$ tickets sold):**
- After $1.5t$ tickets are sold, the price increases linearly until $2t$ tickets are sold.
- The price function in this phase can be expressed as:

$$p(t) = p_s + \left( \frac{2p_s - p_s}{0.5t} \right) \cdot \left( t - 1.5t \right)$$

Simplifying, this gives:

$$p(t) = p_s + \frac{p_s}{0.5t} \cdot (t - 1.5t) = p_s + 2p_s \left(\frac{t - 1.5t}{0.5t}\right)$$

which simplifies to:

$$p(t) = p_s \cdot \left(1 + 2(t - 1.5t) / 0.5t\right) = p_s \cdot \left(1 + 4(t - 1.5t)\right)$$

- This linear relationship continues until $t$ reaches $2t$, where the price is capped at $2p_s$.

Thus, the complete price adjustment function is:

$$p(t) = 
\begin{cases} 
p_s & \text{if } 0 \leq t \leq 1.5t \\
p_s \cdot \left(1 + 4\left(\frac{t - 1.5t}{0.5t}\right)\right) & \text{if } 1.5t < t \leq 2t 
\end{cases}
$$


### [Strategic Complexity and Optimization Problem](#strategic-complexity-and-optimization-problem)

**Bidder's Optimization Problem**:

A bidder must decide how many tickets to buy for each option (i.e., $A$, $B$, or $A+B$) to maximize their expected utility. This decision is influenced by:
- Their valuation of the items or combinations.
- The current prices of tickets.
- The expected competition (i.e., the number of other tickets sold).

The bidder’s objective can be formulated as an optimization problem:


$$\max_{t_A, t_B, t_{A+B}} \{ \mathbb{E}[U_A], \mathbb{E}[U_B], \mathbb{E}[U_{A+B}] \}$$


Subject to:

$$t_A, t_B, t_{A+B} \geq 0$$


$$t_A \cdot p_A + t_B \cdot p_B + t_{A+B} \cdot p_{A+B} \leq \text{Budget}$$

where "Budget" is the total amount the bidder is willing to spend.


**Bayesian Nash Equilibrium (BNE)**:

In a Bayesian setting, each bidder forms beliefs about the strategies of other bidders. The BNE is reached when each bidder's strategy is the best response to the strategies of others, given their beliefs.

The equilibrium strategies will satisfy:

$$\sigma_A^{*} = \arg \max_{\sigma_A} \mathbb{E}[U(\sigma_A | \sigma_{-A})]$$ 

$$\sigma_B^{*} = \arg \max_{\sigma_B} \mathbb{E}[U(\sigma_B | \sigma_{-B})]$$

$$\sigma_{A+B}^* = \arg \max_{\sigma_{A+B}} \mathbb{E}[U(\sigma_{A+B} | \sigma_{-(A+B)})]$$


Each bidder calculates their optimal ticket purchase strategy considering both the direct utility of winning an auction and the impact their actions have on prices in future iterations.

### [Further Exploration and Research](#further-exploration-and-research)

**Algorithmic and AI Bidding Agents**:

Given the complexity of solving the optimization problem manually, there is a strong case for developing **algorithmic bidding agents** or **AI Agents** that can calculate optimal bidding strategies in real-time. These agents would factor in dynamic pricing, the probability of winning, and other bidders' likely strategies.

**Experimental Validation**:

Simulations can be used to validate the theoretical models. By running simulated auctions with algorithmic bidders, researchers can study how dynamic pricing affects market outcomes and whether equilibrium strategies emerge in practice.

**Design of Robust Auction Mechanisms**:

Further research could explore auction mechanisms that are robust to the complexities introduced by dynamic pricing and combinatorial options. This might include designing mechanisms where prices are adjusted in a more predictable way, or where bidders are provided with more information about how prices might evolve.

Let's approach some of these tasks with some rigor and depth. The goal here is not only to suggest improvements to the existing dynamic pricing model in the Espresso design but also to provide a detailed mathematical framework and a research agenda for extending this work. 

## [Extensions of the Espresso Market Design](#extensions-of-the-espresso-market-design)

The Espresso Market design already incorporates a piecewise pricing mechanism that balances stability with the need for dynamic adjustments based on demand. However, the current model can be extended and improved by incorporating additional factors, such as time-sensitive bidding strategies, smoothing mechanisms for price adjustments, and the consideration of asymmetric information among bidders. Below, we study these extensions, mathematical models and outlining how they can be systematically analyzed and tested.

### [Incorporating Time into the Model](#incorporating-time-into-the-model)

**Concept Explanation:**

The current pricing model is static in the sense that it does not explicitly account for the time dynamics of the auction process. By introducing a time factor $t_{phase}$, we can model how bidders might strategically time their purchases to optimize their utility, particularly as the auction transitions from the constant price phase to the linear price increase phase.

**Mathematical Modeling:**

Let $t$ represent the time elapsed since the start of the auction. The time factor $t_{phase}$ is a threshold that determines when the auction transitions from the constant price phase to the linear price increase phase.

- **Phase 1 (Constant Price Phase):** The time before the transition, i.e., when $t < t_{phase}$, corresponds to the constant price phase. The price $p(t)$ during this period is:
  
$$p(t) = p_s \quad \text{for} \quad t < t_{phase}$$
  

- **Phase 2 (Linear Price Increase Phase):** After the transition time $t_{phase}$, the price increases linearly:
  
$$p(t) = p_s \cdot \left(1 + 4\left(\frac{t - t_{phase}}{0.5t}\right)\right) \quad \text{for} \quad t_{phase} \leq t \leq t_{max}$$

where $t_{max}$ is the maximum time corresponding to the sale of all $2t$ tickets.

**Bidder Strategy:**

Bidders can now incorporate the timing of their bids into their strategy. The expected utility function becomes time-dependent:

$$\mathbb{E}[U_A(t)] = \frac{t_A(t)}{T_A(t)} \cdot V_A(t) - p(t)$$

where $t_A(t)$ represents the number of tickets purchased at time $t$, and $T_A(t)$ is the total number of tickets available at that time.

**Future Research Work:**

**Optimization of Time-Sensitive Bidding Strategies:**
- Develop and solve optimization problems for bidders that maximize their expected utility by timing their bids strategically, taking into account the expected phase transition.
- Use dynamic programming to determine the optimal timing strategy $t^*$ that maximizes the utility function.

**Empirical Validation:**
- Conduct experiments with simulated auction environments to observe how time-sensitive bidding strategies affect auction outcomes, especially under different distributions of $t_{phase}$.

### [Exploring Price Smoothing Mechanisms](#exploring-price-smoothing-mechanisms)

**Concept Explanation:**

The current piecewise linear pricing mechanism introduces a sharp transition in pricing at $1.5t$. While this design serves its purpose, it may lead to abrupt changes in bidder behavior, particularly at the phase transition point. To reduce potential volatility, we can explore smoothing mechanisms such as quadratic or exponential price increases.

**Mathematical Modeling:**

**Quadratic Price Increase:**
- Replace the linear function in Phase 2 with a quadratic function:

$$p(t) = p_s \cdot \left(1 + \beta \left(\frac{t - 1.5t}{0.5t}\right)^2\right) \quad \text{for} \quad 1.5t < t \leq 2t$$

- Here, $\beta$ is a scaling factor that determines the curvature of the price increase.

**Exponential Price Increase:**
- Alternatively, use an exponential function to smooth the transition:
  
$$p(t) = p_s \cdot e^{\gamma (t - 1.5t)} \quad \text{for} \quad 1.5t < t \leq 2t$$
  
- $\gamma$ is a growth rate parameter that controls how sharply the price increases.

**Bidder Strategy:**

With smoothing mechanisms, the bidder’s utility function becomes more complex. For the quadratic case:

$$\mathbb{E}[U_A(t)] = \frac{t_A(t)}{T_A(t)} \cdot V_A(t) - p_s \cdot \left(1 + \beta \left(\frac{t - 1.5t}{0.5t}\right)^2\right)$$

For the exponential case:

$$\mathbb{E}[U_A(t)] = \frac{t_A(t)}{T_A(t)} \cdot V_A(t) - p_s \cdot e^{\gamma (t - 1.5t)}$$


**Future Research Work:**

**Comparative Analysis:**
- Perform a comparative analysis of the piecewise linear, quadratic, and exponential models to determine which smoothing mechanism yields the best outcomes in terms of bidder behavior, market efficiency, and revenue maximization.
- Study how different values of $\beta$ and $\gamma$ affect the equilibrium strategies of bidders.

**Impact on Market Stability:**
- Investigate how each smoothing mechanism impacts the stability of the market. For example, does a quadratic increase lead to smoother price changes and thus more predictable bidder behavior?

**Simulation Studies:**
- Implement these models in a simulated auction environment to observe how different smoothing functions influence bidding patterns, market dynamics, and overall auction efficiency.

### [Advanced Equilibrium Analysis with Asymmetric Information](#advanced-equilibrium-analysis-with-asymmetric-information)

**Concept Explanation:**

In many real-world auctions, not all bidders have the same information. Some may have better estimates of when the price shift will occur or more accurate predictions of others' bidding strategies. This information asymmetry can significantly impact the bidding behavior and auction outcomes.

**Mathematical Modeling:**

**Asymmetric Information in BNE:**
- Suppose some bidders have more accurate information about $t_{phase}$, or about the distribution of other bidders' valuations. We denote these bidders as informed bidders, while others are uninformed.
- Let $\theta_i$ represent the type of bidder $i$, where $\theta_i$ reflects their information level. Bidders with higher $\theta_i$ have better estimates of $t_{phase}$ or more knowledge about others' valuations.

**Equilibrium Strategy Under Asymmetric Information:**
- The expected utility function for informed and uninformed bidders can be written as:

$$\mathbb{E}[U_A(t | \theta_i)] = \frac{t_A(t | \theta_i)}{T_A(t)} \cdot V_A(t | \theta_i) - p(t | \theta_i)$$

- The BNE strategies now depend on the type $\theta_i$, leading to different strategies for informed versus uninformed bidders.

**Future Research Work:**

**Equilibrium Analysis:**
- Analyze the BNE in the presence of asymmetric information. Determine how the equilibrium strategies differ between informed and uninformed bidders, and how this impacts auction outcomes.

**Welfare Analysis:**
- Investigate the impact of asymmetric information on social welfare. Does the presence of better-informed bidders lead to more efficient outcomes, or does it create a disadvantage for less-informed participants?

**Empirical Testing:**
- Conduct empirical studies or experiments to validate theoretical predictions. For example, analyze how asymmetric information affects bidding behavior in practice and whether the auction mechanism can be adjusted to mitigate any negative impacts.

