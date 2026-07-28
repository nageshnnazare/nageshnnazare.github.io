import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './Icons'

export default function Footer() {
  return (
    <footer className="relative z-10 card-strong mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            {[
              { icon: LinkedinIcon, href: 'https://linkedin.com/in/nagesh-n-nazare/' },
              { icon: GithubIcon, href: 'https://github.com/nageshnnazare' },
              { icon: GraduationCap, href: 'https://scholar.google.com/citations?user=KDOJ2IAAAAAJ&hl=en' },
            ].map(({ icon: Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full glass-button transition-colors duration-300"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Nagesh N Nazare &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
