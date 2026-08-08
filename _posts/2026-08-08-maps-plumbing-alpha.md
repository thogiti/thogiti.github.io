---
title: Maps, Plumbing, and Alpha
subtitle: When AI Makes Strategies Cheap, What Becomes Scarce?
date: 2026-08-08
author: Nagu Thogiti
tags: Quantitative-Trading, AI-in-Finance, Market-Microstructure, Trading-Infrastructure, Backtest-Overfitting, Representation-Arbitrage
---

### When AI Makes Strategies Cheap, What Becomes Scarce?

Imagine two trading teams watching the same liquidation cascade. A large position is liquidated on Venue A, its price drops sharply, and a few hundred milliseconds later Venue B follows. Both teams see the same sequence and form an obvious hypothesis: A may be incorporating information faster, leaving a brief window in which B can be predicted.

The first team begins with the work that precedes almost every serious cross-venue experiment. It builds exchange connectors, cleans the feeds, reconciles clocks, reconstructs order books, handles sequence gaps, models fees, and writes enough order-management logic to reproduce what the strategy could actually have traded. Several weeks pass before the researchers trust their replay well enough to test the original idea.

The second team already has that substrate. It can retrieve the raw venue events, reproduce exchange semantics, run a causality-safe replay, and test execution under realistic constraints. AI removes another layer of friction: within a day, the team has tried several lead-lag specifications, varied the horizon, included transaction costs, and discarded the versions that fail immediately.

At first, the difference looks like a straightforward speed advantage. One team needed weeks to reach a model that the other could explore before the end of the day. The more consequential advantage appears after that point, because the second team still has enough time and attention to examine the premise of the trade rather than stopping at the first usable correlation.

Venue A may genuinely be the more informative market, in which case a well-built forecasting model could be sufficient. Another explanation starts with the participants rather than the prices. The liquidation on A may force market makers to warehouse unwanted inventory, which they then hedge on B. What appears in the data as information moving from one price to another may instead be risk moving from one balance sheet to another.

The visible sequence remains unchanged: A moves, then B. The economic question has shifted. A forecasting problem about two price series has become a problem about who was forced to take risk, where that risk is likely to move next, and whether the resulting hedge will arrive before liquidity on the next venue can absorb it.

That change in the question captures the central argument of this essay. Systematic trading has spent decades building mature strategy families such as market making, mean reversion, trend following, statistical arbitrage, relative value, and volatility trading. Important innovation continues within those traditions, sometimes with enormous economic consequences, yet much of the daily work consists of refining signals, modeling execution more faithfully, handling awkward cases, and preventing small implementation errors from overwhelming a thin statistical edge.

AI is becoming unusually effective at this layer of work. More of the literal trading stack may also become shared infrastructure, including market-data ingestion, exchange connectivity, order management, historical replay, reconciliation, monitoring, and parts of the risk system. As those costs fall, a larger share of the research budget can move toward the work that remains difficult: deciding what market phenomenon is actually being observed and gathering enough evidence to justify a position in it.

Other sources of advantage remain decisive. Some markets are won through cheaper financing, lower fees, exclusive data, privileged exchange access, faster hardware, or greater balance-sheet capacity. Infrastructure itself can carry alpha when its design determines what the firm can observe or execute. The subject here is the research process: when capable implementation inside familiar frameworks becomes easier to obtain, firms can spend more of their scarce effort framing the problem before they optimize it.

## What AI Is Actually Making Cheap

The established categories of systematic trading save every new researcher from beginning with a blank page. A market maker inherits a language of inventory, spread, queue position, adverse selection, fill probability, and hedging cost. A trend researcher begins with persistence, horizon, turnover, and volatility. A statistical-arbitrage researcher works with factors, residuals, common exposures, and decay.

Each framework compresses years of experience into a set of objects that can be taught, coded, tested, and improved. A new market maker does not need to rediscover why inventory matters before working on a quoting model, and a new stat-arb researcher can treat factor neutralization as a working primitive rather than a separate research program. Ideas that once required invention eventually become part of the profession’s ordinary vocabulary.

That inheritance also narrows the range of questions that feel natural. Once a problem has been classified as market making, researchers ask how quotes should change with inventory, which queue effects predict fills, and how aggressively the strategy should respond to adverse selection. These questions can be difficult and highly profitable. They begin, however, after the market has already been described as a market-making problem.

