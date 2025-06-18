---
title:  Taming Blockchain Spam - How Capital Velocity and Cost of Capital Rewrite Fee Markets
tags: Ethereum Solana Rollups MEV blockchain-spam capital-velocity velocity-of-money cost-of-capital reduce-spam-blockchain Solana local-fee-markets multi-dimensional-fee-markets blockchain-spam-mitigation capital-velocity-DeFi cost-of-capital-spammers MEV-spam-economics
---


# When cheap block-space backfires

During Solana’s January 2022 congestion episode the success rate of ordinary user transactions fell by as much as 70% as arbitrage bots resubmitted identical orders thousands of times to maximize inclusion odds; the validator pipeline simply clogged and block production slowed to a crawl[^1][^2]. Polygon faced a different flavor of the same disease two years later: after it temporarily raised the minimum gas price to deter spam, daily transaction count collapsed by roughly 50%, proving that an indiscriminate fee hike punishes real users as much as bots[^3].

Both incidents highlight a structural weakness of modern high-throughput, low-fee chains: when block-space is close to free, flooding it with low-value transactions becomes the rational strategy for any actor competing in MEV, liquidation races, or on-chain arbitrage. Throughput improvements alone do not immunize a network against this economic feedback loop; they merely raise the ceiling on how much junk the chain can swallow before reliability breaks.

---

# A minimal economic model of spam

Suppose a bot fires off $N$ transactions per block, each with success probability $w$ and profit $P_{*}$ if it lands in the “right” slot of the ordering. The direct cost is the gas fee $G_{\text{cost}}=\text{GasPrice}\times\text{GasUsed}$. Total expected profit in that block is

$$
\Pi = N\bigl(w P_{*}-G_{\text{cost}}\bigr).
$$

As long as $w P_{*} > G_{\text{cost}}$ the bot will scale $N$ upward until some external bottleneck, CPU, mempool bandwidth or the chain’s own admission control, pushes back. Two observations make this inequality stubborn:

* **Volatility coupling.**  During market turbulence the MEV upside $P_{*}$ rises quickly. Gas prices do rise too, but empirical data show the spike in MEV often outpaces the spike in gas, keeping $w P_{*}-G_{\text{cost}}$ positive.
* **No cost of capital.**  After a transaction settles the bot immediately recycles the same principal for the next attempt. Opportunity cost is effectively zero as long as settlement is atomic and instantaneous.

Fee markets attack only the $G_{\text{cost}}$ term; they leave the second factor untouched. This single-dimensional lever therefore runs out of head-room exactly when spam pressure is highest.

---

# Velocity of money and the missing price of time

In traditional finance a trader’s cash moves at the pace of post-trade clearing, typically two business days (T+2 days). Capital therefore earns or forgoes interest during the lull; ignoring that opportunity cost is impossible. In DeFi the settlement cycle collapses to **T+0**, often inside a single transaction bundle thanks to flash-loans and atomic composability. The *velocity of money*, how many times the same coin finances economic activity per unit time, approaches infinity.

Let

$$
C_{\text{capital}} = K r T_{\text{lock}}
$$

where $K$ is the principal temporarily encumbered, $r$ a risk-free staking yield and $T_{\text{lock}}$ the period it remains illiquid. Because $T_{\text{lock}}\approx0$ on most chains today, $C_{\text{capital}}$ is virtually nil. Bots enjoy an unlimited overdraft in economic terms, limited only by gas and bandwidth.

## Velocity of money

**What it is**: In this context, the velocity of money refers to how quickly capital can be reused. In most blockchain systems, as soon as a transaction is settled, the capital used for gas fees can be immediately reused for another transaction. This creates a situation of virtually infinite velocity of money.

**How it helps spammers**: Spammers, who send thousands of transactions in a short period, take advantage of this high velocity. They can use a relatively small amount of capital to fund a massive number of spam transactions by rapidly recycling their funds. They don't need to have the total cost of all their spam transactions on hand at once.

## Cost of Capital

**What it is**: The cost of capital is the minimum return an investment must earn to be profitable. For a spammer, this is the opportunity cost of the funds they have tied up for gas fees. If that capital wasn't being used for spam, it could be earning a return elsewhere ( e.g., through staking).

**How it's linked to spam**: If the cost of capital is low, spamming is more likely to be profitable. Because of the high velocity of money, spammers don't need to tie up a large amount of capital, so their cost of capital (the potential return they are losing) is very low.

