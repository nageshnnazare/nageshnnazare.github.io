import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Awards from './components/Awards'
import Certifications from './components/Certifications'
import Projects from './components/Projects'
import Publications from './components/Publications'
import Contact from './components/Contact'
import Footer from './components/Footer'
import LiquidGlass from './components/LiquidGlass'
import ScrollProgress from './components/ScrollProgress'

const SECTION_IDS = ['about', 'awards', 'skills', 'projects', 'publications', 'contact']

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section closest to the top of the viewport that is visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      <LiquidGlass />
      <Navbar scrollY={scrollY} activeId={activeId} />
      <main>
        <Hero />
        <About />
        <Awards />
        <Skills />
        <Certifications />
        <Projects />
        <Publications />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