Mature frameworks contain a great deal of work that is demanding without being conceptually new. Models must be implemented correctly, data checked for leakage, features compared across regimes, and execution assumptions reconciled with exchange mechanics. Fees, outages, partial fills, state transitions, and operational failures all have to enter the analysis. A promising signal can disappear when any one of these details is treated properly.

AI can explore these branches much faster than a small human team. It can produce code, construct tests, compare alternatives, trace failures, and run many variations without tiring of the tenth unpromising result. Implementation remains essential because markets punish small mistakes; what changes is the scarcity of competent implementation inside a known framework.

Literal infrastructure creates a similar opportunity. A desk cannot study cross-venue liquidity without synchronized data, reason about queue position without a faithful event history, or evaluate execution without reconstructing orders, acknowledgements, cancellations, and fills. Firms repeatedly build these capabilities because research depends on them, even when the underlying engineering problem has already been solved elsewhere in nearly the same form.

The case for sharing this layer becomes clearer when measured by research delay rather than engineering cost. Suppose the lead-lag signal from the opening disappears as soon as realistic fees and queue position are included. The first team learns this after six weeks; the second learns it after two days. Both arrive at the same negative result, but one has consumed far less of its research budget to get there.

Most trading ideas should fail, so an organization improves when it can dispose of weak hypotheses cheaply. Faster deployment matters when the idea is sound; faster disproof matters across the much larger set of ideas that are not. Shared infrastructure earns its place when it shortens the path from conjecture to credible evidence, including evidence that says there is no trade.

The phrase “shared infrastructure” can make the boundary sound cleaner than it is. The stack does more than carry data and orders between the market and the strategy. Its choices determine which parts of the market survive long enough to become research objects, which means that the engineering layer is already participating in the model.

## The Stack Is Already a Model of the Market

Before a trading model can interpret an exchange, an infrastructure system has already made a series of judgments about the exchange’s event stream. It assigns and reconciles timestamps, handles missing messages, chooses how events should be ordered, normalizes venue-specific fields, aggregates updates, and decides which details will be retained. By the time a researcher sees “the market,” a long chain of engineering decisions has shaped the object under study.

The sequence can be written compactly. Separating its stages makes clear where infrastructure ends and representation begins:

$$
x_{\leq t}
\xrightarrow{O_I}
y_{\leq t}
\xrightarrow{\phi}
s_t
\xrightarrow{\pi_\theta}
a_t.
$$

Here $x_{\leq t}$ denotes the underlying market events available up to time $t$. The infrastructure $O_I$ converts those events into the observations $y_{\leq t}$ exposed to the researcher. The representation $\phi$ turns the observations into a state $s_t$, and the policy $\pi_\theta$ maps that state into an action $a_t$.

Most quantitative research concentrates on the latter part of this chain. Researchers vary parameters, features, thresholds, horizons, portfolio weights, and execution policies while leaving the state space largely intact. A neural model can be highly sophisticated and still optimize over a familiar description of prices, returns, spreads, and inventory.

Representation search moves earlier in the chain by changing $\phi$. The question becomes whether the state itself has been defined correctly. An order book might be better understood as a queueing network. A volatility signal might be a partial view of liquidity fragility. Cross-venue price movement might reflect a graph of balance-sheet constraints, with urgency passing from one participant to another through a sequence of hedges.

Whether those alternatives can be investigated depends partly on what $O_I$ preserved. Consider two market-data systems. One stores every order-book event with packet-level timing and provenance; the other supplies a clean snapshot every ten milliseconds. The difference may be irrelevant to a medium-frequency strategy, while a queue-position model would regard the two systems as descriptions of different markets.

The execution side has the same property. Latency, available order types, risk checks, permissions, and routing behavior determine which actions are feasible. At a daily horizon, two competent gateways may be interchangeable. At a microsecond horizon, their implementation can alter the economics of the trade enough to become part of the strategy.

Commodity infrastructure is therefore relative to a research problem. Sharing is harmless when alternative implementations preserve the information and feasible actions that matter economically. Once an implementation changes what can be observed or executed, the lower layer can no longer be treated as neutral plumbing.

The problem grows more consequential when a shared platform becomes the default interface through which many researchers see the market. A platform that exposes best bid, best ask, midpoint, spread, depth, imbalance, and volume is providing useful abstractions. It is also making an implicit judgment about which objects deserve attention, and convenience will pull research toward the fields that are easiest to query, replay, and model.

