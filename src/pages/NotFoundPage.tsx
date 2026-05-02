import { Link } from 'react-router-dom'
import '../styles/effects.css'
import { ShaderBackground } from '../components/showcase/ShaderBackground'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 fx-conic-border">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div className="fx-scanlines" />
        <div className="fx-vignette" />

        <div className="relative z-10 px-6 py-20 text-center md:px-12 md:py-28">
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/55">Error 404</div>
          <h1 className="mt-3 text-7xl font-black tracking-tight text-white md:text-9xl">
            <span className="fx-aurora-text">404</span>
          </h1>
          <p className="mt-4 text-base text-white/65">
            This route wasn&rsquo;t in the build manifest.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-full border border-[#7e7bd9]/60 bg-gradient-to-r from-[#7e7bd9]/20 to-[#d69c2f]/22 px-7 py-3 text-sm font-bold tracking-[0.18em] text-white"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </section>
    </div>
  )
}
