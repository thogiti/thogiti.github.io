---
title:  Application-Controlled Sequencing (ACS) as Pigouvian Policy for MEV - Internalizing Externalities at the App Layer
tags: Ethereum Rollups Application-Specific-Sequencing app-sequencing MEV Pigouvian-taxes Pigouvian-policies Application-Controlled-Sequencing shared-sequencing decentralized-sequencing shared-sequencing-marketplaces app-sequencing-mechanism-design app-sequencing-auction
---


# Overview 

[Maximal Extractable Value (MEV)](https://thogiti.github.io/archive.html?tag=MEV) isn’t inherently bad; the way it’s competed for is. When extractors rush, spam, and reorder to capture value, they impose costs on everyone else, worse prices for takers, adverse selection for LPs, congestion and failed transactions for bystanders, and a latency arms race that wastes real resources. A [Pigouvian](https://en.wikipedia.org/wiki/Pigouvian_tax) approach asks the simple question: if an action imposes a cost on others, can we price that cost at the moment and place it occurs? [Application-Controlled Sequencing (ACS)](https://thogiti.github.io/archive.html?tag=Application-Specific-Sequencing) makes that practical. By enforcing ordering constraints and collecting an application-level “MEV tax” at the exact code path where harm occurs, an app can internalize externalities, rebate victims, and still preserve efficient allocation so socially useful arbitrage keeps working.

# Reader roadmap

This article has three layers. First, it explains why MEV creates externalities and why Pigouvian taxes at the application layer are a natural fit. Second, it develops a simple mathematical model showing how an app-level tax can preserve efficient allocation while shifting rents to victims. Third, it outlines a practical ACS implementation, priority windows, atomic tax checks, and a light-touch calibration loop, plus robustness, measurement, and governance so teams can ship this without turning their app into a research project.


# The Problem MEV Actually Creates

MEV is the *difference* between what a block (or app) could earn with omniscient ordering and what it earns under naïve, first-come ordering. In pursuit of this difference, searchers submit duplicative transactions, bid up priority fees in gas auctions, and exploit informational edges. The externality is not their private profit; it is the spillover damage everyone else bears while they compete. Takers get sandwiched and see worse execution than a fair competitive benchmark. LPs face adverse selection and bleed inventory to informed flow. The mempool and sequencing systems swell with failed or redundant attempts, consuming bandwidth, compute, and blockspace. As block times fall, the incentive to spend on speed explodes, creating a latency arms race that delivers little social benefit. Left unpriced, we get too much of this behavior relative to the social optimum.

# Three Concrete Paths where Harm is Local

It helps to see the externality at the level where users actually feel it. On an AMM **Take** path, harmful extraction shows up as slippage for the taker and adverse selection for LPs; a Pigouvian MEV tax collected on this path lets the app rebate those exact losses back to the taker and LP vaults. On a **Liquidation** path, the main externality is the speed race and duplicate submissions that congest the system; pairing a modest tax with tight priority windows cuts spam while keeping solvent liquidations timely. On an **Oracle Update** path, manipulation risk and order-flow instability cluster around the update; capping acceptable priority and charging a slightly convex tax in that window damp predatory racing without censoring legitimate updates. In each case the harm is local, which is why the tax and the rebate should be local too.

# Why Pigouvian Taxes Fit MEV and Why the App Layer (ACS) is the Right Place

Pigouvian logic is disarmingly simple: if an action generates a harm that the actor doesn’t pay for, charge a fee equal to that harm so private incentives line up with social welfare. In MEV, most harms are *local* to a piece of state and a code path, an AMM “Take” path that induces slippage for a taker and adverse selection for LPs; a liquidations path that can be raced in ways that destabilize borrowers; an oracle update path that becomes the focal point of manipulations. Because the externality is local, the **application** has the best information to meter it and the cleanest route to rebate the proceeds to the parties actually harmed. ACS gives applications two practical, composable levers without changing L1/L2 rules: first, **priority windows** that enforce the order in which categories of transactions execute; second, **in-contract tax checks** that require a transfer to the app’s vault before the sensitive instruction runs. Pricing the externality exactly where it occurs and returning it to exactly the people it hurt is textbook Pigouvian design.

If you are interested in learning more about ACS, you can read my good friend, [Fikumni's](https://x.com/fikunmi_ap) recent [article on ACS](https://x.com/fikunmi_ap/status/1957514269496393818).

# A Short History of Pigouvian Taxes

[Arthur C. Pigou](https://oll.libertyfund.org/titles/pigou-the-economics-of-welfare) argued that when private and social costs diverge, a corrective charge equal to the marginal harm, the Pigouvian tax, restores the first best. [Ronald Coase (1960)](https://sites.socsci.uci.edu/~jkbrueck/course%20readings/Econ%20272B%20readings/coase.pdf) later emphasized that if affected parties can bargain at low cost, they can sometimes reach efficient outcomes without taxes by reallocating rights—but in permissionless blockchains, parties are many, anonymous, and globally distributed, so bargaining is expensive and incomplete. [Martin Weitzman (1974)](https://scholar.harvard.edu/files/weitzman/files/prices_vs_quantities.pdf) showed that under uncertainty about costs and benefits, price instruments (taxes) are often more robust than quantity caps. The environmental-economics synthesis by [Baumol & Oates](https://www.cambridge.org/core/books/theory-of-environmental-policy/E8FE3C8AB6D8D6982E5B65CC95FA1478) formalized how externality pricing works and when to choose prices over standards. In the “second-best” world where other distortions exist, [Bovenberg & de Mooij (1994)](https://blog.rchss.sinica.edu.tw/FCLai/wp-content/uploads/2016/11/20060817_Bovenberg-and-Mooij-1994_Environmental-Levies-and-Distortionary-Taxation-Reply_The-American-Economic-Review-844-1085-1089-Lai.pdf) showed that optimal corrective taxes can sit below raw marginal damages unless revenues are recycled wisely, underscoring that *how* you use revenue matters.

# The Math - Pigouvian Taxes

Let's start with a single extractive opportunity worth $k$ to whoever wins sequencing. To move first, a searcher pays a **priority price** $x$ to the platform and an **app-side MEV tax** to the dApp. If the app uses a simple, linear rule $T(x)=\tau x$ (think “the app charges $\tau$ times whatever you pay in priority”), the searcher chooses $x$ until total cost equals value:

$$
x+\tau x=k \quad\Rightarrow\quad x=\frac{k}{1+\tau}.
$$

In plain English: the platform keeps the fraction $1/(1+\tau)$ of the pie; the app captures the fraction $\tau/(1+\tau)$. Increase $\tau$, and more of the rent flows to the app’s vault. With *many* searchers, competition is a first-price auction in which each bidder’s cost of bidding has been uniformly scaled up by $1+\tau$. The standard equilibrium result still holds: bids are scaled down by $1/(1+\tau)$, but they remain strictly increasing in private value. The highest-value bidder still wins, so **efficient allocation is preserved**—good, price-correcting arbitrage is not blocked.

The next question is how big $\tau$ should be. Let $\lambda$ denote the **harm share** on this path: the fraction of the opportunity that shows up as measurable harm to takers (slippage), LPs (adverse selection), and bystanders (failed-tx burn). The Pigouvian target among linear rules is

$$
\tau^\*=\frac{\lambda}{1-\lambda},
$$

because then the app’s share $\tau/(1+\tau)$ equals $\lambda$. If large opportunities cause disproportionately more damage, the app can adopt a **convex** schedule like $T(x)=\tau x^\alpha$ with $\alpha>1$, which makes very large, very harmful grabs pay more than proportionally while leaving small, benign corrections lightly taxed.

## Designing Non-Linear Schedules when Harm is Convex

Linear taxes are a great default, but many apps face convex harm: the largest extracts impose more than proportional damage. A practical design is a two-slope schedule: charge $T(x)=\tau_{\text{low}}x$ below a threshold $x^\star$ and $T(x)=\tau_{\text{high}}x$ above it, with $\tau_{\text{high}}>\tau_{\text{low}}$. This approximates a convex tax while keeping verification trivial. Choose $x^\star$ around the 80–90th percentile of observed priority payments on that path, and set $\tau_{\text{high}}$ so the app’s marginal share above $x^\star$ matches the higher measured harm in the tail.

## Calibration cookbook (how to estimate $\lambda$ and set $\tau$)

To calibrate $\tau$, estimate the path’s harm share $\lambda$. Start with labeled events (sandwiches, backruns, JIT liquidity, failed duplicates) and compute, over a rolling window, (i) taker slippage versus competitive quotes, (ii) LP adverse selection (inventory-weighted P&L relative to mid), and (iii) externalities from failed or duplicate transactions. Divide this sum by gross realized MEV on the path to obtain $\widehat{\lambda}$. Set the initial tax $\tau_0=\widehat{\lambda}/(1-\widehat{\lambda})$ and then update slowly (for example, weekly) with caps and smoothing. Even a coarse first estimate materially reduces harm because the rebate reaches the right parties. If measurement is noisy, treat $\widehat{\lambda}$ as a lower bound at first; under-charging is safer than over-charging, and you can ratchet up as the attribution pipeline improves.


# What ACS Actually does in this Mechanism

ACS lets the app implement two things the protocol itself doesn’t need to know about. First, it enforces **priority windows** for each code path, “Cancels before Takes” is imposed by giving the Cancel path a higher acceptable priority range and capping the Take path’s range so Takes simply cannot leapfrog Cancels. Second, it enforces **atomic payment checks**: the contract verifies, right next to the sensitive instruction, that a transfer equal to $T(p)$ has occurred to the app’s vault (or the path’s local vault). If the payment is missing or wrong, the call reverts. Because these checks live in the application code, they work today, preserve composability, and can be tuned per path and per state scope (e.g., per pool, oracle, or vault).

## Spillovers and Cross-app Coordination

Taxes change tactics as well as totals. When one app increases its tax, a small share of attempts often migrates to neighboring venues. Think of this as a displacement matrix: a fraction of activity shifts rather than disappears. If two AMMs share flow, both can improve welfare by coordinating on modest, path-local taxes and rebating to their own LPs and takers. The right target for each is its local harm share plus a small adjustment for imported harm from neighbors. In practice, coordination can be as simple as both apps publishing their current $\lambda$ and $\tau$, and updating on a predictable schedule.

# The Important Properties of Pigouvian Mechanism

The central property is **allocation invariance**. A linear MEV tax scales everyone’s bidding costs by the same factor, so the ordering of bids does not change; the most productive extractor still wins. That is crucial: we want less *harmful* MEV, not less *useful* arbitrage. A close cousin is **revenue decomposition**. Under a linear tax, expected revenue is split in a fixed ratio between platform and app, $\tau:1$, and the *total* revenue extracted from the winner is the same as in the no-tax world. The tax therefore acts like a **routing rule** for where MEV rent goes, not a blunt instrument that destroys it.

A third property is **Pigouvian optimality** in the linear case. When measured harm on a path is a constant fraction $\lambda$ of realized opportunity, setting $\tau=\lambda/(1-\lambda)$ hits the first-best target in the simple benchmark and is second-best-optimal among linear rules in competitive settings. If the measured harm is convex in size, a **non-linear** schedule achieves the same idea by making the marginal tax grow with the marginal harm. The mechanism is also **order-respecting**: any monotone sequencing policy you can express as cut-points in priority space is implementable with ACS windows, and taxes simply rescale incentives while leaving feasibility intact.

A practical strength is **path-local budget balance**. Because the app collects the tax at the exact code path that generated the harm, it can return the proceeds to the exact parties harmed, LPs on AMM paths, takers on swap paths, borrowers on liquidation paths, and so on. Under local fee markets, the approach is **inclusion-safe**; raising $\tau$ on your own paths does not starve your users of block access, because inclusion is decided locally so long as base resource fees are paid.

## Threat Model and Robustness

Because tax verification is atomic and adjacent to the sensitive instruction, off-chain rebate or split-payment tricks do not bypass the charge; the call reverts if the tax transfer is missing or mismatched. First-price collusion is brittle—any cartel member can profit by deviating, so systematic bid-shading is unlikely to persist. To guard against griefing (spam that pays the tax but intends no execution), keep priority windows narrow around sensitive moments and levy a small, non-refundable base charge on paths vulnerable to spam. Finally, surface the tax transparently in UX (“this swap includes a protective MEV fee rebated to LPs/takers”) so users understand that the fee funds their own protection rather than protocol rent-seeking.

# An Example 

Imagine a sandwich opportunity worth $k=100$ units. Your attribution pipeline estimates that ninety percent of that value shows up as harm to the victim taker, so $\lambda=0.9$. The Pigouvian linear choice is then $\tau=\lambda/(1-\lambda)=9$. In equilibrium, the platform receives $x=k/(1+\tau)=10$, and the app receives $\tau x=90$. If you return that ninety to the harmed taker, you have neutralized the harm while still allowing the highest-value extractor to compete and win when it is socially productive to do so. If you worry that very large opportunities produce more than linear harm, make the schedule slightly convex so the largest grabs pay more than proportionally.

## How to Measure Success

Evaluate this policy with before/after and, where possible, A/B experiments at the path level. Primary outcomes include taker execution versus competitive quotes, LP effective spread and inventory P&L, duplicate/failed transaction rates, and the share of realized MEV that is rebated to victims. Secondary outcomes include inclusion latency and fill rates for ordinary users. The observed app\:platform revenue split should track approximately $\tau:1$, and $\tau/(1+\tau)$ should converge toward the measured $\widehat{\lambda}$. Publishing these dashboards builds confidence that the policy protects users rather than taxing them.

# How to Implement this without Turning your App into a Research Project

Start by defining path-specific **priority windows** that encode the order you want, cancellations before takes, liquidations ahead of ordinary trading, oracle updates fenced off from being front-run by their own dependents. Add a **linear MEV tax** $T_j(p)=\tau_j p$ for each path and wire an **atomic payment check** directly before the sensitive instruction. Route the proceeds to **path-local vaults** so compensation reaches LPs, takers, or intent pools automatically. Build a simple **estimator loop** that measures the harm share $\widehat{\lambda}_j$ for each path over a rolling window, using labeled sandwiches, measured taker slippage relative to competitive quotes, LP P\&L decomposition for adverse selection, and failed-transaction externalities, and update $\tau_j$ slowly toward $\widehat{\lambda}_j/(1-\widehat{\lambda}_j)$ with caps and smoothing. If your chain supports it, complement this with a **time-advantage sale** for micro-epochs to kill spammy speed races. Each step is incremental and composable; none requires protocol changes.

## Governance and Revenue Use

Pigouvian logic is incomplete without a clear, credible plan for revenue use. Commit in code to path-local rebates: AMM-Take taxes stream to LP vaults pro-rata and to taker-rebate pools; liquidation-path taxes support borrower insurance or backstops; oracle-path taxes fund buffers and circuit breakers. If a share must fund maintenance, cap it explicitly and subject it to transparent governance with a clear SLA. When users can see that taxes finance their own protection, political friction drops dramatically.

# UX Primer 

Think of the priority fee as a “speed price.” The app adds a small, transparent fee that is routed to the people likely to be harmed if the transaction is extractive. This doesn’t stop the best deals from happening; it just makes harmful races pay their way. Over time, the tax level adjusts to match measured harm, and users see refunds or better LP yields because the fee flows back to them.

# Limitations and Open Questions

Three limits matter. First, measuring harm in real time is noisy; the estimator should be conservative and slow-moving to avoid whipsawing incentives. Second, some “good MEV” (true cross-venue arbitrage) can be incidentally taxed when it shares a path with harmful strategies; separating code paths and using lower taxes on benign paths mitigates this. Third, global congestion externalities live at L1/L2; app-level ACS complements, but does not replace, protocol-level instruments such as mild outlier fees or time-advantage auctions. Each is aimed at a different layer of the same problem.

# Further Reading

For first-best Pigouvian logic, see Pigou’s *The Economics of Welfare* and the modern synthesis by Baumol & Oates. For instrument choice under uncertainty, Weitzman’s “Prices vs. Quantities” remains the touchstone. For second-best results and revenue recycling, Bovenberg & de Mooij explain why optimal corrective taxes can sit below raw marginal damages in the presence of distortionary taxation. 


# Closing Thought

The point of a Pigouvian MEV policy is not to declare war on extractors; it is to make extractors face the costs they impose on others, *at the place those costs occur*, and to recycle the proceeds to the victims. ACS lets applications do that today with familiar on-chain tools: priority windows for ordering and atomic tax checks for payment. The math ensures you keep the good, efficient, price-correcting arbitrage, while you price the bad, harmful extraction and wasteful races, down to sensible levels. Framed this way, the policy is less “another fee” and more the last mile of market design: finishing an incomplete market so your users and LPs are protected, your mechanism is cleaner, and your app’s state captures the value that its existence creates.

