---
title: Scarcity Does Not Imply Auctions
subtitle: Why AI inference may look more like cloud capacity than crypto blockspace.
date: 2026-10-17
author: Nagu Thogiti
tags: Quantitative-Trading, AI-in-Finance, Market-Microstructure, Trading-Infrastructure, Backtest-Overfitting, Representation-Arbitrage
---


![Why AI inference may look more like cloud capacity than crypto blockspace.](/assets/images/2026/Scarcity_Does_Not_Imply_Auctions_cover.png)

*Why AI inference may look more like cloud capacity than crypto blockspace.*

A software team gives an AI agent a checkout bug to fix before the next release. The agent reads the repository, proposes a patch, runs tests, and revises whatever fails. The team has a deadline and a spending limit. The team needs the agent to finish without switching to an untested model halfway through or discovering that continuing the repair now requires a much more expensive service tier.

One appealing forecast follows this growing appetite for execution toward auctions: scarce capacity makes priority valuable, so customers bid for service instead of waiting their turn. Matt Huang expressed the broader intuition in an October 2026 post: “I think we'll see many systems evolve from first-come-first-serve to auctions.” Applied to inference, the hypothesis suggests a market where agents continuously bid for access to overloaded providers. [^huang]

I find the case for pricing priority persuasive, but a good price for the next call does not tell the engineering team what it will cost to finish. An inference marketplace could auction execution slots to customers or ask providers to compete to serve each prompt. Neither mechanism, by itself, gives the team a dependable path from a broken checkout to a working release. Before choosing the bidding rule, we need to know what is being bought and how much future service the seller is committing to deliver.

## What the queue is charging

When two customers need the same scarce capacity but incur different costs from waiting, treating them identically can waste something valuable. A production outage and an overnight document-indexing job should not necessarily receive the same priority because the indexing job arrived first. Pricing earlier service can help separate them, provided the buyers' bids reflect the relevant costs of delay rather than merely different spending constraints.

Even first-come-first-served allocation can contain a contest when participants choose how early to arrive. In their 1982 paper *Waiting-Line Auctions*, Charles Holt and Roger Sherman studied prizes distributed at a specified time to people who choose when to join the queue. Earlier arrival functions like a bid paid through waiting. The mechanism applies to that strategic setting, rather than every queue that processes requests in arrival order. [^holt-sherman]

If congestion leads customers to retry requests or duplicate execution, reliable paid priority can reduce wasted computation. Any welfare gain comes from better allocation and resources saved, not the revenue collected. A larger invoice is evidence of a transfer; it does not, on its own, establish an improvement.

A provider can sell earlier service through a posted premium, reserve throughput under a contract, or admit work into different priority classes. An auction becomes attractive when eliciting competing bids improves on those alternatives enough to justify its costs. Scarcity establishes that somebody must wait, pay more, accept worse service, or go without. It does not select the rule.

The software team could bid for priority capacity months before deployment, reserve throughput at a posted price, or compete for immediate service during the incident. All three arrangements price access; only the last makes the application discover that price while the checkout is broken.

## A shortage does not specify a trading rule

When one request launches a workflow of repeated model calls, demand can grow faster than the capacity available to serve it. Anthropic's June 2025 account of its multi-agent research system reported roughly four times the token use for agents and fifteen times for multi-agent systems compared with chat interactions. Those observations from one system show how moving from an answer to a workflow can expand consumption. [^anthropic-agents]

In a May 2025 conversation with Dwarkesh Patel, Sholto Douglas put the supply concern plainly: “Yes, it's highly likely we get dramatically inference bottlenecked in 2027 and 2028.” His surrounding discussion considered model efficiency and the lag before semiconductor production responds. A serious bottleneck need not imply a permanently fixed supply of compute. [^douglas]

The reassurance that efficiency will dissolve scarcity makes its own unsupported leap. In an illustrative scenario where compute per task falls fivefold but the number of worthwhile tasks increases tenfold, total compute demand doubles. Whether something like that happens depends on how much additional work the improvement makes worth doing. Lower cost per task alone cannot settle the question.

