---
title: Cross-Chain MEV Auctions - Modeling Proposer Revenue Maximization
tags: Ethereum sealed-bids blind-bidding FPSB SPSB first-price-sealed-bid second-price-sealed-bid PBS MEV Proposer-Builder-Separation MEV-Supply-Chain-Architecture MEV-Supply-Chain-Management Bayesian-nash-equilibrium BNE builder-bidding-strategies proposer-revenue maximizing-proposer-revenue vickrey-auctions Proposer-Revenue-Maximization cross-chain-mev cross-chain-mev-auctions
---

## WIP - WORK IN PROGRESS 

## Introduction

In the evolving landscape of multi-chain world, one of the key components to unlocking the full potential of cross-chain interactions is through maximizing the value extracted from miner-extractable value, or MEV. This article will explore the mathematical models and optimization of auction mechanisms to maximize proposer revenues and strategic decision making in should a bidder opt for separate auctions or a joint MEV auction in cross-chain MEV interactions.

We'll start by exploring a foundational model presented by Ed Felten in the recent [Arbitrum research forum](https://research.arbitrum.io/t/do-shared-mev-auctions-actually-increase-revenue/9606) [^1], which breaks down the basics of separate and joint MEV auctions. This model serves as a baseline to understand not just the mechanics, but also the broader implications of choosing one auction method over another in a multi-chain environment. By examining this model, we set the stage for a deeper investigation into more complex scenarios that reflect the real-world dynamics of cross-chain MEV interactions.

Before we proceed, a quick note: If you're unfamiliar with the concepts of [MEV](https://barnabe.substack.com/p/pbs)[^2][^3], sealed bid auctions, or simply wish for a refresher, I recommend visiting [Sealed Bid Auctions in Ethereum’s PBS](https://thogiti.github.io/2024/05/28/Sealed-Bids-in-Ethereum-PBS-Impact-on-Proposer-Builder-Dynamics.html)[^3]. It’s essential groundwork that will enrich your understanding of the discussions that lie ahead.


## EdFelten's Basic Model - Separate vs Joint Auctions for MEV Rights

Let us first review and understand the basic model by Ed Felten to analyze separate vs join auctions for MEV rights [^1]. 

### Separate Auctions
- **Valuation Model**:
   $V_{A,i} = V_A^* + A_i$. Each chain has a base unknown true valuation $V^*_A$ for chain A, augmented by a builder-specific estimation error $A_i$, which follows a normal distribution $N(0, \sigma^2)$. This introduces variability in individual valuations based on bidder perceptions and information.

- **Revenue Model**:
   The revenue for MEV rights on a single chain in a sealed-bid, second-price auction is determined by the second-highest bid. Mathematically, this is represented as:
   $R_A = V^*_A + \sigma \cdot \alpha(n)$.
   Here, $\alpha(n)$ is the expected value of the second-largest of $n$ normal samples, scaling the estimation error by bidder number to adjust for competition intensity.

For two chains $A$ and $B$, the total separate proposer revenue $R_{sep}$ is the sum of revenues from both chains:
$R_\mathrm{sep} = V_A^* + V_B^* + 2\sigma\cdot\alpha(n)$

### Joint Auction

**Valuation Model**:
$V_{AB, i} = V_A^* + V_B^* + C_i + M$. When MEV rights for chains $A$ and $B$ are bundled, the combined valuation $V_{AB, i}$ includes the sum of their base valuations plus a synergistic value $M$, which accounts for the additional value derived from controlling MEV across multiple chains. The error term $C_i$ aggregates the individual errors $A_i$ and $B_i$, resulting in a new distribution $N(0, 2\sigma^2)$.

**Revenue Model**:
The revenue for the joint MEV rights follows the format of a sealed-bid, second-price auction:
$R_\mathrm{joint} = V_A^* +V_B^* + M + \sqrt{2} \sigma \cdot \alpha(n)$
The synergistic value $M$ due to cross-chain MEV and the increased error term adjust the base revenue potential upward, reflecting the combined value proposition.

### Comparative Analysis

Comparing the revenues from the separate and joint auctions reveals the core financial dynamics:
$R_{joint} - R_{sep} = M - (2 - \sqrt{2}) \sigma \cdot \alpha(n)$
This formula illustrates the necessary conditions under which the joint auction becomes more profitable to the proposer: the synergistic value $M$ must outweigh the adjusted error term $(2 - \sqrt{2}) \sigma \cdot \alpha(n)$ influenced by the number of bidders and their variance.

### Generalizing to $K$ Chains

Extending the analysis to $K$ chains, we can develop the auction models as below:
- **Separate Auctions**:
  $$R_{sep} = \sum_{j=1}^{K} V^*_j + K \sigma \cdot \alpha(n)$$
  
- **Joint Auction**:
  $$R_{joint} = \sum_{j=1}^{K} V^*_j + M + \sqrt{K} \sigma \cdot \alpha(n)$$

The resulting revenue difference becomes:
$R_{joint} - R_{sep} = M - (K - \sqrt{K}) \sigma \cdot \alpha(n)$

