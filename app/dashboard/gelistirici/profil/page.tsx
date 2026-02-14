import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, Globe, Linkedin, Github, Twitter, MapPin, Mail, Phone, Edit2, Download, ExternalLink, BookOpen } from "lucide-react"
import { ProfileForm } from "./profile-form"
import { ProfileExperiences } from "./profile-experiences"
import { ProfileEducations } from "./profile-educations"
import { ProfileCertificates } from "./profile-certificates"
import { ChangePasswordForm } from "./change-password-form"
import Link from "next/link"

interface ProfilePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Ensure searchParams is awaited
  const query = await searchParams
  const isEditing = query.edit === "true"

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: skills } = await supabase
    .from("developer_skills")
    .select(
      `
      *,
      skills:skill_id (
        name,
        category
      )
    `,
    )
    .eq("developer_id", user.id)

  // Fetch CV Sections
  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .eq("developer_id", user.id)
    .order("start_date", { ascending: false })

  const { data: educations } = await supabase
    .from("educations")
    .select("*")
    .eq("developer_id", user.id)
    .order("start_date", { ascending: false })

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("developer_id", user.id)
    .order("issue_date", { ascending: false })

  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .eq("author_id", user.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10)

  // Edit Mode
  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profili Düzenle</h1>
            <p className="text-muted-foreground">Bilgilerinizi güncelleyin ve kaydedin</p>
          </div>
          <Button variant="ghost" asChild className="hover:bg-muted transition-all duration-300 hover:translate-x-[-4px]">
            <Link href="/dashboard/gelistirici/profil">Geri Dön</Link>
          </Button>
        </div>

        {/* Temel Bilgiler Formu */}
        <ProfileForm initialData={profile} initialSkills={skills || []} userId={user.id} />

        {/* CV Bölümleri Yönetimi */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">CV Detayları</h2>
          <ProfileExperiences experiences={experiences || []} isEditing={true} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileEducations educations={educations || []} isEditing={true} />
            <ProfileCertificates certificates={certificates || []} isEditing={true} />
          </div>
        </div>

        {/* Şifre Değiştirme */}
        <ChangePasswordForm />
      </div>
    )
  }

  // View Mode (CV Design)
  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        {/* Banner / Header Background */}
        <div
          className="h-48 bg-gradient-to-r from-primary to-primary/80 relative bg-cover bg-center"
          style={profile?.profile_bg_url ? { backgroundImage: `url(${profile.profile_bg_url})` } : {}}
        >
          {/* Eğer resim varsa overlay ekle ki yazı okunabilsin (hoş butonlar vs için) */}
          {profile?.profile_bg_url && <div className="absolute inset-0 bg-black/10" />}

          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/dashboard/gelistirici/profil?edit=true">
                <Edit2 className="mr-2 size-4" />
                Düzenle
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* Avatar - Negative margin to pull it up */}
            <div className="-mt-20 shrink-0 relative z-20">
              <Avatar className="size-40 border-4 border-card shadow-2xl">
                <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || "GU"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="pt-4 flex-1">
              <h1 className="text-3xl font-bold text-foreground">{profile?.full_name}</h1>
              <p className="text-xl text-primary font-medium mb-2">{profile?.title || "Yazılım Geliştirici"}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <Mail className="size-4" />
                  {profile?.email}
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="size-4" />
                    {profile?.phone}
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="size-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">Web Sitesi</a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex gap-2 mt-4">
                  {profile.social_links.github && (
                    <Button variant="outline" size="icon" className="rounded-full size-8 bg-background dark:bg-secondary dark:text-secondary-foreground transition-all duration-300 hover:scale-110 border-muted-foreground/20" asChild>
                      <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="size-4" />
                      </a>
                    </Button>
                  )}
                  {profile.social_links.linkedin && (
                    <Button variant="outline" size="icon" className="rounded-full size-8 bg-background dark:bg-secondary dark:text-secondary-foreground transition-all duration-300 hover:scale-110 border-muted-foreground/20" asChild>
                      <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="size-4" />
                      </a>
                    </Button>
                  )}
                  {profile.social_links.twitter && (
                    <Button variant="outline" size="icon" className="rounded-full size-8 bg-background dark:bg-secondary dark:text-secondary-foreground transition-all duration-300 hover:scale-110 border-muted-foreground/20" asChild>
                      <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-8">
            {/* Bio */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Briefcase className="size-5 text-primary" />
                Hakkımda
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile?.bio || "Henüz bir biyografi eklenmemiş."}
              </p>
            </section>

            {/* Experiences */}
            <section>
              {/* Header is handled inside ProfileExperiences but we might want a common header style if it doesn't have one matching About Me exactly. 
                   Checking previous code, ProfileExperiences seemed to be self contained. 
                   However, the user asked for "About Me" style rows.
                   "About Me" has: h3 with border-b, then content.
                   Let's trust the component internal structure for now but place them in sections.
               */}
              <ProfileExperiences experiences={experiences || []} isEditing={false} />
            </section>

            {/* Educations */}
            <section>
              <ProfileEducations educations={educations || []} isEditing={false} />
            </section>

            {/* Certificates */}
            <section>
              <ProfileCertificates certificates={certificates || []} isEditing={false} />
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Uygunluk & Yetenekler</h3>
              <div className="flex flex-wrap gap-2">
                {!skills || skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Henüz yetenek eklenmemiş.</p>
                ) : (
                  skills.map((skill: any) => (
                    <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm bg-primary/80 hover:bg-primary/90 border-primary/20 transition-colors">
                      {skill.skills?.name}
                    </Badge>
                  ))
                )}
              </div>
            </section>

            {/* Yazılar */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Yazılar
              </h3>
              {!blogPosts?.length ? (
                <p className="text-sm text-muted-foreground italic">Henüz yayınlanmış blog yazısı yok.</p>
              ) : (
                <ul className="space-y-2">
                  {blogPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {post.title}
                      </Link>
                      <span className="text-muted-foreground text-sm ml-2">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("tr-TR")
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
