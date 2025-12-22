---
title: The Mechanics of 24/7 Equity Perps - Part 1
date: 2025-12-21
tags: equity-perps perpetuals Hyperliquid HIP-3 lighter Hyperliquid-HIP-3 Ostium GMX-Oracle-Pricing equity-perpetuals 
---

If you want to understand a machine, don’t start with the pitch deck.

Put it on a lift. Trace the pipes. Find the parts that glow when you push them too hard. 

“Equity perpetuals” keep resurfacing in crypto as live markets: TSLA, NVDA, sometimes broad indices. The promise is simple to say out loud: trade equity price exposure like BTC-24/7, with leverage, with no expiration. 

Let’s take that literally.

If we try to run “TSLA/NVDA price exposure” as a 24/7 perpetual swap, what breaks first[^1]? 

---

## 1. The frictions people are trying to remove and why they exist

In traditional markets, leveraged equity exposure usually means options. Options work, but they come with a clock. Hold the contract and time passes; the instrument decays toward expiry. That isn’t a moral failure of options. It’s the product.

You can see the demand for “exposure right now” in how much activity has compressed into the shortest expiries. Cboe’s own reporting shows 0DTE (zero days to expiry, i.e., same-day expiry) as a very large share of S&P 500 index options volume in recent periods[^2].

The second friction is simpler: the cash equity market closes. News doesn’t. 

Information arrives continuously, while the “official” price discovery for a stock is gated by trading hours. A lot of empirical work on U.S. equities finds that a large share of long-run returns shows up outside regular hours (close-to-open), not during the open session.

So the pitch writes itself: remove the decay instrument; remove the locked door.

Now treat that as an engineering statement. Those frictions also acted like shock absorbers. If you delete them, what did they absorb?

---

## 2. What an equity perp is, mechanically

An equity perp is a collateralized contract whose payoff is meant to track a stock’s price movement without owning the stock. There is no delivery. The anchoring happens by cash flows.

To run one, the venue needs three prices that people often blur together: 

* **Perp traded price** $P_t$: This is just the price inside the perp market, what traders agree on via a limit order book or other execution mechanism.
* **Reference / index price** $O_t$: This claims to represent “TSLA’s price” (or a proxy of it). In crypto perps, this usually comes from liquid spot markets. For equities, it comes from feeds stitched across sessions, venues, and proxies.
* **Mark price** $M_t$: This is the risk engine’s price. It’s the number used for P&L, margin checks, and liquidations.

If you only remember one thing: liquidation runs on $M_t$, not on your entry price and not necessarily on the last trade.

Now add the last component: **funding rate**, $f_t$. It charges the side pushing the perp away from the reference (by convention $f_t>0$ means longs pay shorts, $f_t<0$ means shorts pay longs).

A periodic transfer between longs and shorts designed to keep $P_t$ from drifting too far from $O_t$. In its simplest form, when the perp trades rich to the index, longs pay shorts; when it trades cheap, shorts pay longs. You can treat funding as a feedback controller that tries to keep $P_t \approx O_t$.

So the perp is a feedback loop:

1. Traders set $P_t$ by trading.
2. The system publishes $O_t$ from a reference feed.
3. The risk engine computes $M_t$ (often a filtered blend of $P_t$ and $O_t$).
4. Funding rate $f_t$ pushes incentives so $P_t$ doesn’t wander indefinitely.
5. Margin is checked against $M_t$; liquidations fire when collateral can’t cover loss.

That loop is the whole game. Every failure mode below is a place where the loop gets inconsistent.

A common skeleton looks like this:

$$
\text{PnL}_t \approx q \cdot (M_t - M_0)
$$

$$
\text{Funding payment over } \Delta t \approx q \cdot M_t \cdot f_t \cdot \Delta t
$$

* $q$ is your position size (think “share-equivalents,” positive for long, negative for short)
* $M_t$ is the mark price now
* $M_0$ is the mark price when you entered

Liquidation happens when your collateral can’t absorb losses past the venue’s maintenance margin rule:

$$
C + \text{PnL} < \text{maintenance margin}
$$


**Intuition (non-mathy version):**

* PnL says: if the perp moves in your favor, you earn.
* Funding says: if the perp is above the oracle, longs pay shorts; if below, shorts pay longs. It’s a *rubber band* between $P_t$ and $O_t$. But rubber bands snap when the anchor point disappears.