Adding accelerators does not remove a bottleneck when the infrastructure needed to power them is still being built. The International Energy Agency's *Energy and AI* analysis includes long grid-connection queues among the constraints in its high-demand scenario. Software can improve before the infrastructure needed to use more hardware becomes available. [^iea]

My market forecast does not require those shortages to disappear, because persistent scarcity can strengthen demand for advance access. A buyer expecting repeated congestion has a reason to secure capacity before an incident rather than negotiate during it. The supplier can sell that commitment, with its risks and limits, whether the shortage lasts a week or several years.

## The next token is the wrong unit of competition

A provider can compete aggressively for customer traffic while its infrastructure supplier charges a premium for capacity. The same company is a buyer in one transaction and a seller in another. Aggregate chip scarcity therefore does not establish that every model, provider, and region is fully booked; spare capacity in one part of the market can coexist with a shortage elsewhere.

Tarun Chitra's *The Souq: Value Creation and Extraction in OpenRouter* separates the choice of a model from the choice of a provider to execute it. Its Tullock-contest model concerns providers using quoted prices to influence their probability of receiving traffic. That is a seller-side competition for order flow, rather than a customer bidding for priority at an overloaded service. [^souq]

OpenRouter's documented default strategy favors stable providers and weights eligible low-cost candidates by inverse-square price. For a fixed eligible set $\mathcal{E}$, an idealized expression for that weighting is

$$
\pi_i = \frac{P_i^{-2}}{\sum_{j\in\mathcal{E}}P_j^{-2}},
$$

where $P_i$ is provider $i$'s positive price score and $\pi_i$ is its selection probability. A provider with half another's score receives four times its relative weight. This describes the price-weighting step; provider preferences and fallbacks also affect routing. [^routing]

The score becomes less informative when serving one request changes the cost of serving the next. Prompt caching lets a provider reuse computation for repeated input, and OpenRouter documents sticky routing that keeps subsequent requests with the same provider to preserve cache benefits, subject to availability and routing settings. Its full service should not be mistaken for a fresh, stateless price contest on every call. [^caching]

In a simple example, ten calls repeat a million-token prefix and the final nine qualify for a cache discount. Provider A charges \$0.60 per million input tokens without a discount. Provider B charges \$1.00 for the initial input and \$0.10 for each cached repeat. The repeated-input bill is \$6.00 at A and \$1.90 at B.

A ranking based on the uncached headline rate favors A, even though B delivers the cheaper repeated-input bill. Providers competing for that ranking have a reason to cut the visible rate rather than the cost the customer ultimately bears. A fiercely competitive market can still compete over the wrong price.

Chitra's *Caching Cheaters on OpenRouter* reports a corresponding empirical problem: some aggressive repricers produced worse realized costs for repeated-context workloads, although the experiments could not establish whether the cache losses were deliberate. His proposed response includes evaluating providers on the prices users actually pay. [^cache-study]

A router can therefore preserve a session after selecting a provider and still make the initial selection using a score that poorly predicts its eventual cost. Once the first request establishes a useful cache, an alternative supplier must compensate for the cost of starting elsewhere. The comparison has changed from the cheapest isolated call to the cheapest way to continue.

## The exposure of an unfinished workflow

Even perfect cache portability would leave the engineering team with a separate problem: a promising diagnosis or an untested patch might deliver only part of the value of a completed repair. When several steps are complements, securing execution for some of them does not secure a usable result. A customer can pay for early progress and then find the remaining work unaffordable or unavailable.

Auction theory calls the risk of acquiring an uneconomic partial bundle the **exposure problem**. Lawrence Ausubel and Paul Milgrom discuss it in *Ascending Auctions with Package Bidding*: when items are complements, separate bidding can leave a buyer paying too much for the subset it wins. Applying that idea to inference, a workflow whose payoff depends heavily on completion exposes its buyer to the terms of the remaining calls. [^package-bidding]

This exposure can arise under posted prices as well as auctions: a fixed token rate without a capacity commitment can still leave a workflow stranded midway. An interrupted task may leave a useful diagnosis or partial patch, but when most of its payoff depends on completion, the buyer needs to account for interruption risk before purchasing the first call.

