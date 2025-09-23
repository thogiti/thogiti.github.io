---
title: LayerZero - The Journey of a Cross-Chain Message (V2) — “Universal Postal Service”
tags: LayerZero Cross-Chain-Messaging-Systems
---

## Overview
This is a short presentation that explains the journey of a message using LayerZero's cross-chain messaging protocol. It's structured like a presentation with accompanying notes.

## Learning Intentions & Success Criteria

**Learning Intentions**

* Understand how LayerZero V2 moves a message across chains—securely and reliably
* Trace the journey end-to-end (send → verify → commit → deliver)
* Know each role: **Endpoint**, **Libraries**, **DVNs**, **Executors**, and your **OApp**

**Success Criteria**

* I can narrate the journey like a parcel going abroad
* I can name who does what, and why it’s permissionless
* I can pick sane **options** and **DVN quorums** for my app

---

## LayerZero — A Universal Postal Service for Blockchains

Different chains are different **countries**: their own language (VM), customs (consensus), and postage (gas). LayerZero V2 is the **postal network** that lets your app send a **parcel (message)** from one country to another, **without** a single chokepoint.

* **Post office:** the **[Endpoint V2](https://docs.layerzero.network/v2/concepts/protocol/layerzero-endpoint)** on each chain
* **Inspectors:** independent **[DVNs](https://docs.layerzero.network/v2/concepts/modular-security/security-stack-dvns)** that verify parcels left the source intact
* **Customs stamp bundle:** a **[quorum proof](https://docs.layerzero.network/v2/concepts/protocol/message-security)** submitted at the destination (on-chain)
* **Courier:** an **[Executor](https://docs.layerzero.network/v2/concepts/permissionless-execution/executors)** (or *anyone*) that pays gas and completes delivery

---

## The Cast (LayerZero V2 Components)

![LayerZero-V2-Components-Message-Journey](/assets/images/2025/LayerZero-V2-Components-Message-Journey.png)

* **Endpoint V2 (immutable):** the post office. It tracks each sender→receiver **pathway** with a **lossless channel** (gapless **nonces**, stored **payloadHash**) for exactly-once and auditability.
* **Message Libraries (SendUln302 / ReceiveUln302):** the packing/unpacking crew that standardizes packets and routes **options** to off-chain executors (workers).
* **Message Send Library:** Encodes the outbound **packet** (GUID + nonce + routing), **quotes fees** from your **options** (gas for `lzReceive`, optional `lzCompose`, ordered execution, native drop), and emits the events off-chain actors watch.
* **Message Receive Library:** Decodes the inbound packet, **enforces your DVN quorum/config**, and, once satisfied, helps the Endpoint **commit (nonce → payloadHash)** into the **lossless channel** before your app is invoked.
* **DVNs:** independent “customs inspectors” that watch the source and **attest the payloadHash**. You choose a **quorum** (X-of-Y-of-N).
* **Executor (or anyone):** the courier that funds gas and calls into the Endpoint to deliver to your app.
* **Your OApp:** the shipper/recipient. It knows its **Endpoint** and **trusted peers** (a mapping from destination Endpoint IDs (EIDs) to receiver addresses). The receiver implements `_lzReceive(...)`.
* **Developer surface (what you actually touch):**
Inherit OApp → call `_lzSend` to send bytes; implement `_lzReceive` to handle bytes on arrival. The libraries + Endpoint handle the plumbing.

---

## The Message Journey (Source → Destination)

![LayerZero-V2-Message-Journey-Map](/assets/images/2025/LayerZero-V2-Message-Journey-Map.png)

Here is a high-level overview of a typical message flow in LayerZero V2. Let's break it down to understand the main components and their core properties.

### Step 1 — **Prepare & Post** (Source)

Your **Sender OApp** calls `Endpoint.send(MessagingParams)`:

```solidity
struct MessagingParams {
  uint32 dstEid;        // destination Endpoint ID
  bytes32 receiver;     // receiver OApp address (bytes32-encoded)
  bytes   message;      // parcel contents
  bytes   options;      // handling: gas, ordered, native drop, compose
  bool    payInLzToken; // fee mode
}
```

* The Endpoint stamps a **GUID** (global tracker) and increments a pathway **nonce** (local sequence).
* The [Send library](https://docs.layerzero.network/v2/concepts/protocol/message-send-library) encodes the packet and emits events for off-chain observers (DVNs/executors).


> ✉️ **Why both?** **GUID** = global tracking across chains and retries. **Nonce** = per-pathway ordering for exactly-once.

---

### Step 2 — **Customs Inspection** (DVNs, off-chain)

* DVNs independently **observe** the source chain; each proves the **payloadHash**.
* When your configured **quorum** is met, there exists a **quorum proof** (your bundle of customs stamps).

> No contract “calls” the DVNs. They watch independently; they attest.

---

### Step 3 — **Customs Check-in** (Destination, on-chain & permissionless)

* **Anyone** (often an executor) submits the **quorum proof** to the destination **Endpoint** to **`commitVerified`**. (Receive library enforces your DVN config.)
* The Endpoint records **verified** `nonce → payloadHash` in the pathway’s **lossless channel** (Receive library enforced).


> Status: **Verified** (cleared customs). Not delivered yet, just eligible for delivery.

---

### Step 4 — **Last-Mile Delivery** (Destination, permissionless)

* **Anyone** can now provide gas/value and deliver: the Endpoint invokes your receiver’s `lzReceive(...)`, which calls your `_lzReceive(...)`.
* If `options` specified follow-ups, the Endpoint later calls **`lzCompose(...)`** (also permissionless).

> Status: **Delivered** once your app logic executes.

---

### Step 5 — **Ordering** (Lazy by default, strict if you ask)

* **Default (lazy):** If nonce *n* is **Verified** but its **Delivery** fails, *n+1* can still deliver once *n+1* is **Verified**.
* **Strict FIFO (opt-in):** Add **ordered execution** in `options`; *n+1* waits until *n* **executes successfully**.

---

## Options = Your Handling Instructions

![LayerZero-V2-Message-Options](/assets/images/2025/LayerZero-V2-Message-Options.png)

* Apps can **[enforce minimum options](https://docs.layerzero.network/v2/concepts/message-options)**; users can **top-up** per message.
* These are the stickers on the parcel: “priority,” “signature required,” “include a tip,” “run a follow-up.”

---

## Properties (why the LayerZero network works)

* **Exactly-once per pathway:** **gapless nonces** + stored **payloadHash** in a **lossless channel**; clean audit trail.
* **Censorship-resistant:**

  1. Multiple independent DVNs must collude to block a quorum, and
  2. both **commitVerified** and **delivery** are **permissionless**, no single chokepoint.
* **Operationally resilient:** Executors are **replaceable**; anyone can retry with higher gas or different options.
* **Simple control surface:** `options` is where you tune gas, ordering, native drops, and compose.

---

## Receiver Gatekeeping (who’s allowed to ring the doorbell?)


```solidity
function lzReceive(
  Origin calldata _origin,
  bytes32 _guid,
  bytes calldata _message,
  address _executor,
  bytes calldata _extraData
) public payable {
  if (address(endpoint) != msg.sender) revert OnlyEndpoint(msg.sender);
  if (_getPeerOrRevert(_origin.srcEid) != _origin.sender) revert OnlyPeer(_origin.srcEid, _origin.sender);
  _lzReceive(_origin, _guid, _message, _executor, _extraData);
}
```

*Only the post office (Endpoint) can deliver, and only from your **trusted peer** on the source EID.*

---

## Quick FAQ

* **Is there a relayer?** In V2 it’s split: **DVNs** verify; **Executors (or anyone)** deliver.
* **Who contacts DVNs?** No one—DVNs watch the chain. A third party submits the **quorum proof** on the destination chain.
* **Why permissionless delivery?** To remove last-mile censorship and allow retries by anyone.
* **When should I enable strict ordering?** When business logic requires FIFO; otherwise keep the default lazy mode for liveness.

---

## References
- [LayerZero Docs](https://docs.layerzero.network/v2) 
- [Sample Examples ](https://github.com/LayerZero-Labs/devtools/tree/main/examples)
