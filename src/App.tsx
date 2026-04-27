import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatedBackground } from './components/background/AnimatedBackground'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { ReadingProgress } from './components/ReadingProgress'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, scale: 0.985, filter: 'blur(10px)' },
}

export default function App() {
  const location = useLocation()

  const key = useMemo(() => location.pathname, [location.pathname])

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <ReadingProgress />
      <Navbar />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={key}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl px-4 pb-16 pt-10"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  )
}
