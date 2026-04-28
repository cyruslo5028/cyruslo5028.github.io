import React from 'react'
import { portfolioContent } from '../content/portfolio'
import { ProjectCard } from '../components/sections/components/ProjectCard'

export function ProjectsPage() {
  void React
  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-7 md:p-10">
        <h1 className="text-3xl font-semibold text-text-primary">Projects</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
          Selected projects and demos. The new <span className="text-text-primary">/waroftank</span> experience now lives
          inside this React app, while
          <span className="text-text-primary"> /VenmoSplit</span> and
          <span className="text-text-primary"> /webGLshading</span> remain preserved as standalone demos.
        </p>
      </section>

      <section className="glass rounded-3xl p-7 md:p-10">
        <div className="grid gap-4 md:grid-cols-2">
          {portfolioContent.projects.map((p, idx) => (
            <ProjectCard key={p.title} project={p} delay={idx * 0.06} />
          ))}
        </div>
      </section>
    </div>
  )
}
