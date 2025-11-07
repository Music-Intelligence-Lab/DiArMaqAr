---
url: /docs/guide/data-export.md
description: Comprehensive data export capabilities for research and composition
---

# Data Export

DiArMaqAr provides comprehensive data export capabilities designed to support both academic research and practical music-making applications. Users can export complete datasets including tuning systems, ajnās, maqāmāt, and modulation analysis results in structured formats.

## Export Formats

### JSON

Structured, machine-readable format maintaining complete data relationships:

```json
{
  "maqam": {
    "name": "Maqam Rast",
    "ascendingSequence": [...],
    "descendingSequence": [...],
    "ajnas": [...],
    "transpositions": [...],
    "modulations": [...]
  }
}
```

**Use Cases:**

* Programmatic access in other applications
* Data analysis and processing
* Integration with custom tools
* API development

### CSV

Tabular format suitable for spreadsheet software and statistical analysis:

**Columns typically include:**

* Pitch class values
* Mathematical representations
* Note names
* Intervallic relationships
* Source attributions

**Use Cases:**

* Statistical analysis
* Spreadsheet manipulation
* Data visualization
* Quantitative research

### Scala (.scl and .kbm)

Scala is a widely-used format for microtonal scale representation, compatible with many music software and hardware.

#### Scala Scale Files (.scl)

* Contains scale definition with pitch ratios or cents
* Comprehensive metadata from database
* Proper formatting for Scala software
* Includes bibliographic attribution

#### Scala Keymap Files (.kbm)

* Maps scale degrees to MIDI keys
* Defines reference note and octave size
* Enables accurate playback in compatible software

**Use Cases:**

* Integration with synthesizers and samplers
* Contemporary composition practice
* Software instrument design
* Hardware synthesizer configuration

## Export Functions

### Via TypeScript Library

```typescript
import { 
  exportMaqam, 
  exportJins, 
  exportTuningSystem,
  exportToScala 
} from '@/functions/export'

// Export maqām data
const maqamJSON = exportMaqam(maqam, {
  includeTranspositions: true,
  includeModulations: true,
  includeAjnās: true
})

// Export tuning system to Scala
const scalaFiles = exportToScala(tuningSystem, {
  format: 'scl', // or 'kbm'
  referenceNote: 'A4',
  referenceFrequency: 440
})
```

### Export Options

**For Maqāmāt:**

* Include/exclude transpositions
* Include/exclude modulation analysis
* Include/exclude embedded ajnās
* Include/exclude suyūr
* Specify pitch data formats

**For Tuning Systems:**

* All pitch representations
* Note name associations
* Source attributions
* Mathematical calculations

**For Ajnās:**

* Transposition data
* Intervallic structures
* Bibliographic references

## Complete Dataset Export

The platform enables comprehensive dataset generation:

### All Transpositions

Export all possible transpositions for:

* All maqāmāt within a tuning system
* All ajnās within a tuning system
* Complete theoretical mappings

### Modulation Networks

Export complete modulation matrices:

* All valid modulation pathways
* Network relationships
* Comparative analysis data

### Comparative Analysis

Export data for comparing:

* Different tuning systems
* Starting note conventions
* Historical vs. modern approaches

## Research Applications

### Quantitative Analysis

* Statistical analysis of modal relationships
* Correlations between tuning system characteristics
* Transposition and modulation pattern analysis
* Large-scale comparative studies

### Machine Learning Datasets

* Training data for maqām detection models
* Feature engineering for classification
* Ground truth labels with provenance
* Structured, validated reference data

### Musicological Research

* Systematic analysis of traditional repertoire
* Comparative tuning system studies
* Historical framework analysis
* Theoretical validation studies

## Export Metadata

All exports include:

* **Complete source attribution**: Bibliographic references
* **Mathematical details**: All pitch representations
* **Cross-references**: Relationships between entities
* **Provenance**: Transparent data origin
* **Version information**: Data version and platform version

## Integration Examples

### Python Analysis

```python
import json
import pandas as pd

# Load exported JSON
with open('maqamat_export.json') as f:
    data = json.load(f)

# Convert to DataFrame for analysis
df = pd.DataFrame(data['maqamat'])
# Perform statistical analysis
```

### Scala Software

1. Export tuning system to .scl format
2. Import into Scala software
3. Load into compatible synthesizer
4. Play with accurate microtonal tuning

### DAW Integration

1. Export Scala files (.scl/.kbm)
2. Import into DAW (e.g., via MTS-ESP, Kontakt, etc.)
3. Create instruments with authentic tunings
4. Compose using historical frameworks

## Best Practices

### Data Verification

* Always include source attribution in exports
* Verify mathematical calculations
* Check note name associations
* Validate against original sources

### Format Selection

* **JSON**: For programmatic access
* **CSV**: For statistical analysis
* **Scala**: For music software integration
* **Custom**: For specific research needs

### Documentation

* Document export parameters
* Record source tuning system
* Note any transformations applied
* Maintain export logs

## Next Steps

* Learn about [Research Applications](/guide/research-applications/)
* Explore [Bibliographic Sources](/guide/bibliographic-sources/)
* Understand [Tuning Systems](/guide/tuning-systems/) for export