### Insights and Practical Implications

**Revenue Comparison**:
The decision between conducting separate or joint auctions hinges on the balance between the inherent synergistic value $M$ and $(K - \sqrt{K}) \sigma \cdot \alpha(n)$, the cumulative impact of bidder estimation errors across multiple chains. 

**Synergistic Value**:
A significant $M$ suggests joint auctions may provide more proposer revenue, particularly when cross-chain interactions significantly enhance the overall MEV.

**Separate Auction Advantage**:
Conversely, lower $M$ values or high bidder variability make separate auctions more appealing, ensuring each chain's MEV rights are maximized based on individual chain dynamics.


As we've discussed above, there are several assumptions involved regarding the bidding distributions for each chain, their respective error terms, and the distribution in the joint auction model, including the additional MEV value $M$. While these assumptions are critical for the model, they may seem somewhat detached from real-world scenarios. Nevertheless, this simple model will be very useful in extending for the more realistic scenarios like bidder risk preferences using a risk aversion model, dynamic auctions, combinatorial auctions where bidder can choose which chains to bid as combination, or information asymmetry or gradual learning.  

## Modeling Builder's Risk Preferences for MEV Rights

In cross-chain MEV auctions, bidders' behaviors are not just influenced by their wallet size or strategic acumen, but also by how they perceive and manage risk. This dynamic becomes especially compelling in sealed bid second-price auctions, where the highest bid wins, but it's the second-highest bid that sets the price of the payment. Here, understanding risk aversion isn't just a technicality—it's central to predicting how bidders will act under uncertainty. By modeling bidders' risk preferences, we can peel back layers of complexity and uncover the subtleties of their decision-making processes, providing a clearer picture of the auction's outcome in a multi-chain environment where the stakes, and uncertainties, are multiplied.

The objective in this scenario is to incorporate bidder's risk aversion into the valuation model of cross-chain MEV auctions and to examine how this affects the proposer revenue outcomes and revenues from separate and joint MEV auctions.

### Valuation Model with Risk Aversion

#### Notation:
- $V_{i,j}$: Valuation of bidder $i$ for chain $j$.
- $V^*_j$: True valuation of chain $j$.
- $\epsilon_{i,j}$: Estimation error for bidder $i$ on chain $j$, where $\epsilon_{i,j} \sim N(0, \sigma^2)$.
- $U_i(V_{i,j})$: Utility function reflecting the risk aversion of bidder $i$ for valuation $V_{i,j}$.
- $\lambda_i$: Risk aversion parameter for bidder $i$.

**Utility Function**:
We assume an exponential utility function, commonly used to model risk aversion:
$U_i(V_{i,j}) = 1 - e^{-\lambda_i V_{i,j}}$

### Risk Adjusted Valuation:
Given the exponential utility, the risk-averse valuation can be adjusted. The expected utility for valuation $V_{i,j}$ simplifies to:
$$\mathbb{E}[U_i(V_{i,j})] \approx U_i(\mathbb{E}[V_{i,j}]) = 1 - e^{-\lambda_i V^*_j}$$

Since the expectation of the error $\epsilon_{i,j}$ is zero, the calculation results in:
$$\mathbb{E}[U_i(V_{i,j})] = 1 - e^{-\lambda_i V^*_j}$$

From this, we can extract the risk-adjusted valuation by inverting the utility function:
$V_{i,j} = -\frac{1}{\lambda_i} \ln(1 - U_i(V_{i,j}))$

For practical calculations, we can approximate this as:
$V_{i,j} = V_j^* + \frac{\epsilon_{i,j}}{\lambda_i}$

### Risk Adjusted Revenue Calculation 

#### Separate Auctions:
In separate auctions, the revenue for each chain $j$ is influenced by the second-highest bid among $n$ bidders, accounting for their risk-adjusted valuations:
$V_{i,j} = V_j^* + \frac{\epsilon_{i,j}}{\lambda_i}$
This alters the revenue expression to:
$R_j = V_j^* + \frac{\sigma}{\lambda} \alpha(n)$
Here, $\lambda$ is considered an average risk aversion across all bidders.

For multiple chains $K$, the total revenue is:
$$R_{sep} = \sum_{j=1}^K \left( V_j^* + \frac{\sigma}{\lambda} \alpha(n) \right)$$

#### Joint Auction:
For a joint auction of all $K$ chains, the combined bidder valuation is:
$$V_{i,J} = \sum_{j=1}^K V_j^* + \frac{1}{\lambda_i} \sum_{j=1}^K \epsilon_{i,j} + M$$
Where the error sum follows $N(0, K\sigma^2)$.

Thus, the expected second-highest bid becomes:
$$R_{joint} = \sum_{j=1}^K V_j^* + M + \frac{\sigma \sqrt{K}}{\lambda} \alpha(n)$$

### Comparative Analysis
Comparing the revenues:

$$R_{sep} = \sum_{j=1}^K \left( V_j^* + \frac{\sigma}{\lambda} \alpha(n) \right)$$