The cost of moving unfinished work depends on which state survives the move. Files and conversation history can travel even when a provider's execution cache cannot; the receiving endpoint may then have to repeat computation that the original provider could reuse. That gives a session a kind of *KV-cache gravity*: a switching cost distinct from the exposure to losing access altogether. [^caching]

Persistent KV storage can reduce the computation a compatible host must repeat, while application checkpoints preserve progress independently of the execution cache. LMCache documents cache reuse across serving engines, and Anthropic's research-system account describes checkpoints that let agents resume after failures rather than restart. These capabilities do not make arbitrary commercial APIs interchangeable, but they change what must be reconstructed after a move. [^lmcache][^anthropic-agents]

Moving the state is useful only if the destination still performs the task reliably. A team might have several acceptable hosts for one model but no validated replacement model for its tool-using workflow. Changing the provider and changing the model are different substitutions: validation of one configuration does not establish another's reliability. An available endpoint constrains a supplier's price only when it is an adequate, economical alternative for the task.

On Ethereum, different client implementations must follow common protocol rules for execution against the relevant chain state. Transaction ordering can still change economic outcomes, so that shared standard does not make every multistep strategy riskless. Inference buyers face an additional validation problem when a move changes the model or its serving configuration: whether the new destination still produces acceptable work. [^evm][^mev]

I would therefore treat portability as something to improve rather than a reason to abandon markets. More interchangeable services could make bidding more useful by reducing the cost of choosing a different supplier. A commitment addresses continuity; portability makes the customer less dependent on whoever supplies it.

## A commitment is part of the product

A customer needing dependable continuation can buy a broader service than the next prompt: reserved throughput for a period, access under a defined spending envelope, or a session with specified interruption terms. An auction could price any of those commitments. Package bidding exists precisely to let bidders express value for combinations rather than acquire every component separately. [^package-bidding]

Because an agent may not know how many calls a repair will take, reserving an exact ten-call bundle need not be the useful contract. I would start with a bounded capacity envelope over a stated period, with explicit overage and failure terms. Reserving access does not guarantee that the model will repair the software; an outcome guarantee would require a separate agreement about what constitutes an acceptable repair.

The distinction becomes easier to see when the method for setting a price is separated from the scope of the access being purchased:

| Pricing method | Access purchased request by request | Capacity or service committed in advance |
|---|---|---|
| Posted or negotiated prices | Pay-as-you-go execution without reserved capacity | Reserved throughput at an agreed price |
| Competitive bidding | Per-request priority or execution auction | Auction of reserved throughput or a defined session commitment |

A market can move toward the right-hand column while using more auctions, fewer auctions, or the same number. Selling commitments does not settle how their prices should be discovered. Conversely, discovering a price competitively does not require leaving the customer exposed to a new negotiation on every call.

The software team's preference for predictable access can therefore be economically rational, rather than an inconvenience imposed by procurement. Paying more for assured access may be cheaper than accepting a lower rate and a greater chance of missing the release. The supplier takes on part of that availability risk in exchange for compensation and more information about future demand.

Automated buyers make it easier to compare quotes and revise bids, but they still need a policy for what the owner is willing to risk. Knowing the available budget does not establish the business cost of another hour of downtime or the acceptability of changing models. The obstacle is often the specification of the buyer's objective, rather than the computation needed to submit a bid.

An intermediary could buy variable-price capacity and sell customers a more stable service, provided it can manage the difference between its obligations and its suppliers' promises. Correlated demand spikes can make that expensive. Reservations can also leave customers paying for unused capacity or a configuration they no longer need. Those costs belong in the comparison; a commitment transfers risk rather than abolishing it.

## The cloud precedent is already here

Cloud customers already distinguish a discount from an entitlement to capacity. AWS Savings Plans exchange a spending commitment for lower prices without reserving capacity; Capacity Reservations address availability. A buyer can combine the two, but purchasing one should not be mistaken for purchasing the other. [^aws-capacity]

Even the word *spot* does not establish that customers are participating in a live auction. AWS documents EC2 Spot prices as prices set by EC2 and adjusted gradually according to long-term supply and demand. The instances use spare capacity and can be interrupted. Variable pricing and revocable access are sufficient to create this product without continuous customer bidding. [^aws-spot]

