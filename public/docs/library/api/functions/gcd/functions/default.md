---
url: /docs/library/api/functions/gcd/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/gcd](../README.md) / default

# Function: default()

> **default**(`a`, `b`): `number`

Defined in: [functions/gcd.ts:24](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/gcd.ts#L24)

Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.

This function is essential for simplifying fractions throughout the maqam analysis system.
It uses the Euclidean algorithm with floating-point precision handling to ensure
accurate results even with small decimal numbers.

The Euclidean algorithm works by repeatedly replacing the larger number with the
remainder of the division until one number becomes effectively zero.

## Parameters

### a

`number`

First number (will be converted to absolute value)

### b

`number`

Second number (will be converted to absolute value)

## Returns

`number`

The Greatest Common Divisor of a and b

## Examples

```ts
gcd(12, 8) // Returns 4
```

```ts
gcd(15, 25) // Returns 5
```

```ts
gcd(17, 13) // Returns 1 (coprime numbers)
```
