import { Suspense } from "react"
import { AuthSplitLayout } from "@/components/auth-split-layout"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <AuthSplitLayout title="Giriş Yap" subtitle="Hesabınıza giriş yaparak devam edin">
      <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  )
}