$$R_{joint} = \sum_{j=1}^K V_j^* + M + \frac{\sigma \sqrt{K}}{\lambda} \alpha(n)$$

The difference in expected revenue is:

$$R_{joint} - R_{sep} = M - \left( K - \sqrt{K} \right) \frac{\sigma}{\lambda} \alpha(n)$$

### Insights

- **Impact of Risk Aversion**: Incorporating risk aversion significantly modifies the estimation error impact by scaling it down with the risk parameter $\lambda$.
- **Revenue Dynamics**: The decision between joint and separate MEV auctions depends on the magnitude of $M$ relative to the modified risk parameters $\left( K - \sqrt{K} \right) \frac{\sigma}{\lambda} \alpha(n)$.
- **Strategic Implications**: The choice of cross-chain MEV auction format can be strategically optimized based on the aggregate risk preferences of the bidders and the synergistic value of combining MEV rights across chains.


## Dynamic Auction Model - Sequential Auctions

The objective here is to model and analyze sequential auctions where the results of one auction have an impact on subsequent ones in a multi-chain MEV environment. This reflects real-life scenarios where bidders might tweak their strategies based on earlier auction experiences, adapting to wins or losses in a cross-chain MEV auction interactions.

### Sequential Auction Setup

**Assumptions**:
- **Bidder Behavior**: Bidders dynamically adjust their bidding strategies based on the outcomes of preceding auctions.
- **Valuation Model**:
   - For each chain $j$:
     $V_{i,j} = V_j^* + \epsilon_{i,j}$
     where $V_j^*$ represents the true valuation for chain $j$, and $\epsilon_{i,j}$ is the estimation error for bidder $i$ on chain $j$, normally distributed as $\epsilon_{i,j} \sim N(0, \sigma^2)$.
- **Outcome Influence**: The results from one auction (e.g., auction $j$) influence the bidder's perceptions and strategies in subsequent auctions.

**Notation**:
- $n$: Number of bidders.
- $K$: Number of chains.
- $V_j^*$: True valuation for chain $j$.
- $\epsilon_{i,j}$: Estimation error for bidder $i$ on chain $j$.
- $\alpha_j(n)$: Adjusted expected value of the second-largest of $n$ samples from a standard normal distribution $N(0, 1)$ for auction $j$.

### Valuation Model Adjustments in Sequential Auctions 

**Initial Auction**:
For the initial chain $j=1$:
$R_1 = V_1^* + \sigma \cdot \alpha_1(n)$

**Subsequent Auctions**:
For any subsequent chain $j > 1$, the valuation might be adjusted based on previous auction results. We introduce a dynamic factor $\beta_j$ to reflect these adjustments:
$\alpha_j(n) = \alpha(n) + \beta_j$
where $\beta_j$ is influenced by the outcomes of earlier auctions.

### Sequential Auction Revenue Calculation

**Revenue for Chain $j$**:
The revenue from the auction for chain $j$ is thus:
$R_j = V_j^* + \sigma \cdot (\alpha(n) + \beta_j)$

**Total Revenue**:
Summing up all the revenues from the sequential auctions gives:

$$R_{seq} = \sum_{j=1}^K \left( V_j^* + \sigma \cdot (\alpha(n) + \beta_j) \right)$$

$$R_{seq} = \sum_{j=1}^K V_j^* + \sigma \cdot \sum_{j=1}^K (\alpha(n) + \beta_j)$$

### Comparative Analysis

Comparing this with the revenue from a simultaneous auction for all $K$ chains:

$$R_{sim} = \sum_{j=1}^K \left( V_j^* + \sigma \cdot \alpha(n) \right)$$

$$R_{sim} = \sum_{j=1}^K V_j^* + \sigma \cdot K \cdot \alpha(n)$$

The revenue difference is:

$$R_{seq} - R_{sim} = \sigma \cdot \left( \sum_{j=1}^K (\alpha(n) + \beta_j) - K \cdot \alpha(n) \right)$$

$$R_{seq} - R_{sim} = \sigma \cdot \sum_{j=1}^K \beta_j$$

### Observations and Insights

- **Impact of $\beta_j$**:
   - Positive $\beta_j$ values generally suggest that sequential auctions might generate higher revenue than simultaneous ones.
   - The $\beta_j$ values reflect changes in bidder aggressiveness or caution, driven by previous auction outcomes.
- **Strategy Adjustments**:
   - Losers in early auctions may become more aggressive in later rounds, potentially increasing $\beta_j$.
   - Conversely, early winners might temper their bids to manage risk, possibly reducing $\beta_j$.
- **Real-World Applicability**:
   - Sequential auctions can more closely mimic actual bidding behaviors as they allow bidders to adapt strategies based on new information and previous results.
- **Market Dynamics**:
   - These auctions can foster a more dynamic and potentially competitive bidding environment, which might lead to enhanced overall revenue.


## References
[^1]: https://research.arbitrum.io/t/do-shared-mev-auctions-actually-increase-revenue/9606
[^2]: https://barnabe.substack.com/p/pbs 
[^3]: https://thogiti.github.io/2024/03/28/ePBS.html

