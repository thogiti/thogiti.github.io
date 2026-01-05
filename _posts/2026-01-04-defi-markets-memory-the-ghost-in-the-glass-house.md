---
title: The Ghost in the Glass House - Why DeFi Markets Never Forget
date: 2026-01-04
author: Nagu Thogiti
tags: DeFi market-microstructure QuantitativeFinance Crypto Econophysics MarketMemory Metaorders OrderSplitting Liquidity PowerLaws LMFModel 
---

![The Ghost in the Glass House - Why DeFi Markets Never Forget](/assets/images/2026/defi-markets-memory-ghost-in-the-machine.jpeg)

Understanding why prices change is the oldest problem in markets. “Supply and demand” is the standard answer, but it rarely tells you *how* imbalance gets converted into price. In practice, the mechanism lives in the tape: what prints, in what order, and with what persistence.

This framing aligns with the APS Viewpoint *Decoding the Dynamics of Supply and Demand* [1], which uses a simple empirical object, the $+1/-1$ sign tape of buyer- vs. seller-initiated trades, to define “memory” in order flow.

DeFi should make this analysis easier. The data is native and public: every swap is timestamped, every block is numbered, every route is traceable. But the transparency is deceptive. The DeFi tape is a mixture of intent and reaction. Liquidations, sandwiching, backruns, routing artifacts, and ordering power all leave prints that look like “demand” if you only read the sign sequence.

This post uses two quantitative papers by Yuki Sato and Kiyoshi Kanazawa [2, 3] to build a framework for separating these signals. They provide a quantitative test of the Lillo–Mike–Farmer (LMF) model [4]: long memory in market-wide order signs, a heavy-tailed distribution of metaorder lengths, and a sharp exponent relation tying the two.

We do not claim new physics here. Instead, we offer a calibration of the instrument: a framework of strict definitions, a falsifiable quantitative bridge, and a discipline for distinguishing latent demand from the mechanical echoes of the MEV layer.

---

## 01 - The Tape, The Sign, and The Memory

To understand market memory, we must first define our primary instrument: **The Tape**.

In traditional finance, this referred to the paper ticker that printed transactions in real-time. In DeFi, the tape is the chronological, immutable record of every executed transaction within a block. However, raw transaction data is too noisy for analysis. We need to distill it into a signal that represents pressure.

We focus specifically on Aggressive Trades, market orders that cross the spread to consume liquidity, as opposed to passive limit orders that provide it. We encode this stream into a binary "Sign Sequence" denoted as $\varepsilon_t$:

* (+1) if the trade is buyer-initiated (aggressive buy).
* (-1) if the trade is seller-initiated (aggressive sell).

This sequence $\varepsilon_t$ is our atomic unit of analysis.

If markets were memoryless, like a sequence of independent coin flips, knowing the sign of the trade at time $t$ would tell you nothing about the sign at time $t + \tau$. But the data shows otherwise. Sato and Kanazawa analyzed nine years of data from the Tokyo Stock Exchange and found that the "echo" of trade direction persists for hours, days, even weeks [2].

We measure this persistence with the **autocorrelation function**:
$$
C(\tau) = \langle \varepsilon_t , \varepsilon_{t+\tau} \rangle
$$

In a random market, this value would drop to zero immediately. In real markets, it decays slowly, following a power law:
$$
C(\tau) \propto \tau^{-\gamma}, \qquad 0 < \gamma < 1
$$

This "slow decay" is the mathematical definition of **Long Memory** [1]. It means there is no single timescale where the market "forgets." The correlation fades gradually, linking trades across vast spans of time.

Question: Does long memory mean prices are predictable?

Answer: Not automatically. This measures *pressure*, not *returns*. A market can show persistent pressure ($\varepsilon_t$) while keeping returns hard to predict because prices respond to that pressure through impact, inventory risk, and arbitrage.

A curve is not a cause. If the tape remembers, something generates that persistence.

---

## 02 - Why Memory Exists Without Predictability

Persistence is plausible because large participants rarely execute in one shot. If you need to buy a large amount, crossing the spread (or the AMM curve) in one trade is expensive and visible. You split the decision into smaller trades executed over time.

