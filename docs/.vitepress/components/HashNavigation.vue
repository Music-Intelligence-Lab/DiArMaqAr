<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

function handleHashNavigation() {
  const hash = window.location.hash
  if (hash) {
    // Try multiple times with increasing delays for lazy-loaded content
    let attempts = 0
    const maxAttempts = 15
    const attemptDelay = 300
    
    function tryScroll() {
      attempts++
      
      // Try multiple hash formats that vitepress-openapi might use
      const hashValue = hash.replace('#', '').toLowerCase()
      
      // Normalize tag names (remove diacritics, spaces to hyphens)
      const normalizeTag = (tag: string) => {
        return tag
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[āăàáâãäå]/g, 'a')
          .replace(/[ēèéêë]/g, 'e')
          .replace(/[īìíîï]/g, 'i')
          .replace(/[ōòóôõö]/g, 'o')
          .replace(/[ūùúûü]/g, 'u')
          .replace(/[ʿʾ]/g, '')
      }
      
      const normalizedHash = normalizeTag(hashValue)
      const tagMappings: Record<string, string[]> = {
        'maqamat': ['maqamat', 'maqāmāt', 'maqam', 'tag-maqamat'],
        'ajnas': ['ajnas', 'ajnās', 'ajna', 'tag-ajnas'],
        'tuning-systems': ['tuning-systems', 'tuning systems', 'tuning-system', 'tag-tuning-systems'],
        'pitch-classes': ['pitch-classes', 'pitch classes', 'pitch-class', 'tag-pitch-classes'],
        'intervals': ['intervals', 'interval', 'tag-intervals'],
        'sources': ['sources', 'source', 'tag-sources'],
        'modulations': ['modulations', 'modulation', 'tag-modulations'],
      }
      
      // Get all possible variations for this hash
      const variations = tagMappings[normalizedHash] || [normalizedHash]
      const allSelectors = [
        hash, // Original hash
        ...variations.map(v => `#${v}`),
        ...variations.map(v => `[id="${v}"]`),
        ...variations.map(v => `[id*="${v}"]`),
        ...variations.map(v => `[data-tag="${v}"]`),
        ...variations.map(v => `[class*="${v}"]`),
      ]
      
      const selectors = [...new Set(allSelectors)] // Remove duplicates
      
      let element: Element | null = null
      for (const selector of selectors) {
        try {
          element = document.querySelector(selector)
          if (element) break
        } catch (e) {
          // Invalid selector, continue
        }
      }
      
      // If still not found, try to find by tag name in OpenAPI structure
      if (!element && hashValue.includes('tag/')) {
        const tagName = hashValue.replace('tag/', '').trim()
        // Look for elements that might contain the tag name
        const allElements = Array.from(document.querySelectorAll('[id], [class*="tag"], h2, h3'))
        element = allElements.find(el => {
          const id = el.id?.toLowerCase() || ''
          const text = el.textContent?.toLowerCase() || ''
          const className = el.className?.toLowerCase() || ''
          return id.includes(tagName.toLowerCase()) || 
                 text.includes(tagName.toLowerCase()) ||
                 className.includes(tagName.toLowerCase().replace(/\s+/g, '-'))
        }) || null
      }
      
      if (element) {
        // Scroll to the element with offset for navbar
        const offset = 134 // VitePress scroll offset
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - offset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        console.log('Scrolled to hash:', hash, 'element:', element, 'selector used:', selectors.find(s => {
          try {
            return document.querySelector(s) === element
          } catch {
            return false
          }
        }))
      } else if (attempts < maxAttempts) {
        // If not found, try again after delay
        setTimeout(tryScroll, attemptDelay)
      } else {
        // Log for debugging if element not found after all attempts
        console.warn('Hash anchor not found after', maxAttempts, 'attempts:', hash)
        // Try to find similar IDs for debugging
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id)
        const similarIds = allIds.filter(id => id.toLowerCase().includes(hashValue.toLowerCase().replace('tag/', '')))
        if (similarIds.length > 0) {
          console.log('Similar IDs found:', similarIds.slice(0, 10))
        }
      }
    }
    
    tryScroll()
  }
}

onMounted(() => {
  // Handle hash on initial load with longer delay for OpenAPI component to render
  setTimeout(handleHashNavigation, 500)
  
  // Handle hash changes (e.g., when clicking sidebar links)
  window.addEventListener('hashchange', handleHashNavigation)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashNavigation)
})
</script>

<template>
  <!-- This component handles hash navigation for the OpenAPI playground -->
</template>

