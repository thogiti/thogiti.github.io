---
title: From RPC to Execution - A Queueing-Theoretic View of Solana’s Fee Markets and Transaction Pipeline - Part I
tags: Solana solana-fee-markets solana-transaction-pipeline dynamics-fee-markets blockchain-fee-markets solana-multi-stage-queue
---

## WIP - WORK IN PROGRESS

# Part 1: Foundations of Queueing Theory for Solana’s Fee Markets


## Introduction

Solana’s promise of fast, high-throughput blockchain operations relies on an efficient fee market that keeps the network stable even under heavy load. In traditional blockchains, a simple “bidding war” can prioritize transactions by fee, but Solana’s architecture involves multiple sequential stages: network ingress, signature verification, scheduling, and execution. 

**Why do we need a queueing theory perspective?** Because whenever requests (transactions) arrive at a rate that approaches or exceeds the system’s capacity, congestion naturally arises. Solana’s approach to local fee markets—prioritizing high-fee transactions at certain stages—resembles classical priority scheduling in queueing systems. By translating Solana’s pipeline into queueing models, we can:

- Quantify how load (arrival rate $\lambda$) and capacity (service rate $\mu$) interact  
- Determine when high-fee transactions truly benefit from priority scheduling
- Identify how dynamic fee floors (admission control) ensure stability, preventing infinite queue buildup

In Part 1, we introduce the basic M/M/1 queue (single server, Poisson arrivals, exponential service). We then extend it to two-class priority queues, showing how high-fee transactions behave in a congested system. Finally, we examine load shedding (fee floors) and multi-server M/M/k scenarios. This theoretical groundwork sets the stage for Part 2, where we map Solana’s multi-stage pipeline to tandem queues and propose control-theoretic solutions that keep the system stable under varied loads.

---

## Single-Server Model (M/M/1)

The **M/M/1** queue is often taught first in queueing theory due to its simplicity:

- **M** = Markovian (Poisson) arrivals at rate $\lambda$  
- **M** = Markovian (exponential) service times at rate $\mu$  
- **1** = one server

### Key Equations

#### **Utilization:**  

$$\rho \;=\; \frac{\lambda}{\mu}.$$  

A necessary condition for stability is $\rho < 1$. If $\lambda \ge \mu$, the queue grows without bound.

#### **Little’s Law:**  

$$L \;=\; \lambda \,\times\, W,$$  

where 
- $L$ is the average number of transactions in the system (queue + server),  
- $\lambda$ is the arrival rate,  
- $W$ is the average time each transaction spends in the system (wait + service).

#### **Mean Number in System:**  

$$L \;=\; \frac{\rho}{1 - \rho},$$  

assuming $\rho < 1$.

#### **Mean Number in Queue (Excluding Service):**  

$$L_q \;=\; \frac{\rho^2}{1 - \rho}.$$

#### **Mean Waiting Time in Queue:**  

$$W_q 
\;=\; \frac{L_q}{\lambda}
\;=\; \frac{\rho}{\mu(1 - \rho)}.$$

As $\rho \to 1$, both $L_q$ and $W_q$ grow to very large values—a hallmark of congestion.

### Relevance to Fee Markets

- **Saturation:** If $\lambda$ (transaction arrival) grows too close to $\mu$ (throughput capacity), waiting times explode.  
- **Local Fee Market:** If high-fee transactions cannot bypass low-fee transactions in a saturated system, the advantage of paying more is lost.  
- **Controlling $\lambda$:** By raising a fee floor or otherwise shedding low-fee load, we effectively reduce $\lambda$, keeping $\rho$ comfortably below 1.

---

## Priority Queueing: M/M/1 with Two Classes

A two-class priority extension of M/M/1 can capture the idea of high-fee vs. low-fee transactions.

- **Class 1:** High-fee, arrival rate $\lambda_1$.  
- **Class 2:** Low-fee, arrival rate $\lambda_2$.  
- **Total Rate:** $\lambda = \lambda_1 + \lambda_2$.  
- **Single Server:** Rate $\mu$.  
- **Utilization:** $\rho = \lambda/\mu$.

### Non-Preemptive Priority

In non-preemptive priority:
- If the server is idle and both Class 1 and Class 2 transactions arrive, Class 1 goes first.  
- If the server is already serving a Class 2 transaction, it will finish that job before switching to a newly arrived Class 1.

#### Mean Waiting Times

Exact formula derivations can be found in texts like *Kleinrock’s Queueing Systems*[^1]. A simplified representation:

- **Class 1 (High-Fee) Mean Wait, $W_{q,1}$** might look like:
  
  $$W_{q,1} 
    \;=\; \frac{\rho_1}{\mu(1 - \rho_1)} + \Phi(\rho_1, \rho_2),$$
  
  where $\rho_1 = \lambda_1/\mu$ and $\Phi(\rho_1, \rho_2)$ captures how Class 1 may occasionally wait behind a Class 2 job already in service.

- **Class 2 (Low-Fee) Mean Wait, $W_{q,2}$** is necessarily larger because Class 1 cuts in front.

#### Key Insight

If $\rho_1 < 1$, Class 1 enjoys low waiting times even if Class 2 is large. However, if $\rho = \rho_1 + \rho_2$ is near 1, *everyone* suffers eventually, although Class 1 still fares better relatively.

### Dynamic Load Shedding (Fee Floors)

When $\lambda_2$ (low-fee arrivals) is high, a **fee floor** $f$ can be raised so that transactions below $f$ are dropped:

$$\lambda_2^\text{eff} = \lambda_2 \times \mathbf{1}\{\text{fee} \ge f\}.$$

This ensures $\lambda^\text{eff} = \lambda_1 + \lambda_2^\text{eff} < \mu$. If $\rho$ remains below 1, queue lengths stop exploding.

---

## Multiple Servers: M/M/k

Real systems may have $k$ parallel “servers” (threads, cores, etc.). Then the model is **M/M/k** with a stability condition $\lambda < k\mu$. Priority classes can still be applied, but if $\lambda \gg k\mu$, overload happens anyway. This sets the stage for how Solana’s pipeline might scale by adding more parallel execution threads.

---

## Putting it all together - Part 1

Let's briefly recap what we learnt so far:
- **Balancing $\lambda$ and $\mu$:** A fundamental requirement for stable waiting times.  
- **Priority Queues:** Benefit high-fee (Class 1) if $\rho_1$ is significantly below 1.  
- **Fee Floors & Admission Control:** Reduce low-fee arrival rate ($\lambda_2$) to keep $\rho$ below 1.  
- **Parallelization:** M/M/k can boost total capacity, but if $\lambda$ still exceeds $k\mu$, you get large queues.


## References
[^1]: https://ia601403.us.archive.org/13/items/in.ernet.dli.2015.134547/2015.134547.Queueing-Systems-Volume-1-Theory.pdf