A strategy based on exact message ordering across venues, dealer inventory propagation, or collateral-linked liquidation networks may require a different view. The raw information can remain technically available while the standard tooling still channels most users toward the familiar representation. Defaults influence the questions a research organization asks long before anyone consciously decides to exclude an alternative.

A shared substrate has to remove repetitive engineering while preserving enough of the original event structure for researchers to challenge its abstractions. Raw provenance, inspectable clock adjustments, explicit reconstruction assumptions, and replaceable transformations matter because a platform can otherwise make everyone faster at asking the same question. The infrastructure succeeds when it gives researchers a reliable starting point without deciding where their inquiry must end.

That design choice determines whether the liquidation episode remains a routine lead-lag exercise or opens into a different account of the market. With enough of the original event structure intact, the next step is to examine whether the observed price sequence is only the surface trace of another process.

## The Same Price Move, a Different Market

Under the familiar formulation, Venue A leads Venue B and the research problem is to estimate that relation accurately enough to trade it. An account centered on participants produces a different chain of events:

$$
\text{liquidation}
\rightarrow
\text{inventory absorption}
\rightarrow
\text{hedging pressure}
\rightarrow
\text{liquidity consumption}
\rightarrow
\text{repricing}.
$$

The second account is only a hypothesis. Its immediate value is that it changes what the researcher should measure and what evidence should appear if the explanation is correct. Recent returns and order-flow correlations no longer exhaust the state. Liquidation intensity, open interest, inferred dealer inventory, depth on likely hedge venues, funding divergence, and the network connecting related instruments all become plausible inputs.

With those variables in view, the intermediate question also changes. The team is now estimating the probability of a particular flow arriving before the market can absorb it:

$$
\Pr\left(
\text{hedging pressure reaches Venue B before its liquidity replenishes}
\mid x_{\leq t}
\right).
$$

If this state captures the mechanism, the eventual trading rule may be simpler than the lead-lag model it replaces. The difficult step was identifying the variable that deserved to be predicted, rather than finding a more elaborate function of the old variables.

I use *representation arbitrage* as a loose name for the resulting advantage. There need not be a riskless pricing violation. The asymmetry lies in the cost of recognizing and exploiting an economically relevant regularity. Two firms may possess broadly the same public data, yet one organizes it around prices and correlations while the other organizes it around constrained participants and the paths through which their inventory must move.

A relationship that appears weak in the first description can become much simpler in the second. Mathematics offers a useful analogy: a difficult problem may become tractable after a change of variables even though the underlying facts have not changed. The gain comes from finding coordinates in which the relevant structure is easier to express.

AI makes this distinction especially useful because model complexity is a poor proxy for conceptual novelty. A large neural network may be opaque while rediscovering a sophisticated version of momentum. A reinforcement-learning agent can display unfamiliar behavior while implementing a recognizable form of liquidity provision. The model has changed in both cases; the market object may not have.

To earn the status of a useful representation, the new account should organize more than the return series that motivated it. If forced hedging explains the lead-lag, the same account should say where the effect will be strongest, which venues are likely to move next, how available depth changes the propagation, and which conditions should stop it. Each implication gives the market another chance to contradict the explanation.

Successful representations also contain the seed of their own commoditization. If forced-liquidity propagation proves useful across many events, firms will build models around it, data vendors will package the relevant variables, and platforms will expose them as standard features. New researchers will inherit the concept without having to rediscover it. What began as an unusual way of seeing the market becomes part of the next generation’s conceptual infrastructure.

The firm cannot rely on permanent ownership of one such insight. It needs a process that can continue producing and testing new representations after the old ones have become familiar. Once AI greatly expands the number of candidate explanations and strategies, that process faces a new constraint: the rate of generation can outgrow the institution’s ability to tell discovery from accident.

## Cheap Generation and the Cost of Verification

