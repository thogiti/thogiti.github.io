---
title: GCD - A Deep Dive into Fundamental Concept in Number Theory
tags: GCD Number-Theory Cryptography Extended-Euclidean-Algorithm Euclidean-Algorithm
---

- [Greatest Common Divisor Overview](#greatest-common-divisor-overview)
  - [Definition 1 - GCD](#definition-1---gcd)
  - [Definition 2 - Co-prime](#definition-2---co-prime)
  - [Proposition 1](#proposition-1)
- [The Euclidean Algorithm](#the-euclidean-algorithm)
  - [Geometrical View of the Euclidean Algorithm](#geometrical-view-of-the-euclidean-algorithm)
- [The Extended Euclidean Algorithm](#the-extended-euclidean-algorithm)
  - [Theorem 1](#theorem-1)
  - [Proposition 2](#proposition-2)
  - [Theorem 2](#theorem-2)


# [Greatest Common Divisor Overview](#greatest-common-divisor-overview)

The numbers $12$ and $18$ share the divisors `1`, `2`, `3`, and `6`, with `6` being the largest. This set of common divisors can be created for any pair of non-zero integers, `a` and `b`. The set will always include at least the number `1`, as it is a divisor of all integers. Since the set is finite, it will always have a maximum value.

## [Definition 1 - GCD](#definition-1---gcd)

Let's consider two integers `a` and `b`, where both are not zero. The set of common divisors between `a` and `b` has a maximum element, which we denote as `d`. This `d` is known as the Greatest Common Divisor (GCD) of `a` and `b`. We express this as $d = gcd(a, b)$.

This equation signifies that `d` is the largest integer that can divide both `a` and `b` without leaving a remainder.

**Examples.** $gcd(24, 52) = 4$, $gcd(9, 27) = 9$, $gcd(14, 35) = 7$, $gcd(15, 28) = 1$.

## [Definition 2 - Co-prime](#definition-2---co-prime)
Two integers `a` and `b` are said to be **relatively prime** or **co-prime** if $gcd(a, b) = 1$.

**Examples.** $gcd(15, 28) = 1$, $gcd(15, 14) = 1$, $gcd(21, 40) = 1$.

**Remark.** If $a \neq 0$, then $gcd(a,0) = a$. 

However, we do not define $gcd(0, 0)$. This is because any integer, no matter how large, can divide `0`, so there isn't a largest divisor. 

This is why we often specify that at least one of `a` and `b` is non-zero when we make a statement about $gcd(a, b)$. 

In other words, whenever we write $gcd(a, b)$, it's implicitly assumed that at least one of `a` and `b` is non-zero.

**Remark.** We've observed that gcd(24, 44) = 4. Therefore, `24` and `44` are not relatively prime. However, if we divide both `24` and `44` by their GCD `4`, we obtain `6` and `11` respectively. These numbers are relatively prime. 

This is logical because we've divided these numbers by their GCD, which is the largest common divisor. Hence, the resulting numbers have no common divisor other than `1`, making them relatively prime.

## [Proposition 1](#proposition-1) 

If `a` and `b` are integers with $d = gcd(a, b)$, then $gcd(\frac{a}{d}, \frac{b}{d}) = 1$.

Proof. If $c = gcd(\frac{a}{d}, \frac{b}{d})$, then $c \mid \frac{a}{d}$ and $c \mid \frac{b}{d}$. This means that there are integers $k_1$ and $k_2$ with $a = ck_1$ and $b = ck_2$, which tells us that $a = cdk_1$ and $b = cdk_2$. So, $cd$ is a common divisor of $a$ and $b$. Since $d$ is the greatest common divisor and $cd \geq d$, we must have $c = 1$.

# [The Euclidean Algorithm](#the-euclidean-algorithm)

The Euclidean Algorithm is a highly valuable tool in number theory, dating back to its inclusion as *Proposition 2* in *Book VII of Euclid's Elements*. Its key advantage is the ability to calculate the greatest common divisor (gcd) without the need for factoring. This feature is particularly crucial in cryptography, where numbers often span hundreds of digits and are challenging to factor.

Let's compute $gcd(123, 456)$. Consider the following calculations:


$$456 = 3 · 123 + 87$$

$$123 = 1 · 87 + 36$$ 

$$87 = 2 · 36 + 15$$

$$36 = 2 · 15 + 6$$

$$6 = 2 · 3 + 0$$


When examining the prime factorizations of `456` and `123`, we find that the $gcd$ is the last non-zero remainder, which is `3`. Here's the process we followed: 

First, we divided the smaller number `123` into the larger one `456`, resulting in a remainder of `87`. Next, we moved the numbers `123` and `87` to the left, performed the division again, and got a remainder of `36`. We repeated this **"shift left and divide"** method until we ended up with a remainder of `0`.

Let try another example. Let's compute $gcd(119, 259)$. Consider the following calculations:

$$259 = 2 · 119 + 21$$

$$119 = 5 · 21 + 14$$

$$21 = 1 · 14 + 7$$

$$14 = 2 · 7 + 0$$

Again, the last non-zero remainder is the gcd i.e. gcd is $7$. Why does this work? Let’s start by showing why $7$ is a common divisor. 

The fact that the remainder on the last line is `0` says that $7 \mid 14$. Since $7 \mid 7$ and $7 \mid 14$, the next-to-last line says that $7 \mid 21$, since `21` is a linear combination of `7` and `14`. Now move up one line. We have just shown that $7 \mid 14$ and $7 \mid 21$. Since `119` is a linear combination of `21` and `14`, we deduce that $7 \mid 119$. Finally, moving to the top line, we see that $7 \mid 259$ because `259` is a linear combination of $119 and 21$, both of which are multiples of `7`. Since $7 \mid 119$ and $7 \mid 259$, we have proved that `7` is a common divisor of `119` and `259`.

We now want to show that `7` is the largest common divisor. Let `d` be any divisor of `119` and `259`. The top line implies that `21`, which is a linear combination of `259` and `119` (namely, $259 − 2 · 119$), is a multiple of `d`. Next, go to the second line. Both `119` and `21` are multiples of `d`, so `14` must be a multiple of `d`. The third line tells us that since $d \mid 21$ and $d \mid 14$, we must have $d \mid 7$. In particular, $d \leq 7$, so `7` is the greatest common divisor, as claimed. We also have proved the additional fact that any common divisor must divide `7`.

**Euclidean Algorithm.** Let `a` and `b` be non-negative integers and assume that $b \neq 0$. Let's do the following computation:

$$a = q_1b +r1, with  0 \leq r_1 < b$$

$$b = q_2r_1 + r_2, with  0 \leq r_2 < r_1$$ 

$$r_1 =q_3r_2 +r_3, with  0 \leq r_3 < r_2$$

$$\vdots$$

$$r_{n−3} = q_{n−1}r_{n−2} + r_{n−1}, with  0 \leq r_{n−1} < r_{n−2}$$

$$r_{n−2} = q_{n}r_{n−1} + 0$$

The last non-zero remainder, namely $r_{n−1}, equals too $gcd(a,b)$.


## [Geometrical View of the Euclidean Algorithm](#geometrical-view-of-the-euclidean-algorithm)
Suppose we want to compute $gcd(48, 21)$. Start at the point $(48, 21)$ in the plane $(x,y)$.

![Geometrical View of Computation of gcd(48,21)](/assets/images/20231018/Computation-of-gcd(48,21).png)

Start by moving left in increments of `21` until you reach or cross the line $y = x$. In this instance, we take two steps of `21`, landing us at $(6,21)$. Then, move downwards in increments of `6` (the smaller of the two coordinates) until you reach or cross the line $y = x$. Here, we take three steps of `6`, bringing us to $(6, 3)$. Next, move left in increments of `3`. After one step, we arrive at $(3, 3)$, which is on the line $y = x$. The $gcd$ is the x-coordinate (which is also the y-coordinate).

In each series of moves, the number of steps corresponds to the **quotient** in the Euclidean Algorithm, and the **remainder** is how much the final step exceeds the line $y = x$.

# [The Extended Euclidean Algorithm](#the-extended-euclidean-algorithm)

The Euclidean Algorithm reveals a fascinating and practical fact: the greatest common divisor, gcd of two numbers, `a` and `b`, can be represented as a **linear combination** of `a` and `b`. In other words, there are integers `x` and `y` that satisfy the equation $gcd(a, b) = ax + by$.

Here are some examples:

$$3 = gcd(456, 123) = 456 · 17 − 123 · 63$$

$$7 = gcd(259, 119) = 259 · 6 − 119 · 13$$

The method for obtaining x and y is called **the Extended Euclidean Algorithm**. Sometimes these are also referred as the coefficients of Bézout’s identity.

Once you’ve used the Euclidean Algorithm to arrive at gcd(a, b), there’s an easy and very straightforward way to implement the Extended Euclidean Algorithm. I’ll show you below how it works with an example.

The Extended Euclidean algorithm is based on the Euclidean algorithm, which repeatedly performs Euclidean divisions until the remainder is zero. The extended Euclidean algorithm also keeps track of the quotients of each division, and uses them to compute the coefficients `x` and `y` in a recursive way.

Here is an example of how the algorithm works. Suppose we want to find the gcd and the coefficients of Bézout's identity for `a = 36` and `b = 10`. We can use a table to keep track of the steps:

| a | b | q | r | x | y |
|---|---|---|---|---|---|
| 36 | 10 | 3 | 6 | 0 | 1 |
| 10 | 6 | 1 | 4 | 1 | -3 |
| 6 | 4 | 1 | 2 | -1 | 4 |
| 4 | 2 | 2 | 0 | 3 | -11 |

The first four columns are the same as in the Euclidean algorithm. The last two columns are computed as follows:

- On the first row, we initialize `x = 0` and `y = 1`.
- On each subsequent row, we update `x` and `y` using the formula:

$$x = x_{\text{prev}} - q \cdot y_{\text{prev}}$$

$$y = y_{\text{prev}} - q \cdot x_{\text{prev}}$$

where $x_{\text{prev}}$ and $y_{\text{prev}}$ are the values of `x` and `y` from the previous row, and `q` is the quotient of the current row.

The algorithm stops when the remainder `r` is zero. The last non-zero remainder is the gcd of `a` and `b`, and the corresponding values of `x` and `y` are the coefficients of Bézout's identity. In this example, we have:

$$gcd(36, 10) = 2$$

$$2 = (-1) \cdot 36 + (4) \cdot 10$$


## [Theorem 1](#theorem-1)

Let `a` and `b` be integers with at least one of `a`, `b` non- zero. There exist integers `x` and `y`, which can be found by the Extended Euclidean Algorithm, such that

$$gcd(a, b) = ax + by.$$

**Proof.** 
Consider the set $S$ of integers that can be expressed as $ax + by$, where `x` and `y` are integers. Since `a`, `b`, `-a`, and `-b` are all elements of $S$, we can conclude that $S$ contains at least one positive integer.

Let `d` be the smallest positive integer in $S$ (according to the Well-Ordering Principle). Since `d` is an element of $S$, we can write $d = ax_0 + by_0$ for some integers $x_0$ and $y_0$.

Now, we claim that both `a` and `b` are multiples of `d`, making `d` a common divisor of `a` and `b`. To prove this, let's write $a = dq + r$, where `q` and `r` are integers and $0 \leq r < d$.

By substituting the expression for `d`, we have:

$$r = a - dq = a - (ax_0 + by_0)q = a(1 - x_0q) + b(-y_0q)$$

Since `r` is an element of $S$, we can conclude that `r` is also a positive integer. However, since `d` is the smallest positive element in $S$ and $0 \leq r < d$, we must have $r = 0$.

This implies that `d` divides `a`. Similarly, we can show that `d` divides `b`. Therefore, `d` is a common divisor of both `a` and `b`.


## [Proposition 2](#proposition-2)
If `a` and `b` are integers, not both `0`, and `e` is a positive integer, then
$$gcd(ea, eb) = e \cdot gcd(a, b).$$

**Proof.**
From Theorem 1, there exist integers `x`, `y` such that $gcd(a, b) = ax + by$. Multiply by `e` to obtain $e · gcd(a,b) = eax + eby$. If `d` is a common divisor of `ea` and `eb`, then `d` divides $e \cdot gcd(a, b)$. Therefore, $d \leq e \cdot gcd(a, b)$. Since $e \cdot gcd(a, b)$ is a common divisor of `ea` and `eb`, it must be the $gcd$, as claimed.


## [Theorem 2](#theorem-2) 
Let $n \geq 2$ and let $a_1,a_2,...,a_n$ be integers (at least one of them must be nonzero). Then there exist integers $x_1,x_2,...,x_n$ such that

$$gcd(a_1,a_2,...,a_n)=a_1x_1 +a_2x_2 +···+a_nx_n.$$

**Proof.**
We’ll use mathematical induction to the theorem. By Theorem 1, the result is true for $n = 2$. Assume that it is true for $n = k$. Then
$$gcd(a_1,a_2,··· ,a_k) = a_1y_1 +a_2y_2 +···+a_ky_k$$

for some integers $y_1, y_2, . . . , y_k$. But,

$$gcd(a_1, a_2, . . . , a_{k+1}) = gcd(gcd(a_1, a_2, . . . , a_k), a_{k+1})$$

$$= gcd(a_1, a_2, . . . , a_k)x + a_{k+1}y$$

for some integers `x` and `y`, by Theorem 1. Thus, 

$$gcd(a_1,a_2,...,a_{k+1}) = (a_1y_1 +a_2y_2 +···+a_ky_k)x + a_{k+1}y$$

$$= a_1(xy_1) + a_2(xy_2) + · · · + a_k(xy_k) + a_{k+1}y_{k+1}$$, which is the desired result, with $x_i =xy_i$ for $1 \leq i \leq k$ and $x_{k+1} =y$. Therefore, the result is true for $n = k + 1$. By induction, the result holds for all positive integers $n \geq 2$.



