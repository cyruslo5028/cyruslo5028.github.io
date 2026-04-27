export type SocialLink = {
  label: string
  href: string
  kind: 'github' | 'email' | 'website' | 'linkedin' | 'other'
}

export type Project = {
  title: string
  description: string
  tags: string[]
  href: string
  note?: string
}

export type TimelineItem = {
  date: string
  title: string
  org: string
  bullets?: string[]
}

export type PortfolioContent = {
  name: string
  headline: string
  location: string
  intro: string
  socials: SocialLink[]
  projects: Project[]
  skills: string[]
  timeline: TimelineItem[]
}
