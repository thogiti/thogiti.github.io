---
title: "Cheap Generation and the Fragility of Understanding"
subtitle: "Why AI might not automatically couple truth to value"
date: 2025-12-31
author: Nagu Thogiti
tags: AI ML Machine-Learning Epistemology Incentives World-Models Education Societal-Impact AI-Ethics Fragility-of-Understanding
---

A sentence keeps showing up in conversations about AI, usually with optimism:

> “When memorization becomes cheap, understanding becomes valuable.”

Sometimes it shows up in technical clothing:

> “When code production becomes cheap, verification becomes valuable.”

The claim sounds like simple economics: when one thing gets cheaper, the scarce thing becomes more valuable.  
But that story smuggles in a premise: that rewards will move toward understanding on their own.

They might. They also might not.

Because “value” comes in two different kinds.

---

## Two kinds of value

There is **market value**: salary, prestige, promotions, funding, attention.

And there is **intrinsic utility**: the thing that keeps the plane in the sky.

The optimistic quote assumes these stay aligned. It assumes institutions and markets reliably identify and reward verification, judgment, and accountability.

My worry is simpler: verification can be underpriced for a long time. Feedback arrives late. Costs are distributed. Someone else eats the failure. In that world, “good enough” can win for years.

---

## The terminal, the agent, and learning-by-inspection

A new pattern is spreading.

Someone spends billions of tokens in a few months, entirely through a terminal. An AI agent writes code they couldn’t have written themselves. They ship a personal site, CLIs, internal tools adopted by their team, a “wrapped” product, automation experiments, even trading and monitoring systems.

They say something that matters:

*“I don’t read the code. But I read the agent output religiously.”*

The workflow is familiar by now: spin up a repo, feed context, interrogate the plan, link docs, let the agent run, watch the stream, interrupt when it fails, run the server, test, iterate. Then tune an `agents.md` so next time starts cleaner. Add end-to-end tests because you’re tired of bugs that should have been caught.

This resembles apprenticeship, but the resemblance is dangerous.

In apprenticeship, a master passes down grounded competence. Here, the “teacher” is a probabilistic engine. The human learns by running a loop: propose, build, break, patch, repeat.

It’s less “learning from a master” and more **learning by inspection inside a cybernetic loop**.

That loop can teach real things. It can also create a convincing feeling of mastery before you’ve built a model that survives contact with reality.

People begin to confuse three different outcomes:

- **Shipping**: delivering artifacts that run
- **Learning**: improving through feedback and iteration
- **Understanding**: carrying a predictive model that still works when conditions change

>A note of grounding: large-scale studies that categorize LLM-generated code failures show the pattern you’d expect—models can produce runnable code while still systematically missing deeper failure modes. One survey-style deep dive cites work that manually examined hundreds of LLM-generated-code bugs and grouped them into recurring mistake categories.[^1]

---

## What has become cheap (and what hasn’t)

AI lowers the cost of producing plausible artifacts.

Code that compiles.  
Plans that persuade.  
Features that demo.

What it does not lower, by default, is the cost of forming an internal model of what you built: its assumptions, its invariants, its failure modes, the places where the world punches through your abstractions.

The agent can outpace your model-building. That gap is where fragility accumulates.

---

## Understanding is world-model quality

Understanding isn’t a mood. It’s not “I feel like I get it.” It’s the ability to predict what happens under change.

Most serious failures are not syntax errors or clean logical contradictions. They are mismatches between a system’s internal model and the world it’s embedded in.

And the world is not binary. “True” and “false” often sit at the end of long chains: measurement, context, incentives, and interpretation. Understanding lives inside those chains.

---

## A small thought experiment: software lives in time

Imagine you build a small service with an agent. It watches signals, makes a decision, takes an action. Locally it works. In a staging environment it works. You deploy it and it works again.

Now change one boring variable:

Time.

In your editor, the agent sees static files and a static window of context. In production, software lives in time. Events overlap. Requests race. A webhook retries. A process restarts between “read” and “write.” Nothing adversarial. Just normal operations.

The system still “works” most of the time. It even looks correct if you only check outcomes casually. But somewhere in the middle, state updates twice, or not at all, or in the wrong order.

A shallow model says: “If A, then B.”  
A world model asks: “If A happens, and B happens halfway through, and C fails, what state is D in?”

That gap between static text and dynamic time is where fragility hides.

This is why tests can feel like wisdom. Not because they’re morally good, but because they force your model to face concurrency, retries, partial failures, and drift.

---

## When shipping is learning (and when it isn’t)

The terminal-and-agent workflow can teach you quickly.

You ship ahead of your competence. You fail. You ask “why did this break?” Your model thickens.

But shipping can also become a trap: you can produce many artifacts while never building the kind of model that anticipates the failures that matter. Especially outside the patterns the agent is good at reproducing.

This is where a new “technical class” emerges: people who can drive agents well and ship rapidly, but whose depth depends on whether their loop includes real stress-testing, not just iteration until the demo passes.

---

## A minimal incentive model: why slop can win

Return to the market-value claim.

