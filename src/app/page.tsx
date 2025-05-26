// app/page.tsx
import { Suspense } from 'react'
import HomeClient from './home-client'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <HomeClient />
    </Suspense>
  )
}