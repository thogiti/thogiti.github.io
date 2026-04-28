---
title: The Trap of the Three Buckets - Why Human Learning May Not Fit Inside the ML Training Loop
date: 2026-04-28
author: Nagu Thogiti
tags: AI learning-theory cognitive-science intelligence sample-efficiency active-learning world-models reward-functions epistemology Feynman-style-inquiry
---

A question keeps returning in AI [conversations](https://x.com/dwarkesh_sp/status/2049232356998094998):

> Why are humans so much more sample efficient than large language models?

It sounds clean. A child sees a dog once and later recognizes other dogs. A frontier model consumes trillions of tokens and still fails in ways that feel brittle. So we ask: what is missing?

The usual answer sorts the mystery into three buckets:

1. architecture,
2. learning rule,
3. reward or loss function.

Maybe the brain uses a better architecture than transformers. Maybe it uses a better learning rule than backpropagation. Maybe it has a richer reward function than cross-entropy.

The frame feels scientific because it gives us knobs. It turns mystery into engineering.

But what if the buckets are not wrong, only too small?

What if the mistake is accepting the bucket system before understanding the phenomenon?

That is the puzzle.

>Architecture, learning rule, and reward are useful engineering handles. They may not be the right ontology for intelligence.

---

## The frame that feels obvious

Modern machine learning gives us a powerful template:

$$
\text{model} + \text{data} + \text{loss} + \text{optimizer} \rightarrow \text{trained system}.
$$

This template works. It built systems that can write code, summarize papers, translate language, and reason through problems well enough to unsettle almost everyone watching.

But a useful engineering abstraction can start pretending to be the world.

An engineering abstraction says:

> This is a useful way to build something.

An ontology says:

> This is what the thing really is.

Those are different claims.

So when we ask why humans learn differently, we have to be careful. If every answer must fit into architecture, learning rule, or reward, then we may already have assumed that biological intelligence is an ML training loop implemented in wet hardware.

Maybe that is right.

But maybe the mistake begins there.

---

## The clean version of the argument

Let’s state the reward-function argument in its strongest form.

Large language models are trained with relatively simple objectives, usually variants of next-token prediction. The loss is simple:

$$
\mathcal{L}(\theta) = - \sum_t \log p_\theta(x_t \mid x_{<t}).
$$

The model gets very good at predicting text. Humans learn something broader: goals, relevance, danger, social meaning, physical affordances, and causal structure.

So perhaps the brain’s secret is not mainly architecture. Perhaps the secret is a richer objective. Maybe the subcortical systems, casually called the “lizard brain,” provide specialized teaching signals to cortex and other higher systems. Maybe those signals behave like complex loss functions.

This is a good hypothesis. It may help build better AI.

But a Feynman move like this is to make the idea simple enough that it can break.

**Question:** What would it mean for human sample efficiency to come from a better loss function?

**Answer:** It would mean the main difference between humans and LLMs is the training signal. The learner is broadly similar in spirit, but the objective is richer, more structured, more biologically shaped.

That sounds plausible.

Now ask the dangerous question:

**What if “sample efficiency” is hiding several different things?**

---

## Sample efficiency is not one object

When people say humans are sample efficient, they often point to examples like this:

A child sees a dog once and later recognizes other dogs.

That sounds like [one-shot learning](https://en.wikipedia.org/wiki/One-shot_learning_(computer_vision)).

But the child did not begin at zero. Before seeing that dog, the child had already spent years learning objects, motion, faces, agency, sound, touch, biological movement, social attention, and the fact that the world contains bounded things that persist through time.

The “one example” sits on top of a mountain of previous structure.

It is like watching a physicist solve a problem quickly and saying: “Look, one-shot reasoning.” The speed is real, but it is parasitic on years of internalized models.

So the first mistake is to write human sample efficiency as:

$$
\text{few examples} \rightarrow \text{good generalization}.
$$

A better sketch is:

$$
\text{evolved priors} + \text{embodied experience} + \text{social curriculum} + \text{active intervention} + \text{memory} + \text{language} \rightarrow \text{apparently few-shot generalization}.
$$

The child is not a small model trained on a tiny dataset. The child is a living control system embedded in a structured world.

---

## A child is not passively sampling the internet

LLMs mostly consume static text. They do not choose which sentence to read next because they are confused by gravity. They do not poke a cup, drop it, hear it hit the floor, look at an adult’s face, and update a model of causality, surprise, danger, and social meaning at the same time.

Humans do.

A child is an experiment designer.

The child reaches, shakes, breaks, asks, imitates, hides, tests, retries, and watches what other people notice. The child changes the data distribution by acting.

Learning from intervention is different from learning from observation.

**Question:** Why is intervention so powerful?

**Answer:** Because action separates hypotheses.

If I only watch the world, many explanations can fit the same data. If I intervene, I can force the world to answer a sharper question.

A baby dropping a spoon is not merely being annoying. The baby is running physics experiments with sound, gravity, object permanence, social reaction, and agency tangled together.

That is not just better reward. That is a different learning loop.

---

## The scalar trap

When we say “[reward function](https://www.rubrik.com/blog/ai/25/reward-functions-reinforcement-fine-tuning),” we often imagine something like:

$$
\max_\pi \mathbb{E}[R]
$$

or:

$$
\min_\theta \mathcal{L}(\theta).
$$

This is useful mathematics. It can also distort the thing we are trying to understand.

Human learning may not be governed by one clean scalar objective. It may be a negotiation among hunger, pain, curiosity, attachment, imitation, status, fear, play, homeostasis, prediction, motor control, social belonging, and memory consolidation.

Sometimes these systems cooperate. Sometimes they fight.

A child may want to explore, but fear embarrassment. A teenager may understand the right answer, but optimize for status. An adult may know the long-term benefit, but choose short-term relief.

What is the reward function there?

You can always force the answer into one giant scalar. You can say the organism behaves *as if* it maximizes some implicit objective.

But that may be like saying a storm minimizes a hidden function. Maybe you can write one down. The question is whether it helps you understand the mechanism.

This is the scalar trap:

> Once every behavior can be redescribed as optimization, the word “optimization” stops explaining very much.

---

## Reward marks importance. It does not create understanding by itself.

Reward matters. It tells a system what to care about. Pain, hunger, pleasure, surprise, attachment, and social approval all shape learning.

But reward is not the same as understanding.

A child touches a hot stove and learns not to touch it again. Something else can happen too. The child can build a causal model:

$$
\text{stove} \rightarrow \text{heat} \rightarrow \text{pain/damage}.
$$

That model generalizes. It applies to candles, irons, fire, hot pans, steam, and warnings from adults.

Reward marks the event as important. The reusable power comes from the causal abstraction.

So we should separate two questions:

1. What tells the system this matters?
2. What lets the system generalize beyond the event?

Reward is strong on the first question. It does not solve the second by itself.

This is where the “better loss function” framing becomes slippery. A richer loss might improve learning signals, but the hard part is building world models that survive change.

Understanding is not repeating the rewarded behavior. Understanding is predicting what happens when the conditions move.

---

## The genome is not a zip file

Another version of the argument points to the genome.

The [human genome](https://en.wikipedia.org/wiki/Human_genome) is small compared with the parameter count of frontier models. So, the argument goes, the genome cannot store intelligence directly. It must store something compact: an algorithm, a learning rule, maybe a set of sophisticated reward functions.

Part of this is right. The genome does not contain the adult mind.

But the analogy slips.

The genome is not a compressed model checkpoint. It is not a Python script that builds intelligence in a clean machine.

It is a developmental process specification entangled with chemistry, physics, cells, bodies, hormones, nutrition, womb, parents, culture, and world.

A seed does not contain a tiny tree. It contains a process that can become a tree if the world participates.

That distinction matters.

If we imagine the genome as code, we will look for the clever function. But development is not code execution. It is self-organization under constraints.

The brain is not assembled like a laptop. It grows.

And growth uses the world as part of the computation.

---

## The learning-theory point

No learner is sample efficient for all possible worlds.

To learn quickly, a system must assume something. It must restrict the space of possibilities. It must treat some patterns as more likely than others.

Sample efficiency is the payoff from good bias.

The question is not:

> How can humans learn from so few examples?

The question is:

> What assumptions about the world do humans already bring to the table?

Those assumptions can live in body structure, perceptual systems, motor primitives, social drives, causal priors, object permanence, spatial reasoning, memory systems, cultural scaffolding, language, play, imitation, and developmental timing.

Calling all of that a “reward function” is too cheap.

It is like explaining a bird’s flight by saying “better objective function.” The bird has objectives, yes. But it also has wings, muscles, feathers, bones, air, gravity, and millions of years of selection shaping the coupling between them.

The unit of explanation is the whole system.

---

## The smallest toy that does not cheat

Let’s build a toy model, not because the toy is true, but because it forces us to name what the three-bucket frame hides.

Suppose we compare two learners.

Learner A is passive. It receives samples:

$$
x_1, x_2, \ldots, x_n
$$

and updates parameters to reduce a loss:

$$
\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}(\theta_t; x_t).
$$

Learner B is active. It has a body, memory, and an action policy. At each step it chooses an intervention:

$$
a_t \sim \pi(a \mid h_t),
$$

where $h_t$ is its history. The action changes the next observation:

$$
x_{t+1} \sim P(x \mid a_t, h_t, \text{world}).
$$

Now learning is no longer loss minimization over a fixed dataset. The learner is shaping the data stream.

That one change breaks the simplicity of the original frame.

Sample efficiency now depends on what the learner already believes, what actions it can take, what questions those actions ask the world, what the world makes observable, what social systems answer on its behalf, what memories are consolidated, and what errors are safe enough to explore.

The loss still matters. The architecture still matters. The learning rule still matters.

But they are inside a larger loop.

The full object is not:

$$
\text{model} + \text{optimizer} + \text{loss} + \text{data}.
$$

It is closer to:

$$
\text{organism} + \text{body} + \text{world} + \text{action} + \text{culture} + \text{memory} + \text{objectives}.
$$

That is harder to optimize.

It is also closer to the phenomenon.

---

## The dog example again

Return to the child and the dog.

The simple story says:

> The child saw one dog and generalized. Amazing sample efficiency.

The richer story says:

Before the dog, the child already had models of objects, animals, faces, movement, fur, eyes, sound, agency, size, danger, friendliness, naming, pointing, adult attention, and category formation.

When an adult says “dog,” the child is not receiving an isolated label. The child is binding language to a multimodal, social, embodied scene.

The word is not the data. The word is a handle placed on a world model.

That is why the child can generalize.

The label lands on structure that was already there.

This is also why language-only training is strange. Text contains shadows of embodied experience, but not the thing itself. It contains descriptions of actions, not the consequences of acting. It contains the map, not the pressure of the terrain.

LLMs learn from a civilization’s linguistic residue. Children learn inside the machinery that produced the residue.

Those are different training environments.

---

## The wrong question produces the wrong research program

The three-bucket frame asks:

> Which missing ingredient explains human sample efficiency: architecture, learning rule, or reward?

That question naturally produces a certain research program: better architectures, better optimizers, better objectives, more biologically inspired reward signals.

All of that may be useful.

But the question may still be too narrow.

A better question is:

> What kind of system learns by acting in a world, under social guidance, with evolved priors, multiple memory systems, and a body that makes some abstractions cheap?

That question points somewhere else: embodied agents, developmental curricula, active learning, causal discovery, social learning, memory architectures, self-generated experiments, world-model stress testing, multi-timescale learning, and systems that know when they are off-distribution.

The first program tweaks the training loop.

The second asks whether the training loop is a shadow of something larger.

---

## Why Feynman would be suspicious

I think Richard Feynman [style](https://www.todoist.com/inspiration/feynman-technique) of [thinking](https://www.youtube.com/watch?v=P1ww1IXRfTA) and exploring would be very useful here. 

Feynman’s style was not “use simple analogies.” That is the shallow version.

The deeper Feynman move was this:

> Do not let the name of a thing substitute for [understanding](https://www.youtube.com/watch?v=P1ww1IXRfTA) the thing.

“Reward function” can become a name that hides ignorance.

We observe rich behavior. We say: there must be a rich reward function.

But what have we explained?

If a child explores because of curiosity, is curiosity a reward? If the child imitates a parent, is imitation a reward? If the child avoids shame, is shame a reward? If the child asks a question to reduce uncertainty, is uncertainty reduction a reward?

Maybe yes.

But if every steering signal becomes “reward,” we have not discovered the mechanism. We have renamed the mystery.

The honest move is to ask:

**What exactly is being updated?**

**What information is available?**

**What intervention produced it?**

**What prior made the generalization possible?**

**What would make the learner fail?**

That last question matters most.

A theory that cannot say where it breaks is not yet a theory. It is a mood.

---

## The clean world, and the moment it breaks

In the clean ML world, learning is tidy.

There is a dataset. There is a model. There is a loss. There is an optimizer. The system improves by reducing prediction error.

In that world, the three buckets make sense.

But the clean world breaks when we try to explain human learning.

Humans regulate bodies. They seek information. They avoid danger. They imitate. They play. They sleep. They rehearse. They ask adults. They build tools. They change their environment. They inherit culture. They learn what to care about before they can explain why they care.

The system is not merely trained by data.

It participates in producing the data.

Once you see that, the old frame looks less like a theory of intelligence and more like a projection of our current machines back onto biology.

---

## What this means for AI

This does not mean transformers are bad. It does not mean cross-entropy is stupid. It does not mean scaling is over.

The [Bitter Lesson](https://en.wikipedia.org/wiki/Bitter_lesson) still bites: general methods that leverage computation keep winning more often than hand-coded cleverness.

But there is a difference between respecting the Bitter Lesson and worshiping the current loop.

The lesson is not:

> Transformers plus next-token prediction are the final form of intelligence.

The lesson is closer to:

> Systems that can learn and search at scale tend to beat systems that rely on brittle hand-designed knowledge.

A future general method may look less like passive prediction over static corpora and more like self-directed experiment design inside rich environments.

It may still use gradient descent. It may still use transformers. It may still use language.

But the emphasis may move from prediction to intervention, from datasets to worlds, from reward to relevance, from output fluency to model quality under change.

---

## A better decomposition

Instead of three buckets, I would start with seven questions.

### 1. What is the learner allowed to do?

A passive learner and an acting learner are solving different problems.

### 2. What structure does the learner inherit?

Sample efficiency comes from bias. The question is whether the bias matches the world.

### 3. What makes an error safe enough to learn from?

If mistakes are too costly, exploration collapses.

### 4. What chooses the curriculum?

A child’s curriculum is partly self-generated, partly adult-shaped, partly world-imposed.

### 5. What counts as understanding?

Not fluent output. Not familiar performance. Understanding is prediction under changed conditions.

### 6. What memory systems are involved?

Episodic memory, procedural skill, semantic abstraction, emotional salience, and motor habits do not behave like one uniform parameter store.

### 7. What is the unit of analysis?

Not just the brain. Not just the model. The unit is the coupled system: organism, body, world, culture, and time.

These questions do not fit neatly into architecture, learning rule, and reward.

That is why they are useful.

---

## The imagination shift

The old question is:

> What is the missing ingredient inside the ML loop?

The better question is:

> Why did we assume the ML loop was the right container for the mystery?

That is the imagination shift.

The ML loop is useful. But the danger of a useful lens is that after a while you stop seeing the lens.

Everything becomes architecture.

Everything becomes loss.

Everything becomes reward.

Then the world sends phenomena that do not fit, and instead of changing the frame, we stretch the words.

Curiosity becomes reward.

Embodiment becomes data.

Culture becomes pretraining.

Development becomes curriculum.

Agency becomes active sampling.

These translations are sometimes useful. They can also flatten the phenomenon.

Sometimes translation is understanding.

Sometimes it is erasure.

---

## The question that remains

So where does human sample efficiency come from?

Not one place.

It comes from the fact that humans are evolved, embodied, social, active, memory-rich world-modeling systems living inside a world whose structure they can exploit.

A reward function may be part of that. Architecture may be part of that. Learning rules may be part of that.

But none of them alone is the object.

The object is the loop.

A child does not learn the world from examples. The child enters the world, acts on it, is acted on by it, borrows other minds through language, and slowly builds models that can survive surprise.

That is why the child can learn from so little at the surface.

The surface is not where the learning began.

---

## Closing: do not mistake the handle for the machine

Architecture, learning rule, and reward are handles. Good handles. Useful handles.

But intelligence may not be the machine those handles imply.

If we treat the current ML training loop as the natural form of all learning, then every biological mystery becomes a missing hyperparameter. That is comforting. It is also dangerous.

The Feynman move is to stay with the discomfort a little longer.

Do not ask too quickly:

> Which bucket is right?

Ask instead:

> What is the phenomenon before we forced it into buckets?

A learner is not only a model minimizing loss.

A learner must decide what to notice, what to try, what to remember, what to fear, whom to trust, when to ask, when to play, when to persist, and when the world has changed enough that the old model no longer works.

That is life meeting uncertainty.

And if AI is going to become more sample efficient, more robust, and more capable of understanding rather than producing, it may need more than a better loss.

It may need a better way to meet the world.