The infinite velocity of money in DeFi stems from the instantaneous and atomic nature of blockchain transactions, empowered by smart contracts and composability. Spammers leverage this by rapidly recycling their capital, minimizing the amount of capital they need to tie up at any given moment, thus lowering the effective financial barrier to sending a high volume of speculative or "spam" transactions.

---

# Adding two new fee vectors

## Mechanisms to decrease spam

The core idea for decreasing spam revolves around increasing the effective cost of capital for spammers without necessarily increasing the transaction fees for normal users. This is achieved primarily through two interconnected mechanisms.

### Increasing capital requirements (for Spammers)

**Mechanism**: Instead of just paying the transaction fee (gas), the protocol would require the transaction sender (e.g., a sequencer or the user submitting the transaction) to temporarily lock up a larger amount of capital than the actual gas fee. This locked capital would act as a collateral or reservation.

**How it deters spam**: This forces spammers to dedicate more of their total capital to funding their spam attempts. Even if the actual gas fee is low, the requirement to reserve a larger sum means that capital is temporarily unavailable for other profitable activities (like staking). This increases the opportunity cost and thus the effective cost of capital for the spammer.

### Decreasing Capital Velocity (for funds used in transactions)

**Mechanism**: This involves introducing a delay before the reserved capital (or even the change from a transaction) is fully released back to the user or made available for reuse.

**How it deters spam**:

- Imposed illiquidity: If funds are locked for, say, 10 blocks (or a certain time period), they cannot be immediately recycled to fund the next spam transaction.

- Increased opportunity cost: This extended illiquidity directly increases the cost of capital for spammers. While their funds are locked, they are missing out on potential yield or other arbitrage opportunities.

- Differential impact: Normal users who typically send one transaction and wait for its confirmation before sending another would be less affected by such a delay. Their workflow naturally includes waiting. However, spammers, who often send many concurrent, speculative transactions hoping one lands, would be heavily impacted because their capital would be tied up across numerous simultaneous attempts, preventing them from recycling it quickly.

Now, let's formalize these two mechanisms with Mathematics.

## Formalize the mechanism
A more robust defense prices not only *computation* (gas) but also *liquidity* (capital) and *time* (velocity). Concretely:

| Vector                                   | Mechanism                                                                                         | Economic effect                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Capital requirement** $K_{\text{req}}$ | Escrow a multiple of the maximum gas at transaction *inclusion*. Unused margin is refunded later. | Raises $K$ in $C_{\text{capital}}$.    |
| **Reuse timeout** $T_{\text{lock}}$      | Delay refund of that margin for a fixed number of blocks.                                         | Restores a positive $T_{\text{lock}}$. |

With both levers the profitability test becomes

$$
w P_{*} \;\le\; G_{\text{cost}} + K_{\text{req}} r T_{\text{lock}},
$$

so a protocol can kill spam by making either $K_{\text{req}}$ or $T_{\text{lock}}$ grow until the right-hand side outruns the left—*without* touching the base gas price that every honest user pays.

---

# Monad’s architecture as a working example

Monad is a good example to illustrate how these two mechanisms work in practice. 

Monad decouples consensus from execution. When a validator sequences a transaction in block $N$ it must reserve

$$
\text{MaxGas}\times\text{GasPrice}
$$

in the user’s balance. Actual execution happens in block $N+1$; the surplus (MaxGas – ActualGas)×GasPrice is released only after a further delay of about ten blocks.[^4]

Economically this is a built-in $K_{\text{req}}$ equal to the worst-case gas and a $T_{\text{lock}}$ of roughly ten blocks. Validators report that bursty DDoS-style spam fizzles out unless the attacker pre-funds a much larger bankroll than on a conventional EVM chain. Honest wallets sending one transaction every few minutes rarely notice the hold.

---

# Selecting parameters systematically