Let artifact production be cheap. Let verification stay expensive. Let failures show up late, after promotions, funding rounds, launches, and press.

If rewards track visible output more than verified correctness, output becomes the rational strategy. Verification becomes a cost with uncertain payoff.

Write it as a crude utility:

$$
R = \alpha \cdot O - \beta \cdot C
$$

$O$ is visible output. $C$ is the cost of verification.

If error costs arrive late, or are hard to attribute, or are paid by someone else, $\beta$ is effectively discounted. The system selects for output-heavy behavior even if long-run value collapses.

This doesn’t produce immediate chaos. It produces drift.

And drift can look like progress: faster shipping, smoother narratives, more plausible artifacts.

Until the bill arrives.

If you want a concrete image: **Knight Capital**. On August 1, 2012, a routine software deployment activated a defective code path in Knight’s automated router. In the first 45 minutes of trading it sent more than 4 million unintended orders while attempting to fill 212 customer orders, built massive unwanted positions, and lost more than $460 million. The same day, internal systems generated 97 automated emails flagging an error condition before the market opened, but they weren’t treated as actionable alerts [^2].

The system didn’t fail gradually. It failed suddenly, precisely because its fragility had been masked by years of normal operations and unheeded warnings.

A compact sketch:

| Factor | Pre-AI | Post-AI |
|--------|--------|---------|
| Artifact production cost | High | Low |
| Verification cost | High | Still high |
| Reward tied to output vs. truth | Loose | Often looser unless mandated |
| Likely outcome | Slow drift | Faster drift |

A fair objection is that AI can also lower verification costs: tests, static analysis, formal methods, anomaly detection. It can. But only if verification is required. Otherwise it lowers the cost of both truth and plausible nonsense, and selection follows what gets rewarded.

---

## The manifold: where AI is safe, and where it doesn’t know it’s lost

A language model is trained to predict the next token. In effect it learns what continuations look plausible under its training distribution[^3].

Inside that distribution, it can be astonishingly helpful. Outside it, something else happens: the model keeps producing fluent output even when it has lost its footing. It has no built-in “you are off the map” sensor.

Think of the manifold as the safe zone where real examples cluster.

![AI pper manifold metaphor](/assets/images/2026/AI-paper-manifold-metaphor.png)

*Source: Image generated by Google Gemini AI*

*(Picture a thin, crumpled sheet of paper floating in a large empty room. The paper is the manifold: the region where data lives and patterns are supported. The empty air is the space of possible nonsense. The model is trained to continue curves on the paper; it will extend the curve into the air with the same confidence.)*

That is how “AI slop” appears: fluent language with weak grounding. Not deception. Optimization under a proxy objective.

---

## Institutions have manifolds too

Organizations develop their own safe zones.

Past successes define “what works.” Metrics define what gets rewarded. Behaviors that match the proxy survive.

Inside that zone, decisions feel reasonable. When the world shifts, the proxy can break. The organization keeps optimizing it anyway because that’s how the reward function is set.

AI accelerates this failure mode. It increases the rate of plausible production inside the institution’s manifold without improving the institution’s world model.

---

## Cargo cult epistemology, updated

Richard Feynman’s warning was about adopting the forms of knowledge without the discipline that keeps you honest.

In his 1974 “Cargo Cult Science” talk, he put the first principle plainly: you must not fool yourself, because you are the easiest person to fool[^4].

AI makes it easier to fool ourselves at scale.

You can generate the language of insight without the structure of insight. You can ship confidently without knowing where the system breaks.

The risk is not that AI is wrong.  
The risk is that institutions stop paying for the work that would find out where it is wrong.

---

## What this means for education

Education, at its best, trains world models.

A student who memorizes formulas can produce answers. A student who can predict what happens under change has understanding.

AI makes answers cheap. It doesn’t make world models cheap.

If schools reward fluent output rather than model quality (prediction under altered conditions, experiment design, failure analysis), AI will push learners toward the easiest path: producing plausible artifacts inside familiar manifolds.

If schools reward confrontation with reality, AI can help. The tool isn’t the deciding factor.

The incentive structure is.

---

## Returning to the original claim

So return to the original sentence:

> “When memorization becomes cheap, understanding becomes valuable.”

That is not a law of nature. It is a conditional statement.

Understanding becomes market valuable only when systems are built to notice it, reward it, and keep it coupled to reality. Without that coupling, cheap generation competes with understanding instead of elevating it.

The models aren’t confused. They optimize the objective we give them.

The crisis begins when we confuse their optimization for our understanding.

So the real question stays the same:

**What incentive structures keep truth coupled to reward?**

## References
[^1]: [A Deep Dive Into Large Language Model Code Generation Mistakes: What and Why?](https://arxiv.org/html/2411.01414v2)

[^2]: [In the Matter of Knight Capital Americas LLC](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf)

[^3]: [The Bayesian Geometry of Transformer Attention](https://www.arxiv.org/abs/2512.22471)

[^4]: [Richard Feynman: 'The first principle is that you must not fool yourself.' Cargo-Cult Science speech, Caltech - 1974](https://speakola.com/grad/richard-feynman-caltech-1974)