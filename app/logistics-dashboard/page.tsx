"use client"

import { Suspense } from "react"
import LogisticsDashboardContent from "./content"
import Loading from "./loading"

export default function LogisticsDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <LogisticsDashboardContent />
    </Suspense>
  )
}
