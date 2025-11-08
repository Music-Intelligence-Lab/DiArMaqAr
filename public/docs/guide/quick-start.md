---
url: /docs/guide/quick-start.md
description: Get up and running with DiArMaqAr quickly
---

# Quick Start Guide

This guide will help you get started with the Digital Arabic Maqām Archive in just a few minutes.

## Installation

### For API Usage

No installation needed! The API is accessible via HTTP requests.

### For TypeScript/JavaScript Usage

If using the library directly, import from source in your project.

## First API Request

Let's make your first API call:

```bash
# List all maqāmāt
curl http://localhost:3000/api/maqamat
```

This will return a list of all available maqāmāt with basic metadata.

## Get Detailed Maqām Data

To get detailed data for a specific maqām:

```bash
curl "http://localhost:3000/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
```

This returns:

* Complete pitch data in the specified tuning system
* Ajnās information (always included)
* Optional intervals, modulations, and suyūr

## Explore Further

* [API Reference](/api/) - Complete API documentation
* [TypeScript Library](/library/) - Programmatic usage guide
* [Interactive API Playground](http://localhost:3000/api-playground) - Test endpoints in your browser
