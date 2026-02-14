"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { createProject, updateProject, uploadProjectImage, type ProjectFormState } from "../actions"
import { toast } from "sonner"
import { ProjectFormHeader } from "./ProjectFormHeader"
import { ProjectImageUpload } from "./ProjectImageUpload"
import { ProjectFormFields } from "./ProjectFormFields"
import { ProjectSidebarPreview } from "./ProjectSidebarPreview"
import type { ProjectFormInitialValues } from "./project-form-types"

export interface ProjectFormProps {
  mode: "create" | "edit"
  projectId?: string
  noCard?: boolean
  redirectBasePath?: string
  listPath?: string
  showSidebarPreview?: boolean
  initialValues?: ProjectFormInitialValues | null
}

const defaultListPath = "/dashboard/gelistirici/projelerim"

export function ProjectForm({
  mode,
  projectId,
  initialValues,
  noCard,
  redirectBasePath,
  listPath = defaultListPath,
  showSidebarPreview = false,
}: ProjectFormProps) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "")
  const [status, setStatus] = useState(initialValues?.status ?? "draft")
  const [longDescription, setLongDescription] = useState(initialValues?.long_description ?? "")
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [description, setDescription] = useState(initialValues?.description ?? "")
  const [technologies, setTechnologies] = useState(
    Array.isArray(initialValues?.technologies) ? initialValues.technologies.join(", ") : "",
  )

  const action =
    mode === "create"
      ? createProject
      : (prev: ProjectFormState, fd: FormData) => updateProject(projectId!, prev, fd)

  const [state, formAction] = useActionState(action, { ok: false })
  const [uploadState, uploadFormAction] = useActionState(uploadProjectImage, { ok: false })
  const [isUploading, setIsUploading] = useState(false)
  const uploadFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === "create" ? "Proje eklendi" : "Proje güncellendi")
      if (mode === "create") {
        const path = redirectBasePath ?? "/dashboard/gelistirici/projelerim"
        window.location.href = path
      } else {
        router.refresh()
      }
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, mode, router, redirectBasePath])

  useEffect(() => {
    setIsUploading(false)
    if (uploadState.ok && uploadState.url) {
      setImageUrl(uploadState.url)
      toast.success("Görsel yüklendi")
    } else if (uploadState.error) {
      toast.error(uploadState.error)
    }
  }, [uploadState])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.size) return
    setIsUploading(true)
    uploadFormRef.current?.requestSubmit()
  }

  const formContent = (
    <div className="space-y-6">
      <ProjectImageUpload
        imageUrl={imageUrl}
        onRemove={() => setImageUrl("")}
        uploadFormRef={uploadFormRef}
        uploadFormAction={uploadFormAction}
        isUploading={isUploading}
        onFileChange={handleFileChange}
      />
      <ProjectFormFields
        formAction={formAction}
        error={state.error}
        imageUrl={imageUrl}
        listPath={listPath}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        longDescription={longDescription}
        setLongDescription={setLongDescription}
        technologies={technologies}
        setTechnologies={setTechnologies}
        status={status}
        setStatus={setStatus}
        initialValues={initialValues}
        showSidebarPreview={showSidebarPreview}
      />
    </div>
  )

  const sidebarPreview =
    showSidebarPreview ? (
      <ProjectSidebarPreview
        imageUrl={imageUrl}
        title={title}
        description={description}
        longDescription={longDescription}
        technologiesString={technologies}
      />
    ) : null

  if (noCard) {
    if (showSidebarPreview) {
      return (
        <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row md:overflow-hidden">
          {sidebarPreview}
          <div className="flex flex-1 flex-col overflow-y-auto border-t border-border/50 md:border-l md:border-t-0">
            <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
              <div className="mx-auto w-full max-w-lg">
                <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
                  <Link href={listPath}>← Projelere dön</Link>
                </Button>
                <ProjectFormHeader mode={mode} noCard={noCard} listPath={listPath} />
                {formContent}
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div>
        <ProjectFormHeader mode={mode} noCard={noCard} listPath={listPath} />
        {formContent}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={listPath}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <CardTitle>{mode === "create" ? "Yeni Proje" : "Projeyi Düzenle"}</CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Proje bilgilerini girin. Taslak olarak kaydedip sonra yayınlayabilirsiniz."
                : "Proje bilgilerini güncelleyin."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
