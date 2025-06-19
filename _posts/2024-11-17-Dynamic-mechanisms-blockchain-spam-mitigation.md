---
title:  Dynamic Fee Vectors - Turning Anti-Spam Escrows into Self-Tuning Markets
tags: Ethereum Solana Rollups MEV blockchain-spam capital-velocity velocity-of-money cost-of-capital reduce-spam-blockchain Solana-local-fee-markets multi-dimensional-fee-markets blockchain-spam-mitigation capital-velocity-DeFi cost-of-capital-spammers MEV-spam-economics spam-mitigation local-vs-global-fee-markets Li-Yorke-chaos-avoidance blockchain-anti-spam-design
---


# Overview

In the [previous](https://thogiti.github.io/2024/11/10/Taming-blockchain-spam-capital-velocity-cost-of-capital-mechanisms.html) article, we showed how slowing capital velocity and raising reserve requirements can help mitigate the spam without punishing ordinary users.  Here we make those two levers adaptive and dynamic.  Our guide is the study *“[Dynamical Analysis of the EIP-1559 Ethereum Fee Market](https://arxiv.org/abs/2102.10567)[^1],”* which says that fee mechanisms can tip from calm to wild oscillations if their control knob moves too fast: blocks swing from over-full to empty in a pattern called [Li-Yorke chaos](https://link.springer.com/article/10.1007/s11253-005-0055-4)[^2].  To avoid that fate we treat volatility itself as a signal, let interest-rate spreads reveal hidden demand, and even outsource parameter-setting to an open auction—turning static anti-spam fees into a living market that tracks network conditions minute by minute.

The central goal is to dynamically select a set of parameters from a finite list of options to maximize the overall utility of the network. This allows a protocol to adapt to changing conditions intelligently, rather than relying on a static, one-size-fits-all approach.

# The Discrete Optimization Problem 

Before exploring solutions, we must clearly define and understand the problem each solution aims to solve. The objective is to select the optimal set of anti-spam parameters that maximizes network health, balancing robust security with a low-friction environment for legitimate users.

## The Objective Function

We aim to maximize the **Network Utility Function ($U_{net}$)**, which is defined as the weighted difference between the economic cost inflicted on spammers and the economic friction imposed on legitimate actors.

**Maximize:**
$U_{net}(K_{req}, T_{lock}) = (w_{deterrence} \cdot C_{spam}) - (w_{efficiency} \cdot F_{legitimate})$

* **$C_{spam}$ (Cost of Spam / Deterrence Score):** Represents the total opportunity cost imposed on spamming activities, calculated as the sum of capital costs for all spam transactions. A higher score is better.
* **$F_{legitimate}$ (Friction on Legitimate Users):** Represents the total opportunity cost imposed on all legitimate transactions. This is a negative for the network that we aim to minimize.
* **$w_{deterrence}, w_{efficiency}$ (Weighting Parameters):** These are governance-controlled weights that represent the protocol's strategic priorities.

## The Decision Variables

The protocol must choose one value for each of the following parameters from a discrete, predefined set of options:

* **$K_{req} \in \{K_1, K_2, ..., K_m\}$**: The **Capital Requirement**, or the amount of extra capital a user must temporarily lock up to submit a transaction (e.g., a set of multipliers like {5X, 10X, 20X} of the gas fee).
* **$T_{lock} \in \{T_1, T_2, ..., T_p\}$**: The **Time Lock** or "illiquid duration," representing the period for which the required capital is held (e.g., a set of lock-up durations like {0, 1, 5, 10} blocks).

## The Constraints

The chosen parameters must operate within a set of constraints to ensure the network remains functional, accessible, and fair.

* **Constraint 1: Regular User Affordability:** The total effective cost for a typical, infrequent transaction must remain below a maximum acceptable threshold ($C_{max}$) to keep the network accessible.
* **Constraint 2: dApp/Power User Viability:** Legitimate high-frequency applications (like oracle networks) have a budget for their total required working capital. The parameters must not make their operations economically unviable.
* **Constraint 3: Minimum Spam Deterrence:** The chosen parameters must be strong enough to make a standard, low-valuation spam attack unprofitable.

With this formal problem statement established, we now explore three advanced adaptive models designed to find an optimal solution.


# Model 1: The "Volatility-Targeted" Feedback Mechanism

This model directly evolves the [EIP-1559 feedback loop](https://timroughgarden.org/papers/eip1559.pdf)[^3]. It adds a second control variable to directly target and suppress the very volatility that the "Dynamical Analysis" paper identified as a key symptom of a system descending into chaos[^1].

## Mechanism

The system operates on a block-by-block basis, adjusting the two anti-spam parameters ($K_{req}$ and $T_{lock}$) based on two network health metrics: congestion and volatility.

1.  **At the end of each block `t`:** The protocol calculates the block load ($\rho_t$) and updates its moving average of block load volatility ($\sigma_t$).
2.  **Regime Assessment:** The protocol checks if the volatility $\sigma_t$ has breached a pre-defined stability threshold, $\sigma_{target}$. This determines if the network is in a "Stable" or "Unstable" state.
3.  **Parameter Adjustment:**
    * **In a Stable Regime ($\sigma_t \le \sigma_{target}$):** The system focuses on managing normal demand fluctuations. It makes a small adjustment to $K_{req}$ to nudge the block load towards its 50% target, while slowly decreasing the more disruptive $T_{lock}$ towards zero.
    * **In an Unstable Regime ($\sigma_t > \sigma_{target}$):** The protocol’s priority shifts to restoring stability. It recognizes the chaotic full-to-empty block oscillations described in the dynamics analysis paper[^1]. It makes a small, incremental increase to the powerful $T_{lock}$ parameter to break the spam cycle. To avoid conflicting signals, it simultaneously dampens the adjustment to $K_{req}$.

## Mathematical Model

* **State Variables:** $K_{req, t}$ (capital requirement), $T_{lock, t}$ (time lock in blocks).
* **Observed Metrics:** $\rho_t$ (block load), $\sigma_t$ (volatility over `w` blocks).
* **Constants:** $\rho_{target}$ (e.g., 0.5), $\sigma_{target}$ (e.g., 0.1), $\alpha_K$ (small learning rate for $K_{req}$), $\Delta_T$ (small, discrete step for $T_{lock}$, e.g., 1 block).

The **Dampening Factor** $D_t$ is defined as:
$D_t = \begin{cases} 0.5 & \text{if } \sigma_t > \sigma_{target} \\ 1 & \text{if } \sigma_t \le \sigma_{target} \end{cases}$

The **Update Equations** for block `t+1` are:
$T_{lock, t+1} = \begin{cases} T_{lock, t} + \Delta_T & \text{if } \sigma_t > \sigma_{target} \\ \max(0, T_{lock, t} - \Delta_T) & \text{if } \sigma_t \le \sigma_{target} \end{cases}$

$K_{req, t+1} = K_{req, t} \cdot \left(1 + \alpha_K \cdot (\rho_t - \rho_{target}) \cdot D_t\right)$

## Analysis and Impacts

### Spam Reduction

A spam attack, characterized by a high volume of transactions with similar valuations, would cause the block load $\rho_t$ to spike and then crash as the base fee adjusts, leading to high volatility. The system detects this when $\sigma_t$ crosses its target. The subsequent increase in $T_{lock}$ cripples the spammer's capital velocity, forcing them to hold exponentially more working capital to maintain their attack rate. This directly increases their opportunity cost, making the attack unprofitable and breaking the cycle of instability.

### Capital Efficiency

For legitimate users, efficiency is maximized by minimizing friction. During normal operation, network volatility is low, so the disruptive $T_{lock}$ parameter trends towards zero. The system uses the less burdensome $K_{req}$ to manage standard congestion. This ensures the protocol only imposes higher friction when actively defending against an attack that threatens network stability, preserving capital efficiency for legitimate actors.

Let's summarize the benefits and challenges with the model 1.

- **Pros:**
  - **Directly Targets Instability:** It addresses the *second-order* effects of congestion (volatility), which the dynamic analysis paper identifies as the core problem in chaotic regimes[^1].
  - **Predictable Changes:** The maximum change per block is capped, providing short-term cost predictability to users.
  - **Autonomous:** It requires no direct governance intervention once the target parameters are set.

- **Cons:**
  - **Lagging Indicator:** The model is reactive and must observe instability before responding.
  - **Parameter Tuning:** Its effectiveness depends on carefully choosing the system parameters ($\sigma_{target}, \alpha_K, \Delta_T$). The dynamic analysis paper[^1] shows that even small changes to adjustment factors can cause a "phase transition" from order to chaos.

---

# Model 2A – Linear-Rate Vault, Turning Locked Capital into a Spam-Sensitive Market

Now we explore some anti-spam market driven models to adjust the capital velocity and cost of capital vectors, $K_{\text{req}}$ and $T_{\text{lock}}$ . *It is a simple “bank” where the interest rate falls in direct proportion to the size of the vault.*

## Mechanism

Each time a transaction is accepted, the protocol escrows $K_{\text{req}}$ units of the native token **ASSET** for the user’s personal $T_{\text{lock}}$ period. All escrows are swept into one communal vault. Borrowers who need *instant* ASSET liquidity can take a one-block loan from that vault and repay in the next block; the price they pay is an interest charge set by a linear formula.

## Mathematical model

* **State variables**

  * $V_t$ – total ASSET locked in the vault at block $t$.
  * $D$ – exogenous, approximately constant demand for one-block liquidity.
  * $r_t^{\text{lin}}$ – one-block interest rate offered by the vault.

- **Interest curve**

  $$
  r_t^{\text{lin}}=\frac{D}{V_t}.
  $$

  As more capital is locked ($V_t\uparrow$), the borrowing rate falls.

- **Governance rule**
  Let $r_{\text{target}}$ be a desired floor rate.

  $$
  K_{\text{req},t+1}=K_{\text{req},t}\!
  \begin{cases}
    (1+\gamma) & \text{if } r_t^{\text{lin}}<r_{\text{target}},\\
    (1-\gamma) & \text{if } r_t^{\text{lin}}>r_{\text{target}},
  \end{cases}
  $$

  with a small step size $\gamma\ll1$.

## Analysis and Impacts

### Spam-mitigation logic

A spammer must lock $K_{\text{req}}$ per transaction.  His flood of transactions inflates $V_t$, crushing $r_t^{\text{lin}}$.  Once the rate falls below $r_{\text{target}}$ the governor raises $K_{\text{req}}$.  The attack becomes expensive because every new transaction now requires more collateral *and* earns a lower rate of return on any re-borrowed capital.

### Capital-efficiency & yield

- Locked funds are not idle; the vault lends them out for one-block arbitrage, collecting interest.
- Yield equals $r_t^{\text{lin}}\times V_t$ and can be routed to the treasury or burned.
- Because $r_t^{\text{lin}}$ is linear, it can fall very quickly—meaning yield dries up exactly when the vault is richest.


### **Who actually borrows from the `ASSET / kASSET` pool?**

Only actors who need **atomic, single-block liquidity**—capital they can grab *and* repay inside the very same transaction—are willing to pay the pool’s instant slippage + fee:

| Borrower archetype        | Why the vault is perfect                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Arbitrageur**           | Buys on cheap DEX, sells on expensive DEX in one bundle; needs bulk `ASSET` for the first leg and repays with proceeds of the second. |
| **Liquidator**            | Repays a delinquent loan on Aave/Compound, claims collateral at discount, then sells it—all atomically.                               |
| **Flash-loan strategist** | Executes collateral swaps, debt refinancing, or multi-step MEV tricks that momentarily require more capital than the wallet owns.     |

For them, the vault is a native, protocol-secured flash-loan desk with predictable pricing; paying a few bps of slippage plus the vault fee is trivial compared with the arbitrage or liquidation spread they capture.


### **What if the vault price is still too cheap and spam remains profitable?**

Let the expected spam profit per tx be $P_{\text{exp}}$.
The attacker’s net gain is

$$
\Pi = P_{\text{exp}} - \bigl(G_{\text{cost}} + K_{\text{req}}\cdot P_{k\!A}\bigr),
$$

where $P_{k\!A}$ is the vault’s **implicit interest cost** (price discount of `kASSET`). If $\Pi>0$ they will keep spamming.

The defense loop is two-layered:

1. **Curve defense (automatic).** Every new spam tx mints more `kASSET`, pushes $P_{k\!A}$ down, and steepens its own future borrowing cost *convexly*.
2. **Governor defense (explicit).** If price still sinks below the comfort floor $P_{\min}$, the governor multiplies next-block $K_{\text{req}}$ by $(1+\gamma)$. Even with $P_{k\!A}\!\approx0$, a 2× or 4× jump in collateral wipes out $\Pi$ or demands a bankroll most spammers won’t post.

Because $\gamma$ is small but can be applied repeatedly, the system never lets the price linger in a non-deterring zone for more than a handful of blocks.


### **Where does the positive yield for lockers come from?**

There is no inflation, no magic printing here: **all yield is paid by the borrowers.**

- **Swap fee stream.** Every `ASSET ↔ kASSET` trade clips a 0.3 % (configurable) LP fee that accrues to the pool.
- **Convex-pricing rent.** Borrowers slide down the constant-product curve; the geometric-mean payoff they leave behind is economic surplus captured by LP shares.

Those LP tokens are auto-held by whoever’s capital is currently locked; when a user’s $T_{\text{lock}}$ expires, they redeem 1 `kASSET` → 1 `ASSET` **plus** their pro-rata share of accumulated fees. It is, in effect, an on-chain MEV rebate: the profit that would have gone to external flash-loan providers or to miner-extracted priority fees is recycled back to the people whose collateral defends the chain.

*Borrowers* pay for the privilege of instant liquidity; *lockers* earn that payment; the protocol only steps in when the curve itself no longer disciplines spam.


Let's summarize the benefits and challenges with the model 2A.

- **Pros**
  - Simpler implementation.
  - Clear, monotone relationship between spam volume and rate signal.

- **Cons**
  - Rate collapses *too* fast as $V_t$ grows, so governor must intervene often.
  - Single exogenous parameter $D$ must be estimated and can drift over time.
  - Large discrete jumps in $K_{\text{req}}$ risk oscillatory behavior if $\gamma$ is mis-tuned.

---

# Model 2B – Convex CPAMM Vault

*A constant product AMM (CPAMM) prices immediacy on a curved supply–demand surface and earns swap fees.*

## Mechanism

The protocol runs an internal Uniswap-style pool with reserves $(R_A,R_K)$:

- **ASSET** (`ASSET`) – liquid native token.
- **Locked ASSET** (`kASSET`) – IOU redeemable 1-for-1 after its owner’s $T_{\text{lock}}$.

When a user locks $K_{\text{req}}$ ASSET, the protocol mints the same amount of `kASSET` and deposits it single-sided into the pool. Borrowers who want immediate liquidity swap `kASSET → ASSET`, paying the AMM’s price impact plus the usual LP fee.

## Mathematical model

- **Invariant**

  $$
  R_A\cdot R_K=\mathcal K.
  $$

- **On-chain price of `kASSET`**

  $$
  P_{k\!A}=\frac{R_A}{R_K}\quad(<1).
  $$

- **Governance rule (price band)**

  $$
  K_{\text{req},t+1}=K_{\text{req},t}\!
  \begin{cases}
    (1+\gamma) & \text{if } P_{k\!A,t}<P_{\min},\\
    (1-\gamma) & \text{if } P_{k\!A,t}>P_{\max},\\
    1 & \text{otherwise.}
  \end{cases}
  $$

*Optionally*, we can replace the constant-product with a **concentrated-liquidity invariant** to keep $P_{k\!A}$ nearly flat inside a utilization band and make it spike outside.

## Analysis and Impacts

### Spam-mitigation logic

A spammer’s flood mints vast amounts of `kASSET`, enlarging $R_K$ and pushing $P_{k\!A}$ down *convexly*: each extra token has a larger negative price impact than the previous. The borrowing cost therefore rises super-linearly before any governor action.  Only if $P_{k\!A}$ pierces the comfort band does the protocol add small ($\gamma$) bumps to $K_{\text{req}}$.

### Capital-efficiency & yield

* **Swap fees** accrue to LP shares owned by all lockers, so their escrowed capital earns income.
* **Convex pricing** means borrowing cost rises smoothly with demand—no sudden rate collapse.
* **Concentrated liquidity** minimizes impermanent-loss drift, retaining more of the fee yield.

Let's summarize the benefits and challenges with the model 2B.

- **Pros**
  - Borrow cost throttles spam *immediately* via AMM slippage; governor rarely intervenes.
  - All locked capital becomes productive LP liquidity.
  - Pricing is determined by open arbitrage, not by a guessed constant $D$.

**Cons**
  - Needs an ASSET seed in the pool to start deep enough.
  - More contract complexity (invariant maths, LP-token accounting).
  - Price oracle for $P_{k\!A}$ must be TWAP-protected against flash-loan spoofing.


### Side-by-side summary of Model 2A & 2B

| Feature               | **Linear vault**                 | **CP-AMM vault**                    |
| --------------------- | -------------------------------- | ----------------------------------- |
| Borrow-price curve    | $r=D/V$ (linear)                 | $P=R_A/R_K$ (hyper-convex)          |
| Governance frequency    | High (rate collapses fast)       | Low (curve self-regulates)          |
| Yield source          | Interest only                    | LP fees + optional CL yield         |
| Parameters to tune    | $D,\,r_{\text{target}},\,\gamma$ | $P_{\min},\,P_{\max},\,\gamma$      |
| Implementation effort | Low                              | Medium/High                         |
| Resilience to spam    | Relies on governance rule               | Curve punishes spam before governance |

Both designs convert a security cost into an economic signal, but the convex AMM version embeds that signal directly in a well-studied market micro-structure, letting price curvature perform most of the defensive work and turning locked capital into a yield engine for honest users.


---

# Model 4: The Automated "Stability Bond" Auction

This model uses financial incentives to outsource the complex problem of parameter setting to a competitive market, creating a prediction market for network stability.

## Mechanism & Auction Analysis

- **Auction Type:** This is a **bonding auction**. The goal is not to sell an item but to select a policy outcome—the network's parameters for the next epoch—based on the collective financial conviction of the bidders.
- **The Bidding Process:** Before each epoch, "bonders" stake capital on their preferred parameter set $(K_{req}, T_{lock})$.
- **Allocation Rule:** The parameter set with the highest total amount of bonded capital is chosen for the next epoch. This is a "winner-take-all" allocation based on stake-weight.
- **Payoff and Slashing:**
    - **If the epoch is stable** (low volatility), the bonders who backed the winning parameters receive a yield.
    - **If the epoch is unstable** (high volatility), their bond is **slashed** (partially or fully confiscated by the protocol). This creates a strong financial disincentive to propose parameters that could lead to the chaotic behavior described in the dynamics analysis paper[^1].

## Game-Theoretic Analysis

- **Incentive Compatibility:** This mechanism is **not perfectly "truthful"** in a pure sense. A bonder's optimal strategy is to bid on the parameters they believe will both win the auction *and* be stable enough to avoid slashing. This strategic consideration is what drives the system toward a functional equilibrium.
- **Nash Equilibrium:** A Nash Equilibrium is a state where no bonder can improve their expected payoff by changing their bid. The likely equilibrium is one where sophisticated actors, who are skilled at modeling network risk, converge on parameters that are just strong enough to deter anticipated threats without being overly restrictive. They will not bid on weak parameters for fear of being slashed, nor on excessively strong parameters because this provides no extra reward and may attract less total stake, causing them to lose the auction. The equilibrium reflects the market's consensus on the optimal point on the security-efficiency frontier.

## Analysis and Impacts

### Spam Reduction

This model is **proactive**. It forces the market to price in the *future risk* of spam. If bonders anticipate an event that could lead to instability, they will proactively vote for higher security parameters to protect their bonds. This hardens the network *before* an attack, rather than reacting to one. It allows the market to collectively decide on parameters that will keep the system in the stable regime and avoid the "phase transitions" to chaos[^1].

### Capital Efficiency

The auction creates a powerful incentive to not over-secure the network. Since there's no extra reward for choosing excessively high parameters, bonders are motivated to find the *most efficient* (i.e., least restrictive) set of parameters that will still guarantee stability.

- **Pros:**
    - **Proactive and Forward-Looking:** Uses market intelligence to preempt threats.
    - **Outsources Optimization:** Leverages the collective intelligence of the market to find optimal parameters.
    - **Transparent and Predictable:** Parameters are fixed and known for an entire epoch, providing medium-term certainty.

- **Cons:**
    - **Whale Manipulation:** A wealthy actor could potentially sway the auction. However, the slashing mechanism makes this extremely risky; if their chosen parameters lead to instability, their massive bond will be slashed.
    - **Requires Critical Mass:** The system's security relies on a sufficiently large and liquid pool of bonding capital to make the auction meaningful and manipulation prohibitively expensive.

# Profit-sharing as MEV redistribution

Both vault designs generate an **excess value stream** that did not exist in the static-escrow world:

- the linear vault accrues one-block **interest** on every flash loan;
- the CP-AMM vault earns **swap fees** (and, with concentrated liquidity, a tighter gamma-bleed rebate).

Because that revenue is created by transactions jostling for priority, it is effectively **“soft MEV”** captured by the protocol.  Sharing it back with the very wallets whose capital underwrites the defense turns the anti-spam cost into a **positive-sum redistribution loop**:

| Step                | How it works                                                                                                                                                                                                                                         | Typical cadence |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **1. Accrue**       | Interest or LP fees accumulate as additional vault shares.                                                                                                                                                                                           | Every block     |
| **2. Harvest**      | A keeper or scheduled function converts surplus shares back to `ASSET`.                                                                                                                                                                              | Daily / weekly  |
| **3. Redistribute** |  • Pro-rata to all addresses with active locks (simple LP model).<br> • Stream to a pay-master that auto-pays part of their next gas/lock fee (gas subsidy).<br> • Route to a public-goods treasury or burn address if governance prefers deflation. | Same as harvest |

On-chain accounting is trivial: each lock already mints `kASSET` (or an LP receipt) for the user; the profit is distributed in the *same* token, so holders see their balance rise automatically.  Over time the mechanism dampens the net cost of security for honest participants—*a built-in MEV-rebate program*—while spammers still face the full brunt of rising $K_{\text{req}}$ and price slippage.


# References 

[^1]: [Dynamical Analysis of the EIP-1559 Ethereum Fee Market](https://arxiv.org/abs/2102.10567)
[^2]: [Li-Yorke chaos](https://link.springer.com/article/10.1007/s11253-005-0055-4)
[^3]: [An Economic Analysis of EIP-1559](https://timroughgarden.org/papers/eip1559.pdf)
[^4]: [Constant function market maker](https://en.wikipedia.org/wiki/Constant_function_market_maker)