When many participants do this, the market sees runs: buys followed by buys. This happens not because “sentiment is trending,” but because a large decision is being revealed in pieces.

Question: If this pressure is predictable, why can’t everyone front-run it?

Answer: Because the market reacts as the pressure arrives. Liquidity adjusts, prices move, and competition turns predictability into cost. The pressure remains predictable, but the profit is competed away through impact and adverse selection.

This requires a careful phrasing of what “memory” provides: it is a structural clue about the generator of flow, not a trading signal.

---

## 03 - The Splitting Mechanism: Metaorders and Heavy Tails

Imagine walking along a beach. Your footprints create a clear path. Instead of vanishing with the tide, these footprints remain visible for days. Your new steps are subtly influenced by those old prints, creating patterns that span beyond your current position.

A **"Metaorder"** is the hidden decision: “buy $Q$ units.” The market observes the execution: many smaller child orders, often sharing the same sign [1].

Splitting turns one big decision into a run of same-sign prints. The quantitative picture depends on heterogeneity. Metaorders aren’t all similar lengths. Some are short; a few are very long. The standard model assumes a heavy-tailed distribution of metaorder lengths ($L$):
$$
P(L) \propto L^{-(\alpha+1)}, \qquad \alpha > 1
$$

To reproduce long memory in the sign tape, the LMF model predicts that the metaorder-size distribution must have a power-law tail with an exponent tied to the sign-memory exponent:
$$
\alpha = \gamma + 1
$$
[2].

Question: Why is this relation valuable?

Answer: It is falsifiable. You can estimate $\gamma$ from a public sign tape, estimate $\alpha$ from run lengths of splitting-like actors, and check if $\alpha$ is close to $\gamma+1$ [2].

This bridge is the backbone of our framework. DeFi’s job is to break it.

---

## 04 - The Bridge: What You Can Test in DeFi

The bridge has two exponents and a discipline:
1.  Estimate $\gamma$ from an order-sign tape.
2.  Estimate $\alpha$ from a metaorder-length proxy (runs of same-sign activity for splitting-like actors).
3.  Check if $\alpha \approx \gamma+1$ holds in the same regime, on the same tape.

Sato and Kanazawa explicitly defined “metaorder length” as the length of successively equal signs for each splitting trader, applying a gap rule to avoid stitching across long breaks [2].

DeFi translation is possible, but conditional:
* “Trader ID” becomes address (or an address cluster).
* “Market orders” become swaps / aggressive fills.
* “Runs” can be fragmented by routing, batching, and identity splitting.

Question: If an address produces a long run of buys, is that a metaorder?

Answer: Maybe. It might be a genuine execution program. It might be a router. It might be a bot reacting to someone else. A run length is a statistic; “metaorder” is an interpretation.

DeFi needs one extra object that TradFi papers often ignore: a way to separate intent-like flow from reaction-like flow.

Sato and Kanazawa proved this using "Virtual Server IDs" from the Tokyo Stock Exchange to track individual accounts. They found that while Splitting Traders were only about 25% of the users, they accounted for **80% of the market orders** [2].

---

## 05 - The Prefactor $c_0$: A Warning

Once you accept $C(\tau) \approx c_0 \tau^{-\gamma}$, you might ask what the amplitude $c_0$ means.

LMF-style theory ties $c_0$ to microscopic structure. Sato and Kanazawa discuss an estimator that backs out an “effective number of splitting traders” from $c_0$ and $\gamma$ [2].

In DeFi, treat that calculation as a warning sign.

The exponent relation remains robust even when splitting intensities differ across traders, but the prefactor is sensitive to heterogeneity [3]. In practice, the “LMF headcount” behaves more like a lower bound than a census because heterogeneity systematically shifts the prefactor [3].

In DeFi, heterogeneity and identity fragmentation are the default. $c_0$ informs us about concentration, but it does not tell us exactly how many splitters exist.

Sato and Kanazawa derived an estimator for the number of splitting traders ($N_{ST}$) using the prefactor $c_0$. Assuming homogeneous splitting intensity:
$$
N_{ST} \approx \left[ (\gamma + 1) c_0 \right]^{\frac{1}{1-\gamma}}
$$
[2].

