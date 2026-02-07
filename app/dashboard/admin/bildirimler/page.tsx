"use client"

import { useState, useCallback } from "react"
import { AdminNotificationsHeader } from "./_components/AdminNotificationsHeader"
import { AdminNotificationsForm } from "./_components/AdminNotificationsForm"
import { AdminNotificationsExamples } from "./_components/AdminNotificationsExamples"

export interface NotificationTemplateValues {
  title: string
  body: string
  href: string
  targetRole: string
}

export default function AdminNotificationsPage() {
  const [templateValues, setTemplateValues] = useState<NotificationTemplateValues | null>(null)
  const [applyTrigger, setApplyTrigger] = useState(0)

  const onSelectTemplate = useCallback((values: NotificationTemplateValues) => {
    setTemplateValues(values)
    setApplyTrigger((t) => t + 1)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <AdminNotificationsHeader />
      <section className="space-y-6">
        <AdminNotificationsForm
          initialValues={templateValues}
          applyTrigger={applyTrigger}
        />
      </section>
      <section className="space-y-4">
        <AdminNotificationsExamples onSelectTemplate={onSelectTemplate} />
      </section>
    </div>
  )
}