Treating $(K_{\text{req}},T_{\text{lock}})$ as [policy](https://en.wikipedia.org/wiki/Reinforcement_learning) knobs invites a data-driven approach. Here, you model three actor classes:

1. **Spammers / MEV bots** – high frequency, indifferent to transaction failure.
2. **Retail users** – low frequency, UX-sensitive.
3. **Power users / dApps** – medium–high frequency but economically productive.

Define a network utility function

$$
U_{\text{net}} = w_{\text{spam}}\,C_{\text{spam}}
                 - w_{\text{eff}}\!\sum_{i\in\{2,3\}}n_i F_i,
$$

where $C_{\text{spam}}$ is total capital cost inflicted on class 1 and $F_i$ the friction cost borne by legitimate classes. A grid search optimization over a modest set of discrete $K_{\text{req}}$ multipliers (e.g., 4X, 8X, 16X) and timeout values (e.g., 1, 5, 10, 20, etc. blocks) each epoch can maximize $U_{\text{net}}$ while respecting constraints such as *retail cost ≤ x* and *power-user working capital ≤ y*. The parameters therefore adapt automatically to bot activity without governance micromanagement.

For rollups, the very spam that bloats state also looks like easy money: every wasted CU still credits a fee to the sequencer’s wallet, so on paper the operator is incentivized to tolerate it. Yet when the marginal fee is dwarfed by the marginal cost of bandwidth, storage, and dispute resolution, that “extra” income flips negative in net terms—a red flag that block-space remains badly under-priced and that stronger, multi-vector defenses must be in place before TVL and MEV growth magnify the gap.

---

# Engineering the escrow without hurting UX

Requiring every transaction to lock extra capital for a few blocks is conceptually simple, but the naïve approach—forcing each wallet to post and manually reclaim that reserve, would feel like a regression to 2017-era gas-price bidding.  The final step, therefore, is to **hide the capital-bond workflow behind abstractions that users already understand** while still letting the protocol enforce $K_{\text{req}}$ and $T_{\text{lock}}$.

*First*, push the bond management into [account abstraction](https://www.erc4337.io/docs)[^6].  A pay-master contract can front the reserve on behalf of a smart-account wallet, then automatically sweep the refund once the lock expires.  From the signer’s perspective nothing changes: they craft a meta-transaction, authorize it with a single signature, and the pay-master handles both the gas fee and the temporary lockup.  The user only sees a single balance delta that already accounts for the refunded portion.

*Second*, aggregate bonds at the rollup or L2 boundary.  Because a rollup submits thousands of L1 calls in a batch, it can escrow $K_{\text{req}}$ **once per batch** instead of once per end-user transaction.  Retail flows inside the rollup keep their fast-finality experience; the capital cost is paid by the sequencer, which is also the entity best positioned to monetize the resulting MEV and thus absorb the financing spread.

*Third*, let high-frequency actors salvage idle yield.  A DEX router or oracle that legitimately pushes hundreds of updates per minute will always have some fraction of its capital sitting in the “cool-down” queue.  Wrapping the escrow in an ERC-4626-style[^5] token turns that idle slice into a yield-bearing asset; the protocol can even redirect the staking rewards to the escrow owner, so the economic penalty is purely the *illiquidity*, not the lost yield.

With these three layers, pay-master wallets, batch-level bonding, and yield-bearing escrow tokens, the liquidity-lock mechanism enforces the desired opportunity cost on spammers **without** resurfacing fee-management complexity to ordinary users and without starving legitimate power-users of capital efficiency.


---

# Conclusion

Gas-only fee markets fight spam with a single blunt instrument that loses effectiveness exactly when MEV spikes. By explicitly pricing *liquidity*—how much capital an attacker must front—and *time*—how long that capital stays inert—multi-dimensional fee markets restore leverage to protocol designers. They raise the bar for bots yet leave everyday transactions inexpensive. In the current era of throughput arms-race, ignoring these extra dimensions means repeating Solana’s and Polygon’s hard-won lessons; embracing them is how the next wave of high-performance chains will stay both fast **and** clean.

# References 

[^1]: [A Complete History of Solana Outages: Causes and Fixes - Helius.](https://www.helius.dev/blog/solana-outages-complete-history)

[^2]: [Solana Outage History: A Timeline of Network Downtime and Failures.](https://statusgator.com/blog/solana-outage-history/)

[^3]: [Polygon's transaction volume drops by 50% following gas fees hike.](https://cryptonary.com/polygons-transaction-volume-drops-by-50-following-gas-fees-hike/)

[^4]: [Asynchronous Execution | Monad Developer Documentation.](https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution)

[^5]: [Tokenized Vault Standard.](https://ethereum.org/en/developers/docs/standards/tokens/erc-4626/)

[^6]: [Account Abstraction.](https://www.erc4337.io/docs)
