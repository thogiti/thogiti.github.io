---
title: ADL Trilemma, Assumption J.3, and Dan Robinson’s Critique and Tarun's Paper Fixes
date: 2025-12-14
author: Nagu Thogiti
tags: Autodeleveraging Hyperliquid ADL ADL-trilemma Tarun-Chitra-ADL ADL-queue ADL-pro-rata Drift-ADL Dan-Robinson
---

## TL;DR: Who’s right about the ADL trilemma?

A lot of people are tired already, so here’s the scoreboard up front.

* **Dan is right that:**

  * The “ADL trilemma” in Tarun’s paper does **not** apply to all perp venues in all regimes.
  * The trilemma only bites when the exchange is in a structural deficit regime: expected tail shortfalls are bigger than what you can sustainably cover from fees.
  * The original Assumption J.3 was written in a way that makes it *look* circular: the “max sustainable fee diversion” constant wasn’t tied clearly to any economic object like long-term value (LTV).

* **Tarun is right that:**

  * In the regime where major perp venues actually operate (high leverage, heavy tails, limited insurance), there is a real tradeoff between:

    * (S) solvency,
    * (F) fairness to winners, and
    * (R) preserving long-term exchange revenue.
  * You **cannot fix** an under-insured, high-leverage design purely by picking a “better ADL queue.” Policy choice helps, but it doesn’t make the structural deficit disappear.
  * This is exactly the kind of **conditional impossibility** result you see in other fields (CAP theorem, Mundell–Fleming): once you assume a certain regime, you can’t have all three nice properties at once.

* **What actually needs fixing in the paper:**

  1. Rename **Assumption J.3** and tie it explicitly to economics: a *“High-Leverage Structural Deficit”* where expected shortfall rate $\mu_-$ is larger than the maximum fee diversion rate $\mu_\Phi$ that still preserves LTV.
  2. Say clearly: **the trilemma only applies when $\mu_- > \mu_\Phi$**. If $\mu_- \le \mu_\Phi$ (low leverage, shallow tails, big fee base), you can get solvency + fairness + revenue all at once.
  3. In the empirical section, show one concrete regime check: October 10 on Hyperliquid really did sit in $\mu_- \gg \mu_\Phi$.

So I agree with Dan that the *scope* of the theorem needs to be sharpened. I also think the **core insight** in Tarun’s paper survives once you do that.

The rest of this post explains why.

---

## 1. What the ADL trilemma actually claims

Let’s strip the jargon.

Tarun’s paper defines three goals for a perp venue:

* (S) Solvency – Very low chance of the platform going bust; small residual shortfalls when stress hits.
* (F) Fairness – Winning accounts don’t get their profits nuked; “moral hazard” is bounded (top winners keep some fixed fraction of their PnL).
* (R) Revenue – The venue doesn’t tax fees so hard (for insurance) that its **long-term value (LTV)** collapses.

The ADL trilemma in the paper is:

> In a certain regime, no *static ADL policy* can satisfy (S), (F), and (R) all at once. You can have at most two.