We could verify this on-chain. We can count the unique wallet addresses engaging in splitting behavior and check if the physics of memory matches the reality of the chain.

---

## 06 - Latent Demand vs. The Reaction Layer

Markets live in a state of latent supply and demand whose changes are slowly made visible through trades [1].

The first half stays true on-chain. The second half gets contaminated. In DeFi, a user trade reveals intent and triggers reflexes:
* Sandwiching brackets a trade with extra prints.
* Backrunning arbitrage “repairs” prices after a move.
* Liquidations force one-sided pressure that looks like a metaorder.
* Sequencer ordering distorts the time axis without adding obvious new trades.

These mechanisms create persistence in the sign tape without an investor executing a large decision. The DeFi version of the bridge test requires decomposition.

---

## 07 - The MEV Layer: When the Tape Reacts to Itself

Three motifs write structure into the tape in distinct ways.

**Sandwiching.** A victim swap is framed by a pre-trade and a post-trade from the searcher. This creates tight local structure: extra prints with signs mechanically tied to the victim’s sign.

**Backrunning / Arbitrage.** A price move creates a repair trade. This creates short-horizon anti-correlation (buy then sell), but it clusters around the same events that generate large price moves. Mixtures look deceptively clean unless you segment.

**Liquidations.** These generate runs unrelated to splitting. A move triggers liquidations; liquidations push further; more accounts trip. Cascades look like persistent one-sided pressure.

Question: Should liquidation windows be excluded?

Answer: They should be labeled. If your long-memory signal lives mainly inside liquidation regimes, the story is no longer “latent demand leaking out.” It becomes “risk-engine feedback loops create persistence.”

MEV matters even when your fitted $\gamma$ looks stable. A clean power-law fit can come from a mixture of mechanisms.

---

## 08 - Pure Front-Running and Ordering Power

Front-running is often described as “a bot traded before me.” In DeFi, ordering power is deeper. A relayer, builder, sequencer, or venue can extract value by reordering, delaying, selectively including, or internalizing flow.

Question: Why might pure front-running not show up clearly in $\gamma$?

Answer: $\gamma$ measures persistence of the sign sequence, not welfare, execution quality, or who won the race. Ordering power can worsen prices paid without changing long-horizon sign autocorrelation much.

Ordering power distorts inference in three ways:
* It distorts “time” (your event order is the recorded order, which may be adversarial).
* It fragments runs (hurting your $\alpha$ proxy).
* It changes observability (your tape becomes “what printed,” not “what happened”).

Do not pretend you can reconstruct truth. Run sensitivity checks: alternate clocks, within-block ordering proxies, and visibility audits.

---

## 09 - Why This Matters in DeFi

If order flow has long memory, the market isn’t being hit by independent impulses. It is pushed by programs and reflex loops.

For executors, persistence means the environment after you start trading differs from before you start. Whether continuation comes from your remaining child orders or from a reaction layer, visibility has a price.

For LPs, persistent flow amplifies adverse selection. Fees can compensate, but the hurdle rises when continuation is dominated by an extraction layer designed to be repeatable.

This explains why DeFi markets often overshoot and recover slowly. Most impermanent loss calculators assume random, uncorrelated trades. But with long-range correlations from metaorders, losses become path-dependent. A series of small sells from the same whale creates more loss than random trades of equal size.

For protocol design, the goal isn’t “make $\gamma$ small.” The goal is to reduce the part of persistence that comes from synthetic reflex loops. Batching, protected routing, and sequencing rules change where persistence lives: inside genuine execution constraints, or inside extractive reaction loops.

---

## 10 - The Craft of Observation

Science is the terrifying struggle to see what is actually there.

In traditional finance, researchers like Sato and Kanazawa had to be forensic detectives, reconstructing "Virtual Server IDs" to guess who was trading. In DeFi, we drown in data. We have every address, every nonce, and every millisecond timestamp.

This transparency is a trap. If you simply download a CSV of Uniswap trades and run an autocorrelation script, you will find "memory." But you will likely measure the wrong thing.

**Preparation under the Microscope**

