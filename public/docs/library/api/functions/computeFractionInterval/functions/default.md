---
url: /docs/library/api/functions/computeFractionInterval/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/computeFractionInterval](../README.md) / default

# Function: default()

> **default**(`firstFraction`, `secondFraction`): `string`

Defined in: [functions/computeFractionInterval.ts:26](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/computeFractionInterval.ts#L26)

Computes the interval between two fractions and returns the result as a simplified fraction.

This function calculates the ratio between two fractions, which is essential for
determining musical intervals in just intonation and other tuning systems.
The result is automatically simplified using the Greatest Common Divisor.

Mathematical formula: (c/d) / (a/b) = (c \* b) / (d \* a)

## Parameters

### firstFraction

`string`

The first fraction in "numerator/denominator" format (e.g., "3/2")

### secondFraction

`string`

The second fraction in "numerator/denominator" format (e.g., "4/3")

## Returns

`string`

The interval as a simplified fraction string

## Examples

```ts
// Calculate interval from 3/2 to 4/3
computeFractionInterval("3/2", "4/3")
// Returns "8/9" (the simplified result of (4*2)/(3*3))
```

```ts
// Calculate interval from 5/4 to 6/5
computeFractionInterval("5/4", "6/5")
// Returns "24/25"
```
