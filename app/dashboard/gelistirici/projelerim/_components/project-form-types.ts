export interface ProjectFormInitialValues {
  title: string
  description: string
  long_description?: string | null
  technologies: string[]
  github_url?: string | null
  demo_url?: string | null
  image_url?: string | null
  category?: string | null
  inspired_by?: string | null
  status: string
}
