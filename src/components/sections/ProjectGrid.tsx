import { Link } from 'react-router-dom'
import { portfolioContent } from '../../content/portfolio'
import { ProjectCard } from './components/ProjectCard'

export function ProjectGrid() {
  return (
    <section className="glass rounded-3xl p-7 md:p-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Projects</h2>
          <p className="mt-2 text-sm text-text-secondary">Selected work across systems, tooling, and demos.</p>
        </div>
        <Link className="btn-ghost self-start md:self-auto" to="/projects">
          View all →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {portfolioContent.projects.slice(0, 4).map((p, idx) => (
          <ProjectCard key={p.title} project={p} delay={idx * 0.06} />
        ))}
      </div>
    </section>
  )
}
