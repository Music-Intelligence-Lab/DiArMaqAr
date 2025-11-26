# TODO List

Tasks, research items, and things to take care of for the DiArMaqAr project.

---

## Research


---

## Tasks

- [ ] **Check if all modulations json files are generated**: Verify that all modulation JSON files have been generated and are complete

- [ ] **Refactor /maqamat/{idName} endpoint**: Updated the `/maqamat/{idName}` endpoint to use pregenerated JSON files instead of calculating routes in real-time


- [ ] **Remove "includeModulations" from /ajnas/{idName} endpoint**: we don't calculate modulations from ajnas

- [ ] **Refactor /modulation-routes endpoint**: Update the `/modulation-routes` endpoint to use pre-generated JSON files instead of calculating routes in real-time

- [ ] **Create transpositions JSON generation script**: Make a similar script to `generate-modulations` that renders transpositions as JSON files

- [ ] **Render all transpositions**: Execute the transpositions generation script to create all transposition JSON files

- [ ] **Refactor API endpoints using transpositions**: Update all API endpoints that use transpositions (including `/maqamat/{idName}` and any others) to use the pre-generated JSON files instead of real-time computation

- [ ] **Refactor modulations and transpositions components**: Update both modulations and transpositions components to use the JSON files instead of real-time computation. Ensure that no functions are removed from the files during refactoring

---

## Completed

<!-- Move completed items here with date -->