The regime part is what matters, and it’s exactly where the current [fight](https://x.com/danrobinson/status/2000316496866853148) is.

>“Static” here means the ADL rule (severity and ranking) is fixed in advance and doesn’t adapt to the size or history of shortfalls.

The paper models:

* A shortfall rate $\mu_-$: expected bad debt per unit of time coming from heavy-tailed price moves, high leverage, liquidation gaps, etc.
* A max sustainable insurance rate $\mu_\Phi$: the most you can skim from fees into an insurance fund *without* making your long-term platform value go down.

The key assumption is:

$$
\mu_- > \mu_\Phi.
$$

This is what the paper calls the **structural deficit regime**. Intuitively:

* The tails are so fat (or leverage so high, or both) that
  *even if you push insurance funding to the economic limit*,
  the expected shortfalls are still larger.

The trilemma then says:

* In that regime, you **cannot**:

  * keep the platform solvent (S),
  * keep winners protected from deep haircuts (F),
  * and keep fee diversion small enough to preserve LTV (R).

You are forced to break at least one of these.

This is not “ADL is bad.” It’s “if you choose to live in a structurally under-insured, high-leverage world, ADL choice alone cannot save you.”

---

## 2. Dan’s “circularity” critique

Dan’s main [claim](https://x.com/danrobinson/status/2000316496866853148) is:

> The trilemma is vacuous because Assumption J.3 is defined so that the theorem *has* to be true.

In his language:

* The paper picks a “maximum sustainable fee diversion rate” that is **exactly** the number that makes the proof go through.
* If the fee diversion that preserves solvency and fairness were actually sustainable, then the trilemma would disappear.
* So, he says, all the work is being done by how J.3 is written, not by the mathematics of the trilemma.

That’s, IMHO, a fair concern if:

* $\mu_\Phi$ is just chosen as “whatever value makes the theorem hold,” and
* there is no external meaning or discipline on what $\mu_\Phi$ is allowed to be.

In that case, the theorem would be closer to:

> “Assume that the fee diversion needed to satisfy (S) and (F) would kill revenue. Then you can’t satisfy (S), (F), and (R).”

Which is obviously too close to a restatement.

So the question is:

> Can we give $\mu_\Phi$ a **real economic definition**, independent of the trilemma proof?

If yes, then J.3 becomes an **empirical condition** (“this venue is structurally under-insured”), not a trick.

That is where the revised text comes in.

---

## 3. What J.3 *should* say: a structural deficit, not a trick

The right move is to tie $\mu_\Phi$ to **LTV**, not to the proof itself.

Here is the revised version that I think should go into the paper:

> **Assumption J.3 (High-Leverage Structural Deficit).**
> The expected tail shortfall rate $\mu_-$ exceeds the maximum fee diversion rate $\mu_\Phi$ that maintains non-negative LTV growth. Formally,
> $$
> \mu_\Phi = \sup \{ \phi \geq 0 : \mathrm{LTV}(\phi) \geq \mathrm{LTV}(0) - \epsilon \}
> $$
> for a small $\epsilon > 0$, where $\mathrm{LTV}(\phi)$ is the discounted fee flow under fee diversion rate $\phi$.
>
> This assumption captures the economic reality that fee diversion reduces trader participation (via churn), which in turn erodes future revenue. It is **not** a tautology; it is an empirically falsifiable condition. If an exchange operates in a regime where $\mu_- \leq \mu_\Phi$, the trilemma does not bind.

Key points:

* $\mu_\Phi$ is now defined **outside** the impossibility proof. It’s about how fee diversion affects trader behavior and future cash flow.
* “Non-negative LTV” is a constraint any exchange can compute or estimate from its own data.
* The inequality $\mu_- > \mu_\Phi$ is now a **testable property of the venue**, not something set by fiat.

If a venue measures its own $\mathrm{LTV}(\phi)$ curve and finds that it can sustainably divert, say, $2\%$ of fees, and also estimates $\mu_- = 0.5\%$ of fees in expectation, then it is **not** in the structural deficit regime, and the trilemma simply doesn’t apply.

That’s how you avoid circularity.

---

## 4. This is a conditional impossibility, just like other trilemmas

Dan’s critique treats “this only holds in a certain regime” as a weakness.

It’s actually the normal shape of theorems in this family.

Almost every famous “you can’t have all three” result has a **regime assumption** baked in:

| Theorem         | Regime assumption                       | What you can’t have together                     |
| --------------- | --------------------------------------- | ------------------------------------------------ |
| [CAP](https://en.wikipedia.org/wiki/CAP_theorem)             | Network partitions are possible         | Consistency + Availability + Partition-tolerance |
| [Arrow](https://en.wikipedia.org/wiki/Arrow%27s_impossibility_theorem)           | Preferences are unrestricted            | Pareto + IIA + Non-dictatorship                  |
| [Mundell–Fleming](https://en.wikipedia.org/wiki/Mundell%E2%80%93Fleming_model) | Capital is mobile across borders        | Fixed FX + Monetary autonomy + Free flows        |
| [ADL trilemma](https://arxiv.org/html/2512.01112v2#S2)    | $\mu_- > \mu_\Phi$ (structural deficit) | Solvency (S) + Fairness (F) + Revenue (R)        |

If you take away the regime assumption, the impossibility evaporates:

* CAP is “vacuous” if your database never sees a partition.
* Mundell–Fleming is “vacuous” if you have tight capital controls.
* Arrow is “vacuous” if you restrict the preference domain enough.

But nobody calls those theorems empty because of that. They’re useful precisely because:

* The regime is common in practice (distributed systems with failures, open capital markets, etc.).
* Engineers / policymakers need to know **which knob they’re giving up**.

The ADL trilemma is the same pattern:

* It does **not** claim “every perp venue in every configuration must pick only two of S, F, R.”
* It says: **if** you run high leverage on heavy-tailed assets, in a way that puts you in $\mu_- > \mu_\Phi$, **then** no static ADL policy lets you enjoy all three.

The fix is just to say that quietly and clearly in the paper, instead of trying to sound universal.

---

## 5. When the trilemma doesn’t apply (and that’s fine)

Dan’s 1.25x-leverage [thought experiment](https://x.com/danrobinson/status/2000316496866853148) is important.

Imagine:

* Max leverage on BTC is $1.25\times$.
* Liquidation engines are conservative.
* Insurance is funded modestly from fees.

Then:

* Tail shortfall rate $\mu_- \approx 0$.
* Insurance can easily cover the rare blow-up: $\mu_- \le \mu_\Phi$.
* ADL practically never fires.

In that world:

* (S) solvency is preserved by insurance.
* (F) fairness is trivial: you don’t haircut winners because you don’t need to.
* (R) revenue is fine: fee diversion is very small and doesn’t hurt LTV.

The trilemma does **not** apply there. No disagreement.

The important thing is to name that correctly:

* It’s not a “fourth leg.”
* It’s a **different operating point**: outside the high-leverage structural deficit regime.

The paper should just say:

> If you choose a low-leverage, light-tail design such that $\mu_- \le \mu_\Phi$, you can have (S), (F), and (R) all at once. The trilemma is about the high-leverage regime where $\mu_- > \mu_\Phi$.

And it should also be honest about why it studies the high-leverage case:

* That’s where Binance, Bybit, Hyperliquid, etc. actually live (25x-125x leverage).
* That’s where October 10–style events and ADL waves happen.
* The paper focuses on this regime not because it’s universal, but because it’s where user harm and platform fragility are empirically concentrated.
* That’s where users are asking, “who really pays when the music stops?”

---

## 6. The formal statement, cleaned up

For people who like the math, here’s how I’d rewrite the core of Appendix J.

### 6.1 Revised Assumption J.3

Same as above, but grouped with J.1–J.2 and clearly labeled:

> **Assumption J.3 (High-Leverage Structural Deficit).**
> The expected tail shortfall rate $\mu_-$ exceeds the maximum fee diversion rate $\mu_\Phi$ that is compatible with **non-negative LTV growth**. Formally,
> $$
> \mu_\Phi = \sup \{ \phi \geq 0 : \mathrm{LTV}(\phi) \geq \mathrm{LTV}(0) - \epsilon \}
> $$
> for a small $\epsilon > 0$, where $\mathrm{LTV}(\phi)$ is the discounted fee flow under fee diversion rate $\phi$.
>
> If an exchange operates in a regime where $\mu_- \leq \mu_\Phi$, the trilemma does not bind.

### 6.2 Revised informal trilemma in the main text

> **ADL Trilemma (informal).**
> A perpetuals venue cannot simultaneously satisfy
> (S) Solvency,
> (F) Fairness, and
> (R) Revenue
> when it operates in a **high-leverage structural deficit regime** $\mu_- > \mu_\Phi$.
>
> In low-leverage or light-tailed regimes with $\mu_- \le \mu_\Phi$, all three goals may be simultaneously achievable.

### 6.3 Revised Theorem J.7

> **Theorem J.7 (ADL Trilemma).**
> Let $(P_n)_{n\geq 1}$ be a sequence of perpetuals exchanges satisfying Assumptions J.1–J.3. For any **static ADL policy family** $(\pi_n)$ with severity sequence $(\theta_n)$, **at most two** of the three conditions (S), (F), and (R) can hold simultaneously **asymptotically** as $n \to \infty$.
>
> In particular:
>
> * (S) $\land$ (F) $\Rightarrow \neg$(R): preserving solvency and fairness requires fee diversion at (or above) $\mu_-$, which violates the LTV constraint and breaks (R);
> * (S) $\land$ (R) $\Rightarrow \neg$(F): preserving solvency and revenue forces concentrated haircuts, driving the top winners’ post-tail share (PTSR) to $0$;
> * (F) $\land$ (R) $\Rightarrow \neg$(S): preserving fairness and revenue leaves structural shortfalls uncovered, so breach probability tends to $1$.

### 6.4 New remark on the boundary

> **Remark J.8 (Regime Boundary).**
> The inequality $\mu_- > \mu_\Phi$ marks the boundary where the trilemma applies. If a venue chooses parameters such that $\mu_- \le \mu_\Phi$—for example via low maximum leverage, conservative collateral requirements, or large fee bases, then a well-capitalized insurance fund can cover shortfalls without relying on ADL. In that case, (S), (F), and (R) can all hold, and the trilemma is silent.

### 6.5 Short analogy paragraph

In the introduction or conclusion, one compact analogy is enough:

> The ADL trilemma is similar in spirit to the Mundell–Fleming trilemma in international finance. Mundell–Fleming assumes **mobile capital** and then shows you cannot simultaneously maintain a fixed exchange rate, monetary autonomy, and free capital flows. Likewise, the ADL trilemma assumes a **high-leverage structural deficit regime** and then shows you cannot simultaneously achieve solvency, fairness, and revenue with static ADL policies. Neither result is universal; both are conditional on an economically relevant regime.

---

## 7. Where this leaves the debate

If you step back from Twitter and read this like a referee report, the picture is:

* Dan correctly pointed out that the original J.3 was easy to read as “we assume exactly what we need.” That’s a valid red flag.
* Once you **attach $\mu_\Phi$ to LTV** and **state the regime up front**, the result turns into a normal conditional impossibility theorem:

  * very similar in structure to CAP and Mundell–Fleming,
  * focused on the regime where big perp venues actually operate.
* In that regime, you still face a hard choice:

  * protect solvency and winners, and your fee diversion likely eats your business;
  * protect solvency and business value, and you likely over-haircut a small set of winners;
  * protect winners and business value, and you leave the platform under-insured against rare but large shocks.

You can argue about parameter values, modeling choices, and whether static ADL is the right object. All of that is fair game.

But after the dust settles, the key point from Tarun's paper survives:

> If you run a high-leverage perp exchange in a regime where tail losses systematically outgrow sustainable insurance funding, **you can’t use ADL design alone to make that pain disappear.** You still have to decide who eats it: the platform, the winners, or the future.

That’s the uncomfortable truth the ADL trilemma is trying to make precise.
