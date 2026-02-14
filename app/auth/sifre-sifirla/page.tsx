import { Suspense } from "react"
import { ResetPasswordForm } from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">Yükleniyor...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
