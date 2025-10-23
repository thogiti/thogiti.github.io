---
title: Equivocation Detection & Slashing in MonadBFT - Game Theory & Mechanism Design Analysis - PART 1
tags: monad monadbft High-Performance-Consensus mechanism-design MEV Monad-MEV monad-equivocation monad-slashing monad-slashing-mechanism mechanism-design MEV equivocation slashing
---


One-round confirmation ([speculative finality](https://docs.monad.xyz/monad-arch/consensus/monad-bft)) in MonadBFT is only honest if equivocation is economically self-defeating. If a client can act after a single QC ([Quorum Certificate](https://docs.monad.xyz/monad-arch/consensus/monad-bft)), then any attempt to sign two conflicting histories must be so expensive that no rational validator tries. That’s a mechanism-design statement, not just a protocol claim: the expected value of equivocation must be negative in the tails, not just on average.

The MonadBFT [paper](https://arxiv.org/abs/2502.20692) points the way, early confirmation reverts only with accountable evidence, but today’s code doesn’t yet implement that receipt into punishment. Evidence hooks exist in the codebase; a slash function does not. The system is safe in the BFT sense; it is not yet economically accountable. In a high-throughput chain where MEV concentrates, that gap matters.

The economics fit on a napkin:
$$
\mathrm{EV}(\text{equivocate}) = \mathrm{MEV}_{\text{now}} - D \cdot P + \delta \cdot \mathbb{E}\big[u^{\text{post-slash}}\big].
$$

If detection $D$ is optional, then $D<1$. If penalties $P$ are sized to the median, not the tail, $\mathrm{MEV}_{\text{now}}$ will sometimes win. Optional detection plus bounded slashing cannot deliver DSIC; you can always find a large enough MEV spike to make deviation pay in expectation. Mandatory detection and tail-aware penalties can.

This blog post attempts to turn accountability into a concrete mechanism that can protect MonadBFT’s one-round UX. We map what the paper guarantees to what the code must do, show why Ethereum’s public-goods slasher fails here, borrow the parts of Tendermint that scale, and price the remaining risk with penalties sized to multi-block windows, not medians. By the end, the inequality above will point the right way.

---

## 1) A compact game-theoretic frame

Let's model MonadBFT validators as long-lived agents with per-view utility
$$
U_i = \text{fees}_i + \text{rewards}_i - \text{costs}_i - \text{slash}_i + \text{MEV}_i.
$$

Facing an equivocation opportunity, validator $i$ weighs:

* $D \in [0,1]$: probability the equivocation is detected,
* $P$: penalty (stake units) if detected,
* $\mathrm{MEV}_{\text{now}}$: immediate gain,
* $\delta \in (0,1)$: discount on future utility,
* $\mathbb{E}[u_i^{\text{honest}}]$, $\mathbb{E}[u_i^{\text{post-slash}}]$: continuation values.

Then, we have, the expected utility from deviating:
$$
\mathbb{E}\big[u_i(\text{equivocate})\big] =
\mathrm{MEV}_{\text{now}} - D \cdot P + \delta \cdot \mathbb{E}\big[u_i^{\text{post-slash}}\big].
$$

This formula says what a validator “makes” from cheating: a quick MEV windfall, minus the chance of getting caught times the penalty, plus whatever future income remains after being punished. 

Economic safety for one-round speculation requires

$$
\boxed{\mathbb{E}\big[u_i(\text{equivocate})\big]
< \delta \cdot \mathbb{E}\big[u_i^{\text{honest}}\big]}
$$

to hold under realistic tail MEV. The mechanism’s job is to make this inequality robust.

The boxed inequality says this bet must be worse than just staying honest, even when MEV is unusually large. In other words: set detection and penalties so that equivocation is a losing trade on expectation, while honest validators keep their steady future rewards.

With the calibration target defined, the next question is simple: how do real systems set the two knobs that matter, detection probability $D$ and penalty $P$? 

Ethereum and Tendermint make opposite architectural choices here, and those choices largely determine their incentive properties. We start with Ethereum.

---

## 2) Ethereum’s mechanism design

In Ethereum, equivocation detection sits outside the consensus hot path as a separate “slasher” service that only some operators run. That placement turns detection into a public good, costly to provide, easy to free-ride on, and the incentives follow.


### The slasher’s dilemma

Ethereum’s approach to equivocation detection creates a public-goods problem. Running a slasher requires maintaining a large historical index ([often 1 TB on mainnet](https://prysm.offchainlabs.com/docs/configure-prysm/slasher/)) and comparing it against new attestations and proposals. The benefit is network-wide; the cost sits with the operator. The direct incentive is a whistleblower reward of $1/512$ of the slashed validator’s effective balance (about $0.06$ ETH on a 32 ETH slash). On a healthy network, equivocations are rare, so revenue is small while infrastructure cost is not.

The rational response is to free-ride. In practice, only a minority of operators run slashers; assume 10% for illustration. Attackers can now price detection: $D \approx 0.1$.

### Impact of low detection probability

Consider a $10$ ETH MEV opportunity. With $D = 0.1$ and a full-stake penalty $P = 32$ ETH,
$$
\mathrm{EV}(\text{equivocate}) \approx 10 - 0.1 \cdot 32 = 6.8\ \text{ETH} > 0,
$$
so the attack is profitable in expectation.

This is incompatible with one-round UX. If clients are to trust a single-round QC, validators must face overwhelming expected loss for equivocation. Optional detection cannot deliver that.

> **What’s wrong with Ethereum’s approach to slashing?**
> Ethereum’s slasher is a classic public-goods problem. Running it costs thousands annually but generates maybe $100 in whistleblower rewards. Only ~10% of validators run slashers, so detection probability is ~10%. I showed this breaks DSIC—for any finite slashing penalty, you can find an MEV opportunity large enough to make attacks profitable in expectation. The fundamental issue: optional detection with bounded slashing cannot achieve DSIC. Mandatory detection is necessary. MonadBFT can’t make the same mistake.

---

## 3) Tendermint’s mechanism design

Tendermint embeds detection in the hot path: nodes check for conflicting signatures at the same height/round with constant-time lookups. For anything broadcast, $D \approx 1$. A modest penalty $5%$ plus permanent exclusion is already enough because the attacker also forfeits the present value of future rewards. The lesson is architectural, not numeric: detection must be universal, cheap, and automatic.

---

## 4) Why MonadBFT raises the bar

There are three Monad-specific properties that matter:

* One-round speculation. Clients act on a QC; transient splits have real cost unless deviation is strictly loss-making in expectation.
* Tail-fork surface. Without enforceable extend-or-explain, a leader could abandon a predecessor and harvest MEV across multiple blocks, compounding gains.
* Throughput. High TPS increases per-block value and the size of rare but fat-tail MEV events.


These three pressures do more than motivate the problem; they pin down the levers we need to set. We must drive detection probability to $D \approx 1$ in the hot path, keep the fork influence window $w$ small via extend-or-explain (QC/TC/NEC), and size penalties so that $\phi_{\text{block}} \cdot s_i > w \cdot M_b + \kappa$ on tail events, not just on the median day. 

The next section turns that into a concrete mechanism: where detection lives, how evidence moves, who gets paid for reporting, and how $\phi$ is calibrated so that “follow the spec” is strictly dominant.


---

## 5) A mechanism that makes honesty strictly dominant


With the knobs identified, the first to turn is detection: if $D$ isn’t effectively 1, no choice of $\phi$ or $w$ will rescue the incentive inequality, so we begin with mandatory detection.


### 5.1 Mandatory detection in the validator fast path

Use an epoch-scoped detector keyed by $(\text{round}, \text{validator})$ for proposals, votes, and timeouts. On seeing a second, conflicting signed message for the same key:

1. synthesize a self-contained proof (the two signed statements plus minimal domain context),
2. carry it in the proposer’s evidence section for block inclusion.

No separate slasher service is needed here. With this, checks are constant-time map hits; memory is bounded to the current epoch.

### 5.2 Evidence rides in blocks (no timing games)

Evidence is validated alongside transactions. Blocks reject stale or incomplete proofs. Inclusion is mandatory; the chain pays the first reporter embedded in the evidence (next subsection). There is no incentive to wait for “my slot,” and proposers cannot steal credit.

### 5.3 Reporter attribution and modest rewards

The evidence object includes a reporter signature over the proof hash; the staking contract pays that reporter on slash. A 10% bounty keeps detectors eager without skewing incentives. The remaining 90% is burned or redistributed.

### 5.4 Penalties sized to Monad’s tails

Let

* $s_i$: stake of validator $i$,
* $M_b$: a high-quantile per-block MEV tail (e.g., 99.5th percentile), measured on testnet,
* $w$: the effective influence window (in blocks) before Monad’s extend-or-explain path collapses a deviation (TC/high-tip/NEC rules),
* $\kappa \ge 1$: compounding factor for cross-block effects (e.g., predecessor + current),
* $\eta > 0$: safety margin for estimation error.

We can write the worst plausible multi-block haul as:
$$
M^\star = (1+\eta) \cdot \kappa \cdot w \cdot M_b.
$$

With mandatory detection $D \approx 1$ and block-equivocation penalty $P = \phi_{\text{block}} \cdot s_i$,
$$
\text{Deterrence:}\qquad
\phi_{\text{block}} \cdot s_i \ge M^\star
\quad\Longrightarrow\quad
\boxed{\phi_{\text{block}} \ge \dfrac{(1+\eta)\cdot \kappa \cdot w \cdot M_b}{s_i}}.
$$

Why this lands in the $15$–$20$% band on a high-MEV chain:

* If tail blocks reach $M_b \approx 1$–$2%$ of a typical validator’s stake,
* protocol recovery keeps $w$ in the low single digits (say $3$–$5$),
* and $\kappa \approx 1.2$, $\eta \approx 0.25$,

then $\phi_{\text{block}}$ must clear roughly $0.01 \times 3 \times 1.2 \times 1.25 \approx 4.5%$ on the low MEV assumption and moves into low teens on the high assumption. Add margin for correlated spikes and partial partitions, and a $15$–$20$% band cleanly dominates $M^\star$ without extreme values.

For less profitable deviations, use the same logic with smaller $w$ and $M_b$:

* Vote equivocation: no direct multi-block MEV; $w \approx 1$. Set $\phi_{\text{vote}}$ to $5$–$10$% to dominate plausible coordination/bribery gains.
* Timeout equivocation: tiny $M^\star$, mostly timing leverage. Set $\phi_{\text{to}}$ to $1$–$3$% to erase the edge.

These are not arbitrary ranges; they follow from the bound above with Monad-realistic $(M_b, w, \kappa, \eta)$.

### 5.5 Two distinct subgames

These below two cases cover the only economically relevant ways a leader can “skip” a predecessor at a given round: a harmless omission that the TC/High-Tip machinery repairs, and a true same-round conflict (equivocation) that yields a cryptographic proof and must be priced by $\phi$ as in § 5.4.


* Omission without equivocation (not slashable). A leader fails to extend the predecessor. Honest validators time out; the TC exposes the high tip; the next leader reproposes the predecessor. Payoff: zero.
* True equivocation (slashable). A leader signs two conflicting proposals (or votes/timeouts) for the same round. The conflict is self-authenticating; with $\phi$ from § 5.4, the payoff is negative.

Monad’s protocol already empties the first subgame; slashing must empty the second.

---

## 6) Some Scenarios

In what follows we just plug the decision rule from § 1 into the calibration from § 5.4 and check the sign of the payoff. By varying $\mathrm{MEV}_{\text{now}}$, $\phi$, $D\approx 1$ and the influence window $w$, the three mini-scenarios show that equivocate is strictly dominated once $\phi_{\text{block}} \gtrsim \tfrac{(1+\eta)\cdot \kappa \cdot w \cdot M_b}{s_i}$. Each case corresponds to the two behaviors separated in § 5.5 (harmless omission vs. true same-round conflict) plus a collusive double-spend.


### 6.1 Rational MEV extraction

Stake $s_i = 100$ ETH, one-off MEV $= 5$ ETH, $\phi_{\text{block}} = 10%$.

* Honest: propose once; collect reward + MEV $\approx 5.1$ ETH.
* Equivocate: at best collect $5$ ETH before detection; then lose $10$ ETH to slashing. Net $= -5$ ETH.

Even at $15$ ETH MEV, honest wins: $15.1$ vs. $15 - 10 = 5$ ETH.

### 6.2 Coordinated double-spend

Three validators of 100 ETH attempt conflicting finalization for a 50 ETH double-spend.

* Immediate: gain $50$; lose $3 \times 10 = 30$ ETH to slashing (take $\phi_{\text{vote}} = 10%$).
* Future: likely exclusion; forfeit multi-year rewards (the $\delta$ term).
* Net: strongly negative once the discounted future enters.

### 6.3 Tail-forking for multi-block MEV

Without extend-or-explain, a leader could abandon a predecessor and re-include its payload. Monad’s TC/high-tip/NEC rules force reproposal, shrinking $w$. If the attacker also equivocates to prolong the fork, the proof is slashable; with $\phi_{\text{block}} \ge 15%$ the strategy is dominated by design.

---

## 7) Where this meets the paper’s theorems

With the knobs now calibrated (§5–6), we can line them up against the MonadBFT paper’s guarantees and see how each theorem constrains the key term $w$ and completes the deterrence inequality from § 1.

* **No-Tail-Forking (NTF).** Theorem 1’s extend-or-explain rule (re-propose the high tip or present an NEC) blocks profitable abandonment and caps $w$ in § 5.4. If $w$ were large, $\phi$ would need to be extreme; NTF keeps $\phi$ reasonable.
* **Accountable speculation (Theorems 2–3 + Corollary 1).** Early confirmations revert only with receipts (conflicting signatures). The mechanism here turns those receipts into enforcement: evidence in blocks, near-certain detection, near-certain penalty, and a paid reporter. That is why clients can act on one round.
* **Optimistic responsiveness (Theorem 4).** Post-GST, progress runs at event speed. Evidence inclusion shares the same path; time-to-justice is one or two rounds in the healthy regime. The one-round UX remains intact.

Treat this as a division of labor: the theorems constrain dynamics (they bound $w$ and the forms of rollback); the mechanism prices the residual so the inequality in § 1 holds even in the tails.

---

## 8) A compact comparison

With the mechanics and deterrence math in place, here’s a compact comparison of how Ethereum, Tendermint, and the proposed MonadBFT line up on the levers that matter.

| Feature            |           Ethereum PoS |         Tendermint |                                      MonadBFT (proposed) |
| ------------------ | ---------------------: | -----------------: | -------------------------------------------------------: |
| Detection          |        Optional, heavy | Mandatory, in-path |                                       Mandatory, in-path |
| $D$                |          Low, variable |        $\approx 1$ |                                              $\approx 1$ |
| Evidence transport | Gossip; proposer picks |           In block |                           In block (first-reporter paid) |
| Penalty sizing     |                  Mixed |   5% (double-sign) | Tail-aware: 15–20% (block), 5–10% (vote), 1–3% (timeout) |
| One-round UX       |           Incompatible |                N/A |                                             Primary goal |

---

## 9) Risks and how to blunt them

With the mechanism specified, the practical question to ask is what can still go wrong and how to neutralize it in the implementation path.

- False positives. Slash only on complete cryptographic contradictions: two signed messages by the same key, same domain (height/round/role), different digests. Make that minimality explicit in the evidence format and verifier. Fuzz parsers; add property tests for every evidence path. If a proof cannot stand alone, it cannot slash.

- Evidence games. Treat evidence as first-class block content and pay the first valid reporter encoded in the proof. That removes “wait for my slot” timing games and prevents proposers from stealing attribution. Cap evidence items per block and rate-limit invalid submissions so junk cannot crowd the hot path.

- Partitions. Accept only epoch-fresh evidence with a small grace window. Never slash on unverifiable hearsay. When partitions heal, valid proofs remain valid; invalid ones stay inert.

---

## 10) What to measure on testnet

Good mechanisms leave fingerprints; this section lists a few metrics that should move if the design is working.


- Time-to-justice. Timestamp first detection and the block that carries the proof. In steady state, one–two rounds is the target. Publish the distribution.

- Overhead. Track per-message detector latency and heap growth of the “seen” maps over a busy epoch. Detection must not worsen commit-latency tails; if it does, shift non-critical work off the hot path.

- Tail calibration. Treat $\phi$ as an empirically tuned parameter. Estimate $M_b$ and observed $w$ under adversarial sims (conflicting proposals/votes/timeouts). Omission without equivocation should yield zero profit after TC/high-tip recovery; true equivocation should yield negative value after slashing. Keep
$$
\phi_{\text{block}} \gtrsim \frac{(1+\eta)\cdot \kappa \cdot w \cdot M_b}{s_i}.
$$

---

## Closing

MonadBFT already narrows the strategy surface with extend-or-explain and fast public signals. The missing layer is accountability that matches the consensus core: universal, cheap detection; evidence that rides the same pipeline as blocks; and penalties sized against worst-case windows, not medians. When we do all of that, and the inequality in § 1 holds where it matters, the tails, so “one round” speculative finality becomes a sound default.

In the Part 2 of the blog, I will explore the formal mechanism design analysis of this proposal and derive some necessary theorems and properties to study performance, liveness safety, robustness, and security.

---

## Appendix: implementation sketch

**Validator-side detector (epoch-bounded)**

```rust
struct EquivocationDetector {
    seen_prop: HashMap<(Round, ValidatorId), BlockHash>,
    seen_vote: HashMap<(Round, ValidatorId), Digest>,
    seen_to  : HashMap<(Round, ValidatorId), TimeoutDigest>,
    epoch: Epoch,
}

impl EquivocationDetector {
    fn on_proposal(&mut self, p: &Proposal) -> Option<Evidence> {
        let k = (p.round, p.author);
        if let Some(prev) = self.seen_prop.insert(k, p.block_hash) {
            if prev != p.block_hash {
                return Some(Evidence::block_equiv(p.clone(), prev));
            }
        }
        None
    }
    // analogous on_vote, on_timeout ...

    fn on_epoch_change(&mut self, e: Epoch) {
        self.seen_prop.clear();
        self.seen_vote.clear();
        self.seen_to.clear();
        self.epoch = e;
    }
}
```

**Block format & slash execution**

```rust
struct Block { parent: Hash, txs: Vec<Tx>, evidence: Vec<Evidence> }

fn process_evidence(ev: &Evidence) -> Result<()> {
    let slash = calc_slash(ev.kind);              // maps to φ_block, φ_vote, φ_to
    credit(ev.reporter, slash / 10);              // 10% bounty
    burn_or_redistribute(slash - slash/10);       // remainder
    apply_penalty(ev.offender, slash);
    Ok(())
}
```