OpenAI's Reserved Tier sells model-specific provisioned throughput, with priority during peak demand and pay-as-you-go billing for overage. Its Flex processing offers lower prices in exchange for slower responses and occasional resource unavailability. These products sell different access conditions, not merely different numbers on a token-price list. [^reserved][^flex]

The existence of these arrangements does not establish that incumbent cloud pricing is efficient or destined to dominate. A competing market could improve the terms. But it would have to address the same question about who bears the cost when promised execution becomes difficult to supply. My expectation is a substantial base of commitments alongside on-demand access and markets for flexible or overflow work. An overflow market could influence the price of future contracts even if it carries a minority of the traffic.

## An optimizer is not an auction

A provider selling reserved and on-demand service still has to decide which job should run next. Running one request can delay another or consume capacity needed to meet a commitment. Fixed customer prices leave that opportunity cost in place.

In a scheduling model, a *shadow price* measures the marginal value of relaxing a capacity constraint. If a little more capacity would reduce the modeled cost of meeting obligations by five dollars per unit, the local shadow price is five dollars per unit. No customer has necessarily submitted that bid, and no transaction has necessarily cleared at that price. A scheduler can use the calculation while operating entirely on existing contracts.

A subscription could therefore sit above genuine wholesale auctions, or above no auctions at all. An API showing constantly changing prices might simply expose supplier-set rates. I would look for bids that determine allocations and payments before describing the mechanism as an auction; calling every changing price an auction makes the forecast impossible to test.

## Best execution for inference

A customer delegating routing decisions is also delegating part of its procurement policy. The router decides how to compare a cheaper quote with a slower response, an uncertain outcome, or the cost of leaving an existing session. Its commercial incentives can affect those judgments.

Chitra's *The Souq* explicitly discusses payment-for-order-flow relationships among applications, routers, and providers. The corresponding concern is straightforward: compensation for directing traffic can make a supplier more profitable for the intermediary without making it better for the customer. Whether a particular arrangement harms the customer depends on the execution delivered and the alternatives available. [^souq]

Financial-market practice offers a useful standard without supplying a ready-made inference rule. FINRA's 2021 guidance says payment for order flow must not interfere with best execution, and its evaluation covers more than the displayed price. Execution likelihood, speed, transaction costs, and customer needs also matter. Obtaining the best quoted bid or offer does not necessarily settle the question. [^best-execution]

I would borrow that principle for inference procurement: a router claiming to act for the customer should be able to explain its choices against the customer's declared requirements. For the checkout repair, I would examine the cost of accepted work and the time taken to deliver it. The spending calculation should include failed attempts and retries, rather than making a provider look cheap by counting only the runs that succeeded.

Because quality cannot always be assessed immediately, that standard would need evidence beyond the router's own score. For important workloads, I would require task-specific evaluations and comparisons across eligible providers, with failures retained in the record. Sampled comparisons could inform future routing without executing every live job everywhere. Where the evidence is weak, the router should expose the uncertainty rather than claim to have proven a globally optimal choice.

Adding more variables to the score does not remove the incentive to game it. Google's Ad Rank combines bids with quality assessments and contextual factors while retaining an auction. A scoring rule can accommodate several dimensions and still give participants reasons to optimize what it measures. [^ad-rank]

If an inference router rewards fast answers but barely measures whether they work, a supplier has a reason to prioritize speed at the customer's expense. An opaque score makes that trade-off harder for the customer to inspect. The appropriate response is to test the score against delivered results, not assume that proprietary ranking has solved the incentive problem.

Stripe's August 19, 2026 announcement of an agreement to acquire OpenRouter gives these questions a concrete commercial setting: it described combining token routing with tools for managing business profitability and also emphasized neutral infrastructure. That announcement establishes neither biased routing nor a particular payment-for-order-flow arrangement. [^stripe]

My concern about combining billing with supplier selection is that a customer's routing policy can become difficult to distinguish from the platform's commercial policy. I would want customers to see relevant incentives, restrict eligible providers, and understand why a session moved. Disclosure would help, but it would not replace evidence that the chosen service met their requirements.