In an earlier essay, [*Cheap Generation and the Fragility of Understanding*](https://thogiti.github.io/2026/01/01/AI-fragility-of-understanding.html), I wrote that “when code production becomes cheap, verification becomes valuable.” The sentence was meant as a conditional rather than a law of economics. Cheaper production creates a larger need for verification. Institutions may still reward visible output while underpaying the work required to determine whether that output deserves trust.

Quantitative research concentrates the same tension in an adversarial environment. An AI system can generate thousands of candidate signals, features, transformations, horizons, universes, cost assumptions, and execution variants. Many will look sensible, and some will produce unusually strong historical performance because the search was broad enough to find attractive accidents.

A simple statistical toy model gives the intuition. If $Z_1,\ldots,Z_N$ are independent standard-normal variables drawn under a null with no genuine effect, then the expected maximum grows approximately as

$$
\mathbb{E}\left[\max_i Z_i\right]
\approx
\sqrt{2\log N}.
$$

Actual trading research violates nearly every simplifying assumption behind this expression. Tests are correlated, selection is adaptive, returns are non-Gaussian, and researchers revise experiments after observing intermediate results. Those complications make the effective search space harder to measure, while leaving the selection problem intact: a larger search produces more results that look exceptional under the history used to find them.

AI can therefore scale overfitting along with legitimate discovery. As plausible hypotheses become abundant, the institution’s scarce capability shifts toward accurate rejection. Finding an attractive strategy is only the beginning; the harder task is determining which attractive strategies deserve to survive the research process.

Evidence can support that decision in more than one way. Some strategies are mechanism-backed: the economic process is understood well enough to generate independent predictions about propagation paths, available liquidity, capacity, and failure conditions. Other strategies may earn confidence empirically before their full causal mechanism is understood, provided they survive genuinely prospective tests, alternative definitions, realistic costs, perturbations, capacity analysis, and live deployment.

Demanding a polished causal story in every case can encourage researchers to manufacture one after seeing the result. The common requirement is a legible evidence process. Partial opacity in the policy is tolerable so long as the firm can explain why it currently deserves capital, where the supporting evidence is expected to apply, how much capacity the effect can plausibly support, and which observations would force a revision.

The earlier essay described understanding as the ability to predict what happens under change. That standard maps naturally onto trading. A strategy is better understood when researchers can anticipate how it should behave as liquidity thins, size increases, exchange rules change, a different participant becomes constrained, or competitors begin exploiting the same pattern. A backtest records performance along one historical path; a useful research model says something about nearby paths that have not yet occurred.

Verification has to continue after a strategy leaves the backtest. Historical evidence can establish that an idea survived a market in which the strategy was absent. The next stage must examine the market that forms after the strategy begins to act, because trading turns the research subject into a participant in its own experiment.

## The Market Answers Back

Historical data describes a market in which the proposed strategy did not exist. Once the strategy begins trading, its orders enter the queues, consume liquidity, influence prices, reveal information, and give competitors something new to infer. The object being studied changes in response to the attempt to exploit it.

The lead-lag strategy may work beautifully at small size. As capital increases, its own orders reach Venue B sooner and consume the liquidity that made the delay profitable. Other firms may recognize the pattern and race the trade, while liquidity providers alter their quotes in anticipation of the incoming flow. A real relationship can weaken because the strategy has learned to use it.

Historical replay cannot contain this counterfactual market because the relevant orders were never sent. Simulation can approximate the response only through assumptions about other participants. Both remain useful, although neither removes the need to learn from actual intervention.

Early live deployment can therefore be treated as experimental capital. A small position can reveal how fill quality changes with size, whether hedging pressure follows the predicted route, how much the strategy alters its own signal, and when another participant begins to respond. The first dollars allocated to a strategy may be purchasing information before they are expected to maximize profit.

Execution joins the measurement process and continues the work begun in research. This has a direct consequence for verification: evidence in markets expires. A claim can be well supported today and become wrong later because the environment changed, perhaps partly in response to the claim itself.

The same feedback changes the value of shared infrastructure. Tools that shorten the path to live experimentation can improve a firm’s learning rate, yet those tools may also shorten the path by which competitors reproduce whatever the firm learns. Faster research creates value only in relation to the speed at which that value diffuses.

## Discovery and Diffusion

Suppose a common trading stack reduces the time required to test a cross-venue idea from six weeks to three days. The firm can investigate more hypotheses and abandon weak ones sooner. Now suppose the same stack reduces the time required for another firm to reproduce a successful strategy from six months to two weeks. The industry has accelerated two different processes at once.

The first process is the firm’s internal research loop. It converts an observation into an experimentally supported trading claim:

$$
\text{observation}
\rightarrow
\text{representation}
\rightarrow
\text{experiment}
\rightarrow
\text{validated strategy}.
$$

A successful discovery then enters a second process outside the firm. Competitors reproduce it, capital crowds it, and the original edge begins to decay:

$$
\text{discovery}
\rightarrow
\text{replication}
\rightarrow
\text{crowding}
\rightarrow
\text{decay}.
$$

AI can accelerate both loops, and shared infrastructure can do the same. Research velocity by itself is therefore an incomplete measure of the moat. A firm can double the number of good ideas it discovers and still become economically weaker if those ideas lose their value much faster.

A rough accounting expression makes the tradeoff visible. Suppose a firm produces deployable discoveries at rate $\lambda_{\mathrm{validated}}$. Each discovery has economic value $V$, useful capacity $K$, and lifetime $T$ before competition or market adaptation erodes it. The economic value of the research pipeline scales loosely with

$$
\Pi
\propto
\lambda_{\mathrm{validated}}
\mathbb{E}[VKT].
$$

AI can raise $\lambda_{\mathrm{validated}}$ by making implementation and search faster, provided the verification process keeps pace. Shared infrastructure can raise it again by lowering the cost of experiments. Both can reduce $T$ by making replication easier and by encouraging firms to work from similar data abstractions and execution primitives.

The competitive question is how quickly the institution learns relative to how quickly the market diffuses what it has learned. A single strategy rarely compounds in the relevant sense. It attracts capital, competitors, and eventually its own decay. The research process can compound if each experiment leaves behind better data tools, discarded hypotheses, improved simulations, sharper failure tests, and a representation that makes the next problem easier to formulate.

Seen this way, the neolab is an organization designed so that the loss of one strategy improves the process that produces the next one. Its strategies expire under competitive pressure; its research memory should become more useful with each cycle.

## What the Neolab Has to Compound

A serious neolab would need several forms of memory and several opposing incentives. Some part of the organization would generate alternative descriptions of the market, translating an apparent return anomaly into a queueing problem, a network of balance-sheet constraints, an auction, a causal process, or a strategic interaction. The immediate output might be an intermediate question rather than a trade.

That question would first be examined in replay or in a deliberately simplified environment. Researchers could ask whether the proposed state existed in past events, whether the mechanism produces the consequences it should, and which observations already contradict it. Candidate policies would emerge only after enough structure survived to make an action meaningful.

Generation and verification should not carry the same institutional incentives. Researchers and agents that create a strategy naturally accumulate reasons to preserve it. A separate function should be rewarded for finding leakage, hidden factor exposure, fragile cost assumptions, capacity constraints, or an alternative explanation that renders the original story unnecessary.

A strategy killed at this stage can still produce valuable information if the cause of death enters institutional memory. The organization should not rediscover the same leakage pattern or cost mistake six months later under a different signal name. Negative results become useful when they remove regions of the search space rather than disappearing into private notebooks.

Surviving ideas would move into live experimentation at deliberately limited scale. The firm could then observe whether the proposed state variables retain their meaning after intervention, how impact changes with size, and whether other participants respond. Only after those observations agree sufficiently with the research model would the strategy become primarily a capital-allocation problem.

The process compounds when results alter the machinery that generated them. A failed strategy may reveal a defect in the replay engine. Several projects may expose the same latent state variable. A transformation repeatedly rebuilt by different researchers may deserve to become part of the shared substrate. An explanation that survives enough experiments may acquire a name, a set of diagnostics, and eventually its own standard tools.

Yesterday’s discovery then becomes today’s infrastructure, lowering the cost of tomorrow’s research. The stages form a recursive loop in which every completed experiment can change the way the next one is designed:

$$
\text{representation}
\rightarrow
\text{hypothesis}
\rightarrow
\text{policy}
\rightarrow
\text{adversarial test}
\rightarrow
\text{live experiment}
\rightarrow
\text{learning}
\rightarrow
\text{new representation}.
$$

Human judgment remains important inside this loop for reasons that go beyond idea generation. Researchers decide which market questions justify attention, what evidence is strong enough to risk capital, and which live interventions are acceptable. They also remain accountable when an opaque policy interacts with real markets and real balance sheets.

The institution becomes more durable than any strategy it produces only if it can resist several predictable failure modes. Representation search can drift into novelty for its own sake, verification can become another benchmark to game, and shared infrastructure can create a monoculture of assumptions. Those risks place practical limits on what the neolab thesis can claim.

## Where the Argument Can Fail

The space of possible market descriptions is enormous, and novelty has no economic value on its own. An unconstrained AI can invent new ontologies faster than any research team can evaluate them. Most will be useless because they neither compress an important regularity nor generate a decision that survives real trading constraints.

Strong priors continue to matter. Market microstructure, economics, statistics, and domain experience reduce the search space by identifying recurring constraints and questions with enough economic mass to justify investigation. Useful novelty has a practical test: the representation must make an important market regularity easier to explain, examine, or exploit.

Verification can fail more subtly. Once an AI system learns the battery of robustness tests that determines approval, those tests become part of the optimization landscape. The system can search for strategies that pass the validation suite without discovering anything durable, much as a model can overfit a public benchmark.

Prospective holdouts, alternative definitions, changing tests, and live interventions help keep the evidence process from becoming another backtest. The organization also needs incentives that reward early rejection and accurate uncertainty rather than visible production alone. Otherwise cheap generation will fill the pipeline faster than the institution can learn where the outputs break.

Shared infrastructure introduces concentration risk of its own. A common replay bug can create a common illusion, while a normalization convention can remove information that every customer later assumes never mattered. A platform that observes research queries or order flow may also learn more about the strategies built on top of it than its users intend.

For that reason, shared infrastructure has to earn trust in much the same way a strategy does. Its transformations should be auditable, its isolation guarantees credible, and its users able to leave the default abstraction when the research requires it. Standardization should lower duplicated effort without turning one vendor’s ontology into the industry’s blind spot.

Operational advantages remain outside the neolab thesis as well. Lower fees, privileged order types, better financing, exchange relationships, exclusive data, faster hardware, and balance-sheet strength can dominate a more elegant representation. A firm with a mediocre model and exceptional economics can outperform one with a beautiful theory and no scalable way to express it.

Together, these limits bound the prediction. As AI and infrastructure reduce the cost of work that once consumed much of the research budget, advantage should move toward better problem formulation, stronger experimental design, and faster rejection of false discoveries. The evidence should appear in live markets: shared infrastructure should shorten time to rejection as well as time to launch, new representations should generate consequences beyond the historical pattern that selected them, and AI-assisted research should improve cost-adjusted, capacity-aware performance rather than merely multiplying completed backtests.

Failure on those measures would mean that the institution has accelerated activity without improving discovery. The two teams from the opening provide a simple picture of the alternative, because the lasting difference between them should eventually appear in the quality of the questions they can afford to pursue.

## What Becomes Scarce

After several weeks, the first team has built its infrastructure and produced a respectable lead-lag strategy. The data is clean, the costs appear manageable, and execution is improving. The second team reached the same point much earlier and used the saved time to investigate why the pattern existed.

Its researchers came to believe that Venue A was not the interesting object by itself. A liquidation created an inventory shock, the shock forced someone to hedge, and the hedge traveled through markets with different amounts of available liquidity. The price movement on B was one visible consequence of that process rather than an isolated statistical delay.

They then tried to disprove the explanation. They tested other liquidation events, changed venues, varied definitions and timestamps, examined cases in which the propagation should stop, and used small amounts of live capital to see whether their own presence altered the effect. Eventually the representation became good enough to support meaningful risk.

If the strategy matters, the advantage will not remain private forever. Competitors will observe the trades or discover the same mechanism independently. Data vendors may package the relevant variables, and trading platforms may eventually expose measures of hedging pressure as standard features. Researchers entering the industry later may learn the framework as part of ordinary market microstructure.

What began as a discovery becomes part of the plumbing. By then, the second team’s advantage depends less on permanent ownership of that insight than on what accumulated while the insight was being developed: better data abstractions, failed hypotheses that no longer need to be repeated, improved experiments, a clearer map of the mechanism’s limits, and a stronger sense of which question to ask next.

AI can make hypothesis generation extraordinarily cheap, while shared infrastructure can reduce the cost of serious experimentation. Competitive markets keep the resulting knowledge temporary. The scarce resource is the capacity to turn cheap generation into evidence strong enough to risk capital on, then learn from each experiment quickly enough that the research process improves before the current discovery is arbitraged away.

The firms that master that loop will still lose individual strategies, as every successful strategy eventually attracts imitation and adaptation. Their advantage lies in reaching the next useful question before the rest of the market has finished optimizing the last one.

