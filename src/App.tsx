import React, { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatedBackground } from './components/background/AnimatedBackground'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { ReadingProgress } from './components/ReadingProgress'
import { HomePage } from './pages/HomePage'
import { ShowcaseHomePage } from './pages/ShowcaseHomePage'
import { AboutPage } from './pages/AboutPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Heavy game routes — code-split so the home page bundle stays small.
const WarOfTankPage = lazy(() => import('./pages/WarOfTankPage').then((m) => ({ default: m.WarOfTankPage })))
const HKRogueLikePage = lazy(() => import('./pages/HKRogueLikePage').then((m) => ({ default: m.HKRogueLikePage })))


const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, scale: 0.985, filter: 'blur(10px)' },
}

export default function App() {
  const location = useLocation()

  const key = React.useMemo(() => location.pathname, [location.pathname])

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
          <Suspense fallback={<div className="flex h-64 items-center justify-center text-text-secondary">Loading…</div>}>
            <Routes location={location}>
              <Route path="/" element={<ShowcaseHomePage />} />
              <Route path="/legacy" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/waroftank" element={<WarOfTankPage />} />
              <Route path="/hkroguelike" element={<HKRogueLikePage />} />
              <Route path="/showcase" element={<ShowcaseHomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  )
}
