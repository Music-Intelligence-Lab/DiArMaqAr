# API Cost Analysis Report

Generated: 2025-11-06T20:34:16.038Z

## Summary

- Total tests: 225
- Successful tests: 198
- Failed tests: 27
- Tests with external comparison: 198

## Performance Metrics

### Average Response Times
- Local API average: 49.70 ms
- External API average: 391.33 ms
- Difference: 341.63 ms (687.4% slower)

## Top 10 Slowest Endpoints

| Rank | Endpoint | Avg Time (ms) | Min (ms) | Max (ms) | StdDev (ms) |
|------|----------|---------------|----------|----------|-------------|
| 1 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat | 466.10 | 369.00 | 1248.00 | 260.73 |
| 2 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true | 383.90 | 378.00 | 392.00 | 4.09 |
| 3 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false | 378.00 | 373.00 | 389.00 | 4.17 |
| 4 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false | 347.30 | 325.00 | 455.00 | 37.62 |
| 5 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=true | 340.30 | 332.00 | 381.00 | 13.75 |
| 6 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat | 329.80 | 311.00 | 423.00 | 32.25 |
| 7 | /maqamat?filterByFamily=kurd&inArabic=true | 175.00 | 168.00 | 211.00 | 12.47 |
| 8 | /maqamat?filterByFamily=ajam&inArabic=true | 169.30 | 165.00 | 174.00 | 2.41 |
| 9 | /maqamat?inArabic=true | 163.50 | 158.00 | 180.00 | 5.94 |
| 10 | /maqamat?filterByTonic=ajam_ushayran&inArabic=true | 156.30 | 154.00 | 161.00 | 1.90 |

## Top 10 Largest Responses

| Rank | Endpoint | Avg Size (bytes) | Min (bytes) | Max (bytes) | StdDev (bytes) |
|------|----------|------------------|-------------|-------------|----------------|
| 1 | /maqamat?inArabic=true | 565523 | 565523 | 565523 | 0 |
| 2 | /maqamat?includeSources=true | 383735 | 383735 | 383735 | 0 |
| 3 | /maqamat | 381536 | 381536 | 381536 | 0 |
| 4 | /maqamat?sortBy=tonic | 381536 | 381536 | 381536 | 0 |
| 5 | /maqamat?sortBy=alphabetical | 381536 | 381536 | 381536 | 0 |
| 6 | /maqamat?includeSources=false | 381536 | 381536 | 381536 | 0 |
| 7 | /maqamat?inArabic=false | 381536 | 381536 | 381536 | 0 |
| 8 | /ajnas?includeSources=true&inArabic=true | 325706 | 325706 | 325706 | 0 |
| 9 | /ajnas?sortBy=tonic&includeSources=true&inArabic=true | 325706 | 325706 | 325706 | 0 |
| 10 | /ajnas?inArabic=true | 325092 | 325092 | 325092 | 0 |

## External vs Internal Comparison


### Endpoints with Largest External API Slowdown

| Endpoint | Local (ms) | External (ms) | Difference (ms) | % Slower |
|----------|------------|----------------|-----------------|----------|
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false | 378.00 | 1825.20 | 1447.20 | 382.9% |
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true | 383.90 | 1817.20 | 1433.30 | 373.4% |
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat | 466.10 | 1860.10 | 1394.00 | 299.1% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=true | 340.30 | 1634.00 | 1293.70 | 380.2% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat | 329.80 | 1610.90 | 1281.10 | 388.4% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false | 347.30 | 1603.80 | 1256.50 | 361.8% |
| /maqamat?inArabic=true | 163.50 | 1029.10 | 865.60 | 529.4% |
| /maqamat?filterByFamily=ajam&filterByTonic=ajam_ushayran&inArabic=true | 155.40 | 987.80 | 832.40 | 535.6% |
| /maqamat?filterByFamily=kurd&inArabic=true | 175.00 | 983.40 | 808.40 | 461.9% |
| /maqamat?filterByTonic=ajam_ushayran&inArabic=true | 156.30 | 962.50 | 806.20 | 515.8% |

### Endpoints with Largest External API Size Increase

| Endpoint | Local (bytes) | External (bytes) | Difference (bytes) | % Larger |
|----------|---------------|------------------|---------------------|----------|
| /ajnas/jins_bayyat/availability?inArabic=true | 12397 | 12450 | 53 | 0.4% |
| /ajnas/jins_athar_kurd/availability?inArabic=true | 13274 | 13327 | 53 | 0.4% |
| /ajnas/jins_athar_kurd/availability?inArabic=false | 8920 | 8973 | 53 | 0.6% |
| /ajnas/jins_ajam_ushayran/availability?inArabic=true | 13974 | 14027 | 53 | 0.4% |
| /ajnas/jins_segah_baladi/availability?inArabic=true | 10577 | 10630 | 53 | 0.5% |
| /ajnas/jins_hijaz_yegah/availability?inArabic=false | 2615 | 2668 | 53 | 2.0% |
| /ajnas/jins_bayyat/availability?inArabic=false | 8331 | 8384 | 53 | 0.6% |
| /ajnas/jins_bayyat/availability | 8316 | 8369 | 53 | 0.6% |
| /ajnas/jins_segah_baladi/availability?inArabic=false | 7087 | 7140 | 53 | 0.7% |
| /ajnas/jins_hijaz_yegah/availability?inArabic=true | 3721 | 3774 | 53 | 1.4% |


## Efficiency Recommendations

### 1. Caching Opportunities
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat**: Consider caching responses (avg 466.10ms)
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true**: Consider caching responses (avg 383.90ms)
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false**: Consider caching responses (avg 378.00ms)
- **/tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false**: Consider caching responses (avg 347.30ms)
- **/tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=true**: Consider caching responses (avg 340.30ms)

### 2. Response Size Optimization
- **/maqamat?inArabic=true**: Consider pagination or field filtering (avg 552.27KB)
- **/maqamat?includeSources=true**: Consider pagination or field filtering (avg 374.74KB)
- **/maqamat**: Consider pagination or field filtering (avg 372.59KB)
- **/maqamat?sortBy=tonic**: Consider pagination or field filtering (avg 372.59KB)
- **/maqamat?sortBy=alphabetical**: Consider pagination or field filtering (avg 372.59KB)

### 3. Parameter Impact Analysis
- Review parameter combinations that significantly increase response time or size
- Consider setting optimal defaults for commonly used parameters

### 4. External API Performance
- External API is significantly slower (687.4% slower on average)
  - Consider CDN caching or edge optimization for external deployments

## Data Files

- CSV Results: `api-cost-audit-2025-11-06T20-16-08.csv`
- Analysis Report: `api-cost-analysis-2025-11-06T20-16-08.md`