Think of a dataset like a biological specimen. Before you can magnify it, you must prepare the slide.
1.  **The Clean Tape:** Order every swap by its precise position in the blockchain: `block_number` $\rightarrow$ `tx_index` $\rightarrow$ `log_index` (essential for multi-swap transactions).
2.  **Convention Consistency:** Maintain a strict base/quote convention (e.g., always ETH/USDC). This seems trivial until you spend hours debugging why your correlation analysis flipped signs mid-dataset.

**The Three Tapes**

Separate the signal from the noise. I recommend creating three distinct views of the same data:
1.  **The Full Tape:** Every trade as it appears on-chain.
2.  **The Reaction Tape:** Transactions confidently identified as MEV-driven (sandwiches, backruns, liquidation cascades).
3.  **The Intent Tape:** Everything that remains.

The difference is often startling. I once analyzed a stablecoin pool during a volatility spike where the Full Tape showed extreme persistence, but the Intent Tape revealed mostly random flow. The appearance of "memory" was almost entirely created by MEV bots reacting to each other. Without separating the tapes, you model a ghost.

---

## 11 - The First Principle

[Richard Feynman famously said](https://www.youtube.com/watch?v=k7_mVS9mKII), *"The first principle is that you must not fool yourself, and you are the easiest person to fool."*

In DeFi analytics, fooling yourself is easy.

The most seductive trap is the **Prefactor Trap**. The math of the Lillo-Mike-Farmer model gives a formula to estimate the number of active whales based on correlation amplitude. It is tempting to plug in data, solve for $N$, and claim you know the number of whales manipulating a pool.

But that prefactor isn't a census counter. It is a barometer measuring concentration. In crypto's fragmented landscape of EOAs, smart contracts, and multi-sig wallets, heterogeneity is the rule. The number you calculate is a sensitivity instrument, not a headcount [3].

We must also respect the **Clock**. In physics, time flows smoothly. In Ethereum, time jumps in 12-second heartbeats (Solana 400 ms, bitcoin 10 minutes). If you measure memory using "Event Time" (trade #1, trade #2, trade #3), you rely on the block builder who decided that order. Always cross-check against "Block Time", the net buying or selling pressure per block. When these two clocks tell dramatically different stories, you are looking at block construction artifacts, not market dynamics.

---

## Conclusion: The Human Behind the Whale

Let me end with something personal.

Early in my career, I watched a senior trader execute what seemed like bizarre behavior. For three days, he placed identical small buy orders at precisely 15-minute intervals. When I asked why, he smiled.

"Young man," he said, "the market has memory. My job isn't to fight that memory, it's to dance with it."

That wisdom stays with me. The Lillo-Mike-Farmer model isn't just about mathematics, it respects the human reality behind markets.

Sato and Kanazawa proved this in Tokyo using "Virtual Server IDs", shadows of shadows. In DeFi, we work with the source code of money. The blockchain offers a "Glass House" where we can verify the physics of liquidity in real-time.

But the persistence we see on the screen, that $\gamma$ exponent decaying slowly over time, is the digital footprint of human constraint. It is a DAO treasurer trying to diversify without crashing the price; it is a founder liquidating equity to buy a house; it is a fund manager entering a position over three sleepless nights.

The market remembers because people must act in time.

As we build the next generation of AMMs, Perps, and lending protocols, we shouldn't try to erase this memory. We should build protocols that understand it. We need liquidity that breathes with the whales and infrastructure that works with human nature, not against it.

The footprints are there. We just finally learned how to read them.

---

**References**

[1] F. Lillo, *[Decoding the Dynamics of Supply and Demand](https://physics.aps.org/articles/v16/192)*, APS Physics 16, 192 (2023).

[2] Y. Sato and K. Kanazawa, *[Inferring Microscopic Financial Information from the Long Memory in Market-Order Flow](https://dx.doi.org/10.1103/PhysRevLett.131.197401)*, Phys. Rev. Lett. 131, 197401 (2023).

[3] Y. Sato and K. Kanazawa, *[Quantitative Statistical Analysis of Order-Splitting Behavior...](https://dx.doi.org/10.1103/PhysRevResearch.5.043131)*, Phys. Rev. Research 5, 043131 (2023).

[4] F. Lillo et al., [Theory for long memory in supply and demand](https://dx.doi.org/10.1103/PhysRevE.71.066122), Phys. Rev. E 71, 066122 (2005).
