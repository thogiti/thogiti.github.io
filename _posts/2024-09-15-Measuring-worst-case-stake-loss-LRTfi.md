---
title: Unlocking Liquid Restaking - Measuring Worst-Case Stake Loss, Cross-Contagion Risk, and LTV in LRTfi Networks

tags: Ethereum Restaking Eigenlabs Eigenlayer Securing-Multi-Service-Validators Validator-Security Robust-Restaking-Networks Validator-Reuse-Risks Cascading-Attacks Cryptoeconomic-security Liquid-Restaking Worst-Case-Stake-Loss Cross-Contagion-Risk LRTfi
---


Let’s develop a framework around how Liquid Restaking Token (LRT) providers could measure and relay the worst-case stake loss $R_\psi(C)$ for different validators, calculate cross-contagion risk (which is important when validators are interconnected or share market risks), and how this could feed into an overall system like Nucleus to provide more resilient staking ecosystems and assist in creating resilient LRTfi protocols..


## Overview

The goal of the framework is to provide LRT providers a method to dynamically assess risk, calculate contagion, and adjust staking products accordingly.

- Measuring $R_\psi(C)$ involves calculating both the direct loss from validators and the cascading losses from interconnected failures.
- Cross-contagion risk is introduced through validator interdependencies and market conditions (beta), where failures in one part of the system can propagate to others.
- The LTV of LRT can be formulated as a weighted combination of $1 - R_\psi(C)$ for individual validators or tokens, adjusted for cross-contagion risk, providing a risk-adjusted ratio that informs how much value can be borrowed against LRT tokens.



## Measuring and Relaying $R_\psi(C)$ in LRT Systems

The function $R_\psi(C)$ measures the worst-case stake loss in a restaking network or contagion risk for a set of validators $C$, under a shock or disturbance $\psi$. For LRT providers, calculating $R_\psi(C)$ is important to estimate potential losses due to validator failure, slashing, or downtime events.

**Key Elements in Measuring $R_\psi(C)$**:

- **$\psi$**: The size of the initial shock, often represented as a fraction of the total stake at risk, which could be caused by validator failure, market downturns, or network failures.
- **$C$**: The set of validators affected by the shock, including those initially impacted and those affected due to cascading effects (cross-contagion).
  
## A Framework for Measuring $R_\psi(C)$

- **Direct Losses from Affected Validators:**
   - For each validator $v \in C$, the direct loss due to the shock can be calculated as the fraction of their stake slashed or lost due to the failure:
   
   $$\text{Direct Loss from } v = \frac{\sigma_v}{\sigma_V} \cdot \psi$$
   
   where $\sigma_v$ is the stake of validator $v$ and $\sigma_V$ is the total stake in the system.

- **Cascading Failures (Restaking Networks):**
   - In a restaking network, if a fraction $\psi$ of the stake is lost, validators that rely on cross-staking (validators staking for multiple services) could be affected. The failure of one validator might increase the likelihood of another validator failing, creating cascading losses.
   - $R_\psi(C)$ is calculated by summing both direct and cascading losses:
   
   $$R_\psi(C) = \sum_{v \in C} \left( \frac{\sigma_v}{\sigma_V} \cdot \psi \right) + \sum_{v' \in N(C)} \left( \frac{\sigma_{v'}}{\sigma_V} \cdot \psi_{\text{cascading}} \right)$$
   
   where $N(C)$ represents validators indirectly affected by the failure of validators in $C$, and $\psi_{\text{cascading}}$ is the propagation factor of the initial shock.

- **Relaying $R_\psi(C)$:**
   - **LRT providers** would need to relay $R_\psi(C)$ dynamically to stakers and token holders. This could involve:
     - **Regular Updates**: Using real-time data to compute $R_\psi(C)$ periodically, adjusting based on validator performance, market liquidity, or validator health metrics.
     - **Risk Scores**: Aggregating $R_\psi(C)$ across multiple validators or services into a risk score, which could be displayed to LRT holders or integrated into a dashboard.


## Cross-Contagion Risk Calculation

Cross-contagion risk refers to the propagation of risk from one part of the network to another, where failures or poor performance of validators (or other economic actors) in one domain spill over and affect others. In the LRT ecosystem, this could involve cross-staking validators who simultaneously support multiple networks or services, or market-linked contagion where the decline in one asset’s value affects others.

### Cross-Contagion Risk in LRT Networks