A router can earn its margin by reducing the cost and uncertainty of completed work. It can also earn a margin because customers cannot reconstruct why their work went where it did. I expect the difference between those businesses to matter long after any particular shortage eases.

## The market I would build

I would build for a market in which dependable execution is the main product and bidding is one procurement tool. For an important, predictable workload, I would secure a baseline of committed capacity and maintain tested alternatives for the parts that can move. I would buy additional flexibility where it is worth the cost. I would not make the application rediscover its right to finish on every call.

Auctions would have a substantial place where providers offer comparable service, performance is measurable, and changing demand makes fresh bids informative. Standardized batches and overflow capacity are plausible candidates. More portable state would expand that opportunity. An auction for a longer service commitment could be valuable for the same reason: it lets suppliers compete over a product the buyer can actually use.

Before improving the bidding rule, I would make the router account for what its decisions produce. The session record should connect the quoted rate to the bill actually paid and to the work the customer accepted. Cache treatment and unsuccessful attempts belong in that record. A lower visible token price would not persuade me to switch providers without knowing what happened to the cost and reliability of completion.

My wager is that providers and intermediaries will absorb much of the short-run price and capacity risk for predictable, business-critical workloads. I would revise that view if those workloads increasingly bought execution request by request at auction-clearing prices, without advance capacity commitments, and achieved lower total cost at comparable completion quality and reliability. Auctions used to price commitments would remain compatible with my forecast.

I am less worried about auctions becoming too common than about the wrong performance measure becoming entrenched. If providers compete on the cheapest visible token while buyers bear the cost of retries, lost state, and failed work, greater market activity can make the system busier without making it better. I would put my money behind infrastructure that makes those costs visible and helps customers control them, rather than a routing business whose margins depend on customers being unable to compare.

The engineer waiting for a repaired checkout gives us a useful standard against which to judge the whole arrangement. Did the system complete acceptable work within the agreed constraints, and can the buyer tell what it paid for? I would rather own infrastructure that answers those questions reliably than an exchange that discovers, with exquisite precision, the price of one more unfinished step.

---

## Source notes

