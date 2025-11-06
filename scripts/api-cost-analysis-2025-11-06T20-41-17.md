# API Cost Analysis Report

Generated: 2025-11-06T20:59:24.117Z

## Summary

- Total tests: 198
- Successful tests: 198
- Failed tests: 0
- Tests with external comparison: 198

## Performance Metrics

### Average Response Times
- Local API average: 52.28 ms
- External API average: 397.17 ms
- Difference: 344.89 ms (659.7% slower)

## Top 10 Slowest Endpoints

| Rank | Endpoint | Avg Time (ms) | Min (ms) | Max (ms) | StdDev (ms) |
|------|----------|---------------|----------|----------|-------------|
| 1 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat | 502.50 | 365.00 | 878.00 | 184.75 |
| 2 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat | 401.40 | 308.00 | 1102.00 | 235.32 |
| 3 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true | 385.10 | 379.00 | 397.00 | 5.22 |
| 4 | /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false | 376.20 | 370.00 | 405.00 | 10.03 |
| 5 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false | 356.90 | 325.00 | 456.00 | 42.98 |
| 6 | /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=true | 335.90 | 328.00 | 373.00 | 14.15 |
| 7 | /tuning-systems/al-Dik-(1926a)/yegah/maqamat | 330.60 | 325.00 | 353.00 | 7.75 |
| 8 | /maqamat?filterByFamily=ajam&filterByTonic=ajam_ushayran&inArabic=true | 183.30 | 156.00 | 253.00 | 36.76 |
| 9 | /maqamat?inArabic=true | 166.10 | 162.00 | 176.00 | 4.16 |
| 10 | /maqamat?filterByFamily=ajam&inArabic=true | 163.90 | 157.00 | 196.00 | 11.05 |

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
| /maqamat | 122.60 | 3028.70 | 2906.10 | 2370.4% |
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true | 385.10 | 1811.20 | 1426.10 | 370.3% |
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false | 376.20 | 1769.00 | 1392.80 | 370.2% |
| /tuning-systems/Ronzevalle-(1904)/ushayran/maqamat | 502.50 | 1781.90 | 1279.40 | 254.6% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=true | 335.90 | 1552.30 | 1216.40 | 362.1% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false | 356.90 | 1522.40 | 1165.50 | 326.6% |
| /tuning-systems/al-Dik-(1926a)/yegah/maqamat | 330.60 | 1494.90 | 1164.30 | 352.2% |
| /tuning-systems/Ronzevalle-(1904)/yegah/maqamat | 401.40 | 1533.00 | 1131.60 | 281.9% |
| /maqamat?inArabic=true | 166.10 | 995.50 | 829.40 | 499.3% |
| /maqamat?filterByFamily=ajam&inArabic=true | 163.90 | 960.80 | 796.90 | 486.2% |

### Endpoints with Largest External API Size Increase

| Endpoint | Local (bytes) | External (bytes) | Difference (bytes) | % Larger |
|----------|---------------|------------------|---------------------|----------|
| /ajnas/jins_ajam_ushayran/availability?inArabic=true | 13974 | 14001 | 27 | 0.2% |
| /ajnas/jins_nahawand/availability?inArabic=true | 13934 | 13961 | 27 | 0.2% |
| /ajnas/jins_hijaz_3_(binsir)/availability?inArabic=true | 13656 | 13683 | 27 | 0.2% |
| /ajnas/jins_hijaz_3_(binsir)/availability?inArabic=false | 9179 | 9206 | 27 | 0.3% |
| /ajnas/jins_segah_baladi/availability | 7072 | 7099 | 27 | 0.4% |
| /ajnas/jins_hijaz_3_(binsir)/availability | 9164 | 9191 | 27 | 0.3% |
| /ajnas/jins_hijaz_yegah/availability | 2600 | 2627 | 27 | 1.0% |
| /ajnas/jins_hijaz_yegah/availability?inArabic=true | 3721 | 3748 | 27 | 0.7% |
| /ajnas/jins_nahawand/availability | 9372 | 9399 | 27 | 0.3% |
| /ajnas/jins_segah_baladi/availability?inArabic=true | 10577 | 10604 | 27 | 0.3% |


## Efficiency Recommendations

### 1. Caching Opportunities
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat**: Consider caching responses (avg 502.50ms)
- **/tuning-systems/Ronzevalle-(1904)/yegah/maqamat**: Consider caching responses (avg 401.40ms)
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=true**: Consider caching responses (avg 385.10ms)
- **/tuning-systems/Ronzevalle-(1904)/ushayran/maqamat?inArabic=false**: Consider caching responses (avg 376.20ms)
- **/tuning-systems/Ronzevalle-(1904)/yegah/maqamat?inArabic=false**: Consider caching responses (avg 356.90ms)

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
- External API is significantly slower (659.7% slower on average)
  - Consider CDN caching or edge optimization for external deployments

## Data Files

- CSV Results: `api-cost-audit-2025-11-06T20-41-17.csv`
- Analysis Report: `api-cost-analysis-2025-11-06T20-41-17.md`