> There are some special edge cases of liquidations that trigger ADL (autodeleveraging) where the loss is so large that neither the insurance fund nor the collateral is enough to take the bad debt off the system. We discussed them in detail [here](https://thogiti.github.io/2025/12/11/Autodeleveraging-Hyperliquid-653M-debate.html) and [here](https://thogiti.github.io/2025/12/14/ADL-Trilemma-Dan-Critique-Tarun-paper-fixes.html).

---

## 3. The stress test - three hammers

You can design a bridge that looks beautiful on paper. I want to know what happens when the wind blows or an earthquake hits. 

### Failure Mode A - the weekend gap

Equities don’t trade continuously on primary venues. That creates a hard question for a 24/7 derivative:

What is $O_t$ when the primary stock market is closed?

On Saturday, “TSLA’s price” isn’t a single observable number. You might have thin after-hours prints, ADRs, correlated instruments, or simply nothing. Some venues choose to halt; others choose a synthetic rule.

Now run a clean thought experiment:

* Friday close: TSLA prints 250.
* Sunday: real-world news drops that would plausibly reprice TSLA to 220 at Monday open.

In the cash market, that shows up as a gap. Price jumps because there was no continuous auction to walk it there.

Your perp has to pick what $O_t$ and $M_t$ are during the closed interval. None of the choices are free.

* If you mark to a weekend internal market that drifts slowly, you can create phantom solvency: the system behaves as if the world stayed near 250.
* If you mark to a “best guess” of Monday’s open, you can liquidate people before the underlying market prints a single trade.

Then Monday arrives, the feed snaps, and whatever you were pretending becomes real. The interesting question isn’t “do traders make or lose money.” It’s “what happens to the system when the snap is larger than its buffers.”

Where does the discontinuity get paid: insurance fund, autodeleverage, socialized loss, or a freeze?


### Failure Mode B - The oracle becomes the weapon

On paper, an oracle is a sensor. In stressed conditions, it can become an attack surface.

The equity version of this is subtle because the reference is often stitched from weak signals during off hours. If the venue is large relative to the source the oracle watches, then moving the oracle input can move the mark.

Imagine someone very long the perp. If they can move the proxy market the oracle uses with relatively little capital, they can move $O_t$, which moves $M_t$, which triggers liquidations elsewhere.

It’s not “spoofing”; it’s a feedback loop that emerges when the perp market is large relative to the oracle’s off-hours signal. It’s a structural question:

* what exactly feeds $O_t$ on nights/weekends,
* how deep is it,
* what filters prevent a small print from rewriting the world,
* and how much capital would it take to push $M_t$ far enough to matter.

### Failure Mode C - the liquidity dries up, and the risk engine has to choose a lie

Every perp system needs market makers. They quote two-way prices and hedge exposure.

For crypto perps, hedging is always on: spot and perps run 24/7, collateral moves quickly, and cross-margin is common. For the TSLA/NVDA example, the hedge leg lives on TradFi rails that sleep. On weekends, hedging gets stuck.

So makers widen spreads or step away.

That sounds like a “bad UX” problem until you connect it back to the loop:

* when liquidity thins, $P_t$ becomes jumpy;
* if $M_t$ follows $P_t$ too closely, you get liquidation cascades;
* if $M_t$ ignores $P_t$, you get phantom solvency.

Either way, the system must pick a rule under uncertainty. That rule is part of the product.

---

## 4. Regulatory boundary conditions

Even if we avoid the whole “tokenized stock” framing and say “it’s just a derivative on a number,” regulators don’t see it that way.

If you offer price exposure to TSLA with leverage and liquidation mechanics, you’re not in “pure crypto perp land.” You’re in “equity derivative land.”

In the U.S., that drags you into SEC/CFTC territory, and you can’t pretend you’re just offering “crypto perps with a funny symbol.”

A few concrete constraints that show up fast:

- **Classification:** a TSLA-linked perp is very likely to be treated as a *single-name equity derivative* (think *security futures* / *security-based swap* style rules), which pulls you toward SEC/CFTC-style registration, surveillance, reporting, and market-access requirements.
- **Market structure:** even if the core matching engine is onchain, the surrounding pieces (front-end, custody, margin, onboarding, disclosures, broker-like functions) are where enforcement usually attaches.
- **Cross-border posture:** “we geofenced the U.S.” isn’t a magic incantation. The question becomes: who are you soliciting, where, and how; what’s the venue’s control over access; and whether your distribution looks like an offshore offer (Reg S-style) versus a U.S. offer[^9].

This isn’t a “crypto vs TradFi” debate. It’s a constraint landscape.

So in practice, most architectures either:

- operate offshore and geo-fence hard  
- or structure the product as “synthetic exposure” inside a limited jurisdiction  
- or move toward a licensed wrapper (broker-dealer style)  
- or avoid the hardest jurisdictions entirely

This is part of the reason the “equity perp dream” keeps resurfacing but rarely stabilizes.

This is why equity perp liquidity tends to form where the integrated stack can exist without the same constraints, and why many designs target non-U.S. flow first, then spread through interfaces.

For our purposes, the key point is mechanical: regulation pushes you into specific architectures, and architectures push you into specific failure modes. You can’t judge the safety of a TSLA perp without knowing which rail it lives on.


---
## 5. A quick map of architectures

At this point, “equity perp” stops being one thing. You can build the loop above in different ways, and the failure modes land differently.

* **CLOB perp venues** (order book + funding + liquidations): Example: Hyperliquid’s[^3] ecosystem of order-book perps, including HIP-3 deployers[^4] like Trade.xyz[^5], Felix[^6].
Here $P_t$ is the book, $O_t$ is an oracle reference, and $M_t$ is a defined function of internal and external signals. The stress tests in Section 3 map cleanly onto the variables: you can ask exactly how weekend rules affect $O_t$, how thin liquidity affects $P_t$, and what the mark function does to liquidations. The friction is moved to oracle integrity, liquidation liveness, market-maker incentives, and backstop design.


* **Onchain CLOBs with verifiable matching/risk**: Example: Lighter[^7] (an onchain order-book approach that leans heavily on cryptography to keep verification practical without making trading unusable).
The equity problem doesn’t disappear. It becomes more explicit: the hard part isn’t “can we run a book,” it’s how to define $O_t$ and $M_t$ for assets whose primary market sleeps, without turning mark moves into liquidation pinballs. The friction is moved to performance constraints, latency, and capital efficiency under verification.

* **Oracle-first / pool-counterparty perps**: Example: Ostium’s[^8] style of trading where execution leans heavily on oracle prices and the pool/vault is the counterparty.
Here you can get clean fills near the reference during open hours, but the stress concentrates in the balance sheet: weekend halts, hedge latency, and how the pool absorbs informed flow. The friction is moved to oracle manipulation, oracle downtime, and governance of parameters.

These categories aren’t a ranking. They’re a map. Each one shifts where the risk sits. You can already see the research program: hold the same TSLA weekend gap constant, then change only the architecture and the mark rule. Watch how often you blow through the insurance buffer.

---

## 6. What comes next - Part 2

This part 1 was about naming the moving parts and the hammers.

Part 2 is the experiment:

* Simulate a weekend interval where the reference price is proxy-based or stale.
* Let the perp trade evolve with thin liquidity.
* Apply a Monday open jump distribution (starting with TSLA/NVDA).
* Run the liquidation engine under different mark-price rules and insurance sizes. 

If the machine is robust, it should survive that test without hidden socialization that only shows up when the system is stressed.

If it isn’t, the failure will have a signature you can name and measure: a specific interaction between off-hours reference quality, mark construction, liquidity depth, and leverage constraints.

That’s the part worth measuring.

---

## References

[^1]: [TSLA Perps](https://app.hyperliquid.xyz/trade/flx:TSLA)

[^2]: [Cboe reporting on 0DTE share of S&P 500 index options volume](https://www.cboe.com/insights/posts/spx-0-dte-options-jump-to-record-62-share-in-august)

[^3]: [Hyperliquid docs](https://hyperliquid.gitbook.io/hyperliquid-docs/)

[^4]: [Hyperliquid HIP-3 deployers](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals)

[^5]: [Trade.xyz ](https://trade.xyz/) 

[^6]: [Felix ](https://usefelix.gitbook.io/perps)

[^7]: [Lighter ](https://docs.lighter.xyz/)

[^8]: [Ostium ](https://ostium-labs.gitbook.io/ostium-docs)

[^9]: [SEC Regulation S](https://databento.com/compliance/regulation-s)