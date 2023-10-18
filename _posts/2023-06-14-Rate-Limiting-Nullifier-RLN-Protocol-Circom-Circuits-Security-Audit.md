---
title: Rate Limiting Nullifier (RLN) Protocol - Circom Circuits Security Audit
tags: Ethereum RLN Rate-Limiting-Nullifier Circom Circom-Circuits Security-Audit ZKP-Security-Audit ZKP Zero-Knowledge-Proofs Ecne Poseidon PSE
---

# Rate Limiting Nullifier (RLN) Review

I recently had the pleasure of conducting my first security audit of a Zero Knowledge Proofs (ZKP) protocol. The protocol in question was the Rate Limiting Nullifier (RLN) Zero Knowledge Proofs Protocol, with its circuits written in Circom. My main focus during this review was on the Circom Circuits of the Zero Knowledge Proofs gadgets. And let me tell you, it was quite the adventure! I mean, who knew math could be so exciting?

During my review of the RLN Zero Knowledge Proofs Protocol, I learned a great deal about the intricacies of the RLN specifications, the verifications, and how to identify underconstraint systems. My mathematical background proved to be invaluable in helping me understand these complex concepts. It’s like they always say, “mathematics is the language of the universe”! But seriously, who comes up with this stuff? Additionally, I gained a deeper understanding of ZKP primitives attack vectors and other potential vulnerabilities in the system. It’s like being a detective, but for ZKP systems! And let me tell you, it’s not as easy as it looks. 

**Review Resources:**

