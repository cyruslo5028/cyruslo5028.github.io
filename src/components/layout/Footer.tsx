
export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-12 pt-10">
      <div className="hairline rounded-2xl bg-ink-100/40 px-6 py-6 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-text-primary">© {new Date().getFullYear()} Cyrus Lo</div>
            <div className="text-xs text-text-secondary">Built with React · Vite · Tailwind · Framer Motion</div>
          </div>
          <div className="text-xs text-text-secondary">Full-stack · AI agents · Reliability</div>
        </div>
      </div>
    </footer>
  )
}
