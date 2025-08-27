---
title:  Application-Controlled Sequencing (ACS) as Pigouvian Policy for MEV - Internalizing Externalities at the App Layer
tags: Ethereum Rollups Application-Specific-Sequencing app-sequencing MEV Pigouvian-taxes Pigouvian-policies Application-Controlled-Sequencing shared-sequencing decentralized-sequencing shared-sequencing-marketplaces app-sequencing-mechanism-design app-sequencing-auction
---


# Overview 

[Maximal Extractable Value (MEV)](https://thogiti.github.io/archive.html?tag=MEV) isn’t inherently bad; the way it’s competed for is. When extractors rush, spam, and reorder to capture value, they impose costs on everyone else, worse prices for takers, adverse selection for LPs, congestion and failed transactions for bystanders, and a latency arms race that wastes real resources. A [Pigouvian](https://en.wikipedia.org/wiki/Pigouvian_tax) approach asks the simple question: if an action imposes a cost on others, can we price that cost at the moment and place it occurs? [Application-Controlled Sequencing (ACS)](https://thogiti.github.io/archive.html?tag=Application-Specific-Sequencing) makes that practical. By enforcing ordering constraints and collecting an application-level “MEV tax” at the exact code path where harm occurs, an app can internalize externalities, rebate victims, and still preserve efficient allocation so socially useful arbitrage keeps working.

# The Problem MEV Actually Creates

MEV is the *difference* between what a block (or app) could earn with omniscient ordering and what it earns under naïve, first-come ordering. In pursuit of this difference, searchers submit duplicative transactions, bid up priority fees in gas auctions, and exploit informational edges. The externality is not their private profit; it is the spillover damage everyone else bears while they compete. Takers get sandwiched and see worse execution than a fair competitive benchmark. LPs face adverse selection and bleed inventory to informed flow. The mempool and sequencing systems swell with failed or redundant attempts, consuming bandwidth, compute, and blockspace. As block times fall, the incentive to spend on speed explodes, creating a latency arms race that delivers little social benefit. Left unpriced, we get too much of this behavior relative to the social optimum.

# Why Pigouvian Taxes Fit MEV and Why the App Layer (ACS) is the Right Place

Pigouvian logic is disarmingly simple: if an action generates a harm that the actor doesn’t pay for, charge a fee equal to that harm so private incentives line up with social welfare. In MEV, most harms are *local* to a piece of state and a code path, an AMM “Take” path that induces slippage for a taker and adverse selection for LPs; a liquidations path that can be raced in ways that destabilize borrowers; an oracle update path that becomes the focal point of manipulations. Because the externality is local, the **application** has the best information to meter it and the cleanest route to rebate the proceeds to the parties actually harmed. ACS gives applications two practical, composable levers without changing L1/L2 rules: first, **priority windows** that enforce the order in which categories of transactions execute; second, **in-contract tax checks** that require a transfer to the app’s vault before the sensitive instruction runs. Pricing the externality exactly where it occurs and returning it to exactly the people it hurt is textbook Pigouvian design.

If you are interested in learning more about ACS, you can read my good friend, [Fikumni's](https://x.com/fikunmi_ap) recent [article on ACS](https://x.com/fikunmi_ap/status/1957514269496393818).

# A Short History of Pigouvian Taxes

[Arthur C. Pigou’s original]( https://oll.libertyfund.org/titles/pigou-the-economics-of-welfare) insight (1920s) was that markets overproduce activities whose private benefit exceeds their social benefit because decision-makers ignore costs borne by others; a corrective charge equal to the marginal harm, the **Pigouvian tax**, restores the first best. [Ronald Coase (1960)](https://sites.socsci.uci.edu/~jkbrueck/course%20readings/Econ%20272B%20readings/coase.pdf) later emphasized that if affected parties can bargain at low cost, they can sometimes reach efficient outcomes without taxes by reallocating rights—what became known as the **Coase theorem**—but he also stressed that real-world transaction costs often make such bargaining impractical. Modern policy design borrows a key result from [Martin Weitzman (1974)](https://scholar.harvard.edu/files/weitzman/files/prices_vs_quantities.pdf): under uncertainty about costs and benefits, **prices vs. quantities** (taxes vs. caps) differ in expected welfare; when marginal benefits (or damages) are relatively flatter than marginal costs, price instruments (taxes) tend to be more robust. [Environmental-economics textbooks (Baumol & Oates)](https://www.cambridge.org/core/books/theory-of-environmental-policy/E8FE3C8AB6D8D6982E5B65CC95FA1478) formalized how externality pricing works and when standards (caps) or prices (taxes) are appropriate, laying the microfoundations used today. Finally, [the public-finance work by Bovenberg & de Mooij, (1994)](https://blog.rchss.sinica.edu.tw/FCLai/wp-content/uploads/2016/11/20060817_Bovenberg-and-Mooij-1994_Environmental-Levies-and-Distortionary-Taxation-Reply_The-American-Economic-Review-844-1085-1089-Lai.pdf) showed that when other distortionary taxes already exist, the optimal environmental/Pigouvian tax can be **below** the raw marginal damage unless revenues are recycled wisely, underscoring that **how** you use the revenue (rebates/dividends, offsetting other taxes) is as important as the tax level itself.



# The math - Pigouvian Taxes

Let's start with a single extractive opportunity worth $k$ to whoever wins sequencing. To move first, a searcher pays a **priority price** $x$ to the platform and an **app-side MEV tax** to the dApp. If the app uses a simple, linear rule $T(x)=\tau x$ (think “the app charges $\tau$ times whatever you pay in priority”), the searcher chooses $x$ until total cost equals value:

$$
x + \tau x = k \quad\Rightarrow\quad x^*=\frac{k}{1+\tau}.
$$

In plain English: the platform keeps the fraction $1/(1+\tau)$ of the pie; the app captures the fraction $\tau/(1+\tau)$. Increase $\tau$, and more of the rent flows to the app’s vault. With *many* searchers, competition is a first-price auction in which each bidder’s cost of bidding has been uniformly scaled up by $1+\tau$. The standard equilibrium result still holds: bids are scaled down by $1/(1+\tau)$, but they remain strictly increasing in private value. The highest-value bidder still wins, so **efficient allocation is preserved**, good, price-correcting arbitrage is not blocked.

The next question is how big $\tau$ should be. Let $\lambda$ denote the **harm share** on this path: the fraction of the opportunity that shows up as measurable harm to takers (slippage), LPs (adverse selection), and bystanders (failed-tx burn). The Pigouvian target among linear rules is

$$
\tau^*=\frac{\lambda}{1-\lambda},
$$

because then the app’s share $\tau/(1+\tau)$ equals $\lambda$. If large opportunities cause disproportionately more damage, the app can adopt a **convex** schedule like $T(x)=\tau x^\alpha$ with $\alpha>1$, which makes very large, very harmful grabs pay more than proportionally while leaving small, benign corrections lightly taxed.

# What ACS Actually does in this Mechanism

ACS lets the app implement two things the protocol itself doesn’t need to know about. First, it enforces **priority windows** for each code path, “Cancels before Takes” is imposed by giving the Cancel path a higher acceptable priority range and capping the Take path’s range so Takes simply cannot leapfrog Cancels. Second, it enforces **atomic payment checks**: the contract verifies, right next to the sensitive instruction, that a transfer equal to $T(p)$ has occurred to the app’s vault (or the path’s local vault). If the payment is missing or wrong, the call reverts. Because these checks live in the application code, they work today, preserve composability, and can be tuned per path and per state scope (e.g., per pool, oracle, or vault).

# The Important Properties of Pigouvian Mechanism

The central property is **allocation invariance**. A linear MEV tax scales everyone’s bidding costs by the same factor, so the ordering of bids does not change; the most productive extractor still wins. That is crucial: we want less *harmful* MEV, not less *useful* arbitrage. A close cousin is **revenue decomposition**. Under a linear tax, expected revenue is split in a fixed ratio between platform and app, $\tau:1$, and the *total* revenue extracted from the winner is the same as in the no-tax world. The tax therefore acts like a **routing rule** for where MEV rent goes, not a blunt instrument that destroys it.

A third property is **Pigouvian optimality** in the linear case. When measured harm on a path is a constant fraction $\lambda$ of realized opportunity, setting $\tau=\lambda/(1-\lambda)$ hits the first-best target in the simple benchmark and is second-best-optimal among linear rules in competitive settings. If the measured harm is convex in size, a **non-linear** schedule achieves the same idea by making the marginal tax grow with the marginal harm. The mechanism is also **order-respecting**: any monotone sequencing policy you can express as cut-points in priority space is implementable with ACS windows, and taxes simply rescale incentives while leaving feasibility intact.

A practical strength is **path-local budget balance**. Because the app collects the tax at the exact code path that generated the harm, it can return the proceeds to the exact parties harmed, LPs on AMM paths, takers on swap paths, borrowers on liquidation paths, and so on. This is Pigou done right: the payer compensates the victim. Under local fee markets, the approach is **inclusion-safe**; raising $\tau$ on your own paths does not starve your users of block access, because inclusion is decided locally so long as base resource fees are paid. Finally, the design is **robust** in the ways that matter on chain. Atomic verification next to the operation prevents off-chain split-payment tricks, and collusive bid-shading among searchers is unstable in first-price auctions because any member can profit by deviating.

One externality deserves a bit more attention here: **latency races**. When searchers spend on speed to beat each other by milliseconds, they impose a congestion and spam cost on everybody else. Two Pigouvian complements exist. The app (or the protocol) can sell a deterministic head-start in micro-epochs, with a reserve price set to the measured marginal spam cost, or it can levy a fee on a robust proxy for latency spend. Both instruments align private marginal benefits of speed with social marginal costs, collapsing wasteful arms races while preserving price discovery.

# An Example 

Imagine a sandwich opportunity worth $k=100$ units. Your attribution pipeline estimates that ninety percent of that value shows up as harm to the victim taker, so $\lambda=0.9$. The Pigouvian linear choice is then $\tau=\lambda/(1-\lambda)=9$. In equilibrium, the platform receives $x=k/(1+\tau)=10$, and the app receives $\tau x=90$. If you return that ninety to the harmed taker, you have neutralized the harm while still allowing the highest-value extractor to compete and win when it is socially productive to do so. If you worry that very large opportunities produce more than linear harm, make the schedule slightly convex so the largest grabs pay more than proportionally.

# How to Implement this without Turning your App into a Research Project

Start by defining path-specific **priority windows** that encode the order you want, cancellations before takes, liquidations ahead of ordinary trading, oracle updates fenced off from being front-run by their own dependents. Add a **linear MEV tax** $T_j(p)=\tau_j p$ for each path and wire an **atomic payment check** directly before the sensitive instruction. Route the proceeds to **path-local vaults** so compensation reaches LPs, takers, or intent pools automatically. Build a simple **estimator loop** that measures the harm share $\widehat{\lambda}_j$ for each path over a rolling window, using labeled sandwiches, measured taker slippage relative to competitive quotes, LP P\&L decomposition for adverse selection, and failed-transaction externalities, and update $\tau_j$ slowly toward $\widehat{\lambda}_j/(1-\widehat{\lambda}_j)$ with caps and smoothing. If your chain supports it, complement this with a **time-advantage sale** for micro-epochs to kill spammy speed races. Each step is incremental and composable; none requires protocol changes.

# Closing Thought

The point of a Pigouvian MEV policy is not to declare war on extractors; it is to make extractors face the costs they impose on others, *at the place those costs occur*, and to recycle the proceeds to the victims. ACS lets applications do that today with familiar on-chain tools: priority windows for ordering and atomic tax checks for payment. The math ensures you keep the good, efficient, price-correcting arbitrage, while you price the bad, harmful extraction and wasteful races, down to sensible levels. If you communicate it to readers this way, the policy becomes less about “adding another fee” and more about finishing an incomplete market so your users and LPs are protected, your mechanism is cleaner, and your app’s state captures the value that its existence creates.
