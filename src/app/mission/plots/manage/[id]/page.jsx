import { Suspense } from "react"
import ManagePageInner from "./ManagePageInner"

export default function ManagePage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">⏳ Loading...</p>}>
      <ManagePageInner />
    </Suspense>
  )
}
