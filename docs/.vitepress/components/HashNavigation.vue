<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

function handleHashNavigation() {
  const hash = window.location.hash
  if (hash) {
    // Try multiple times with increasing delays for lazy-loaded content
    let attempts = 0
    const maxAttempts = 10
    const attemptDelay = 200
    
    function tryScroll() {
      attempts++
      const element = document.querySelector(hash)
      if (element) {
        // Scroll to the element with offset for navbar
        const offset = 134 // VitePress scroll offset
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - offset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        console.log('Scrolled to hash:', hash, 'element:', element)
      } else if (attempts < maxAttempts) {
        // If not found, try again after delay
        setTimeout(tryScroll, attemptDelay)
      } else {
        // Log for debugging if element not found after all attempts
        console.warn('Hash anchor not found after', maxAttempts, 'attempts:', hash)
        // Try to find similar IDs for debugging
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id)
        const similarIds = allIds.filter(id => id.toLowerCase().includes(hash.replace('#', '').toLowerCase()))
        if (similarIds.length > 0) {
          console.log('Similar IDs found:', similarIds)
        }
      }
    }
    
    tryScroll()
  }
}

onMounted(() => {
  // Handle hash on initial load
  setTimeout(handleHashNavigation, 100)
  
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

