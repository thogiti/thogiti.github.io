---
title: Ensuring Correct Integer Division in Circom - Avoiding Multiple Solutions in $\mathbb{F}_p$
tags: Circom Zero-Knowledge-Proofs ZKP integer-division
---

# Overview

Integer division is a textbook example of how arithmetic in a prime field $\mathbb{F}_p$ can subtly diverge from integer arithmetic. The naive approach often appears correct but can lead to multiple valid solutions in zero-knowledge proofs (ZKP), breaking the soundness property of ZKP. This can lead to multiple security vulnerabilities in ZKP implementations. By adding the appropriate constraints at the circuits level—whether by implementing a bitwise division algorithm or by bounding the quotient—you can restore uniqueness and ensure your circuit truly encodes the integer division you intended.


When implementing ZKP circuits, it can be tempting to rely on high-level operations such as `\` (division) and `%` (modulus) in your code. While these operators look like their counterparts in many programming languages, under the hood they behave differently when compiled to arithmetic circuits in a prime field $\mathbb{F}_p$. This difference can introduce *multiple valid solutions* for the quotient and remainder, breaking the real-world assumption that integer division should have only one possible answer.

In this post, I’ll walk through:

-  A simple code snippet that naively uses Circom’s `\` and `%` operators.  
-  Why these operators do not guarantee a unique integer quotient and remainder in $\mathbb{F}_p$.  
- Two common approaches to fix this, including the pros and cons: 
    - a bitwise/shift-based division algorithm, or  
    - additional constraints on the quotient to ensure uniqueness.  

I’ll also cover some [CircomSpect](https://github.com/trailofbits/circomspect) warnings you might see when diagnosing potential unconstrained signals.

---

# Example: A “Naive” Integer Division Template

Here’s a simplified version of an `IntegerDivision` template in Circom that uses the built-in operators:

```circom
template IntegerDivision() {
    signal input dividend;
    signal input divisor;
    signal output quotient;
    signal output remainder;
    
    // Ensure the divisor is non-zero
    assert(divisor != 0);

    // Assign quotient and remainder using Circom 2.x operators
    quotient <-- dividend \ divisor;
    remainder <-- dividend % divisor;
    
    // Constrain remainder < divisor
    signal isLessThan <== SafeLessThan(252)([remainder, divisor]);
    1 === isLessThan;

    // Check that the math works in the field
    dividend === divisor * quotient + remainder;
}
```

Looks correct, right? We:

- Prevent division by zero.
- Ensure `remainder < divisor`.
- Enforce the usual integer-divison formula $\text{dividend} = \text{divisor} \times \text{quotient} + \text{remainder}$.

In a typical integer language, this would be all you need. But in a prime field $\mathbb{F}_p$, we have an *extra dimension* to worry about.

---

# Why Multiple Valid Solutions Appear in $\mathbb{F}_p$

In a prime field of size $p$, the equation

$$\text{dividend} \equiv \text{divisor} \cdot \text{quotient} \;+\; \text{remainder} \pmod{p}$$

allows multiple pairs $(\text{quotient}, \text{remainder})$ to satisfy the same equation—*even if* you check $\text{remainder} < \text{divisor}$ and $\text{divisor} \neq 0$. 

## A Concrete Example in $\mathbb{F}_{13}$

Suppose:

- $\text{dividend} = 10$  
- $\text{divisor} = 3$

In normal integer arithmetic, we have:

$$10 = 3 \times 3 + 1
\quad\Rightarrow\quad
\text{quotient} = 3,\; \text{remainder} = 1.$$

But in $\mathbb{F}_{13}$, consider a second solution:

$$10 \equiv 3 \times 7 + 2 \pmod{13}.$$

Check it:

$$3 \times 7 + 2 = 21 + 2 = 23 \equiv 10 \pmod{13}.$$

We also have $2 < 3$, so “$\text{remainder} = 2$” passes the check `remainder < divisor`. So the circuit sees *two valid solutions* for the same $(\text{dividend}, \text{divisor})$:

- $\text{quotient} = 3,\; \text{remainder} = 1$
- $\text{quotient} = 7,\; \text{remainder} = 2$

Both solutions will pass the constraints. This is *not* what we want if we are truly trying to prove that $\text{quotient}$ is the “real integer quotient.” In typical integer mathematics, the quotient would be unique. But in $\mathbb{F}_p$, we need more constraints to pin it down.

---

# Approaches to Fixing the Problem

## Option A: Bitwise Division (Long Division in the Circuit)

One standard solution is to *implement integer division from scratch* with a bit-by-bit (or shift-based) algorithm. Such an approach typically:

- Decomposes $\text{dividend}, \text{divisor}$ into binary bits:  
   $$
   \text{dividend} < 2^n,\quad
   \text{divisor} < 2^n
   $$
- Implements a long-division process:  
   - Start with a partial remainder = 0  
   - Iterate from the MSB to LSB of `dividend`, shifting partial remainder and subtracting `divisor` if feasible  
   - Each step yields a bit of the `quotient` and an updated `remainder`
- Ensures the final `quotient` and `remainder` are single-valued in normal integer arithmetic.

A simplified example of such a circuit might look like this:

```circom
template SafeIntegerDivision(nBits) {
    // We assume dividend < 2^nBits and divisor < 2^nBits.
    signal input dividend;
    signal input divisor;
    signal output quotient;
    signal output remainder;

    // Ensure divisor != 0
    assert(divisor != 0);

    // Decompose them as bits
    signal [nBits] dividendBits <== Num2Bits(nBits)(dividend);
    signal [nBits] divisorBits <== Num2Bits(nBits)(divisor);

    signal [nBits] quotientBits;

    // We'll store partialRemainder as an integer in the loop
    var partialRemainder = 0;

    // For each bit from MSB down to LSB
    for (var i = nBits - 1; i >= 0; i--) {
        // Shift the partial remainder left by 1
        partialRemainder = partialRemainder * 2 + dividendBits[i];
        
        // If partialRemainder >= divisor, then set that bit in quotient
        var ge = GreaterEqThan(nBits)([partialRemainder, divisor]);
        quotientBits[i] <== ge;

        // Subtract divisor if ge == 1
        partialRemainder = partialRemainder - ge * divisor;
    }

    // Reconstruct quotient from bits
    quotient <== Bits2Num(nBits)(quotientBits);
    remainder <== partialRemainder;
}
```

Because we replicate the usual integer-division algorithm step by step, there is exactly one valid outcome in the circuit. In $\mathbb{F}_p$, you can’t “shift” the quotient and fix the remainder because each step is pinned down by a sequence of bits that must match partial differences.

### Pros:

- Fully constrains the solution to one unique quotient and remainder.
- Mimics standard integer division with no ambiguity.

### Cons:

- Potentially larger circuit: it requires iterative logic, bit decomposition, and constraints in each iteration.
- Slightly more complex code to maintain and debug.

---

## Option B: Constraining Quotient with Additional Inequalities

Another approach tries to keep using `quotient <-- dividend \ divisor; remainder <-- dividend % divisor;` but then enforces that $\text{quotient} \le \lfloor \frac{\text{dividend}}{\text{divisor}} \rfloor$. 

In an ordinary programming language, we might write:

```javascript
max_quotient = floor(dividend / divisor);
// Then ensure quotient <= max_quotient
assert(quotient <= max_quotient);
```

But Circom does not provide a built-in `floor()` or direct integer division you can rely on. You’d have to build your own “bitwise-based check” anyway—or pass in `max_quotient` as some sort of *public input* to the circuit, then prove that `quotient <= max_quotient` via a safe comparator:

```circom
signal max_quotient; // provided externally
signal isLessOrEq <== SafeLessEqThan(252)([quotient, max_quotient]);
1 === isLessOrEq;
```

But who *computes* `max_quotient`? Typically you’d do it off-chain, but then the circuit must verify that `max_quotient` is consistent with `(dividend, divisor)`. That again leads to an elaborate set of constraints verifying you didn’t lie about `max_quotient`. So effectively, you re-invent the bitwise approach or a partial approach.

### Pros:

- Potentially simpler if you can rely on external logic to supply a correct upper bound for `quotient`.
- If you only need a small range for `quotient`, you can do a smaller comparator circuit.

### Cons:

- You still need extra constraints to ensure no overflows or deception in `max_quotient`.
- Not as direct or foolproof as the full bitwise algorithm.

---

# Interpreting CircomSpect Warnings

When you see warnings from [CircomSpect](https://github.com/trailofbits/circomspect), they usually revolve around two key points:

- `<--` vs `<==`  
   - `<--` means: “Assign the value in the compiled code, but do not generate a constraint that forces equality.” So if your code only uses `<--`, the signal might remain *unconstrained* unless you explicitly constrain it later.  
   - `<==` means: “Create a constraint that enforces this equality.”

- Unused outputs  
   If a template returns `(quotient, remainder)` but you only use the `quotient` in further constraints, you might see a warning like “The output signal `remainder` is not constrained.” That’s because from the circuit’s standpoint, `remainder` can be anything consistent with the local logic, and if no subsequent constraints mention it, it’s effectively free.

For instance:

```circom
(quotient, _) <== IntegerDivision()(a * (10  W), b);
```

In such a scenario, `_` is never used, so CircomSpect warns you that “`remainder` is not constrained in the next step.” This might be fine if you truly only need the `quotient`. But if you accidentally forgot to constrain the remainder, then you might be letting the circuit accept more solutions than you intended.

---

# Pros & Cons of the Two Division Approaches

Using the built-in `\`, `%`:

- Pros:  
  - Very concise code.  
  - Circom handles the modulo operation behind the scenes.  
- Cons:  
  - In a prime field, the result is *not unique*.  
  - You must add extra constraints to ensure that your integer quotient matches the unique real-world division result.  

Bitwise/Shift Division:

- Pros:  
  - Guarantees uniqueness of `(quotient, remainder)` in the integer sense.  
  - Entirely self-contained: you don’t rely on external “max_quotient” or other assumptions.  
- Cons:  
  - More code, and more constraints in the circuit (which may increase proving time).  
  - Potentially less intuitive if you are new to circuit-based arithmetic.  

---

# Conclusion

- If you truly need a unique `(quotient, remainder)` corresponding to standard integer division, you must do something more than just:

   ```circom
   quotient <-- dividend \ divisor;
   remainder <-- dividend % divisor;
   ```

- A robust solution: implement a bit-by-bit or shift-based algorithm that replicates integer division. This ensures that in $\mathbb{F}_p$, only the “natural” quotient and remainder can satisfy all constraints.  
- Alternatively, if you can supply an additional constraint or a “publicly known maximum quotient,” you can still do `\` and `%` but then enforce  
   $$
     \text{quotient} \times \text{divisor} \;\le\; \text{dividend} \,<\; (\text{quotient}+1) \times \text{divisor},
     \quad
     0 \le \text{remainder} < \text{divisor}.
   $$  
   Just realize that verifying these inequalities typically requires *bitwise checks anyway*.

- CircomSpect warnings:  
   - If you see warnings about `<--` vs `<==`, confirm that each signal is indeed constrained somewhere else in the code.  
   - If you see warnings about an “unused” output, confirm whether that is intentional or an oversight.

That small difference between “syntactic sugar” (`\`, `%`) and “true constraints” is one of the keys to mastering Circom. Always check that your signal constraints prevent any extra solutions in $\mathbb{F}_p$.


