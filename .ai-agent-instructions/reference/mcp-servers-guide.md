# MCP Servers Usage Guide

**PURPOSE**: Detailed guide for leveraging Model Context Protocol (MCP) servers to extend AI agent capabilities.

**LOAD**: Conditionally - when user mentions MCP, Context7, Playwright, or when needing library documentation or browser automation.

---

## Overview

MCP servers provide powerful extensions to base AI capabilities. Use them strategically to access current documentation, automate browser interactions, and enhance development workflows.

---

## Context7 (Upstash) - Library Documentation

**Purpose**: Access up-to-date documentation for any library or framework beyond your training data.

### When to Use

- Need current API documentation for libraries
- Looking for best practices for specific frameworks
- Want code examples from official documentation
- Checking for breaking changes in newer versions
- Exploring API surfaces of unfamiliar libraries

### Workflow

1. **Resolve library ID**: Use `resolve-library-id` with library name
2. **Fetch documentation**: Use `get-library-docs` with resolved ID and topic
3. **Apply to task**: Implement with culturally-aware approach

### Example Scenarios

**Checking non-Western support:**
```
"How does VexFlow handle non-Western notation systems?"
→ Use Context7 to fetch VexFlow documentation
→ Analyze through decolonial lens
→ Identify limitations or adaptation opportunities
```

**Framework internationalization:**
```
"What are Next.js 15 app router patterns for internationalization?"
→ Fetch Next.js i18n documentation
→ Apply to Arabic/English bilingual support
→ Respect cultural text direction (RTL/LTR)
```

**React concurrent features:**
```
"Show React 19 concurrent rendering examples"
→ Get latest React docs on concurrent features
→ Apply to performance-critical music rendering
```

### Best Practices

**Strategic queries:**
- Be specific about version numbers
- Ask for specific features or patterns
- Request code examples when available
- Focus on areas beyond your training cutoff

**Cultural awareness:**
- Documentation may assume Western contexts
- Check for internationalization support
- Verify accessibility features
- Adapt examples to respect cultural frameworks

**Integration:**
- Combine external docs with project conventions
- Apply existing architectural patterns
- Maintain code quality standards
- Document any library-specific cultural adaptations

---

## Playwright - Browser Automation

**Purpose**: Interact with web pages programmatically for testing, data extraction, and UI verification.

### When to Use

- Testing live applications and UI workflows
- Extracting data from documentation websites
- Verifying responsive design across viewports
- Automating browser-based testing
- Taking screenshots for documentation
- Monitoring network requests
- Checking console output

### Capabilities

**Navigation & Interaction:**
- Navigate to URLs
- Click elements
- Fill forms
- Hover over elements
- Scroll and wait for elements

**JavaScript Execution:**
- Execute arbitrary JavaScript in browser context
- Access DOM directly
- Manipulate page state
- Extract computed values

**Visual & Accessibility:**
- Take screenshots (full page or specific elements)
- Capture accessibility snapshots
- Test responsive layouts
- Verify color contrast

**Network & Performance:**
- Monitor network requests
- Check console logs for errors
- Measure load times
- Verify API calls

### Example Scenarios

**Workflow testing:**
```
"Test the maqām selection workflow on localhost"
→ Navigate to maqām selector
→ Click through selection process
→ Verify pitch classes update correctly
→ Check Arabic text displays properly
```

**Internationalization verification:**
```
"Verify the Arabic/English language toggle works correctly"
→ Load page in English
→ Take screenshot
→ Toggle to Arabic
→ Verify RTL layout
→ Take comparison screenshot
→ Check for text rendering issues
```

**Data extraction:**
```
"Extract example data from the live documentation"
→ Navigate to docs site
→ Execute JavaScript to extract structured data
→ Validate against schema
→ Use for testing or examples
```

**Visual documentation:**
```
"Screenshot the staff notation rendering for different maqāmāt"
→ Loop through maqām list
→ Select each maqām
→ Wait for notation render
→ Capture screenshot
→ Organize by family classification
```

### Best Practices

**Reliable selectors:**
- Prefer data-testid attributes
- Use semantic HTML (role, aria-label)
- Avoid brittle CSS selectors
- Handle dynamic content with waits

**Cultural testing:**
- Test both Arabic and English UI
- Verify RTL/LTR layout switching
- Check font rendering for Arabic text
- Validate Unicode handling
- Test enharmonic notation display

**Performance:**
- Reuse browser context when possible
- Close pages after use
- Handle timeouts gracefully
- Cache results when appropriate

**Documentation:**
- Save screenshots with descriptive names
- Document test workflows
- Note browser/viewport used
- Include timestamp for version tracking

---

## Other MCP Servers

As new MCP servers become available, evaluate them for:

- **Relevance**: Does it solve real project needs?
- **Cultural compatibility**: Does it support non-Western contexts?
- **Performance**: What's the overhead?
- **Maintenance**: Is it actively maintained?
- **Integration**: How well does it fit existing workflows?

---

## General MCP Best Practices

### Strategic Application

**Use when:**
- You need information beyond your training data
- Current documentation is critical (API changes, new features)
- Browser automation saves significant manual effort
- Live testing is more efficient than mocking

**Don't use when:**
- Your core knowledge is sufficient
- Project documentation provides the answer
- Simple file reading is faster
- Task doesn't benefit from external tools

### Cultural Awareness

**Apply critical lens:**
- External resources often have Western biases
- Library examples may assume Western music theory
- Internationalization features may be incomplete
- Accessibility tools may not cover all scripts

**Adapt thoughtfully:**
- Don't blindly copy external examples
- Apply decolonial computing principles
- Respect cultural frameworks
- Validate with domain experts when possible

**Document adaptations:**
- Note where external patterns were modified
- Explain cultural considerations
- Reference original sources
- Preserve institutional knowledge

### Integration with Workflow

**Combine strategically:**
- Use MCP servers to enhance, not replace, core knowledge
- Integrate findings with project conventions
- Apply existing architectural patterns
- Maintain code quality standards

**Preserve learnings:**
- Document useful library patterns discovered
- Note cultural adaptation strategies
- Update instruction files with insights
- Share knowledge through comments and docs

---

## Summary

MCP servers extend your capabilities significantly:

- **Context7**: Access current library documentation beyond training data
- **Playwright**: Automate browser testing and interaction
- **Future servers**: Evaluate new tools for project fit

Always apply these tools through the lens of:
- **Decolonial computing**: Question Western defaults
- **Cultural sensitivity**: Respect non-Western frameworks
- **Code quality**: Maintain project standards
- **Knowledge preservation**: Document learnings

Use MCP servers as **powerful tools in service of culturally-aware, technically excellent software development**.
