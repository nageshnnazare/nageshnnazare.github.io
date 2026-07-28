import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Awards', href: '#awards', id: 'awards' },
  { name: 'Skills', href: '#skills', id: 'skills' },
  { name: 'Projects', href: '#projects', id: 'projects' },
  { name: 'Publications', href: '#publications', id: 'publications' },
  { name: 'Contact', href: '#contact', id: 'contact' },
]

export default function Navbar({ scrollY, activeId }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isScrolled = scrollY > 50

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50"
    >
      <div className={`glass-nav max-w-5xl mx-auto rounded-full ${isScrolled ? 'glass-nav--scrolled' : ''}`}>
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <a href="#" aria-label="Home" className="flex items-center pr-2 text-primary-light">
              <Logo size={48} />
            </a>

            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = activeId === link.id
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                      active
                        ? 'text-white bg-white/[0.1]'
                        : 'text-gray-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {link.name}
                  </a>
                )
              })}
            </div>

            <div className="hidden md:flex items-center pl-3 ml-1 border-l border-white/10">
              <ThemeToggle />
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="md:hidden text-gray-200 hover:text-white p-1.5 rounded-full hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-nav glass-nav--scrolled md:hidden mt-2 max-w-5xl mx-auto rounded-3xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const active = activeId === link.id
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 text-sm rounded-xl transition-colors ${
                      active ? 'text-white bg-white/[0.1]' : 'text-gray-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {link.name}
                  </a>
                )
              })}
              <div className="flex items-center justify-between px-4 pt-3 mt-2 border-t border-white/10">
                <span className="text-xs text-gray-400">Accent</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