- The code repository at [github.com/Rate-Limiting-Nullifier](https://github.com/Rate-Limiting-Nullifier/circom-rln)
- The RLN V1 specification document at [rfc.vac.dev](https://rfc.vac.dev/spec/32)
- The RLN V2 specification document at [rfc.vac.dev](https://rfc.vac.dev/spec/58)

**Auditors:**

 - [0xnagu](https://github.com/thogiti/)


## Table of Contents <!-- omit in toc -->

[Executive Summary](#executive-summary)

[Scope](#scope) 

[Explanation of Findings](#explanation-of-findings) 

[Critical Findings](#critical-findings) 

[High Findings](#high-findings) 

[Medium Findings](#medium-findings) 

[Low Findings](#low-findings) 

[Final Remarks](#final-remarks) 

## Executive Summary
- There are no critical or high impact bugs in the code.
- There were some low impact bugs mainly under constrained input variables between the Circom circuits and their corresponding Solidity contracts. 

**Rate Limiting Nullifier**

Rate limiting nullifier (RLN) is a construct based on zero-knowledge proofs (sometimes called ZKP gadget) that provides an anonymous rate-limited signaling/messaging framework suitable for decentralized (and centralized) environments using Secret Shamir Sharing (SSS) scheme.

**Motivation**
Some applications of rate limiting nullifier in anonymous decentralized networks include:
1. Decentralized voting applications: RLN helps prevent voting outcomes from being manipulated by spam or sybil attacks, ensuring the integrity of the voting process. 
2. Anonymous group chat applications: By preventing users from spamming or polluting group chats, RLN enhances the user experience in these applications.
3. Direct anonymous attestation: RLN can be used in combination with Direct Anonymous Attestation (DAA) to implement service rate-limiting in a scenario where messages between users and the service are sent anonymously while preserving message unlinkability
4. Blockchain-based social networks: RLN can be applied to decentralized social media networks to prevent spam, sybil attacks, and other types of abuse targeting APIs and applications, thus enhancing the overall security and reliability of these networks.
5. Rate limiting in web applications: RLN can be integrated with Web Application Firewalls (WAF) to protect against denial-of-service attacks, brute-force login attempts, and API traffic surges, providing a more secure and reliable web application experience. 

**RLN V2**
The RLN V2 protocol is a more general construct, that allows to set various limits for an epoch (it’s 1 message per epoch in RLN-V1) while remaining almost as simple as it predecessor. Moreover, it allows to set different rate-limits for different RLN app users based on some public data, e.g. stake.

The RLN Circom circuits were reviewed over 13 days. The code review was performed between May 31 and June 12, 2023. The RLN repository was under active development during the review, but the review was limited to the latest commit, [37073131b9](https://github.com/Rate-Limiting-Nullifier/circom-rln/tree/37073131b9c5910228ad6bdf0fc50080e507166a) at the start of the review. 

The official documentation for the RLN circuits was located at [rate-limiting-nullifier.github.io](https://rate-limiting-nullifier.github.io/rln-docs/).

**Flow**

Here is the complete flow diagram of RLN protocol for the Circom circuits.


![RLN Protocol Flow](/assets/images/20230614/RLN-Flow-Diagram.png)


```mermaid 

    graph TD
        ext_null>External Nullifier] --> h1(hash)
        secret{{Secret Trapdoor & nullifier}} --> h0(hash) --> a_0
        a_0{{Secret hashed a_0}} --> h1
        msg_id>Message_ID `k`] --> h1
        msg_id --> limit_check(Message Limit Check)
        msg_limit>Message Limit] --> limit_check
        h1 --> a_1 --> h2(hash) --> int_null([Internal Nullifier])
        a_1 --> times
        m>Message] --> h3(hash) --> times(*) --> plus(+)
        a_0 --> plus --> sss([Shamir's Share y_share])
        a_0 --> h4(hash) --> id_com([id_commitment])
        h4 --> merkle(MerkleProof)

```


## Scope

The scope of the review consisted of the following circuits at the specific commit:

- [rln.circom](https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/37073131b9c5910228ad6bdf0fc50080e507166a/circuits/rln.circom)
- [utils.circom](https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/37073131b9c5910228ad6bdf0fc50080e507166a/circuits/utils.circom)
- [withdraw.circom](https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/37073131b9c5910228ad6bdf0fc50080e507166a/circuits/withdraw.circom)

After the findings were presented to the RLN team, fixes were made and included in several PRs.

This review is a code review to identify potential vulnerabilities in the code. The reviewers did not investigate security practices or operational security and assumed that privileged accounts could be trusted. The reviewers did not evaluate the security of the code relative to a standard or specification. The review may not have identified all potential attack vectors or areas of vulnerability.

yAcademy and the auditors make no warranties regarding the security of the code and do not warrant that the code is free from defects. yAcademy and the auditors do not represent nor imply to third parties that the code has been audited nor that the code is free from defects. By deploying or using the code, RLN and users of the contracts agree to use the code at their own risk.


Code Evaluation Matrix
---

| Category                 | Mark    | Description |
| ------------------------ | ------- | ----------- |
| Access Control           | Not applicable | The code does not explicitly implement access control mechanisms. It does not have specific checks or restrictions on who can access or modify the data. |
| Mathematics              | Good | The code includes mathematical operations such as addition, multiplication, and hashing using the Poseidon function. It also includes range checks and bit manipulation operations.  |
| Complexity               | Good | The complexity of the code is relatively low. It consists of basic mathematical operations and includes a Merkle tree inclusion proof and range checks. |
| Libraries                | Average | The code includes the Circomlib library, specifically the Poseidon circuit, which is used for hashing. |
| Decentralization         | Not applicable | The code does not explicitly address decentralization. It does not include mechanisms for distributed consensus or interaction with a decentralized network.  |
| Code stability           | Good    | The code appears to be well-structured and follows the Circom syntax. It does not contain any obvious errors or issues that would affect its stability. |
| Documentation            | Low | The code does not include extensive documentation. There are some comments explaining the purpose of certain components, but more detailed documentation would be beneficial.  |
| Monitoring               | Average | The code does not include specific monitoring mechanisms. It does not have built-in logging or tracking of events or performance metrics. |
| Testing and verification | Average | The code includes some basic range checks and a Merkle tree inclusion proof, which are important for ensuring the correctness of the code. However, it does not include comprehensive testing or verification procedures.  |

## Explanation of Findings

Findings are broken down into sections by their respective impact:
 - Critical, High, Medium, Low impact
     - These are findings that range from attacks that may cause loss of funds, impact control/ownership of the contracts, or cause any unintended consequences/actions that are outside the scope of the requirements
 - Gas savings
     - Findings that can improve the gas efficiency of the contracts
 - Informational
     - Findings including recommendations and best practices

---

## Critical Findings

### 1. Critical - `identitySecret` gets revealed for certain inputs `x` (hash of the message)

The `identitySecret` gets revealed when the input signal `x`, the hash of the message, is `0` modulo prime `p` of the scalar field used. When the `x` is `0` or `21888242871839275222246405745257275088548364400416034343698204186575808495617` (in Ethereum) or the prime `p`, the order of the scalar field $Fp$ arithmetic circuits, the product `a1 * x` becomes zero thus revealing the `identitySecret`. 

- This prime `p` is the order of the scalar field of the $BN254$ curve.
- Circom 2.0.6 introduces two new prime numbers to work with
  - The order of the scalar field of the $BLS12-381$.
    -  `52435875175126190479447740508185965837690552500527637822603658699938581184513`
  - The goldilocks prime `18446744069414584321`, originally used in $Plonky2$.

**Recommended Solution**

Constraint on the input signal `x` and also on the product `a1 * x` to be non-zero modulo prime `p`.

```circom
isZero(x).out === 0
isZero(a1*x).out === 0

```

## High Findings

None.

## Medium Findings

None.

## Low Findings

### 1. Low - Incosistency between RLN contract and RLN circuit on the number of bits for userMessageLimit

In RLN.sol, the messageLimit can take upto 2**256 - 1 values whereas messageId & userMessageLimit values in circuits is restricted to 2**16 - 1 .

[rln.circom](https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/37073131b9c5910228ad6bdf0fc50080e507166a/circuits/rln.circom)

```circom
template RLN(DEPTH, LIMIT_BIT_SIZE) {
...
    // messageId range check
    RangeCheck(LIMIT_BIT_SIZE)(messageId, userMessageLimit);
...
}
component main { public [x, externalNullifier] } = RLN(20, 16);
```

[rln.sol](https://github.com/Rate-Limiting-Nullifier/rln-contracts/blob/main/src/RLN.sol)
```solidity
uint256 messageLimit = amount / MINIMAL_DEPOSIT;
```

**Recommended Solution**

Update the relevant code at [rln.sol](https://github.com/Rate-Limiting-Nullifier/rln-contracts/blob/main/src/RLN.sol) with something like below:

```solidity
function register(uint256 identityCommitment, uint256 amount) external {
        ...
        uint256 messageLimit = amount / MINIMAL_DEPOSIT;
        require( messageLimit <= type(uint16).max , "Max length of your message limit is 65535");
        ...
    }
```



### 2. Low - Unused `address` input signal in the Withdraw circuit

The input signal `address` was declared but not used in the output calculation. 

```circom
    signal input address;
```
**Recommended Solution**
Assign a local computation for the unused input signal `address`. For example:

```circom
   signal addressDoubled <== address + address;
```

### 3. Low - Missing rangechecks for the data inputs

The Circom circuits are missing explicit rangechecks for several input parameters suchh as `DEPTH`, `address`, `LIMIT_BIT_SIZE`, etc. 

**Recommended Solution**
Perform explcit range checks and constrain the data input parameters to improve the soundness of the ZKP system.

## Informational Findings
The Circom circuits are further tested for `Weak Verification` soundness property using [Ecne tool](https://github.com/franklynwang/EcneProject) from 0xParc. This tests if, given the input variables in a QAP (R1CS constraints), the output variables have uniquely determined values. An underconstrained circuit admits valid proofs for multiple different outputs, given the same input. In the worst case, an attacker can generate a valid proof for an underconstrained circuit for any output--meaning that an attacker would be able to convince a verifier who (incorrectly) believes the circuit to be properly-constrained that the attacker knows the pre-image of arbitrary outputs.

### Ecne Findings
The Circom cuits were compiled to non-optimized R1CS constraints system and then they were tested for `Weak Verification` to check for any bad constraints or underconstraints. All the circuits passed the Ecne tests without any bad or underconstraints. This verifies that R1CS equations of the given circuits uniquely determine outputs given inputs (i.e. that the constraints are sound).

### Error Handling
Consider adding below error handling to check for specific conditions and throw an error or return an error code when those conditions are not met. This helps provide meaningful error messages or handle exceptional cases in a controlled manner.

**`rln.circom`**
```circom
// Add error handling for Merkle tree inclusion proof
root <== MerkleTreeInclusionProof(DEPTH)(rateCommitment, identityPathIndex, pathElements);
assert(root !== 0, "Invalid Merkle tree inclusion proof"); // Throw an error if the Merkle tree inclusion proof is invalid

```
**`withdraw.circom`**
```circom
// Add error handling for address length check
assert(address.length == EXPECTED_ADDRESS_LENGTH, "Invalid address length"); // Throw an error if the address length is not as expected

```
**`utils.circom`**
```circom

// Add error handling for length check
assert(leaf.length == EXPECTED_LEAF_LENGTH, "Invalid leaf length"); // Throw an error if the leaf length is not as expected
```
### `POSEIDON` and Some Additional Remarks
- The RLN circuit assumes that the underlying hash function (`Poseidon`) is:
    * Collision-resistant
    * Resistant to differential, algebraic, and interpolation attacks
    * Behaves as a random oracle
- The Merkle tree used for membership proof is assumed to be secure against second-preimage attacks.
- The security of the circuit depends on the security of the cryptographic primitives used for range checks and SSS share calculations.
- The security of the circuit also depends on the secrecy of the `identitySecret` signal, which is assumed to be kept secret by the user.
- Social engineering attacks are still a valid way to break the system.
- An attacker can obtain the `identitySecret` signal of a user by using methods such as social engineering, phishing attacks, or exploiting vulnerabilities in the user's system.
- Once the attacker has obtained the `identitySecret` signal, they can calculate the `identityCommitment`, `rateCommitment`, `a1`, and `y` signals for that user, and use them to break the security of the RLN circuit.


## Final remarks
Overall, the code demonstrates good implementation of mathematical operations and basic functionality. However, it could benefit from more extensive documentation and additional testing and verification procedures.

