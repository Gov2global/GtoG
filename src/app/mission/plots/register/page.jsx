import { Suspense } from "react"
import RegisterPageInner from "./RegisterPageInner"

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">⏳ Loading...</p>}>
      <RegisterPageInner />
    </Suspense>
  )
}
