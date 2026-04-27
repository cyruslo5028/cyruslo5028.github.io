import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
        <div className="text-sm text-text-secondary">404</div>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Page not found</h1>
        <p className="mt-3 text-text-secondary">The page you are looking for doesn’t exist (or has moved).</p>
        <div className="mt-6">
          <Link className="btn-primary" to="/">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
