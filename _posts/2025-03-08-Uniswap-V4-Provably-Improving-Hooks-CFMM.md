---
title: Provably Improving Hook-Enabled Forward Exchange Functions - A Rigorous Mathematical Framework for Optimal Routing in Uniswap v4
date: 2025-03-08
author: Nagu Thogiti
tags: Ethereum uniswap uniswap-v4 uniswap-v4-hooks amm automated-market-making automated-market-maker amm-v4-hooks optimal-routing-amm hook-enabed-forward-exchange-functions CFMM  smart-routing-CFMM provably-improving-hooks better-hooks-CFMM
---


# Introduction - The Evolution of Automated Market Makers 

If you've ever traded on Uniswap, you might think of it as a decentralized vending machine for tokens—you put in token A, and it spits out token B. But this vending machine isn’t using fixed prices—it’s governed by a mathematical function that determines prices dynamically based on supply and demand.  


Uniswap v4 introduced [hooks](https://github.com/Uniswap/v4-core/tree/main/docs/whitepaper), which are like custom modifications that can change how this function behaves. These hooks mess with the curve, and in some cases, they actually make routing strictly better. These hooks can:  

- Modify fees dynamically based on market conditions.  
- Introduce limit orders, letting traders specify exact prices at which they want to buy or sell.  
- Use external liquidity (RFQs), enabling trades at prices better than the automated pool would normally allow.  

This raises a fundamental question:  

> **When does a hook provably improve routing?**  

In this article, we’ll rigorously define "**provably improving routing**" and show that under certain conditions, hooks strictly expand execution possibilities, improve trader outcomes, and preserve the solvability of optimal routing problems.  


---

# The Mathematics of CFMMs and Routing

## How Uniswap Normally Works

A constant function market maker (CFMM) maintains reserves $R_A, R_B$ for assets $A$ and $B$, enforcing the invariant function:

$$
\Psi(R_A - x, R_B + y) = k.
$$

This is just a fancy way of saying:
>The product (or some other function) of the two token reserves is always constant.



A trade of $x$ units of $A$ for $y$ units of $B$ satisfies the forward exchange function:  

$$
y = \phi(x).
$$

This function describes how much of token B you get per unit of token A.  

For standard CFMMs (like Uniswap v2, Curve, or Balancer), $\phi(x)$ satisfies:  

- Monotonicity: $\phi'(x) \geq 0$ (If you add more of token A, you get more of token B.).  
- Concavity: $\phi''(x) \leq 0$ (The more you trade, the worse your exchange rate gets because each additional token has a slightly worse price).  

The concavity of $\phi(x)$ ensures that as you buy more of an asset, you move the price against yourself, making large trades more expensive.  

This is what makes AMMs behave like real markets—liquidity gets "stretched" as you trade deeper.  

---

## How Hooks Modify the Exchange Function

A hook in Uniswap v4 modifies the exchange function by introducing an additional term:  

$$
\tilde{\phi}(x, s) = \phi(x) + h(x, s).
$$

where:  
- $\phi(x)$ is the original swap function.  
- $h(x, s)$ is a hook-induced modification.  
- $s$ is an external state variable (such as an oracle price, linit order, RFQ bid, or liquidity incentive).  

### Examples of Hook-Enabled Pricing Functions

In the [previous article](https://thogiti.github.io/2025/02/15/Understanding-Uniswap-v4-hooks-optimal-routing-AMM.html), we explained three use cases in details of hook-enabled forward exchange functions based on the recent paper from [Tarun et al., “Optimal Routing in the Presence of Hooks: Three Case Studies,”](https://arxiv.org/abs/2502.02059). 

1. Limit Orders (Piecewise Linear Segments)  
   - Users place fixed-price trades up to a volume limit.  
   - This makes the exchange curve "flat" over that range.  
   
   Mathematically:

   $$
   \tilde{\phi}(x) =
   \begin{cases} 
   \phi(x), & x < x_1 \\
   P_{\text{limit}} x, & x_1 \leq x \leq x_2 \\
   \phi(x), & x > x_2.
   \end{cases}
   $$

   Effect: In that middle region, the price doesn’t change—you get a fixed rate, no slippage.  

2. RFQ Hooks (External Liquidity Sources)  
   - Instead of always following the CFMM curve, the function checks an external price feed and takes the better price:

   $$
   h(x, s) = \max(\phi(x), P_{\text{RFQ}}(s)).
   $$

   Effect: This behaves like dark pools in traditional finance, where liquidity "magically appears" at better prices.  

3. Time-Weighted Execution (Smoothing Price Impact)  
   - Instead of executing a trade all at once, break it into small trades over time:  

   $$
   h(x, t) = \frac{1}{T} \sum_{i=1}^{T} \phi(x_i).
   $$

   Effect: This reduces price impact from large trades.  

These hooks expand the set of possible trades, but when does this actually improve routing?  

---

# When Hooks Provably Improve Routing  

## Definition of Provably Improving Hooks

For a hook to **provably improve routing**, we require three fundamental properties:  

1. No worse on any trade size: $\tilde{\phi}(x) \geq \phi(x)$ for all $x \geq 0$.  
   - Meaning: The modified exchange function never offers a worse rate than the original.  
   - Why it matters: This ensures that users are never forced into a suboptimal trade.  

2. Strict improvement on some trade sizes: There exists $x^\*$ such that $\tilde{\phi}(x^\*) > \phi(x^\*)$.  
   - Meaning: The hook must provide a strictly better rate for at least one trade size.  
   - Why it matters: Otherwise, the hook doesn’t expand the feasible trade set, making it functionally useless.  

3. Preserving convexity and monotonicity: $\tilde{\phi}(x)$ must remain concave and non-decreasing.  
   - Meaning: The modified function still behaves like a well-defined market: larger trades do not yield increasing marginal returns.  
   - Why it matters: Ensuring concavity guarantees that the aggregator’s global routing problem remains convex, which means it is still solvable in polynomial time.  

Thus, we can formally define **the set of provably improving hooks** as follows:  

$$
\mathcal{H}(\phi) = \Big\{ \tilde{\phi} \colon \mathbb{R}_+ \to \mathbb{R}_+  \; \Big| \;  \tilde{\phi}(x) \geq \phi(x) \; \forall x, \quad \tilde{\phi} \text{ is concave and nondecreasing}, \quad \exists x^* \text{ s.t. } \tilde{\phi}(x^*) > \phi(x^*) \Big\}.
$$

This is the set of all hook-enabled forward exchange functions that provably improve routing.  


If $\tilde{\phi} \in \mathcal{H}(\phi)$, routing is **provably improved**.  

- Hooks in $\mathcal{H}(\phi)$ guarantee traders never get a worse rate.  
- If $\tilde{\phi}(x) > \phi(x)$, routing strictly improves. 
- Concavity ensures optimal routing remains solvable.
- If $\tilde{\phi} \notin \mathcal{H}(\phi)$, the hook either degrades routing or breaks solvability.  



# Mathematical Proof of Provably Improved Routing

## The Formal Optimization Problem

A trader’s job is to find the best route across multiple liquidity pools, optimizing their utility function $U(x)$:

$$
\max_{x \in \mathbb{R}_+^N} U(x) \quad \text{subject to} \quad x \in \mathcal{F}(\phi).
$$

where:  
- $U(x)$ is the trader’s utility function (e.g., the net output from the swap).  
- $\mathcal{F}(\phi)$ is the feasible trade set, defined by the CFMM forward exchange functions.  


When a hook is introduced, the feasible set expands to $\mathcal{F}(\tilde{\phi})$, where:  

$$
\mathcal{F}(\tilde{\phi}) = \{(x, y) \in \mathbb{R}_+^2 \;|\; y \leq \tilde{\phi}(x) \}.
$$

Since $\tilde{\phi}(x) \geq \phi(x)$ by definition, the new feasible set is always larger,  $\mathcal{F}(\tilde{\phi}) \supset \mathcal{F}(\phi)$.  

Thus, the optimal routing solution improves:  

$$
U(x^*(\tilde{\phi})) \geq U(x^*(\phi)).
$$

If the hook provides a strict improvement at some trade size $x^*$, then:  

$$
U(x^*(\tilde{\phi})) > U(x^*(\phi)).
$$

In simple terms, if adding hooks always increases the optimal trade, then routing is strictly improved.


This is guaranteed if:  
1. The feasible trade set expands: $\mathcal{F}(\tilde{\phi}) \supset \mathcal{F}(\phi)$.  
2. There exists a price improvement $h(x) > 0$ over some trade region.  
3. The aggregator retains optionality: If the hook isn't beneficial, it can be ignored.  


---

## Variational Proof of Routing Improvement

Now, let’s prove this rigorously using optimization techniques.


### KKT Conditions & Their Importance  

At the optimal trade execution, the  [Karush-Kuhn-Tucker (KKT) conditions](https://en.wikipedia.org/wiki/Karush%E2%80%93Kuhn%E2%80%93Tucker_conditions) describe the necessary conditions for optimality in a constrained optimization problem.  

For the optimal routing problem, the first-order condition states that:  

$$
\frac{\partial U}{\partial x_i} = \lambda \frac{\partial \tilde{\phi}(x)}{\partial x_i}.
$$

where:  
- $U(x)$ is the trader's utility function (e.g., the net output of their trade).  
- $\lambda$ is the Lagrange multiplier, representing the shadow price of liquidity constraints.  
- $\frac{\partial \tilde{\phi}(x)}{\partial x_i}$ is the marginal exchange rate, i.e., how much extra output a trader gets per unit of input.  

Why does this matter?  

- If $\tilde{\phi}(x)$ offers a better rate than $\phi(x)$ at some $x$, then  
  - $\frac{\partial \tilde{\phi}(x)}{\partial x_i} > \frac{\partial \phi(x)}{\partial x_i}$.  
  - This increases the optimal trade size $x_i^*$ since traders always move towards higher marginal utility per unit input.  
- The only way routing doesn’t improve is if traders completely ignore the hook, which contradicts the assumption that $h(x) > 0$ for some $x$.  

Thus, introducing a provably improving hook must lead to increased optimal trade volume and better routing outcomes.  

---

### Gateaux Differentiation: Measuring the Impact of Hooks  

Another way to see this improvement is through variational analysis.  

Consider a small perturbation to the forward exchange function:  

$$
\tilde{\phi}(x) = \phi(x) + \epsilon h(x).
$$

where:  
- $\epsilon$ is a scaling factor, representing an infinitesimally small modification to the original function.  
- $h(x)$ is the hook-induced modification to the exchange function.  

To measure how this affects the optimal routing solution, we take the Gateaux derivative of the utility function:  

$$
\frac{d}{d\epsilon} U(x^*(\tilde{\phi})) = \sum_{i=1}^{N} \frac{\partial U}{\partial x_i} h(x_i).
$$

Interpretation:  

- Since $h(x) \geq 0$ for all $x$ (by the definition of $\mathcal{H}(\phi)$), we conclude:  

  $$
  \frac{d}{d\epsilon} U(x^*(\tilde{\phi})) \geq 0.
  $$

- This means that routing outcomes cannot get worse with the introduction of the hook.  
- Moreover, if $h(x) > 0$ for some trade sizes, then:

  $$
  \frac{d}{d\epsilon} U(x^*(\tilde{\phi})) > 0.
  $$

  which proves that the optimal routing solution strictly improves under the hook-enabled function.  

Thus, we have mathematically established that:  
- Hooks always expand execution possibilities without making things worse.  
- The optimal routing solution improves whenever the hook provides a strictly better exchange rate at some trade size.  


---

# Theorem: Provably Improved Routing with Hooks

Now, let’s formalize the main theorem that guarantees hook-modified forward exchange functions improve routing while preserving convex solvability.  

## Theorem (Provably Improved Routing)  

Let $\{ \phi_i \}_{i=1}^{m}$ be the original forward exchange functions for $m$ CFMM pools. Suppose we modify them via hooks, yielding new functions $\{ \tilde{\phi}\_i \}\_{i=1}^{m}$, where each $\tilde{\phi}_i$ belongs to the set $\mathcal{H}(\phi_i)$. Define the new feasible trade sets:  

$$
\tilde{T}_i = \{(x,y) \in \mathbb{R}_+^2 \;|\; y \leq \tilde{\phi}_i(x) \}.
$$

Then:  

- The new routing problem remains a convex optimization problem:  

   $$
   \max_{x} U\!\Bigl(\sum\nolimits_{i=1}^m A_i x_i \Bigr) \quad \text{subject to} \quad x_i \in \tilde{T}_i.
   $$

- The optimal outcome weakly improves:  

   $$
   U(x^*(\tilde{\phi})) \geq U(x^*(\phi)).
   $$

- If $\tilde{\phi}_i(x) > \phi_i(x)$ for some $x$, the routing strictly improves:  

   $$
   U(x^*(\tilde{\phi})) > U(x^*(\phi)).
   $$

Thus, hooks in $\mathcal{H}(\phi)$ provably improve routing, strictly increasing user utility while maintaining solvability.  

---

# Intuition and Key Insights

- Expanding the Feasible Trade Set  
   - Since $\tilde{\phi}(x) \geq \phi(x)$, every previous trade remains valid or improved.  
   - Result: The router can always find equal or better paths.  

- Preserving Convexity = Keeping Routing Tractable  
   - Concavity ensures routing remains solvable in polynomial time.  
   - Without concavity, the routing problem might become non-convex, leading to local optima and inefficiencies.  

- Practical Hook Examples That Belong to $\mathcal{H}(\phi)$  
   - Limit Orders: They add piecewise linear improvements, keeping $\tilde{\phi}$ concave.  
   - RFQ Hooks: They provide external liquidity sources, strictly increasing the output function.  
   - Fee Discounts: They shift the exchange function upward without breaking convexity.  

- When a Hook Fails to Be Provably Improving  
   - If the hook lowers the output for any trade size, it fails the feasible trade set condition.  
   - If the hook introduces a non-concave segment, it breaks convex solvability.  

---

# The Hook Efficiency Frontier: Where Finance Meets AMMs

## How Hooks Improve Execution Quality  
We can define execution quality as:

$$
R = \int_{0}^{x^*} (\tilde{\phi}(x) - P_{\text{market}})dx.
$$

A hook shifts this integral outward if:

$$
\max_{h} R(h) \geq \max_{\phi} R(\phi).
$$

---

## Mean-Variance Optimization Connection  
In portfolio theory, investors maximize return while minimizing variance:

$$
\max_{x} \mathbb{E}[R(x)] - \lambda \text{Var}[R(x)].
$$

- Hooks play the role of adding a new asset class.
- If they increase expected returns without increasing variance, traders always prefer them.

Thus, hook-enabled CFMMs extend the efficient routing frontier, just like portfolio diversification improves risk-adjusted returns.

---

# Conclusion: What This Means for Uniswap v4

## What We've Proven  
- Hooks strictly expand the set of possible trades.  
- Hooks never make routing worse (traders can always ignore them).  
- Hooks shift the execution frontier outward (better execution quality).  
- Mathematically, provably improving hooks guarantee optimal routing remains convex and solvable.

Uniswap v4's hook-enabled forward exchange functions are more than just a technical curiosity—they’re a fundamental upgrade to how decentralized trading works. By expanding the set of mathematically provable trade improvements, Uniswap is bringing a more flexible, efficient, and customizable AMM system to DeFi.  


# References
- [Chitra, Tarun et al., "Optimal Routing in the Presence of Hooks: Three Case Studies, 2025."](https://arxiv.org/abs/2502.02059)
- [Diamandis et al., An Efficient Algorithm for Optimal Routing Through Constant Function Market Makers, 2023.](https://arxiv.org/abs/2302.04938)
- [Guillermo Angeris et al., An analysis of Uniswap markets, 2021](https://arxiv.org/abs/1911.03380)
- [Uniswap V4](https://github.com/Uniswap/v4-core/tree/main/docs/whitepaper)
- [ Guillermo Angeris et al., When Does The Tail Wag The Dog? Curvature and Market Making, 2022.](https://cryptoeconomicsystems.pubpub.org/pub/angeris-curvature-market-making/release/2)