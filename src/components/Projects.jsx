import { motion } from 'framer-motion'
import SectionWrapper from './SectionWrapper'
import TiltCard from './TiltCard'
import { ExternalLink } from 'lucide-react'
import { GithubIcon } from './Icons'

const projects = [
  {
    title: 'Gzip Text Classifier (k-NN + NCD)',
    tech: ['C++17', 'zlib', 'k-NN', 'Python', 'GitHub Actions'],
    description:
      'Ultralightweight, parameter-free text classifier using DEFLATE compression and Normalized Compression Distance, after Jiang et al. 2022 ("Less is More").',
    highlights: [
      'Raw-DEFLATE streams + empty-string calibration for accurate short-text distances',
      'Multi-threaded C++17 evaluation across all cores',
      'Python F1 / precision-recall + confusion-matrix reporting, wired into CI',
    ],
    github: 'https://github.com/nageshnnazare/gzip-classifier',
    demo: 'https://nageshnnazare.github.io/gzip-classifier/',
    isContribution: false,
  },
  {
    title: 'LLVM Debugger (lldb)',
    tech: ['C++', 'LLVM'],
    description:
      'Designed and integrated a dedicated console pane in the LLDB (LLVM) debugger, enabling real-time capture and logging of stdout/stderr streams for improved visibility.',
    github: 'https://github.com/llvm/llvm-project/pull/177160',
    isContribution: true,
  },
  {
    title: 'cynide',
    tech: ['C++', 'LLVM'],
    description:
      'Designed and developed cylang, an ahead-of-time (AoT) compiler for cynide, a language with Python-like syntax. Implemented the full pipeline: custom lexer, parser, semantic analyzer, and an LLVM-based code generation backend.',
    github: 'https://github.com/nageshnnazare/cynide',
    isContribution: false,
  },
]

export default function Projects() {
  return (
    <SectionWrapper id="projects" title="Projects & Open Source">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <TiltCard className="h-full rounded-3xl" tiltIntensity={15} glare>
              <div className="group relative p-6 rounded-3xl card hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-light transition-colors">
                      {project.title}
                    </h3>
                    {project.isContribution && (
                      <span className="inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded-full card-subtle text-emerald-400">
                        Open Source
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} — live demo`}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} — source on GitHub`}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      <GithubIcon size={18} />
                    </a>
                  </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>

                {project.highlights && (
                  <ul className="mt-3 space-y-1.5">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                        <span className="text-primary-light mt-0.5">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/[0.06]">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2 py-0.5 rounded-full card-subtle text-primary-light"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  )
}