[^huang]: Matt Huang, October 4, 2026, [post on first-come-first-served systems and auctions](https://x.com/matthuang/status/2106893266138591520). The subsequent application to inference is the essay's formulation of the hypothesis, not an additional quotation from Huang.

[^holt-sherman]: Charles A. Holt Jr. and Roger Sherman, [“Waiting-Line Auctions”](https://www.journals.uchicago.edu/doi/abs/10.1086/261056), *Journal of Political Economy* 90(2), April 1982, pp. 280–294. DOI: 10.1086/261056. The paper considers strategic arrival for prizes distributed at a specified time.

[^anthropic-agents]: Anthropic, [“How we built our multi-agent research system”](https://www.anthropic.com/engineering/multi-agent-research-system), June 13, 2025. The reported fourfold and fifteenfold token comparisons concern Anthropic's data. The production-reliability discussion also covers state, expensive restarts, and checkpointing.

[^douglas]: *Dwarkesh Podcast*, [“How Does Claude 4 Think? — Sholto Douglas & Trenton Bricken”](https://www.dwarkesh.com/p/sholto-trenton-2), May 22, 2025. See the chapter beginning at 01:18:55, “Inference compute will bottleneck AGI.” The shortage forecast is quoted as a forecast, alongside its discussion of efficiency and supply response.

[^iea]: International Energy Agency, *Energy and AI* (2025), [“Energy supply for AI”](https://www.iea.org/reports/energy-and-ai/energy-supply-for-ai), especially “Electricity supply in the sensitivity cases.” The Lift-Off Case discusses long grid-connection queues.

[^souq]: Tarun Chitra, [“The Souq: Value Creation and Extraction in OpenRouter”](https://robvc.com/research/the-souq), Robot Ventures, August 17, 2026. Relevant sections distinguish capability from execution routing, model provider competition as a multidimensional Tullock contest, and discuss payment-for-order-flow relationships. Those discussions do not establish that any particular routing arrangement is harmful.

[^routing]: OpenRouter, [“Provider Routing”](https://openrouter.ai/docs/guides/routing/provider-selection), “Price-Based Load Balancing (Default Strategy).” The displayed equation idealizes inverse-square weighting over a fixed eligible set with positive price scores. It is not a specification of every routing override, fallback, or session-persistence behavior, and halving a score multiplies relative weight rather than necessarily quadrupling absolute selection probability.

[^caching]: OpenRouter, [“Prompt Caching”](https://openrouter.ai/docs/guides/best-practices/prompt-caching), especially “Provider Sticky Routing.” Sticky routing has eligibility and availability conditions and does not by itself establish a contractual guarantee that cached state or access will persist.

[^cache-study]: Tarun Chitra, [“Caching Cheaters on OpenRouter”](https://www.linkedin.com/pulse/caching-cheaters-openrouter-tarun-chitra-bycjc/), 2026. The experiments report realized customer-cost effects and explicitly distinguish those observations from unproven intent. The proposed repair includes scoring expected or realized customer prices rather than relying only on quoted rates.

[^package-bidding]: Lawrence M. Ausubel and Paul Milgrom, [“Ascending Auctions with Package Bidding”](https://cramton.umd.edu/econ415/ausubel-milgrom-package-bidding.pdf), draft dated July 31, 2002. See the exposure-problem discussion on printed page 11 (PDF page 11) and the package-bidding designs. The workflow application is an economic analogy developed here; the paper does not study AI inference.

[^lmcache]: LMCache, [project documentation](https://docs.lmcache.ai/), overview and key features. The documented capabilities include persistent KV storage and reuse across serving engines. This is not evidence of universal cache portability between arbitrary providers, models, or incompatible execution configurations.

[^evm]: Ethereum documentation, [“Ethereum Virtual Machine (EVM)”](https://ethereum.org/developers/docs/evm/), particularly the state-transition function and implementation requirements. Ethereum execution is stateful and protocol-verifiable; it is not stateless because transactions can be atomic.

[^mev]: Ethereum documentation, [“Maximal extractable value (MEV)”](https://ethereum.org/developers/docs/mev/). The discussion of inclusion and transaction ordering explains why a common ledger does not remove economic sensitivity to execution order.

[^aws-capacity]: AWS, [“Reserve compute capacity with EC2 On-Demand Capacity Reservations”](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html), including the comparison with Savings Plans and Reserved Instances. See also [“Amazon EC2 billing and purchasing options”](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html). Spending discounts and capacity entitlements are distinct and can be combined where applicable.

[^aws-spot]: AWS, [“Spot Instances”](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html). Describes EC2-set prices, gradual adjustment based on long-term supply and demand, spare capacity, and interruptibility.

[^reserved]: OpenAI, [“Reserved Tier for API Customers”](https://openai.com/api-reserved-tier/). Describes prepurchased model-specific throughput, peak-load priority, and pay-as-you-go treatment of overage. The relevant service terms apply; the essay does not interpret capacity priority as a guarantee of a successful business outcome.

[^flex]: OpenAI, [“Flex processing”](https://developers.openai.com/api/docs/guides/flex-processing). Describes lower costs in exchange for slower responses and occasional resource unavailability.

[^best-execution]: FINRA, [Regulatory Notice 21-23](https://www.finra.org/rules-guidance/notices/21-23), June 23, 2021, “FINRA Reminds Member Firms of Requirements Concerning Best Execution and Payment for Order Flow.” The essay uses this dated guidance as a market-design comparison, not a claim that securities-law duties apply to inference routers. The proposed inference standard is the author's recommendation.

[^ad-rank]: Google Ads, [“About Ad Rank”](https://support.google.com/google-ads/answer/1722122?hl=en). Describes an auction ranking that incorporates bids, quality assessments, and contextual factors. Multidimensional scoring and auction mechanisms can coexist.

[^stripe]: Stripe, [“Stripe agrees to acquire OpenRouter to help businesses optimize token routing and usage”](https://stripe.com/newsroom/news/stripe-agrees-to-acquire-openrouter), August 19, 2026. This is an announcement of an agreement, not evidence of closing, a specific rebate arrangement, or biased routing. The announcement also emphasizes neutral infrastructure.
