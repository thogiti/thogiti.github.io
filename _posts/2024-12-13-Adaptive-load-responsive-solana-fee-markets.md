---
title: Adaptive, Load Responsive Fee Markets on Solana - A Rigorous LRU-Based Control-Theoretic Framework
tags: Solana solana-fee-markets dynamics-fee-markets blockchain-fee-markets
---

## WIP - WORK IN PROGRESS

*Special thank yous to [Terry](https://x.com/0xtaetaehoho) and [Fikunmi](https://x.com/fikunmi_ap) for reading early versions of this article and providing feedback.* 


## Introduction

Solana is a high-throughput blockchain that aims to maintain full capacity utilization without artificially constraining blockspace. Unlike Ethereum—which relies on a dynamic base fee model (EIP-1559) that makes blockspace explicitly scarce—Solana’s design philosophy emphasizes abundant capacity and low latency. Yet, this introduces a unique challenge: how can the network guide users toward paying fees that reflect real-time contention without relying on traditional fee models that depend on block saturation?

The recently [proposed LRU cache](https://docs.google.com/document/d/1Piwlc1VZyfh6uaYwY_OsMae8MApPQSxisjE3S-oBf0c/edit?usp=drivesdk)[^1] solution by [Fikunmi](https://x.com/fikunmi_ap) attempts to improve Solana’s fee market by tracking only the most contentious accounts and recommending fees that closely reflect current conditions. In this post, we rigorously formalize this approach, integrate direct network load signals (such as scheduler and QUIC ingress backlogs), and consider adaptive windows that make fee estimation more responsive to near real-time network states. We also introduce a control-theoretic perspective to ensure stability, equilibrium, and predictability in the face of dynamic transaction arrival rates.

Our framework shows that it is possible to approach the [vision outlined by Toly](https://x.com/aeyakovenko/status/1867218480640262529?s=46)[^2] and others in the Solana community: a healthy fee market that naturally encourages appropriate fee bidding—without forcing empty blocks or dropping low-fee transactions.

---

## Background

Before diving into our formalism, let’s restate the problem at a high level:

- No artificial constrains: Solana wants to keep blocks as full as possible. Transactions should not be dropped simply because they did not meet a “base fee.”
- Load responsiveness: Fee recommendations should respond directly to signals of congestion—scheduler backlog, QUIC ingress queue depth—rather than waiting for block saturation.
- Freshness of data: Fee recommendations should reflect immediate conditions. Past hot accounts that have cooled down should not inflate current fee recommendations.

Our approach: a refined LRU cache design that stores recent median fees for the most contentious accounts, integrates these fees with global median fees, and then scales them based on real-time load indicators. We tie these concepts together using rigorous mathematics and basic control-theoretic principles.

---

## Formalizing the Setting

Time and Slots:
We assume discrete time intervals $t \in \mathbb{N}$, where each slot corresponds to one Solana block.

Accounts and Fees:
- Let $\mathcal{A}$ be the set of all accounts on the network.
- For each slot $t$, let $A_t \subseteq \mathcal{A}$ be the set of accounts touched by transactions in that slot.
- Let $f_{t}(a)$ represent the observed median priority fee paid by transactions that access account $a$ at slot $t$. If no transactions touch $a$ in slot $t$, then $f_{t}(a) = \emptyset.$

Global Fees:
We define a global median fee $f_t^{(global)}$ as the median priority fee of all transactions included in slot $t$.

---

## Introducing Direct Load Signals

Instead of looking at block fullness, we consider:

- $Q(t)$: QUIC ingress queue depth at time $t$.
- $S(t)$: Scheduler backlog at time $t$.

These provide a more direct measure of network congestion. We combine them into a load vector:

$$L(t) = (Q(t), S(t)) \in \mathbb{R}_{\ge 0}^2.$$


---

## The LRU Cache Structure

We maintain an LRU (Least Recently Used) cache to track the most contentious accounts at any given time:

- Let $C(t) \subseteq \mathcal{A}$ be the set of accounts currently in the cache at the end of slot $t$.
- The cache size and eviction rules ensure it only contains accounts that have been contentious over a very recent window of slots.

We define a short lookback window $w \leq W(t)$, where $W(t)$ is the (possibly adaptive) number of recent slots we consider. For each cached account $a \in C(t)$, we compute a median fee over the last $w$ slots in which $a$ was touched:

$$M_a(t) = \text{median}\{ f_{\tau}(a) \mid t-w+1 \leq \tau \leq t, f_{\tau}(a) \neq \emptyset \}.$$


We also maintain a global median fee across recent slots:

$$M_{global}(t) = \text{median}\{ f_{\tau}^{(global)} \mid t-W_g+1 \leq \tau \leq t \}$$

for some global lookback window $W_g$.

**Cache Dynamics:**
- Evict accounts that have not been seen for more than $W(t)$ slots or have stale data.
- Insert the top $k$ most contentious accounts from slot $t$ into $C(t)$.

Formally:

$$C(t) = (C(t-1) \setminus E(t)) \cup I(t)$$

where $E(t)$ are evictions and $I(t)$ are new insertions.

---

## Adaptive Lookback Windows

We want the system to be more reactive under high load and more stable under low load. To achieve this, we let the lookback window $W(t)$ depend on the current load $L(t)$.

For example:

$$W(t) = \frac{W_0}{1 + \theta L_{norm}(t)},$$

where $L_{norm}(t) = \alpha Q(t) + \beta S(t)$ is a weighted sum of load indicators, and $\theta, W_0, \alpha, \beta > 0$ are parameters.

When congestion is high ($L_{norm}(t)$ large), $W(t)$ shrinks, ensuring we rely on fresher, more immediate data. When load is stable and low, $W(t) \approx W_0$, giving us a slightly smoother historical view.

---

## Fee Recommendation Function

For a transaction at time $t$ touching accounts $A_T \subseteq \mathcal{A}$, we want to produce a recommended fee $F(t)$. We combine global and per-account medians and then scale based on load:


$$F(t) = \max\{ M_{global}(t), \max_{a \in A_T \cap C(t)} M_a(t) \} \cdot G(L(t)),$$


where $G: \mathbb{R}_{\ge 0}^2 \to$  $\mathbb{R}\_{> 0}$ is a monotone non-decreasing function representing how we scale fees up or down based on load.

### Defining the Load-Scaling Function $G$

One could choose a simple exponential form:

$$G(L(t)) = 1 + \alpha Q(t)^\beta + \gamma S(t)^\delta,$$

where $\alpha, \beta, \gamma, \delta > 0.$

Alternatively, for more refined control, use a control-theoretic feedback loop (like a PID controller):

$$G(L(t)) = \exp\bigl( K_p E(t) + K_i \sum_{\tau=0}^{t} E(\tau) \Delta\tau + K_d \frac{E(t)-E(t-1)}{\Delta\tau}\bigr),$$

where $E(t) = S(t) - S^\*$ measures deviation from a target scheduler backlog $S^\*$.

---

## Equilibrium Analysis

Goal: Show that the system can reach a stable equilibrium. An equilibrium occurs when fees, load, and arrival rates stabilize.

- Let $\lambda$ be the steady-state transaction arrival rate.
- At equilibrium, we have a fixed point $(F^\*, L^\*)$ where:

$$F^* = \Phi(F^*, L^*) \quad \text{and} \quad L^* = \Psi(F^*, \lambda),$$

for some continuous functions $\Phi$ and $\Psi$.

Existence of Equilibrium:
Under reasonable assumptions—bounded load, stationary arrival rates, continuous and monotone fee-response functions—Brouwer’s Fixed Point Theorem[^3] guarantees at least one fixed point. In short, if you raise fees when load increases and load decreases when fees are too high, the system should find a stable operating point.

Stability:
Stability depends on the sensitivity of $G$ and tuning parameters ($K_p, K_i, K_d$ or $\alpha, \beta, \gamma, \delta$). By linearizing around $F^*$, standard control theory (Routh-Hurwitz conditions)[^4] can verify that no persistent oscillations occur.

---

## Responsive Yet Predictable

A key feature of this approach is balancing responsiveness with predictability:

- If no accounts are contentious:
  If no hot accounts are found in the cache, and load is low, we have:
  
  $$F(t) \approx M_{global}(t).$$
  
  This ensures stable, low fees under normal conditions.

- If certain accounts are contentious:
  If an account is highly demanded, then:
  
  $$\max_{a \in A_T \cap C(t)} M_a(t) > M_{global}(t),$$
  
  lifting the recommended fee for transactions touching that account. This mechanism encourages appropriate bidding without enforcing strict exclusion.

---

## Window Stability and Freshness

When load stabilizes, $L_{norm}(t) \to L_{norm}^*$, and:

$$\lim_{t \to \infty} W(t) = \frac{W_0}{1 + \theta L_{norm}^*}.$$


This ensures the system’s lookback window converges to a stable range, balancing immediate responsiveness against unnecessary volatility.

---

## References

[^1]: https://docs.google.com/document/d/1Piwlc1VZyfh6uaYwY_OsMae8MApPQSxisjE3S-oBf0c/edit?usp=drivesdk
[^2]: https://x.com/aeyakovenko/status/1867218480640262529?s=46
[^3]: https://en.wikipedia.org/wiki/Brouwer_fixed-point_theorem
[^4]: https://en.wikipedia.org/wiki/Routh%E2%80%93Hurwitz_stability_criterion