- **Validator-Validator Contagion:**
   - Validators often cross-stake for different services. If one validator fails (e.g., due to a slashing event), other validators that depend on it could be indirectly impacted.
   - Cross-contagion in validators could be modeled using network theory, where validators are nodes and edges represent the dependencies between them (e.g., how much of their stake relies on another validator).
   - **Formula for Cross-Contagion Risk:**
     
     $$\text{Cross-Contagion Risk}(LRT1, LRT2) = \sum_{C_1 \subseteq LRT1} \sum_{C_2 \subseteq LRT2} \text{Correlation}(C_1, C_2) \cdot R_{\psi}(C_1)$$


    Where:
      - $C_1 \subseteq LRT_1$: A set of validators or services in LRT_1.
      - $C_2 \subseteq LRT_2$: A set of validators or services in LRT_2.
      - Correlation measures the interdependence or risk transfer between the two sets of validators/services.
      - $R_\psi(C_1)$ measures the worst-case stake loss for set $C_1$, capturing the total loss from the initial shock that could propagate.


- **Cross-Staking Dependency Factor:**
   - Validators are not isolated; their risks are interdependent, especially in cross-staking environments. If a validator stakes for multiple services, the failure in one service could impact their ability to maintain stake in another.
   - The cross-staking dependency factor $\delta(v, v')$ could be defined as the fraction of validator $v'$’s stake that is tied to validator $v$’s performance:
     
     $$\delta(v, v') = \frac{\text{Stake from } v \text{ on } v'}{\text{Total Stake of } v'}$$
     
   - The cross-contagion risk is proportional to this dependency, as validators with high exposure to failing validators are more likely to be affected.


## Market Beta and Cross-Contagion Impact from Market Factors

Another factor in cross-contagion is the influence of market beta, which refers to how much the LRT index (or its individual components) moves in relation to the broader market. Market beta is important in determining how the value of LRT tokens responds to overall market conditions, as a downturn in the market could cause liquidity crunches or price slippage, further exacerbating losses due to validator failures.

### Market Beta in the LRT System

- **Market Beta ($\beta$):**
  - Beta is a measure of how sensitive the value of an LRT token is to market movements. A high beta indicates that the LRT token is more volatile and more affected by overall market conditions, whereas a low beta suggests relative insulation from market-wide shocks.
  - For an LRT index, we can calculate a weighted market beta:
    
    $$\beta_{\text{LRT Index}} = \sum_{i=1}^n w_i \cdot \beta_i$$
    
    where $w_i$ is the weight of LRT token $i$ in the index, and $\beta_i$ is the beta of token $i$.

- **Cross-Contagion from Market Beta:**
  - In a market downturn, LRT tokens with high beta are more likely to experience rapid price drops, which can induce cross-contagion as liquidity dries up or panic selling occurs.
  - The cross-contagion impact from market beta could be modeled as an additional factor in the calculation of $R_\psi(C)$:
    
    $$R_\psi(C) = \sum_{v \in C} \left( \frac{\sigma_v}{\sigma_V} \cdot \psi \right) + \sum_{v' \in N(C)} \left( \frac{\sigma_{v'}}{\sigma_V} \cdot \psi_{\text{cascading}} \right) + \sum_{i=1}^n w_i \cdot \beta_i \cdot M_{\text{downturn}}$$
    
    where $M_{\text{downturn}}$ represents the magnitude of the market shock, and $w_i$ reflects the weight of each LRT in the index.


## Formulation for LTV of LRT Based on Cross-Contagion Risk and $R_\psi(C)$

The Loan-to-Value (LTV) ratio of the LRT system, which incorporates both $1 - R_\psi(C)$ and cross-contagion risk. Here's how we can logically think about constructing this:

### LTV of LRT ($\text{LTV}_{\text{LRT}}$)

- **Weighted Contribution of $(1 - R_\psi(C))$:**
  - The Loan-to-Value (LTV) ratio is a measure of the risk associated with borrowing against LRTs. To formulate the LTV for LRT, we can take the weighted average of $(1 - R_\psi(C))$, which reflects the expected resilience of the validators in the index:
    
    $$\text{LTV}_{\text{LRT}} = \sum_{i=1}^n w_i \cdot (1 - R_{\psi_i}(C_i)) + \text{Cross-Contagion Risk}$$
    
    where $w_i$ is the weight of each validator or LRT in the index, and $\text{Cross-Contagion Risk}$ accounts for both validator contagion and market beta effects.

- **Incorporating Cross-Contagion Risk:**
  - The cross-contagion risk includes the risks from both validator failures and market-induced contagion, as discussed above. This could be modeled as an additive or multiplicative factor that adjusts the LTV downward based on the level of systemic risk.

### Final LTV Formula

$$\text{LTV}_{\text{LRT}} = \left( \sum_{i=1}^n w_i \cdot (1 - R_{\psi_i}(C_i)) \right) - \left( \text{Cross-Contagion Risk from Validators} + \text{Cross-Contagion Risk from Market Beta} \right)$$


